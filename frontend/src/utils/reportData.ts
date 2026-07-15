import type {
  CollectionResult,
  DerivedStats,
  ItemPriority,
  NormalizedItem,
  StatTrend,
  TrendDirection,
} from '@/types';

const PRIORITY_ORDER: Record<ItemPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function extractMarkdownSection(markdown: string, heading: string): string {
  if (!markdown) return '';
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `(?:^|\\n)##?\\s*${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##?\\s|$)`,
    'i',
  );
  const match = markdown.match(regex);
  return match?.[1]?.trim() ?? '';
}

export function extractHeadings(markdown: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const lines = markdown.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (!match) continue;
    const level = match[1].length;
    const text = match[2].trim();
    const id = slugify(text);
    headings.push({ id, text, level });
  }
  return headings;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function filterBySource(
  items: NormalizedItem[],
  source: NormalizedItem['source'],
): NormalizedItem[] {
  return items.filter((i) => i.source === source);
}

export function sortByPriority(items: NormalizedItem[]): NormalizedItem[] {
  return [...items].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

export function topPriorities(items: NormalizedItem[], limit = 8): NormalizedItem[] {
  return sortByPriority(items).slice(0, limit);
}

export function deriveStats(items: NormalizedItem[], counts?: CollectionResult['counts']): DerivedStats {
  const emails = filterBySource(items, 'gmail');
  const meetings = filterBySource(items, 'calendar');
  const tasks = filterBySource(items, 'asana');
  const slack = filterBySource(items, 'slack');

  const unreadEmails = emails.filter((i) => i.meta?.unread === true).length;
  const completedTasks = tasks.filter((i) => i.meta?.completed === true).length;
  const overdueTasks = tasks.filter((i) => {
    const tag = String(i.meta?.tag ?? '').toLowerCase();
    return tag.includes('overdue');
  }).length;
  const lateTasks = tasks.filter((i) => {
    const tag = String(i.meta?.tag ?? '').toLowerCase();
    return tag.includes('overdue') || tag.includes('late');
  }).length;

  return {
    emailsToday: counts?.emails ?? emails.length,
    calendarMeetings: counts?.meetings ?? meetings.length,
    tasksDue: counts?.tasks ?? tasks.length,
    slackMentions: counts?.slack ?? slack.length,
    completedTasks,
    unreadEmails,
    lateTasks,
    overdueTasks: overdueTasks || lateTasks,
  };
}

export function compareCounts(
  current?: CollectionResult['counts'] | null,
  previous?: CollectionResult['counts'] | null,
  key?: keyof NonNullable<CollectionResult['counts']>,
): StatTrend {
  if (!current || !previous || !key) {
    return { direction: 'flat', delta: 0 };
  }
  const delta = current[key] - previous[key];
  let direction: TrendDirection = 'flat';
  if (delta > 0) direction = 'up';
  if (delta < 0) direction = 'down';
  return { direction, delta };
}

export function getRawItems(rawData: CollectionResult | null | undefined): NormalizedItem[] {
  if (!rawData?.items || !Array.isArray(rawData.items)) return [];
  return rawData.items;
}
