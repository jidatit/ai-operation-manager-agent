import { Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';

export function AiRecommendations({ content }: { content: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Lightbulb className="h-4 w-4" />
        </div>
        <CardTitle>AI Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {content ? (
          <MarkdownRenderer content={content} compact />
        ) : (
          <EmptyState
            compact
            title="No recommendations yet"
            description="AI recommendations appear after a report is generated."
            icon={<Lightbulb className="h-5 w-5" />}
          />
        )}
      </CardContent>
    </Card>
  );
}
