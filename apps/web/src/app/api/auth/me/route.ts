import { NextRequest, NextResponse } from 'next/server';
import { getMe } from '@/lib/auth.service';
import { verifyAccessToken } from '@/lib/jwt';
import { errorResponse, handleError } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return errorResponse(401, 'Access token required');
    }

    let payload;
    try {
      payload = verifyAccessToken(auth.slice(7));
    } catch (err: any) {
      const msg = err?.name === 'TokenExpiredError'
        ? 'Access token expired'
        : 'Invalid access token';
      return errorResponse(401, msg);
    }

    const user = await getMe(payload.userId);
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    return handleError(err);
  }
}
