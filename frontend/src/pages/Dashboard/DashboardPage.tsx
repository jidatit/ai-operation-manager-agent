import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ConnectionBadge } from '../../components/ConnectionBadge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { StatCard } from '../../components/StatCard';
import { api } from '../../services/api';
import type { DashboardData } from '../../types';

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function DashboardPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<DashboardData>('/dashboard')).data,
  });

  const generate = useMutation({
    mutationFn: async (type: 'MORNING' | 'EVENING') =>
      (await api.post(`/reports/generate?type=${type}`)).data,
    onSuccess: () => {
      toast.success('Report generated');
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
      void qc.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: () => toast.error('Failed to generate report'),
  });

  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (!data) {
    return (
      <EmptyState
        title="Dashboard unavailable"
        description="We could not load your dashboard. Try refreshing."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Operational pulse for {data.timezone}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={generate.isPending}
            onClick={() => generate.mutate('MORNING')}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {generate.isPending ? 'Generating…' : 'Generate Morning Report'}
          </button>
          <button
            type="button"
            disabled={generate.isPending}
            onClick={() => generate.mutate('EVENING')}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
          >
            Generate Evening Report
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Connected Accounts" value={data.connectionCount} />
        <StatCard
          label="Last Report"
          value={data.lastReport?.type ?? 'None'}
          hint={formatDate(data.lastReport?.createdAt)}
        />
        <StatCard
          label="Next Scheduled"
          value={formatDate(data.nextScheduledReport)}
        />
        <StatCard label="Emails (last report)" value={data.counts.emails} />
        <StatCard label="Meetings Today" value={data.counts.meetings} />
        <StatCard label="Tasks Due" value={data.counts.tasks} />
        <StatCard label="Slack Messages" value={data.counts.slack} />
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Connection Status</h2>
            <Link to="/connections" className="text-xs text-blue-600 hover:underline">
              Manage
            </Link>
          </div>
          <ul className="space-y-3">
            {data.connections.map((c) => (
              <li
                key={c.provider}
                className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800"
              >
                <span className="text-sm font-medium capitalize">
                  {c.provider.toLowerCase()}
                </span>
                <ConnectionBadge connected={c.connected} />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent AI Summaries</h2>
            <Link to="/reports" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {data.recentReports.length === 0 ? (
            <EmptyState
              title="No reports yet"
              description="Generate your first morning or evening brief to see it here."
            />
          ) : (
            <ul className="space-y-3">
              {data.recentReports.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/reports/${r.id}`}
                    className="block rounded-lg border border-zinc-100 px-3 py-3 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{r.type}</span>
                      <span className="text-xs text-zinc-500">
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                      {r.preview}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
