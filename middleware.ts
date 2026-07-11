/**
 * Next.js Edge Middleware — Route Protection
 *
 * Protects authenticated-only routes by checking for a Firebase session cookie.
 * Because Firebase client-side auth cannot be verified in the Edge runtime
 * (no Firebase Admin SDK), we use a lightweight __session cookie that the
 * client sets on sign-in (see AuthContext.tsx).
 *
 * Flow:
 *  1. User signs in → client sets document.cookie = "__session=<uid>"
 *  2. Middleware reads the cookie on every protected route request
 *  3. If cookie missing → redirect to / (landing page)
 *  4. If email not verified → redirect to /verify-email
 *     (we encode emailVerified=true|false in a second cookie: __email_verified)
 *
 * NOTE: This is a "soft" guard — it's not cryptographically verified.
 * The real security is Firestore Security Rules (see firestore.rules).
 * This middleware prevents casual URL access and accidental exposure.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Helper to decode a JWT payload in the Edge runtime.
 * We don't verify the signature here (that happens in authGuard.ts for API routes).
 * This is just to quickly check claims like email_verified for routing purposes.
 */
function decodeJwtPayload(token: string) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/** Routes that require authentication */
const PROTECTED_PATHS = [
  '/dashboard',
  '/pdf-editor',
  '/virtual-test',
  '/create-profile',
  '/onboarding',
  '/study-material',
  '/seniors',
  '/roadmaps',
];

/** Routes that require email verification (subset of protected) */
const VERIFIED_ONLY_PATHS = [
  '/dashboard',
  '/pdf-editor',
  '/virtual-test',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  if (!isProtected) return NextResponse.next();

  // Check for the session cookie set by the client after Firebase sign-in
  const sessionCookie = request.cookies.get('__session')?.value;

  if (!sessionCookie) {
    // Not logged in — redirect to landing page
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth', 'required');
    return NextResponse.redirect(url);
  }

  // Check email verification for sensitive routes
  const isVerifiedOnlyPath = VERIFIED_ONLY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  if (isVerifiedOnlyPath && sessionCookie) {
    const payload = decodeJwtPayload(sessionCookie);
    // If the token is successfully decoded and email_verified is explicitly false
    if (payload && payload.email_verified === false) {
      const url = request.nextUrl.clone();
      url.pathname = '/verify-email';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     * - API routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
};
