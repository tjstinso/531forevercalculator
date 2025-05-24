import { NextResponse } from 'next/server';
import { createSession, getSession, deleteSession } from '@/lib/db';
import { cookies } from 'next/headers';

const SESSION_COOKIE = '531_ts_session';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const sessionId = createSession(userId);
    
    // Set session cookie
    cookies().set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sessionId = cookies().get(SESSION_COOKIE)?.value;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      // Clear invalid session cookie
      cookies().delete(SESSION_COOKIE);
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error getting session:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const sessionId = cookies().get(SESSION_COOKIE)?.value;
    
    if (sessionId) {
      deleteSession(sessionId);
      cookies().delete(SESSION_COOKIE);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
} 