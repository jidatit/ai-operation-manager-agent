import { cn } from '@/lib/utils';

export function ReportToc({
  headings,
  className,
}: {
  headings: { id: string; text: string; level: number }[];
  className?: string;
}) {
  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className={cn('sticky top-20 space-y-1', className)}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Contents
      </p>
      <ul className="space-y-1 border-l border-border">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                'block border-l-2 border-transparent py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground',
                h.level === 1 && 'pl-3 font-medium',
                h.level === 2 && 'pl-3',
                h.level >= 3 && 'pl-5 text-xs',
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
