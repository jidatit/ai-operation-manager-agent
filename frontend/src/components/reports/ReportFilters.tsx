import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ReportFilters({
  search,
  type,
  from,
  to,
  onSearchChange,
  onTypeChange,
  onFromChange,
  onToChange,
}: {
  search: string;
  type: string;
  from: string;
  to: string;
  onSearchChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search reports…"
        aria-label="Search reports"
      />
      <Select value={type || 'all'} onValueChange={(v) => onTypeChange(v === 'all' ? '' : v)}>
        <SelectTrigger aria-label="Filter by type">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="MORNING">Morning</SelectItem>
          <SelectItem value="EVENING">Evening</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        aria-label="From date"
      />
      <Input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        aria-label="To date"
      />
    </div>
  );
}
