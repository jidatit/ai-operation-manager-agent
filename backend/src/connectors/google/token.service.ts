import { OAuthProvider } from '@prisma/client';
import { google } from 'googleapis';
import { env } from '../../config/env.js';
import { ReconnectRequiredError } from '../../middleware/errors.js';
import { decrypt, encrypt } from '../../utils/encryption.js';
import { logger } from '../../utils/logger.js';
import { prisma } from '../../utils/prisma.js';
import { createGoogleOAuthClient } from '../../auth/google.oauth.js';

const REFRESH_BUFFER_MS = 60_000;

export async function getGoogleAuthClient(userId: string) {
  const account = await prisma.oAuthAccount.findUnique({
    where: { userId_provider: { userId, provider: OAuthProvider.GOOGLE } },
  });

  if (!account) {
    throw new ReconnectRequiredError('GOOGLE');
  }

  const client = createGoogleOAuthClient(env.GOOGLE_CONNECT_REDIRECT_URI);
  let accessToken = decrypt(account.accessToken);
  let refreshToken = account.refreshToken ? decrypt(account.refreshToken) : undefined;

  const expiresSoon =
    !account.expiresAt || account.expiresAt.getTime() <= Date.now() + REFRESH_BUFFER_MS;

  if (expiresSoon && refreshToken) {
    client.setCredentials({ refresh_token: refreshToken });
    try {
      const { credentials } = await client.refreshAccessToken();
      accessToken = credentials.access_token ?? accessToken;
      refreshToken = credentials.refresh_token ?? refreshToken;
      await prisma.oAuthAccount.update({
        where: { id: account.id },
        data: {
          accessToken: encrypt(accessToken),
          refreshToken: refreshToken ? encrypt(refreshToken) : account.refreshToken,
          expiresAt: credentials.expiry_date
            ? new Date(credentials.expiry_date)
            : account.expiresAt,
          scopes: credentials.scope ?? account.scopes,
        },
      });
      logger.info({ userId }, 'Refreshed Google access token');
    } catch (err) {
      logger.error({ err, userId }, 'Google token refresh failed');
      throw new ReconnectRequiredError('GOOGLE');
    }
  }

  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: account.expiresAt?.getTime(),
  });

  return { client, account };
}

export function getGmailClient(auth: InstanceType<typeof google.auth.OAuth2>) {
  return google.gmail({ version: 'v1', auth });
}

export function getCalendarClient(auth: InstanceType<typeof google.auth.OAuth2>) {
  return google.calendar({ version: 'v3', auth });
}
