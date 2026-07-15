import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ConnectionBadge } from '../../components/ConnectionBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { api } from '../../services/api';
import type { Connection } from '../../types';

const copy: Record<
  Connection['provider'],
  { title: string; description: string }
> = {
  GOOGLE: {
    title: 'Google',
    description: 'Gmail and Google Calendar for email and meeting context.',
  },
  SLACK: {
    title: 'Slack',
    description: 'Workspace messages, mentions, and report delivery.',
  },
  ASANA: {
    title: 'Asana',
    description: 'Tasks due today, blocked work, and daily progress.',
  },
};

export function ConnectionsPage() {
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: async () => (await api.get<Connection[]>('/connections')).data,
  });

  useEffect(() => {
    const connected = params.get('connected');
    const error = params.get('error');
    if (connected) {
      toast.success(`${connected} connected`);
      void qc.invalidateQueries({ queryKey: ['connections'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
      setParams({});
    } else if (error) {
      toast.error('Connection failed. Please try again.');
      setParams({});
    }
  }, [params, qc, setParams]);

  const connect = useMutation({
    mutationFn: async (provider: string) =>
      (await api.post<{ url: string }>(`/connections/${provider.toLowerCase()}`))
        .data,
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: () => toast.error('Could not start OAuth flow'),
  });

  const disconnect = useMutation({
    mutationFn: async (provider: string) =>
      api.delete(`/connections/${provider.toLowerCase()}`),
    onSuccess: () => {
      toast.success('Disconnected');
      void qc.invalidateQueries({ queryKey: ['connections'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => toast.error('Disconnect failed'),
  });

  if (isLoading) return <LoadingSkeleton rows={3} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Connections</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Connect business apps so AI COO can collect operational data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(data ?? []).map((c) => {
          const meta = copy[c.provider] ?? {
            title: c.provider,
            description: '',
          };
          return (
            <div
              key={c.provider}
              className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">{meta.title}</h2>
                  <p className="mt-1 text-sm text-zinc-500">{meta.description}</p>
                </div>
                <ConnectionBadge connected={c.connected} />
              </div>
              {c.metadata?.teamName || c.metadata?.workspaceName ? (
                <p className="mt-3 text-xs text-zinc-500">
                  {c.metadata.teamName ?? c.metadata.workspaceName}
                </p>
              ) : null}
              {c.lastSync ? (
                <p className="mt-1 text-xs text-zinc-400">
                  Last sync: {new Date(c.lastSync).toLocaleString()}
                </p>
              ) : null}
              <div className="mt-auto flex gap-2 pt-6">
                <button
                  type="button"
                  onClick={() => connect.mutate(c.provider)}
                  className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  {c.connected ? 'Reconnect' : 'Connect'}
                </button>
                {c.connected ? (
                  <button
                    type="button"
                    onClick={() => disconnect.mutate(c.provider)}
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium dark:border-zinc-700"
                  >
                    Disconnect
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
