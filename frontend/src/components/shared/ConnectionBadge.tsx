import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function ConnectionBadge({
  connected,
  className,
}: {
  connected: boolean;
  className?: string;
}) {
  return (
    <Badge
      variant={connected ? 'success' : 'secondary'}
      className={cn('gap-1.5', className)}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          connected ? 'bg-success' : 'bg-muted-foreground',
        )}
      />
      {connected ? 'Connected' : 'Disconnected'}
    </Badge>
  );
}
