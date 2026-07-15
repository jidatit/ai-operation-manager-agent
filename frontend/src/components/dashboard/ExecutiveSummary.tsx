import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';

export function ExecutiveSummary({ content }: { content: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <CardTitle>Executive Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {content ? (
          <MarkdownRenderer content={content} compact />
        ) : (
          <EmptyState
            compact
            title="No summary yet"
            description="Generate your first morning or evening brief to see an AI executive summary."
            icon={<Sparkles className="h-5 w-5" />}
          />
        )}
      </CardContent>
    </Card>
  );
}
