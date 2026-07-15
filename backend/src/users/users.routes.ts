import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../utils/prisma.js';

export const usersRouter = Router();

const settingsSchema = z.object({
  timezone: z.string().min(1).optional(),
  emailReports: z.boolean().optional(),
  slackReports: z.boolean().optional(),
  slackChannelId: z.string().nullable().optional(),
});

usersRouter.patch('/settings', requireAuth, async (req, res, next) => {
  try {
    const body = settingsSchema.parse(req.body);
    const userId = req.user!.id;

    if (body.timezone) {
      await prisma.user.update({
        where: { id: userId },
        data: { timezone: body.timezone },
      });
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        emailReports: body.emailReports ?? true,
        slackReports: body.slackReports ?? true,
        slackChannelId: body.slackChannelId ?? null,
      },
      update: {
        emailReports: body.emailReports,
        slackReports: body.slackReports,
        slackChannelId: body.slackChannelId,
      },
    });

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    res.json({
      timezone: user.timezone,
      settings,
    });
  } catch (err) {
    next(err);
  }
});
