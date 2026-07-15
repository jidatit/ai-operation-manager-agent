import type { NormalizedItem } from '../../types/normalized.js';
import { logger } from '../../utils/logger.js';
import { getSlackClient } from './oauth.js';

export async function collectSlack(
  userId: string,
  _mode: 'morning' | 'evening',
): Promise<NormalizedItem[]> {
  const { client } = await getSlackClient(userId);
  const items: NormalizedItem[] = [];
  const oldest = String(Math.floor(Date.now() / 1000) - 24 * 60 * 60);

  try {
    const auth = await client.auth.test();
    const userIdSlack = auth.user_id;

    const channels = await client.conversations.list({
      types: 'public_channel,private_channel,im,mpim',
      limit: 20,
      exclude_archived: true,
    });

    for (const channel of channels.channels ?? []) {
      if (!channel.id || channel.is_archived) continue;
      try {
        const history = await client.conversations.history({
          channel: channel.id,
          oldest,
          limit: 15,
        });

        for (const msg of history.messages ?? []) {
          if (!msg.text || msg.subtype) continue;
          const mentionsUser =
            !!userIdSlack && (msg.text.includes(`<@${userIdSlack}>`) || msg.text.includes('<!here>') || msg.text.includes('<!channel>'));
          const isThread = !!msg.thread_ts && msg.thread_ts !== msg.ts;

          items.push({
            source: 'slack',
            title: `#${channel.name ?? channel.id}`,
            summary: msg.text.slice(0, 280),
            priority: mentionsUser ? 'high' : isThread ? 'medium' : 'low',
            time: msg.ts
              ? new Date(Number(msg.ts) * 1000).toISOString()
              : undefined,
            url: channel.id
              ? `https://slack.com/app_redirect?channel=${channel.id}`
              : undefined,
            meta: {
              mentionsUser,
              isThread,
              channelId: channel.id,
            },
          });
        }
      } catch (err) {
        logger.warn({ err, channelId: channel.id }, 'Slack channel history skipped');
      }
    }
  } catch (err) {
    logger.error({ err, userId }, 'Slack collection failed');
    throw err;
  }

  return items.slice(0, 40);
}

export async function postSlackReport(
  userId: string,
  text: string,
  channelId?: string | null,
): Promise<void> {
  const { client, metadata } = await getSlackClient(userId);
  let channel = channelId;

  if (!channel) {
    const authedUserId = metadata.authedUserId as string | undefined;
    if (authedUserId) {
      const dm = await client.conversations.open({ users: authedUserId });
      channel = dm.channel?.id;
    }
  }

  if (!channel) {
    throw new Error('No Slack channel available for delivery');
  }

  await client.chat.postMessage({
    channel,
    text,
    mrkdwn: true,
  });
}
