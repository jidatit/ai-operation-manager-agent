import { Prisma, ReportType } from '@prisma/client';
import { DateTime } from 'luxon';
import { generateReport } from '../ai/openrouter.service.js';
import { postSlackReport } from '../connectors/slack/collector.js';
import { sendReportEmail } from '../email/email.service.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errors.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../utils/prisma.js';
import { collectData } from './collector.service.js';

function slackPreview(markdown: string, reportId: string): string {
  const stripped = markdown.replace(/[#*_`]/g, '').trim();
  const snippet = stripped.slice(0, 400);
  return `*AI COO Report*\n${snippet}${stripped.length > 400 ? '…' : ''}\n\n<${env.FRONTEND_URL}/reports/${reportId}|Open in dashboard>`;
}

export async function generateAndDeliverReport(
  userId: string,
  type: ReportType,
): Promise<{ id: string; content: string; type: ReportType; createdAt: Date }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { settings: true },
  });
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const mode = type === ReportType.MORNING ? 'morning' : 'evening';
  logger.info({ userId, type }, 'Starting report generation');

  const collection = await collectData(userId, mode);
  const content = await generateReport(type, collection.items, collection.errors);

  const report = await prisma.dailyReport.create({
    data: {
      userId,
      type,
      content,
      rawData: {
        items: collection.items,
        errors: collection.errors,
        counts: collection.counts,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  const ranOn = DateTime.now().setZone(user.timezone).toISODate() ?? '';
  await prisma.reportRunLog.upsert({
    where: { userId_type_ranOn: { userId, type, ranOn } },
    create: { userId, type, ranOn },
    update: { ranAt: new Date() },
  });

  const subject =
    type === ReportType.MORNING
      ? `Morning Ops Brief — ${ranOn}`
      : `Evening Ops Wrap-up — ${ranOn}`;

  if (user.settings?.emailReports !== false) {
    try {
      await sendReportEmail({
        to: user.email,
        subject,
        markdown: content,
        reportId: report.id,
      });
    } catch (err) {
      logger.error({ err, userId }, 'Failed to email report');
    }
  }

  if (user.settings?.slackReports !== false) {
    try {
      await postSlackReport(
        userId,
        slackPreview(content, report.id),
        user.settings?.slackChannelId,
      );
    } catch (err) {
      logger.warn({ err, userId }, 'Failed to post Slack report (may be disconnected)');
    }
  }

  logger.info({ userId, reportId: report.id, type }, 'Report generated');
  return report;
}

export async function listReports(
  userId: string,
  query: {
    search?: string;
    from?: string;
    to?: string;
    type?: ReportType;
    page?: number;
    pageSize?: number;
  },
) {
  const page = query.page ?? 1;
  const pageSize = Math.min(query.pageSize ?? 20, 100);
  const where: Record<string, unknown> = { userId };

  if (query.type) where.type = query.type;
  if (query.search) {
    where.content = { contains: query.search, mode: 'insensitive' };
  }
  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {}),
    };
  }

  const [items, total] = await Promise.all([
    prisma.dailyReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        type: true,
        content: true,
        createdAt: true,
        rawData: true,
      },
    }),
    prisma.dailyReport.count({ where }),
  ]);

  return {
    items: items.map((r) => ({
      ...r,
      preview: r.content.slice(0, 200),
    })),
    total,
    page,
    pageSize,
  };
}

export async function getReport(userId: string, id: string) {
  const report = await prisma.dailyReport.findFirst({
    where: { id, userId },
  });
  if (!report) {
    throw new AppError(404, 'Report not found');
  }
  return report;
}
