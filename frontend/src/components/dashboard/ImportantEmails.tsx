import { ExternalLink, Mail, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { formatRelative } from '@/utils/format';
import type { NormalizedItem } from '@/types';

function parseSender(summary: string): string {
  const match = summary.match(/^([^:]+):/);
  return match?.[1]?.trim() ?? 'Unknown';
}

function parsePreview(summary: string): string {
  const idx = summary.indexOf(':');
  if (idx === -1) return summary;
  return summary.slice(idx + 1).trim();
}

export function ImportantEmails({ items }: { items: NormalizedItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <Mail className="h-4 w-4" />
        </div>
        <CardTitle>Recent Important Emails</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            compact
            title="No emails"
            description="Important Gmail messages from your last report will appear here."
            icon={<Mail className="h-5 w-5" />}
          />
        ) : (
          <ul className="space-y-3">
            {items.slice(0, 8).map((item, idx) => (
              <li
                key={`${item.title}-${idx}`}
                className="rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{parseSender(item.summary)}</p>
                      <PriorityBadge priority={item.priority} />
                      {item.meta?.unread === true ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          Unread
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {parsePreview(item.summary)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatRelative(item.time)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {item.url ? (
                      <>
                        <Button type="button" variant="outline" size="sm" asChild>
                          <a href={item.url} target="_blank" rel="noreferrer">
                            <Reply className="h-3 w-3" />
                            Reply
                          </a>
                        </Button>
                        <Button type="button" variant="ghost" size="sm" asChild>
                          <a href={item.url} target="_blank" rel="noreferrer" aria-label="Open Gmail">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
