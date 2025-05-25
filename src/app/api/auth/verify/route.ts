import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function POST(request: Request) {
  try {
    const { id_token } = await request.json();

    if (!id_token) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify the ID token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload) {
      return NextResponse.json(
        { error: 'Failed to verify ID token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    });
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return NextResponse.json(
      { error: 'Failed to verify ID token' },
      { status: 500 }
    );
  }
} 