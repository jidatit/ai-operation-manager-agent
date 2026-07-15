import { ReportType } from '@prisma/client';
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateAndDeliverReport } from '../reports/report.service.js';

export const schedulerRouter = Router();

schedulerRouter.post('/run-morning', requireAuth, async (req, res, next) => {
  try {
    const report = await generateAndDeliverReport(req.user!.id, ReportType.MORNING);
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
});

schedulerRouter.post('/run-evening', requireAuth, async (req, res, next) => {
  try {
    const report = await generateAndDeliverReport(req.user!.id, ReportType.EVENING);
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
});
