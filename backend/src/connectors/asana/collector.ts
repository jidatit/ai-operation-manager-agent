import type { NormalizedItem } from '../../types/normalized.js';
import { getAsanaAccessToken } from './oauth.js';

interface AsanaTask {
  gid: string;
  name: string;
  notes?: string;
  due_on?: string | null;
  completed?: boolean;
  permalink_url?: string;
  assignee_status?: string;
  memberships?: { section?: { name?: string } }[];
}

async function asanaFetch<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`https://app.asana.com/api/1.0${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Asana API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function todayIsoDate(timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export async function collectAsana(
  userId: string,
  mode: 'morning' | 'evening',
  timezone = 'UTC',
): Promise<NormalizedItem[]> {
  const { accessToken, metadata } = await getAsanaAccessToken(userId);
  const workspaceId = metadata.workspaceId as string | undefined;
  if (!workspaceId) {
    return [];
  }

  const today = todayIsoDate(timezone);
  const optFields =
    'name,notes,due_on,completed,permalink_url,assignee_status,memberships.section.name';

  const assigned = await asanaFetch<{ data: AsanaTask[] }>(
    accessToken,
    `/tasks?workspace=${workspaceId}&assignee=me&completed_since=now&opt_fields=${optFields}&limit=50`,
  );

  const recentlyCompleted = await asanaFetch<{ data: AsanaTask[] }>(
    accessToken,
    `/tasks?workspace=${workspaceId}&assignee=me&completed_since=${today}T00:00:00.000Z&opt_fields=${optFields}&limit=50`,
  );

  const items: NormalizedItem[] = [];
  const seen = new Set<string>();

  const pushTask = (task: AsanaTask, priority: NormalizedItem['priority'], tag: string) => {
    if (seen.has(task.gid)) return;
    seen.add(task.gid);
    const section = task.memberships?.[0]?.section?.name ?? '';
    const blocked = /block/i.test(section) || /block/i.test(task.name);
    items.push({
      source: 'asana',
      title: task.name,
      summary: [tag, task.notes?.slice(0, 180), task.due_on && `Due: ${task.due_on}`, blocked && 'Blocked']
        .filter(Boolean)
        .join(' | '),
      priority: blocked ? 'high' : priority,
      time: task.due_on ? `${task.due_on}T12:00:00.000Z` : undefined,
      url: task.permalink_url,
      meta: {
        completed: task.completed,
        dueOn: task.due_on,
        blocked,
        tag,
      },
    });
  };

  if (mode === 'morning') {
    for (const task of assigned.data ?? []) {
      if (task.completed) continue;
      const dueToday = task.due_on === today;
      const overdue = !!task.due_on && task.due_on < today;
      if (dueToday || overdue) {
        pushTask(task, overdue ? 'high' : 'high', overdue ? 'Overdue' : 'Due today');
      } else {
        pushTask(task, 'medium', 'Assigned');
      }
    }
  } else {
    for (const task of recentlyCompleted.data ?? []) {
      if (task.completed) {
        pushTask(task, 'low', 'Completed today');
      }
    }
    for (const task of assigned.data ?? []) {
      if (task.completed) continue;
      const overdue = !!task.due_on && task.due_on < today;
      pushTask(task, overdue ? 'high' : 'medium', overdue ? 'Overdue' : 'Remaining');
    }
  }

  return items.slice(0, 50);
}
