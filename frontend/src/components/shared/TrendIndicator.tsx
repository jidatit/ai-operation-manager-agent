import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatTrend } from '@/types';

export function TrendIndicator({ trend, className }: { trend?: StatTrend; className?: string }) {
  if (!trend || trend.direction === 'flat') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-0.5 text-xs text-muted-foreground',
          className,
        )}
      >
        <Minus className="h-3 w-3" />
        <span>—</span>
      </span>
    );
  }

  const isUp = trend.direction === 'up';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium',
        isUp ? 'text-success' : 'text-destructive',
        className,
      )}
    >
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      <span>
        {isUp ? '+' : ''}
        {trend.delta}
      </span>
    </span>
  );
}
