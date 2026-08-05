import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export const REFRESH_COOKIE = 'refresh_token';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

// Helper: set refresh token cookie on response
export function withRefreshCookie(res: NextResponse, token: string): NextResponse {
  res.cookies.set(REFRESH_COOKIE, token, COOKIE_OPTIONS);
  return res;
}

// Helper: clear refresh token cookie
export function clearRefreshCookie(res: NextResponse): NextResponse {
  res.cookies.set(REFRESH_COOKIE, '', { ...COOKIE_OPTIONS, maxAge: 0 });
  return res;
}

// Helper: get refresh token from cookie
export function getRefreshToken(req: NextRequest): string | undefined {
  return req.cookies.get(REFRESH_COOKIE)?.value;
}

// Helper: unified error response
export function errorResponse(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

// Helper: handle service errors (thrown as { status, message } objects)
export function handleError(err: unknown) {
  if (
    err &&
    typeof err === 'object' &&
    'status' in err &&
    'message' in err
  ) {
    const e = err as { status: number; message: string };
    return errorResponse(e.status, e.message);
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      },
      { status: 400 },
    );
  }
  console.error('Unhandled API error:', err);
  return errorResponse(500, 'Internal server error');
}

// Helper: authenticate request — returns userId or null
export function authenticateRequest(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  try {
    const { verifyAccessToken } = require('@/lib/jwt');
    const payload = verifyAccessToken(token);
    return payload.userId;
  } catch {
    return null;
  }
}
