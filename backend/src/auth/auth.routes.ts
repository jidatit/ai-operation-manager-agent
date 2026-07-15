import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import {
  clearAuthCookie,
  requireAuth,
  setAuthCookie,
  signToken,
} from '../middleware/auth.js';
import { getGoogleLoginUrl } from './google.oauth.js';
import { getMe, handleGoogleCallback } from './auth.service.js';
import { logger } from '../utils/logger.js';

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.use(authLimiter);

authRouter.get('/google', (_req, res) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    res.status(503).json({ error: 'Google OAuth is not configured' });
    return;
  }
  res.redirect(getGoogleLoginUrl());
});

authRouter.get('/google/callback', async (req, res) => {
  try {
    const code = req.query.code as string | undefined;
    if (!code) {
      res.redirect(`${env.FRONTEND_URL}/login?error=missing_code`);
      return;
    }
    const user = await handleGoogleCallback(code);
    const token = signToken(user.id);
    setAuthCookie(res, token);
    res.redirect(`${env.FRONTEND_URL}/dashboard`);
  } catch (err) {
    logger.error({ err }, 'Google auth callback failed');
    res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await getMe(req.user!.id);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      timezone: user.timezone,
      createdAt: user.createdAt,
      settings: user.settings,
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});
