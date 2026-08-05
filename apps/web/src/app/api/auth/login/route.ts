import { NextRequest, NextResponse } from 'next/server';
import { login, LoginSchema } from '@/lib/auth.service';
import { withRefreshCookie, handleError } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = LoginSchema.parse(body);
    const { user, accessToken, refreshToken } = await login(input);

    const res = NextResponse.json({ user, accessToken }, { status: 200 });
    return withRefreshCookie(res, refreshToken);
  } catch (err) {
    return handleError(err);
  }
}
