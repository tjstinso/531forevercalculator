import { TokenResponse } from '@react-oauth/google';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const SPREADSHEET_IDENTIFIER = '531_TS_WORKOUT_PLAN'; 
const createOAuth2Client = (credentialResponse: TokenResponse) => {
    let _client = new OAuth2Client();
    _client.setCredentials({
        access_token: credentialResponse.access_token,
        scope: credentialResponse.scope,
        token_type: credentialResponse.token_type,
    });

    return _client;
}

// List all spreadsheets created by the user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const spreadsheetId = searchParams.get('spreadsheetId');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    let client = createOAuth2Client(JSON.parse(token) as TokenResponse);
    let drive = google.drive({ version: 'v3', auth: client });

    // If spreadsheetId is provided, fetch its data
    if (spreadsheetId) {
      let sheets = google.sheets({ version: 'v4', auth: client });
      
      // Get the data from the Current Block sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Current Block',
      });

      const values = response.data.values || [];
      
      // Find the final week's data
      const finalWeekIndex = values.findLastIndex((row: string[]) => 
        row[0]?.toLowerCase().includes('final week')
      );

      if (finalWeekIndex === -1) {
        return NextResponse.json(
          { error: 'No final week data found' },
          { status: 404 }
        );
      }

      // Extract training maxes from the final week
      const trainingMaxes = new Map<string, number>();
      let currentRow = finalWeekIndex - 3;
      
      while (currentRow < values.length && values[currentRow][0]?.toLowerCase().includes('final week')) {
        const exercise = values[currentRow][2]; // Exercise name
        const trainingMax = values[currentRow][3]; // Training max value
        if (exercise && trainingMax) {
          // Extract the number from "XXX lbs"
          const maxValue = parseInt(trainingMax.match(/\d+/)?.[0] || '0');
          trainingMaxes.set(exercise, maxValue);
        }
        currentRow++;
      }

      return NextResponse.json({
        trainingMaxes: Object.fromEntries(trainingMaxes),
      });
    }

    // If no spreadsheetId, list all spreadsheets
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.spreadsheet'`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
    });

    return NextResponse.json({
      spreadsheets: (response.data.files || []).filter((file: any) => file.name.includes(SPREADSHEET_IDENTIFIER)),
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Create or update a spreadsheet
export async function POST(request: Request) {
  try {
    const { 
        token,
        data,
        title,
        spreadsheetId, // Optional: if provided, update existing spreadsheet
        sheetName = 'Sheet1',
        append = false // Optional: if true, append to existing sheet instead of overwriting
     } = await request.json();

    let client = createOAuth2Client(token as TokenResponse);
    let drive = google.drive({ version: 'v3', auth: client });
    let sheets = google.sheets({ version: 'v4', auth: client });

    let targetSpreadsheetId = spreadsheetId;

    // If no spreadsheetId is provided, create a new spreadsheet
    if (!targetSpreadsheetId) {
      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `${title || `531 Workout Plan ${new Date().toISOString().split('T')[0]}`} - ${SPREADSHEET_IDENTIFIER}`,
          },
          sheets: [
            {
              properties: {
                title: 'Current Block',
              },
            },
            {
              properties: {
                title: 'History',
              },
            },
          ],
        },
      });

      targetSpreadsheetId = spreadsheet.data.spreadsheetId;

      if (!targetSpreadsheetId) {
        throw new Error('Failed to create spreadsheet');
      }

      // Make the new spreadsheet accessible to anyone with the link
      await drive.permissions.create({
        fileId: targetSpreadsheetId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // For new spreadsheets, just write to Current Block
      await sheets.spreadsheets.values.update({
        spreadsheetId: targetSpreadsheetId,
        range: 'Current Block!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: data,
        },
      });
    } else {
      // For existing spreadsheets, handle the sequence of operations
      // 1. Get current data and append to history
      const currentBlockResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: targetSpreadsheetId,
        range: 'Current Block',
      });

      const currentData = currentBlockResponse.data.values || [];
      if (currentData.length > 0) {
        // Get the last row of history to append to
        const historyResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: targetSpreadsheetId,
          range: 'History',
        });
        const historyValues = historyResponse.data.values || [];
        const historyRange = `History!A${historyValues.length + 1}`;

        // Append current data to history
        await sheets.spreadsheets.values.update({
          spreadsheetId: targetSpreadsheetId,
          range: historyRange,
          valueInputOption: 'RAW',
          requestBody: {
            values: currentData,
          },
        });
      }

      // 2. Clear the current block sheet
      await sheets.spreadsheets.values.clear({
        spreadsheetId: targetSpreadsheetId,
        range: 'Current Block',
      });

      // 3. Add new data to current block
      await sheets.spreadsheets.values.update({
        spreadsheetId: targetSpreadsheetId,
        range: 'Current Block!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: data,
        },
      });
    }

    return NextResponse.json({
      success: true,
      spreadsheetId: targetSpreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${targetSpreadsheetId}`,
    });
  } catch (error) {
    console.error('Error exporting to Google Sheets:', error);
    return NextResponse.json(
      { error: 'Failed to export to Google Sheets' },
      { status: 500 }
    );
  }
}