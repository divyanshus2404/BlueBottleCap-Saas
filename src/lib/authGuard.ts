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
  // 1. Try Authorization header (Bearer <idToken>) for strongest verification
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const idToken = authHeader.slice(7);
    const admin = getAdmin();
    if (admin) {
      try {
        const decoded = await admin.auth.verifyIdToken(idToken);
        return { userId: decoded.uid, error: null };
      } catch {
        return {
          userId: null,
          error: NextResponse.json(
            { error: 'Invalid or expired session. Please sign in again.' },
            { status: 401 }
          ),
        };
      }
    }
  }

  // 2. Fall back to __session cookie (same as middleware)
  const cookieHeader = req.headers.get('cookie') ?? '';
  const sessionMatch = cookieHeader.match(/__session=([^;]+)/);
  const userId = sessionMatch?.[1];

  if (!userId) {
    return {
      userId: null,
      error: NextResponse.json(
        { error: 'Sign in required to use this feature.' },
        { status: 401 }
      ),
    };
  }

  return { userId, error: null };
}
