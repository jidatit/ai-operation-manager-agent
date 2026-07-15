import type { gmail_v1 } from 'googleapis';
import type { NormalizedItem } from '../../types/normalized.js';
import { getGmailClient, getGoogleAuthClient } from './token.service.js';

function header(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string,
): string {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? '';
}

function toPriority(labels: string[] | undefined): NormalizedItem['priority'] {
  if (labels?.includes('IMPORTANT') || labels?.includes('STARRED')) return 'high';
  if (labels?.includes('UNREAD')) return 'medium';
  return 'low';
}

export async function collectGmail(
  userId: string,
  mode: 'morning' | 'evening',
): Promise<NormalizedItem[]> {
  const { client } = await getGoogleAuthClient(userId);
  const gmail = getGmailClient(client);

  const query =
    mode === 'morning'
      ? 'newer_than:1d in:inbox -category:promotions -category:social'
      : 'is:unread newer_than:1d -category:promotions -category:social';

  const list = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 40,
  });

  const messages = list.data.messages ?? [];
  const items: NormalizedItem[] = [];

  for (const msg of messages.slice(0, 25)) {
    if (!msg.id) continue;
    const full = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'metadata',
      metadataHeaders: ['From', 'Subject', 'Date'],
    });

    const labels = full.data.labelIds ?? [];
    const headers = full.data.payload?.headers;
    const from = header(headers, 'From');
    const subject = header(headers, 'Subject') || '(No subject)';
    const date = header(headers, 'Date');

    items.push({
      source: 'gmail',
      title: subject,
      summary: `${from}: ${full.data.snippet ?? ''}`.trim(),
      priority: toPriority(labels),
      time: date ? new Date(date).toISOString() : undefined,
      url: `https://mail.google.com/mail/u/0/#inbox/${msg.id}`,
      meta: {
        labels,
        unread: labels.includes('UNREAD'),
        important: labels.includes('IMPORTANT'),
        starred: labels.includes('STARRED'),
      },
    });
  }

  return items;
}
