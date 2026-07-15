import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { firstName, getGreeting } from '@/utils/greetings';
import { formatDate } from '@/utils/format';

export function WelcomeBanner({
  name,
  generatedAt,
  onGenerateMorning,
  onGenerateEvening,
  isGenerating,
}: {
  name?: string | null;
  generatedAt?: string | null;
  onGenerateMorning: () => void;
  onGenerateEvening: () => void;
  isGenerating: boolean;
}) {
  return (
    <Card className="overflow-hidden border-border/80 bg-gradient-to-br from-card to-muted/40">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {getGreeting()}, {firstName(name)}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Today&apos;s Executive Brief
          </h2>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            {generatedAt
              ? `Generated at ${formatDate(generatedAt)}`
              : 'No brief generated yet today'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={isGenerating}
            onClick={onGenerateMorning}
          >
            {isGenerating ? 'Generating…' : 'Generate Report'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isGenerating}
            onClick={onGenerateEvening}
          >
            Generate Evening
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
