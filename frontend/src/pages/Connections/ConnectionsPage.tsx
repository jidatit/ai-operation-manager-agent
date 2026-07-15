import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { IntegrationCard } from '@/components/connections/IntegrationCard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { api } from '@/services/api';
import type { Connection } from '@/types';

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
      (await api.post<{ url: string }>(`/connections/${provider.toLowerCase()}`)).data,
    onSuccess: (res) => {
      window.location.href = res.url;
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
        <h2 className="text-2xl font-semibold tracking-tight">Connections</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect business apps so AI COO can collect operational data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(data ?? []).map((c) => (
          <IntegrationCard
            key={c.provider}
            connection={c}
            isConnecting={connect.isPending}
            isDisconnecting={disconnect.isPending}
            onConnect={() => connect.mutate(c.provider)}
            onDisconnect={() => disconnect.mutate(c.provider)}
          />
        ))}
      </div>
    </div>
  );
}
