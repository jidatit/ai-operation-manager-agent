import type { NormalizedItem } from '../types/normalized.js';

/** Identity normalizer — collectors already emit NormalizedItem. Kept for extension. */
export function normalizeItems(items: NormalizedItem[]): NormalizedItem[] {
  return items.map((item) => ({
    ...item,
    title: item.title.trim() || '(Untitled)',
    summary: item.summary.trim(),
    priority: item.priority ?? 'medium',
  }));
}

export function countBySource(items: NormalizedItem[]) {
  return {
    emails: items.filter((i) => i.source === 'gmail').length,
    meetings: items.filter((i) => i.source === 'calendar').length,
    tasks: items.filter((i) => i.source === 'asana').length,
    slack: items.filter((i) => i.source === 'slack').length,
  };
}
