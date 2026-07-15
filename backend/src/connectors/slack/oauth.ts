import { OAuthProvider } from '@prisma/client';
import { WebClient } from '@slack/web-api';
import { env } from '../../config/env.js';
import { AppError, ReconnectRequiredError } from '../../middleware/errors.js';
import { decrypt, encrypt } from '../../utils/encryption.js';
import { logger } from '../../utils/logger.js';
import { prisma } from '../../utils/prisma.js';

const SCOPES = [
  'channels:history',
  'channels:read',
  'groups:history',
  'groups:read',
  'im:history',
  'im:read',
  'mpim:history',
  'mpim:read',
  'users:read',
  'chat:write',
].join(',');

export function getSlackAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.SLACK_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: env.SLACK_REDIRECT_URI,
    state,
  });
  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

export async function handleSlackCallback(code: string, userId: string) {
  const body = new URLSearchParams({
    client_id: env.SLACK_CLIENT_ID,
    client_secret: env.SLACK_CLIENT_SECRET,
    code,
    redirect_uri: env.SLACK_REDIRECT_URI,
  });

  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = (await response.json()) as {
    ok: boolean;
    error?: string;
    access_token?: string;
    scope?: string;
    team?: { id?: string; name?: string };
    bot_user_id?: string;
    authed_user?: { id?: string };
  };

  if (!data.ok || !data.access_token) {
    logger.error({ data }, 'Slack OAuth failed');
    throw new AppError(400, data.error ?? 'Slack OAuth failed');
  }

  const metadata = {
    teamId: data.team?.id,
    teamName: data.team?.name,
    botUserId: data.bot_user_id,
    authedUserId: data.authed_user?.id,
  };

  await prisma.oAuthAccount.upsert({
    where: { userId_provider: { userId, provider: OAuthProvider.SLACK } },
    create: {
      userId,
      provider: OAuthProvider.SLACK,
      accessToken: encrypt(data.access_token),
      scopes: data.scope ?? SCOPES,
      metadata,
    },
    update: {
      accessToken: encrypt(data.access_token),
      scopes: data.scope ?? SCOPES,
      metadata,
    },
  });

  logger.info({ userId, teamId: metadata.teamId }, 'Slack connected');
  return metadata;
}

export async function getSlackClient(userId: string): Promise<{
  client: WebClient;
  metadata: Record<string, unknown>;
}> {
  const account = await prisma.oAuthAccount.findUnique({
    where: { userId_provider: { userId, provider: OAuthProvider.SLACK } },
  });
  if (!account) {
    throw new ReconnectRequiredError('SLACK');
  }
  const token = decrypt(account.accessToken);
  return {
    client: new WebClient(token),
    metadata: (account.metadata as Record<string, unknown>) ?? {},
  };
}
