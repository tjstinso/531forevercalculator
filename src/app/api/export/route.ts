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
      
      // Get all sheets in the spreadsheet
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets.properties.title',
      });

      // Find the sheet with the training plan
      const trainingSheet = spreadsheet.data.sheets?.find(sheet => 
        sheet.properties?.title?.toLowerCase().includes('training plan')
      );

      if (!trainingSheet?.properties?.title) {
        return NextResponse.json(
          { error: 'No training plan sheet found' },
          { status: 404 }
        );
      }

      // Get the data from the sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: trainingSheet.properties.title,
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
    console.log("spreadsheettitle: ", title)
    if (!targetSpreadsheetId) {
      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `${title || `531 Workout Plan ${new Date().toISOString().split('T')[0]}`} - ${SPREADSHEET_IDENTIFIER}`,
          },
          sheets: [
            {
              properties: {
                title: sheetName,
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
    } else {
      // Verify the user has access to the spreadsheet
      try {
        await sheets.spreadsheets.get({
          spreadsheetId: targetSpreadsheetId,
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'You do not have access to this spreadsheet' },
          { status: 403 }
        );
      }
    }

    // Get the current data range to determine where to append
    let range = `${sheetName}!A1`;
    if (append) {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: targetSpreadsheetId,
        range: sheetName,
      });
      const values = response.data.values || [];
      range = `${sheetName}!A${values.length + 1}`;
    }

    // Update the spreadsheet with data
    await sheets.spreadsheets.values.update({
      spreadsheetId: targetSpreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: data,
      },
    });

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