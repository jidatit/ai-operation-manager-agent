import { OAuthProvider } from '@prisma/client';
import { prisma } from '../utils/prisma.js';
import { AppError } from '../middleware/errors.js';

const PROVIDERS: OAuthProvider[] = [
  OAuthProvider.GOOGLE,
  OAuthProvider.SLACK,
  OAuthProvider.ASANA,
];

export async function listConnections(userId: string) {
  const accounts = await prisma.oAuthAccount.findMany({ where: { userId } });
  const byProvider = new Map(accounts.map((a) => [a.provider, a]));

  return PROVIDERS.map((provider) => {
    const account = byProvider.get(provider);
    const metadata = (account?.metadata as Record<string, unknown> | null) ?? null;
    return {
      provider,
      connected: !!account,
      lastSync: account?.lastSyncAt ?? null,
      metadata: metadata
        ? {
            teamName: metadata.teamName,
            workspaceName: metadata.workspaceName,
            teamId: metadata.teamId,
            workspaceId: metadata.workspaceId,
          }
        : null,
    };
  });
}

export async function disconnectProvider(userId: string, providerRaw: string) {
  const provider = providerRaw.toUpperCase() as OAuthProvider;
  if (!PROVIDERS.includes(provider)) {
    throw new AppError(400, 'Unknown provider', 'INVALID_PROVIDER');
  }

  await prisma.oAuthAccount.deleteMany({
    where: { userId, provider },
  });

  return { ok: true, provider };
}

export async function markSync(userId: string, provider: OAuthProvider) {
  await prisma.oAuthAccount.updateMany({
    where: { userId, provider },
    data: { lastSyncAt: new Date() },
  });
}
