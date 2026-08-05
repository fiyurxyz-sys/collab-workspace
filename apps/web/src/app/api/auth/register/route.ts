import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { register, RegisterSchema } from '@/lib/auth.service';
import { withRefreshCookie, handleError } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = RegisterSchema.parse(body);
    const { user, accessToken, refreshToken } = await register(input);

    const res = NextResponse.json({ user, accessToken }, { status: 201 });
    return withRefreshCookie(res, refreshToken);
  } catch (err) {
    return handleError(err);
  }
}
