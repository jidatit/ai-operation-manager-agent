import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { getGoogleConnectUrl } from '../auth/google.oauth.js';
import { createGoogleOAuthClient } from '../auth/google.oauth.js';
import { encrypt } from '../utils/encryption.js';
import { prisma } from '../utils/prisma.js';
import { OAuthProvider } from '@prisma/client';
import { getSlackAuthUrl, handleSlackCallback } from './slack/oauth.js';
import { getAsanaAuthUrl, handleAsanaCallback } from './asana/oauth.js';
import { disconnectProvider, listConnections } from './connections.service.js';

export const connectionsRouter = Router();

function signedState(userId: string): string {
  return jwt.sign({ userId }, env.SESSION_SECRET, { expiresIn: '15m' });
}

function parseState(state: string): string {
  const payload = jwt.verify(state, env.SESSION_SECRET) as { userId: string };
  return payload.userId;
}

connectionsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json(await listConnections(req.user!.id));
  } catch (err) {
    next(err);
  }
});

connectionsRouter.get('/google', requireAuth, (req, res) => {
  const url = getGoogleConnectUrl(signedState(req.user!.id));
  res.json({ url });
});

connectionsRouter.get('/google/callback', async (req, res) => {
  try {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;
    if (!code || !state) {
      res.redirect(`${env.FRONTEND_URL}/connections?error=missing_params`);
      return;
    }
    const userId = parseState(state);
    const client = createGoogleOAuthClient(env.GOOGLE_CONNECT_REDIRECT_URI);
    const { tokens } = await client.getToken(code);
    if (!tokens.access_token) {
      res.redirect(`${env.FRONTEND_URL}/connections?error=token_missing`);
      return;
    }

    const existing = await prisma.oAuthAccount.findUnique({
      where: { userId_provider: { userId, provider: OAuthProvider.GOOGLE } },
    });

    await prisma.oAuthAccount.upsert({
      where: { userId_provider: { userId, provider: OAuthProvider.GOOGLE } },
      create: {
        userId,
        provider: OAuthProvider.GOOGLE,
        accessToken: encrypt(tokens.access_token),
        refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scopes: tokens.scope ?? '',
      },
      update: {
        accessToken: encrypt(tokens.access_token),
        refreshToken: tokens.refresh_token
          ? encrypt(tokens.refresh_token)
          : existing?.refreshToken,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scopes: tokens.scope ?? existing?.scopes,
      },
    });

    res.redirect(`${env.FRONTEND_URL}/connections?connected=google`);
  } catch (err) {
    logger.error({ err }, 'Google connect callback failed');
    res.redirect(`${env.FRONTEND_URL}/connections?error=google_connect_failed`);
  }
});

connectionsRouter.get('/slack', requireAuth, (req, res) => {
  const url = getSlackAuthUrl(signedState(req.user!.id));
  res.json({ url });
});

connectionsRouter.get('/slack/callback', async (req, res) => {
  try {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;
    if (!code || !state) {
      res.redirect(`${env.FRONTEND_URL}/connections?error=missing_params`);
      return;
    }
    const userId = parseState(state);
    await handleSlackCallback(code, userId);
    res.redirect(`${env.FRONTEND_URL}/connections?connected=slack`);
  } catch (err) {
    logger.error({ err }, 'Slack connect callback failed');
    res.redirect(`${env.FRONTEND_URL}/connections?error=slack_connect_failed`);
  }
});

connectionsRouter.get('/asana', requireAuth, (req, res) => {
  const url = getAsanaAuthUrl(signedState(req.user!.id));
  res.json({ url });
});

connectionsRouter.get('/asana/callback', async (req, res) => {
  try {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;
    if (!code || !state) {
      res.redirect(`${env.FRONTEND_URL}/connections?error=missing_params`);
      return;
    }
    const userId = parseState(state);
    await handleAsanaCallback(code, userId);
    res.redirect(`${env.FRONTEND_URL}/connections?connected=asana`);
  } catch (err) {
    logger.error({ err }, 'Asana connect callback failed');
    res.redirect(`${env.FRONTEND_URL}/connections?error=asana_connect_failed`);
  }
});

connectionsRouter.delete('/:provider', requireAuth, async (req, res, next) => {
  try {
    res.json(await disconnectProvider(req.user!.id, req.params.provider));
  } catch (err) {
    next(err);
  }
});

// Alias POST endpoints from the plan for starting OAuth
connectionsRouter.post('/google', requireAuth, (req, res) => {
  const url = getGoogleConnectUrl(signedState(req.user!.id));
  res.json({ url });
});
connectionsRouter.post('/slack', requireAuth, (req, res) => {
  const url = getSlackAuthUrl(signedState(req.user!.id));
  res.json({ url });
});
connectionsRouter.post('/asana', requireAuth, (req, res) => {
  const url = getAsanaAuthUrl(signedState(req.user!.id));
  res.json({ url });
});
