import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { saveToken } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { refresh_token } = await request.json();

    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Create a new OAuth client for this request
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials({
      refresh_token
    });

    // Get new tokens
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Save the new tokens to the database
    await saveToken(credentials, oauth2Client);

    return NextResponse.json(credentials);
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
} 