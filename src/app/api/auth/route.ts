import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Auth code is required' },
        { status: 400 }
      );
    }

    // Exchange the auth code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    console.log("tokens: ");
    console.log(tokens);

    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Error exchanging auth code:', error);
    return NextResponse.json(
      { error: 'Failed to exchange auth code' },
      { status: 500 }
    );
  }
} 