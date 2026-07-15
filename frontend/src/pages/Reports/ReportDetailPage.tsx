import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { api } from '../../services/api';
import type { ReportSummary } from '../../types';

export function ReportDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['report', id],
    enabled: !!id,
    queryFn: async () => (await api.get<ReportSummary>(`/reports/${id}`)).data,
  });

  if (isLoading) return <LoadingSkeleton rows={5} />;
  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        Report not found.{' '}
        <Link to="/reports" className="underline">
          Back to reports
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/reports" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Reports
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{data.type} Report</h1>
          <span className="text-sm text-zinc-500">
            {new Date(data.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
      <article className="prose prose-zinc max-w-none rounded-xl border border-zinc-200 bg-white p-6 dark:prose-invert dark:border-zinc-800 dark:bg-zinc-900">
        <ReactMarkdown>{data.content ?? ''}</ReactMarkdown>
      </article>
    </div>
  );
}
