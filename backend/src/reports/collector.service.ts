import { OAuthProvider } from '@prisma/client';
import { collectAsana } from '../connectors/asana/collector.js';
import { collectCalendar } from '../connectors/google/calendar.js';
import { collectGmail } from '../connectors/google/gmail.js';
import { collectSlack } from '../connectors/slack/collector.js';
import { markSync } from '../connectors/connections.service.js';
import type { CollectionResult } from '../types/normalized.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../utils/prisma.js';
import { countBySource, normalizeItems } from './normalizer.js';

export async function collectData(
  userId: string,
  mode: 'morning' | 'evening',
): Promise<CollectionResult> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const accounts = await prisma.oAuthAccount.findMany({ where: { userId } });
  const connected = new Set(accounts.map((a) => a.provider));

  const errors: CollectionResult['errors'] = [];
  const settled = await Promise.allSettled([
    connected.has(OAuthProvider.GOOGLE)
      ? collectGmail(userId, mode).then(async (items) => {
          await markSync(userId, OAuthProvider.GOOGLE);
          return items;
        })
      : Promise.resolve([]),
    connected.has(OAuthProvider.GOOGLE)
      ? collectCalendar(userId, mode, user.timezone)
      : Promise.resolve([]),
    connected.has(OAuthProvider.ASANA)
      ? collectAsana(userId, mode, user.timezone).then(async (items) => {
          await markSync(userId, OAuthProvider.ASANA);
          return items;
        })
      : Promise.resolve([]),
    connected.has(OAuthProvider.SLACK)
      ? collectSlack(userId, mode).then(async (items) => {
          await markSync(userId, OAuthProvider.SLACK);
          return items;
        })
      : Promise.resolve([]),
  ]);

  const labels = ['gmail', 'calendar', 'asana', 'slack'] as const;
  const items = [];
  const sourceCounts: Record<string, number> = {
    gmail: 0,
    calendar: 0,
    asana: 0,
    slack: 0,
  };

  for (let i = 0; i < settled.length; i++) {
    const result = settled[i];
    const source = labels[i];
    if (result.status === 'fulfilled') {
      sourceCounts[source] = result.value.length;
      items.push(...result.value);
    } else {
      const message =
        result.reason instanceof Error ? result.reason.message : String(result.reason);
      logger.warn({ userId, source, message }, 'Collector failed — continuing');
      errors.push({ source, error: message });
    }
  }

  logger.info({ userId, mode, sourceCounts }, 'Collector finished');

  const normalized = normalizeItems(items);
  return {
    items: normalized,
    errors,
    counts: countBySource(normalized),
  };
}
