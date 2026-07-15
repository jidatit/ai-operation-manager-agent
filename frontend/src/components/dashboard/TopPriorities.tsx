import { ExternalLink, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import type { NormalizedItem } from '@/types';

const sourceLabel: Record<string, string> = {
  gmail: 'Gmail',
  calendar: 'Calendar',
  asana: 'Asana',
  slack: 'Slack',
};

export function TopPriorities({ items }: { items: NormalizedItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
          <Flag className="h-4 w-4" />
        </div>
        <CardTitle>Top Priorities</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            compact
            title="No priorities"
            description="Priorities appear after a report collects operational data."
            icon={<Flag className="h-5 w-5" />}
          />
        ) : (
          <ul className="space-y-3">
            {items.map((item, idx) => (
              <li
                key={`${item.source}-${item.title}-${idx}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <PriorityBadge
                      priority={item.priority}
                      label={item.priority === 'high' ? 'Critical' : undefined}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {sourceLabel[item.source] ?? item.source}
                    {item.summary ? ` · ${item.summary.slice(0, 80)}` : ''}
                  </p>
                </div>
                {item.url ? (
                  <Button type="button" variant="outline" size="sm" asChild>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      Open
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
