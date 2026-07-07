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

  if (isVerifiedOnlyPath) {
    const emailVerified = request.cookies.get('__email_verified')?.value;
    if (emailVerified === 'false') {
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
