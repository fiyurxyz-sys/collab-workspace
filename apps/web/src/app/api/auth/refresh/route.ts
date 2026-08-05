import { NextRequest, NextResponse } from 'next/server';
import { refreshTokens } from '@/lib/auth.service';
import { getRefreshToken, withRefreshCookie, errorResponse, handleError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawToken = getRefreshToken(req);
    if (!rawToken) {
      return errorResponse(401, 'Refresh token required');
    }

    const { accessToken, refreshToken } = await refreshTokens(rawToken);

    const res = NextResponse.json({ accessToken }, { status: 200 });
    return withRefreshCookie(res, refreshToken);
  } catch (err) {
    return handleError(err);
  }
}
