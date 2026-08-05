import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/dashboard'];
// Auth routes — redirect to dashboard if already logged in
const AUTH_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for refresh token cookie as auth signal (httpOnly, so no JS access)
  const hasRefreshToken = request.cookies.has('refresh_token');

  // Redirect authenticated users away from login/register
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (hasRefreshToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect dashboard and other protected routes
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!hasRefreshToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
