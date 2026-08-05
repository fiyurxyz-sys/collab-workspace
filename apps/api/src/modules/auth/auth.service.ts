import crypto from 'crypto';
import { prisma } from '../../db/prisma';
import { hashPassword, comparePassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middleware/errorHandler';
import { env } from '../../config/env';
import type { RegisterInput, LoginInput } from './auth.schema';

// Hash refresh token before storing (never store raw tokens in DB)
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Parse JWT expiry string to milliseconds for DB expiry storage
function parseExpiry(expiry: string): Date {
  const unit = expiry.slice(-1);
  const value = parseInt(expiry.slice(0, -1), 10);
  const ms = unit === 'm' ? value * 60_000
    : unit === 'h' ? value * 3_600_000
    : unit === 'd' ? value * 86_400_000
    : value * 1000;
  return new Date(Date.now() + ms);
}

// ─── Register ───────────────────────────────────────────
export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, 'An account with this email already exists');
  }

  const password_hash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password_hash,
      name: input.name,
    },
    select: { id: true, email: true, name: true, avatar_url: true, created_at: true },
  });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token_hash: hashToken(refreshToken),
      user_id: user.id,
      expires_at: parseExpiry(env.JWT_REFRESH_EXPIRES_IN),
    },
  });

  return { user, accessToken, refreshToken };
}

// ─── Login ──────────────────────────────────────────────
export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Consistent timing to prevent user enumeration
  const dummyHash = '$2b$12$invalidhashfortimingattackprotection0000000000000000';
  const passwordMatch = user
    ? await comparePassword(input.password, user.password_hash)
    : await comparePassword(input.password, dummyHash);

  if (!user || !passwordMatch) {
    throw new AppError(401, 'Invalid email or password');
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token_hash: hashToken(refreshToken),
      user_id: user.id,
      expires_at: parseExpiry(env.JWT_REFRESH_EXPIRES_IN),
    },
  });

  const { password_hash, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

// ─── Refresh ─────────────────────────────────────────────
export async function refresh(rawRefreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  const tokenHash = hashToken(rawRefreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { token_hash: tokenHash } });

  if (!stored || stored.revoked || stored.expires_at < new Date()) {
    throw new AppError(401, 'Refresh token is no longer valid');
  }

  // Rotate refresh token (revoke old, issue new)
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  const newAccessToken = signAccessToken(payload.userId);
  const newRefreshToken = signRefreshToken(payload.userId);

  await prisma.refreshToken.create({
    data: {
      token_hash: hashToken(newRefreshToken),
      user_id: payload.userId,
      expires_at: parseExpiry(env.JWT_REFRESH_EXPIRES_IN),
    },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

// ─── Logout ──────────────────────────────────────────────
export async function logout(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken);
  await prisma.refreshToken.updateMany({
    where: { token_hash: tokenHash, revoked: false },
    data: { revoked: true },
  });
}

// ─── Get Me ──────────────────────────────────────────────
export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, avatar_url: true, created_at: true, updated_at: true },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
}
