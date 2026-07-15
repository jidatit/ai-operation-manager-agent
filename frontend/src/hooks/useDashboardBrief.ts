import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type {
  DashboardData,
  DerivedStats,
  NormalizedItem,
  ReportDetail,
  ReportsResponse,
  StatTrend,
} from '@/types';
import {
  compareCounts,
  deriveStats,
  extractMarkdownSection,
  filterBySource,
  getRawItems,
  topPriorities,
} from '@/utils/reportData';

export interface DashboardBrief {
  dashboard: DashboardData;
  report: ReportDetail | null;
  items: NormalizedItem[];
  executiveSummary: string;
  recommendations: string;
  priorities: NormalizedItem[];
  meetings: NormalizedItem[];
  tasks: NormalizedItem[];
  emails: NormalizedItem[];
  slack: NormalizedItem[];
  stats: DerivedStats;
  trends: {
    emails: StatTrend;
    meetings: StatTrend;
    tasks: StatTrend;
    slack: StatTrend;
  };
  isLoading: boolean;
  isBriefLoading: boolean;
}

export function useDashboardBrief(): DashboardBrief {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<DashboardData>('/dashboard')).data,
  });

  const lastReportId = dashboardQuery.data?.lastReport?.id;

  const reportQuery = useQuery({
    queryKey: ['report', lastReportId],
    enabled: !!lastReportId,
    queryFn: async () => (await api.get<ReportDetail>(`/reports/${lastReportId}`)).data,
  });

  const recentQuery = useQuery({
    queryKey: ['reports', 'trends'],
    queryFn: async () =>
      (await api.get<ReportsResponse>('/reports?pageSize=2')).data,
  });

  const items = useMemo(
    () => getRawItems(reportQuery.data?.rawData),
    [reportQuery.data?.rawData],
  );

  const stats = useMemo(
    () =>
      deriveStats(
        items,
        reportQuery.data?.rawData?.counts ?? dashboardQuery.data?.counts,
      ),
    [items, reportQuery.data?.rawData?.counts, dashboardQuery.data?.counts],
  );

  const content = reportQuery.data?.content ?? '';

  const trends = useMemo(() => {
    const [current, previous] = recentQuery.data?.items ?? [];
    const currentCounts = current?.rawData?.counts;
    const previousCounts = previous?.rawData?.counts;
    return {
      emails: compareCounts(currentCounts, previousCounts, 'emails'),
      meetings: compareCounts(currentCounts, previousCounts, 'meetings'),
      tasks: compareCounts(currentCounts, previousCounts, 'tasks'),
      slack: compareCounts(currentCounts, previousCounts, 'slack'),
    };
  }, [recentQuery.data?.items]);

  return {
    dashboard: dashboardQuery.data!,
    report: reportQuery.data ?? null,
    items,
    executiveSummary: extractMarkdownSection(content, 'Executive Summary'),
    recommendations:
      extractMarkdownSection(content, 'Recommendations') ||
      extractMarkdownSection(content, 'Recommendations for Tomorrow'),
    priorities: topPriorities(items),
    meetings: filterBySource(items, 'calendar').sort((a, b) =>
      (a.time ?? '').localeCompare(b.time ?? ''),
    ),
    tasks: filterBySource(items, 'asana'),
    emails: filterBySource(items, 'gmail').sort((a, b) => {
      const aImp = a.meta?.important === true ? 0 : 1;
      const bImp = b.meta?.important === true ? 0 : 1;
      return aImp - bImp;
    }),
    slack: filterBySource(items, 'slack'),
    stats,
    trends,
    isLoading: dashboardQuery.isLoading,
    isBriefLoading: !!lastReportId && reportQuery.isLoading,
  };
}
