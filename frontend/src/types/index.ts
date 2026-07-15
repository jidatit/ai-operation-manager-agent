export interface UserSettings {
  id: string;
  userId: string;
  emailReports: boolean;
  slackReports: boolean;
  slackChannelId: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  timezone: string;
  createdAt: string;
  settings: UserSettings | null;
}

export interface Connection {
  provider: 'GOOGLE' | 'SLACK' | 'ASANA';
  connected: boolean;
  lastSync: string | null;
  metadata: {
    teamName?: string;
    workspaceName?: string;
    teamId?: string;
    workspaceId?: string;
  } | null;
}

export interface ReportSummary {
  id: string;
  type: 'MORNING' | 'EVENING';
  createdAt: string;
  preview?: string;
  content?: string;
  rawData?: CollectionResult | null;
}

export type ItemSource = 'gmail' | 'calendar' | 'asana' | 'slack';
export type ItemPriority = 'high' | 'medium' | 'low';

export interface NormalizedItem {
  source: ItemSource;
  title: string;
  summary: string;
  priority: ItemPriority;
  time?: string;
  url?: string;
  meta?: Record<string, unknown>;
}

export interface CollectionError {
  source: ItemSource | 'google';
  error: string;
}

export interface CollectionResult {
  items: NormalizedItem[];
  errors: CollectionError[];
  counts: {
    emails: number;
    meetings: number;
    tasks: number;
    slack: number;
  };
}

export interface ReportDetail {
  id: string;
  userId: string;
  type: 'MORNING' | 'EVENING';
  content: string;
  rawData: CollectionResult | null;
  createdAt: string;
}

export interface DashboardData {
  connections: Connection[];
  connectionCount: number;
  lastReport: ReportSummary | null;
  nextScheduledReport: string;
  schedule: { morning: string; evening: string; next: string };
  counts: {
    emails: number;
    meetings: number;
    tasks: number;
    slack: number;
  };
  todayReports: ReportSummary[];
  recentReports: ReportSummary[];
  timezone: string;
}

export interface ReportsResponse {
  items: ReportSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DerivedStats {
  emailsToday: number;
  calendarMeetings: number;
  tasksDue: number;
  slackMentions: number;
  completedTasks: number;
  unreadEmails: number;
  lateTasks: number;
  overdueTasks: number;
}

export type TrendDirection = 'up' | 'down' | 'flat';

export interface StatTrend {
  direction: TrendDirection;
  delta: number;
}
