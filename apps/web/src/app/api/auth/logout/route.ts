import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/auth.service';
import { getRefreshToken, clearRefreshCookie, handleError } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const rawToken = getRefreshToken(req);
    if (rawToken) {
      await logout(rawToken);
    }

    const res = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    return clearRefreshCookie(res);
  } catch (err) {
    return handleError(err);
  }
}
