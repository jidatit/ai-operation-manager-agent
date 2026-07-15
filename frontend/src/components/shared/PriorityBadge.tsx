import { Badge } from '@/components/ui/badge';
import type { ItemPriority } from '@/types';

const variantMap = {
  high: 'high',
  medium: 'medium',
  low: 'low',
} as const;

const labelMap = {
  high: 'Critical',
  medium: 'Medium',
  low: 'Low',
} as const;

export function PriorityBadge({
  priority,
  label,
}: {
  priority: ItemPriority;
  label?: string;
}) {
  return (
    <Badge variant={variantMap[priority]} className="capitalize">
      {label ?? labelMap[priority]}
    </Badge>
  );
}
