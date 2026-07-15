import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  MailOpen,
  MessageSquare,
  ListTodo,
} from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import type { DerivedStats, StatTrend } from '@/types';

export function StatGrid({
  stats,
  trends,
}: {
  stats: DerivedStats;
  trends: {
    emails: StatTrend;
    meetings: StatTrend;
    tasks: StatTrend;
    slack: StatTrend;
  };
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Emails Today"
        value={stats.emailsToday}
        icon={Mail}
        trend={trends.emails}
      />
      <StatCard
        label="Calendar Meetings"
        value={stats.calendarMeetings}
        icon={Calendar}
        trend={trends.meetings}
      />
      <StatCard
        label="Tasks Due"
        value={stats.tasksDue}
        icon={ListTodo}
        trend={trends.tasks}
      />
      <StatCard
        label="Slack Mentions"
        value={stats.slackMentions}
        icon={MessageSquare}
        trend={trends.slack}
      />
      <StatCard
        label="Completed Tasks"
        value={stats.completedTasks}
        icon={CheckCircle2}
      />
      <StatCard
        label="Unread Emails"
        value={stats.unreadEmails}
        icon={MailOpen}
      />
      <StatCard
        label="Late Tasks"
        value={stats.lateTasks}
        icon={Clock}
      />
      <StatCard
        label="Overdue Tasks"
        value={stats.overdueTasks}
        icon={AlertTriangle}
      />
    </div>
  );
}
