import { Hash, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatRelative } from '@/utils/format';
import type { NormalizedItem } from '@/types';

function channelFromItem(item: NormalizedItem): string {
  if (typeof item.meta?.channel === 'string') return item.meta.channel;
  if (item.title.startsWith('#')) return item.title;
  const match = item.title.match(/#(\w+)/);
  return match ? `#${match[1]}` : item.title || 'Slack';
}

export function SlackActivity({ items }: { items: NormalizedItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
          <MessageSquare className="h-4 w-4" />
        </div>
        <CardTitle>Slack Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            compact
            title="No Slack activity"
            description="Mentions and important discussions from your last report will appear here."
            icon={<MessageSquare className="h-5 w-5" />}
          />
        ) : (
          <ul className="space-y-3">
            {items.slice(0, 8).map((item, idx) => (
              <li
                key={`${item.title}-${idx}`}
                className="rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  {channelFromItem(item)}
                  <span className="text-muted-foreground/60">·</span>
                  <span>{formatRelative(item.time)}</span>
                </div>
                <p className="mt-1.5 text-sm font-medium">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.summary}</p>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                  >
                    Open in Slack
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
