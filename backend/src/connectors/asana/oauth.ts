import { OAuthProvider } from '@prisma/client';
import { env } from '../../config/env.js';
import { AppError, ReconnectRequiredError } from '../../middleware/errors.js';
import { decrypt, encrypt } from '../../utils/encryption.js';
import { logger } from '../../utils/logger.js';
import { prisma } from '../../utils/prisma.js';

const REFRESH_BUFFER_MS = 60_000;

export function getAsanaAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.ASANA_CLIENT_ID,
    redirect_uri: env.ASANA_REDIRECT_URI,
    response_type: 'code',
    state,
    scope: 'default',
  });
  return `https://app.asana.com/-/oauth_authorize?${params.toString()}`;
}

async function exchangeAsanaToken(params: URLSearchParams) {
  const response = await fetch('https://app.asana.com/-/oauth_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const data = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    data?: { id?: number; email?: string; name?: string };
    error?: string;
    error_description?: string;
  };
  if (!data.access_token) {
    throw new AppError(
      400,
      data.error_description ?? data.error ?? 'Asana OAuth failed',
    );
  }
  return data;
}

export async function handleAsanaCallback(code: string, userId: string) {
  const data = await exchangeAsanaToken(
    new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.ASANA_CLIENT_ID,
      client_secret: env.ASANA_CLIENT_SECRET,
      redirect_uri: env.ASANA_REDIRECT_URI,
      code,
    }),
  );

  const meRes = await fetch('https://app.asana.com/api/1.0/users/me', {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const meJson = (await meRes.json()) as {
    data?: {
      gid?: string;
      workspaces?: { gid: string; name: string }[];
    };
  };
  const workspace = meJson.data?.workspaces?.[0];

  const metadata = {
    asanaUserGid: meJson.data?.gid,
    workspaceId: workspace?.gid,
    workspaceName: workspace?.name,
  };

  const expiresAt = data.expires_in
    ? new Date(Date.now() + data.expires_in * 1000)
    : null;

  await prisma.oAuthAccount.upsert({
    where: { userId_provider: { userId, provider: OAuthProvider.ASANA } },
    create: {
      userId,
      provider: OAuthProvider.ASANA,
      accessToken: encrypt(data.access_token!),
      refreshToken: data.refresh_token ? encrypt(data.refresh_token) : null,
      expiresAt,
      scopes: 'default',
      metadata,
    },
    update: {
      accessToken: encrypt(data.access_token!),
      refreshToken: data.refresh_token ? encrypt(data.refresh_token) : undefined,
      expiresAt,
      metadata,
    },
  });

  logger.info({ userId, workspaceId: metadata.workspaceId }, 'Asana connected');
  return metadata;
}

export async function getAsanaAccessToken(userId: string): Promise<{
  accessToken: string;
  metadata: Record<string, unknown>;
}> {
  const account = await prisma.oAuthAccount.findUnique({
    where: { userId_provider: { userId, provider: OAuthProvider.ASANA } },
  });
  if (!account) {
    throw new ReconnectRequiredError('ASANA');
  }

  const expiresSoon =
    !account.expiresAt || account.expiresAt.getTime() <= Date.now() + REFRESH_BUFFER_MS;

  if (expiresSoon && account.refreshToken) {
    try {
      const data = await exchangeAsanaToken(
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: env.ASANA_CLIENT_ID,
          client_secret: env.ASANA_CLIENT_SECRET,
          refresh_token: decrypt(account.refreshToken),
        }),
      );
      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : account.expiresAt;
      await prisma.oAuthAccount.update({
        where: { id: account.id },
        data: {
          accessToken: encrypt(data.access_token!),
          refreshToken: data.refresh_token
            ? encrypt(data.refresh_token)
            : account.refreshToken,
          expiresAt,
        },
      });
      return {
        accessToken: data.access_token!,
        metadata: (account.metadata as Record<string, unknown>) ?? {},
      };
    } catch (err) {
      logger.error({ err, userId }, 'Asana token refresh failed');
      throw new ReconnectRequiredError('ASANA');
    }
  }

  return {
    accessToken: decrypt(account.accessToken),
    metadata: (account.metadata as Record<string, unknown>) ?? {},
  };
}
