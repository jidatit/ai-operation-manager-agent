import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { ReportToc } from '@/components/reports/ReportToc';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { api } from '@/services/api';
import type { ReportDetail } from '@/types';
import { formatDate } from '@/utils/format';
import { extractHeadings } from '@/utils/reportData';

export function ReportDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['report', id],
    enabled: !!id,
    queryFn: async () => (await api.get<ReportDetail>(`/reports/${id}`)).data,
  });

  const headings = useMemo(
    () => (data?.content ? extractHeadings(data.content) : []),
    [data?.content],
  );

  if (isLoading) return <LoadingSkeleton rows={5} />;

  if (error || !data) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
        Report not found.{' '}
        <Link to="/reports" className="underline">
          Back to reports
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/reports"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Reports
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              {data.type === 'MORNING' ? 'Morning' : 'Evening'} Report
            </h2>
            <Badge variant={data.type === 'MORNING' ? 'default' : 'secondary'}>
              {data.type}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatDate(data.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button type="button" variant="outline" size="sm" disabled>
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Coming soon</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="no-print hidden lg:block">
          <ReportToc headings={headings} />
        </aside>
        <article className="print-content rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
          <MarkdownRenderer content={data.content} />
        </article>
      </div>
    </div>
  );
}
