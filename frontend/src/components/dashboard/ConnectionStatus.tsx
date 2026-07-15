import { Link } from 'react-router-dom';
import { Plug } from 'lucide-react';
import { ProviderLogo, PROVIDER_NAMES } from '@/components/connections/ProviderLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectionBadge } from '@/components/shared/ConnectionBadge';
import { formatRelative } from '@/utils/format';
import type { Connection } from '@/types';

export function ConnectionStatus({ connections }: { connections: Connection[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-500/10 text-zinc-600 dark:text-zinc-400">
            <Plug className="h-4 w-4" />
          </div>
          <CardTitle>Connection Status</CardTitle>
        </div>
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link to="/connections">Manage</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-3">
          {connections.map((c) => (
            <li
              key={c.provider}
              className="rounded-lg border border-border/60 p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <ProviderLogo provider={c.provider} size="sm" />
                  <p className="text-sm font-semibold">{PROVIDER_NAMES[c.provider]}</p>
                </div>
                <ConnectionBadge connected={c.connected} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Last sync:{' '}
                {c.lastSync ? formatRelative(c.lastSync) : 'Never'}
              </p>
              <div className="mt-3">
                <Button type="button" variant="outline" size="sm" asChild className="w-full">
                  <Link to="/connections">
                    {c.connected ? 'Reconnect' : 'Connect'}
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
