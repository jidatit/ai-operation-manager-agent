import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { api } from '../../services/api';
import type { ReportsResponse } from '../../types';

export function ReportsPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    return params.toString();
  }, [search, type, from, to]);

  const { data, isLoading } = useQuery({
    queryKey: ['reports', queryString],
    queryFn: async () =>
      (await api.get<ReportsResponse>(`/reports?${queryString}`)).data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Morning and evening executive briefs.
        </p>
      </div>

      <div className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reports…"
          className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        >
          <option value="">All types</option>
          <option value="MORNING">Morning</option>
          <option value="EVENING">Evening</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : !data?.items.length ? (
        <EmptyState
          title="No reports found"
          description="Adjust filters or generate a report from the dashboard."
        />
      ) : (
        <ul className="space-y-3">
          {data.items.map((r) => (
            <li key={r.id}>
              <Link
                to={`/reports/${r.id}`}
                className="block rounded-xl border border-zinc-200 bg-white px-5 py-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-950"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium dark:bg-zinc-800">
                    {r.type}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {r.preview}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
