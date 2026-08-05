import crypto from 'crypto';
import { prisma } from './prisma';
import { hashPassword, comparePassword } from './password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './jwt';
import { env } from './env';
import { z } from 'zod';

// ─── Input Schemas ───────────────────────────────────────
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  name: z.string().min(2, 'Name too short').max(100),
});

export const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

// ─── Helpers ─────────────────────────────────────────────
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function parseExpiryMs(expiry: string): number {
  const unit = expiry.slice(-1);
  const val = parseInt(expiry.slice(0, -1), 10);
  if (unit === 'm') return val * 60_000;
  if (unit === 'h') return val * 3_600_000;
  if (unit === 'd') return val * 86_400_000;
  return val * 1000;
}

// ─── Register ────────────────────────────────────────────
export async function register(input: z.infer<typeof RegisterSchema>) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw { status: 409, message: 'An account with this email already exists' };
  }

  const password_hash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email: input.email, password_hash, name: input.name },
    select: { id: true, email: true, name: true, avatar_url: true, created_at: true },
  });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token_hash: hashToken(refreshToken),
      user_id: user.id,
      expires_at: new Date(Date.now() + parseExpiryMs(env.JWT_REFRESH_EXPIRES_IN)),
    },
  });

  return { user, accessToken, refreshToken };
}

// ─── Login ───────────────────────────────────────────────
export async function login(input: z.infer<typeof LoginSchema>) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Timing-attack safe — always run compare even if user not found
  const dummyHash = '$2b$12$KIXynO2UPx3FPdPdQzT0ZOznoJXd7JaV5k.qpqYpGb5cJJVHBUi2';
  const match = user
    ? await comparePassword(input.password, user.password_hash)
    : await comparePassword(input.password, dummyHash);

  if (!user || !match) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token_hash: hashToken(refreshToken),
      user_id: user.id,
      expires_at: new Date(Date.now() + parseExpiryMs(env.JWT_REFRESH_EXPIRES_IN)),
    },
  });

  const { password_hash, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

// ─── Refresh (with token rotation) ───────────────────────
export async function refreshTokens(rawToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    throw { status: 401, message: 'Invalid or expired refresh token' };
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token_hash: hashToken(rawToken) },
  });

  if (!stored || stored.revoked || stored.expires_at < new Date()) {
    throw { status: 401, message: 'Refresh token is no longer valid' };
  }

  // Revoke old, issue new
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

  const newAccess = signAccessToken(payload.userId);
  const newRefresh = signRefreshToken(payload.userId);

  await prisma.refreshToken.create({
    data: {
      token_hash: hashToken(newRefresh),
      user_id: payload.userId,
      expires_at: new Date(Date.now() + parseExpiryMs(env.JWT_REFRESH_EXPIRES_IN)),
    },
  });

  return { accessToken: newAccess, refreshToken: newRefresh };
}

// ─── Logout ──────────────────────────────────────────────
export async function logout(rawToken: string) {
  await prisma.refreshToken.updateMany({
    where: { token_hash: hashToken(rawToken), revoked: false },
    data: { revoked: true },
  });
}

// ─── Get Me ──────────────────────────────────────────────
export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, avatar_url: true, created_at: true, updated_at: true },
  });
  if (!user) throw { status: 404, message: 'User not found' };
  return user;
}
