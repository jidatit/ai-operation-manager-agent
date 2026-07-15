import { Calendar, CheckCircle2 } from 'lucide-react';
import { ProviderLogo } from '@/components/connections/ProviderLogo';
import { ConnectionBadge } from '@/components/shared/ConnectionBadge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDate } from '@/utils/format';
import type { Connection } from '@/types';

const PROVIDER_COPY: Record<
  Connection['provider'],
  {
    title: string;
    description: string;
    permissions: string[];
  }
> = {
  GOOGLE: {
    title: 'Google Workspace',
    description: 'Gmail and Google Calendar for email and meeting context.',
    permissions: ['Gmail read', 'Calendar read'],
  },
  SLACK: {
    title: 'Slack',
    description: 'Workspace messages, mentions, and report delivery.',
    permissions: ['Channels read', 'Chat write'],
  },
  ASANA: {
    title: 'Asana',
    description: 'Tasks due today, blocked work, and daily progress.',
    permissions: ['Tasks read'],
  },
};

export function IntegrationCard({
  connection,
  onConnect,
  onDisconnect,
  isConnecting,
  isDisconnecting,
}: {
  connection: Connection;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting: boolean;
  isDisconnecting: boolean;
}) {
  const copy = PROVIDER_COPY[connection.provider];
  const workspace =
    connection.metadata?.teamName ??
    connection.metadata?.workspaceName ??
    null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <ProviderLogo provider={connection.provider} size="md" />
            <div>
              <CardTitle>{copy.title}</CardTitle>
              <CardDescription className="mt-1">{copy.description}</CardDescription>
            </div>
          </div>
          <ConnectionBadge connected={connection.connected} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 text-sm">
        {workspace ? (
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Workspace: </span>
            {workspace}
          </p>
        ) : null}
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">Last sync: </span>
          {connection.lastSync ? formatDate(connection.lastSync) : 'Never'}
        </p>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Permissions
          </p>
          <ul className="space-y-1.5">
            {copy.permissions.map((perm) => (
              <li key={perm} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                {perm}
              </li>
            ))}
            {connection.provider === 'GOOGLE' ? (
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-success" />
                Calendar access
              </li>
            ) : null}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          type="button"
          disabled={isConnecting}
          onClick={onConnect}
          className="flex-1"
        >
          {connection.connected ? 'Reconnect' : 'Connect'}
        </Button>
        {connection.connected ? (
          <Button
            type="button"
            variant="outline"
            disabled={isDisconnecting}
            onClick={onDisconnect}
          >
            Disconnect
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
