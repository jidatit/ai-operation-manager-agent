import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendIndicator } from '@/components/shared/TrendIndicator';
import { cn } from '@/lib/utils';
import type { StatTrend } from '@/types';

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: StatTrend;
  className?: string;
}) {
  return (
    <Card className={cn('group', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
            <div className="mt-1.5 flex items-center gap-2">
              {trend ? <TrendIndicator trend={trend} /> : null}
              {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
            </div>
          </div>
          {Icon ? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15 dark:bg-primary/15">
              <Icon className="h-4 w-4" />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
