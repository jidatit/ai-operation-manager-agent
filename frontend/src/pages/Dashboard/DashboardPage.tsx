import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';
import { ExecutiveSummary } from '@/components/dashboard/ExecutiveSummary';
import { StatGrid } from '@/components/dashboard/StatGrid';
import { TopPriorities } from '@/components/dashboard/TopPriorities';
import { TodaysMeetings } from '@/components/dashboard/TodaysMeetings';
import { TasksDueToday } from '@/components/dashboard/TasksDueToday';
import { ImportantEmails } from '@/components/dashboard/ImportantEmails';
import { SlackActivity } from '@/components/dashboard/SlackActivity';
import { AiRecommendations } from '@/components/dashboard/AiRecommendations';
import { ConnectionStatus } from '@/components/dashboard/ConnectionStatus';
import { EmptyState } from '@/components/shared/EmptyState';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardBrief } from '@/hooks/useDashboardBrief';
import { api } from '@/services/api';
import { preferredReportType } from '@/utils/greetings';

export function DashboardPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const brief = useDashboardBrief();

  const generate = useMutation({
    mutationFn: async (type: 'MORNING' | 'EVENING') =>
      (await api.post(`/reports/generate?type=${type}`)).data,
    onSuccess: () => {
      toast.success('Report generated');
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
      void qc.invalidateQueries({ queryKey: ['reports'] });
      void qc.invalidateQueries({ queryKey: ['report'] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? 'Failed to generate report';
      toast.error(message);
    },
  });

  if (brief.isLoading) return <DashboardSkeleton />;

  if (!brief.dashboard) {
    return (
      <EmptyState
        title="Dashboard unavailable"
        description="We could not load your dashboard. Try refreshing."
      />
    );
  }

  const preferred = preferredReportType();

  return (
    <div className="space-y-6">
      <WelcomeBanner
        name={user?.name}
        generatedAt={brief.dashboard.lastReport?.createdAt}
        isGenerating={generate.isPending}
        onGenerateMorning={() => generate.mutate(preferred)}
        onGenerateEvening={() => generate.mutate('EVENING')}
      />

      <ExecutiveSummary content={brief.executiveSummary} />

      <StatGrid stats={brief.stats} trends={brief.trends} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopPriorities items={brief.priorities} />
        <TodaysMeetings items={brief.meetings} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TasksDueToday items={brief.tasks} />
        <ImportantEmails items={brief.emails} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SlackActivity items={brief.slack} />
        <AiRecommendations content={brief.recommendations} />
      </div>

      <ConnectionStatus connections={brief.dashboard.connections} />
    </div>
  );
}
