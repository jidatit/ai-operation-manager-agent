import cron from 'node-cron';
import { ReportType } from '@prisma/client';
import { DateTime } from 'luxon';
import { generateAndDeliverReport } from '../reports/report.service.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../utils/prisma.js';

async function runScheduledReports(): Promise<void> {
  const users = await prisma.user.findMany({ select: { id: true, timezone: true } });

  for (const user of users) {
    const local = DateTime.now().setZone(user.timezone || 'UTC');
    const hour = local.hour;
    const minute = local.minute;
    const ranOn = local.toISODate();
    if (!ranOn) continue;

    const inMorningWindow = hour === 8 && minute < 15;
    const inEveningWindow = hour === 19 && minute < 15;

    if (!inMorningWindow && !inEveningWindow) continue;

    const type = inMorningWindow ? ReportType.MORNING : ReportType.EVENING;
    const existing = await prisma.reportRunLog.findUnique({
      where: { userId_type_ranOn: { userId: user.id, type, ranOn } },
    });
    if (existing) continue;

    try {
      logger.info({ userId: user.id, type, timezone: user.timezone }, 'Cron generating report');
      await generateAndDeliverReport(user.id, type);
    } catch (err) {
      logger.error({ err, userId: user.id, type }, 'Cron report generation failed');
    }
  }
}

export function startScheduler(): void {
  cron.schedule('*/15 * * * *', () => {
    void runScheduledReports();
  });
  logger.info('Scheduler started (every 15 minutes, per-user timezone)');
}

export { runScheduledReports };
