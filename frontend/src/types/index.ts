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
