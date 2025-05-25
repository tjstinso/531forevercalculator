import { NextResponse } from 'next/server';
import { saveToken, getLatestToken, clearTokens } from '@/lib/db';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function POST(request: Request) {
  try {
    const token = await request.json();
    await saveToken(token, oauth2Client);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving token:', error);
    return NextResponse.json(
      { error: 'Failed to save token' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const token = getLatestToken(userId);
    if (!token) {
      return NextResponse.json(
        { error: 'No token found' },
        { status: 404 }
      );
    }
    return NextResponse.json(token);
  } catch (error) {
    console.error('Error getting token:', error);
    return NextResponse.json(
      { error: 'Failed to get token' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await clearTokens(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing tokens:', error);
    return NextResponse.json(
      { error: 'Failed to clear tokens' },
      { status: 500 }
    );
  }
} 