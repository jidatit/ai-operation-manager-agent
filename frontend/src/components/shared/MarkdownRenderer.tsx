import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { cn } from '@/lib/utils';
import { slugify } from '@/utils/reportData';

const components: Components = {
  h1: ({ children }) => {
    const text = String(children);
    return (
      <h1 id={slugify(text)} className="scroll-mt-24 text-2xl font-semibold tracking-tight">
        {children}
      </h1>
    );
  },
  h2: ({ children }) => {
    const text = String(children);
    return (
      <h2 id={slugify(text)} className="scroll-mt-24 mt-8 text-xl font-semibold tracking-tight">
        {children}
      </h2>
    );
  },
  h3: ({ children }) => {
    const text = String(children);
    return (
      <h3 id={slugify(text)} className="scroll-mt-24 mt-6 text-lg font-semibold">
        {children}
      </h3>
    );
  },
  p: ({ children }) => <p className="leading-relaxed text-muted-foreground">{children}</p>,
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-5 text-muted-foreground">{children}</ul>,
  ol: ({ children }) => (
    <ol className="my-3 list-decimal space-y-1 pl-5 text-muted-foreground">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-primary underline-offset-4 hover:underline"
    >
      {children}
    </a>
  ),
};

export function MarkdownRenderer({
  content,
  className,
  compact,
}: {
  content: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'prose prose-zinc max-w-none dark:prose-invert',
        compact && 'prose-sm',
        className,
      )}
    >
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
