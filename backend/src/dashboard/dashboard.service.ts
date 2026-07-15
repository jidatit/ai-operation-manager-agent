import { DateTime } from 'luxon';
import { listConnections } from '../connectors/connections.service.js';
import { prisma } from '../utils/prisma.js';

function nextScheduledLocal(timezone: string): { morning: string; evening: string; next: string } {
  const now = DateTime.now().setZone(timezone);
  let morning = now.set({ hour: 8, minute: 0, second: 0, millisecond: 0 });
  let evening = now.set({ hour: 19, minute: 0, second: 0, millisecond: 0 });
  if (morning <= now) morning = morning.plus({ days: 1 });
  if (evening <= now) evening = evening.plus({ days: 1 });
  const next = morning < evening ? morning : evening;
  return {
    morning: morning.toISO()!,
    evening: evening.toISO()!,
    next: next.toISO()!,
  };
}

export async function getDashboard(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const connections = await listConnections(userId);
  const lastReport = await prisma.dailyReport.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const startOfDay = DateTime.now().setZone(user.timezone).startOf('day').toUTC().toJSDate();
  const todayReports = await prisma.dailyReport.findMany({
    where: { userId, createdAt: { gte: startOfDay } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  let counts = { emails: 0, meetings: 0, tasks: 0, slack: 0 };
  if (lastReport?.rawData && typeof lastReport.rawData === 'object') {
    const raw = lastReport.rawData as { counts?: typeof counts };
    if (raw.counts) counts = raw.counts;
  }

  const recentReports = await prisma.dailyReport.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      type: true,
      content: true,
      createdAt: true,
    },
  });

  const schedule = nextScheduledLocal(user.timezone);

  return {
    connections,
    connectionCount: connections.filter((c) => c.connected).length,
    lastReport: lastReport
      ? {
          id: lastReport.id,
          type: lastReport.type,
          createdAt: lastReport.createdAt,
          preview: lastReport.content.slice(0, 240),
        }
      : null,
    nextScheduledReport: schedule.next,
    schedule,
    counts,
    todayReports: todayReports.map((r) => ({
      id: r.id,
      type: r.type,
      createdAt: r.createdAt,
    })),
    recentReports: recentReports.map((r) => ({
      id: r.id,
      type: r.type,
      createdAt: r.createdAt,
      preview: r.content.slice(0, 200),
    })),
    timezone: user.timezone,
  };
}
