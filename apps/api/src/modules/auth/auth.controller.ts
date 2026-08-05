import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { RegisterSchema, LoginSchema, RefreshSchema } from './auth.schema';
import { env } from '../../config/env';

const REFRESH_COOKIE_NAME = 'refresh_token';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/register
export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = RegisterSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.register(input);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);

    res.status(201).json({ user, accessToken });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = LoginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.login(input);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);

    res.status(200).json({ user, accessToken });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/refresh
export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // Accept refresh token from httpOnly cookie OR request body (for flexibility)
    const rawToken =
      req.cookies?.[REFRESH_COOKIE_NAME] ||
      RefreshSchema.parse(req.body).refreshToken;

    if (!rawToken) {
      res.status(401).json({ error: 'Refresh token required' });
      return;
    }

    const { accessToken, refreshToken } = await authService.refresh(rawToken);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);

    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

    if (rawToken) {
      await authService.logout(rawToken);
    }

    res.clearCookie(REFRESH_COOKIE_NAME);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
export async function getMeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
