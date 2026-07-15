import { CheckSquare, ListTodo } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { formatTime } from '@/utils/format';
import type { NormalizedItem } from '@/types';

export function TasksDueToday({ items }: { items: NormalizedItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <ListTodo className="h-4 w-4" />
        </div>
        <CardTitle>Tasks Due Today</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            compact
            title="No tasks"
            description="Asana tasks from your last report will appear here."
            icon={<ListTodo className="h-5 w-5" />}
          />
        ) : (
          <ul className="space-y-2">
            {items.map((item, idx) => {
              const completed = item.meta?.completed === true;
              const tag = typeof item.meta?.tag === 'string' ? item.meta.tag : 'Asana';
              return (
                <li
                  key={`${item.title}-${idx}`}
                  className="flex items-start gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/40"
                >
                  <div
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      completed
                        ? 'border-success bg-success text-success-foreground'
                        : 'border-muted-foreground/40'
                    }`}
                    aria-hidden
                  >
                    {completed ? <CheckSquare className="h-3 w-3" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={`text-sm font-medium ${completed ? 'text-muted-foreground line-through' : ''}`}
                      >
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            {item.title}
                          </a>
                        ) : (
                          item.title
                        )}
                      </p>
                      <PriorityBadge priority={item.priority} />
                      <Badge variant="secondary">{tag}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.time ? `Due ${formatTime(item.time)}` : 'No due time'} · Asana
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
