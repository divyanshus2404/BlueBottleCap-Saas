/**
 * Lightweight Firebase session guard for API routes.
 *
 * Checks for the `__session` cookie (set by AuthContext on sign-in) and
 * optionally verifies the Firebase ID token via Admin SDK for stronger
 * security. Falls back to cookie-only check when Admin SDK is unavailable.
 *
 * Usage:
 *   const auth = await requireAuth(req);
 *   if (auth.error) return auth.error;
 *   // auth.userId is available
 */

import { NextResponse } from 'next/server';
import { getAdmin } from './firebaseAdmin';

interface AuthResult {
  userId: string;
  error: null;
}

interface AuthError {
  userId: null;
  error: NextResponse;
}

/**
 * Require a valid session cookie. If a Firebase ID token is provided in the
 * Authorization header AND Admin SDK is configured, we verify it for stronger
 * assurance. Otherwise we fall back to the cookie (which is a soft guard, same
 * as the middleware — real security is Firestore Rules).
 */
export async function requireAuth(req: Request): Promise<AuthResult | AuthError> {
  // 1. Get token from Authorization header or fallback to __session cookie
  let token = '';
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    const cookieHeader = req.headers.get('cookie') ?? '';
    const sessionMatch = cookieHeader.match(/__session=([^;]+)/);
    token = sessionMatch?.[1] || '';
  }

  if (!token) {
    return {
      userId: null,
      error: NextResponse.json(
        { error: 'Sign in required to use this feature.' },
        { status: 401 }
      ),
    };
  }

  // 2. Cryptographically verify the token if Admin SDK is configured
  const admin = getAdmin();
  if (admin) {
    try {
      const decoded = await admin.auth.verifyIdToken(token);
      return { userId: decoded.uid, error: null };
    } catch {
      return {
        userId: null,
        error: NextResponse.json(
          { error: 'Session expired or invalid. Please sign in again or refresh the page.' },
          { status: 401 }
        ),
      };
    }
  }

  // 3. Fallback for local dev without Admin SDK: Soft decode the JWT payload
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) throw new Error('Invalid JWT');
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    const uid = decoded.uid || decoded.user_id;
    if (uid) {
      return { userId: uid, error: null };
    }
  } catch {
    // fall through
  }

  return {
    userId: null,
    error: NextResponse.json(
      { error: 'Invalid session format.' },
      { status: 401 }
    ),
  };
}
