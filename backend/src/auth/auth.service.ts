import { OAuthProvider } from '@prisma/client';
import { google } from 'googleapis';
import { createGoogleOAuthClient } from './google.oauth.js';
import { encrypt } from '../utils/encryption.js';
import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errors.js';

export async function handleGoogleCallback(code: string) {
  const client = createGoogleOAuthClient(env.GOOGLE_REDIRECT_URI);
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  if (!tokens.access_token) {
    throw new AppError(400, 'Google did not return an access token');
  }

  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const { data: profile } = await oauth2.userinfo.get();

  if (!profile.email) {
    throw new AppError(400, 'Google account email is required');
  }

  const user = await prisma.user.upsert({
    where: { email: profile.email },
    create: {
      email: profile.email,
      name: profile.name ?? profile.email,
      avatar: profile.picture ?? null,
      settings: { create: {} },
    },
    update: {
      name: profile.name ?? undefined,
      avatar: profile.picture ?? undefined,
    },
    include: { settings: true },
  });

  const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : null;
  const scopes = tokens.scope ?? '';

  await prisma.oAuthAccount.upsert({
    where: {
      userId_provider: { userId: user.id, provider: OAuthProvider.GOOGLE },
    },
    create: {
      userId: user.id,
      provider: OAuthProvider.GOOGLE,
      accessToken: encrypt(tokens.access_token),
      refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
      expiresAt,
      scopes,
      metadata: { googleId: profile.id },
    },
    update: {
      accessToken: encrypt(tokens.access_token),
      refreshToken: tokens.refresh_token
        ? encrypt(tokens.refresh_token)
        : undefined,
      expiresAt,
      scopes,
      metadata: { googleId: profile.id },
    },
  });

  logger.info({ userId: user.id, email: user.email }, 'Google OAuth login success');
  return user;
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { settings: true },
  });
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return user;
}
