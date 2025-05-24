import Database from 'better-sqlite3';
import { Credentials } from '@/types/auth';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'crypto';

// Initialize SQLite database
const db = new Database('531_ts.db');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS user_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    scope TEXT NOT NULL,
    token_type TEXT NOT NULL,
    expiry_date INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES user_tokens(user_id)
  );
`);

// Save a new token
export async function saveToken(token: Credentials, oauth2Client: OAuth2Client) {
  // Get user info from the ID token
  const ticket = await oauth2Client.verifyIdToken({
    idToken: token.id_token!,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();
  
  if (!payload) {
    throw new Error('Failed to verify ID token');
  }

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO user_tokens (
      user_id, email, access_token, refresh_token, scope, token_type, expiry_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    payload.sub, // Google's unique user ID
    payload.email || '',
    token.access_token || '',
    token.refresh_token || null,
    token.scope || '',
    token.token_type || 'Bearer',
    token.expiry_date || null
  );
}

// Create a new session
export function createSession(userId: string): string {
  const sessionId = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Session expires in 7 days

  const stmt = db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, ?)
  `);

  stmt.run(sessionId, userId, expiresAt.toISOString());
  return sessionId;
}

// Get session and associated user token
export function getSession(sessionId: string): { userId: string; token: Credentials } | null {
  const stmt = db.prepare(`
    SELECT s.user_id, t.*
    FROM sessions s
    JOIN user_tokens t ON s.user_id = t.user_id
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `);

  const result = stmt.get(sessionId) as {
    user_id: string;
    access_token: string;
    refresh_token: string | null;
    scope: string;
    token_type: string;
    expiry_date: number | null;
  } | undefined;

  if (!result) {
    return null;
  }

  return {
    userId: result.user_id,
    token: {
      access_token: result.access_token,
      refresh_token: result.refresh_token || undefined,
      scope: result.scope,
      token_type: result.token_type,
      expiry_date: result.expiry_date || undefined
    }
  };
}

// Delete a session
export function deleteSession(sessionId: string) {
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
  return stmt.run(sessionId);
}

// Get the latest token for a user
export function getLatestToken(userId: string): Credentials | null {
  const stmt = db.prepare(`
    SELECT * FROM user_tokens
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `);

  const result = stmt.get(userId) as {
    access_token: string;
    refresh_token: string | null;
    scope: string;
    token_type: string;
    expiry_date: number | null;
  } | undefined;

  if (!result) {
    return null;
  }

  return {
    access_token: result.access_token,
    refresh_token: result.refresh_token || undefined,
    scope: result.scope,
    token_type: result.token_type,
    expiry_date: result.expiry_date || undefined
  };
}

// Clear tokens for a specific user
export function clearTokens(userId: string) {
  const stmt = db.prepare('DELETE FROM user_tokens WHERE user_id = ?');
  return stmt.run(userId);
}

// Close database connection when the application shuts down
process.on('exit', () => {
  db.close();
}); 