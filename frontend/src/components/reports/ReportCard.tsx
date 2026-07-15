import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/utils/format';
import type { ReportSummary } from '@/types';

export function ReportCard({ report }: { report: ReportSummary }) {
  return (
    <Link to={`/reports/${report.id}`} className="block">
      <Card className="transition-all hover:-translate-y-0.5 hover:border-primary/30">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <Badge variant={report.type === 'MORNING' ? 'default' : 'secondary'}>
                {report.type === 'MORNING' ? 'Morning Report' : 'Evening Report'}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">{formatDate(report.createdAt)}</span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {report.preview ?? 'Open to view full executive brief.'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
