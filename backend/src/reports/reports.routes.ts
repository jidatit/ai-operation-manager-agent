import { ReportType } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import {
  generateAndDeliverReport,
  getReport,
  listReports,
} from './report.service.js';

export const reportsRouter = Router();

reportsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const query = z
      .object({
        search: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        type: z.enum(['MORNING', 'EVENING']).optional(),
        page: z.coerce.number().optional(),
        pageSize: z.coerce.number().optional(),
      })
      .parse(req.query);

    res.json(
      await listReports(req.user!.id, {
        ...query,
        type: query.type as ReportType | undefined,
      }),
    );
  } catch (err) {
    next(err);
  }
});

reportsRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    res.json(await getReport(req.user!.id, req.params.id));
  } catch (err) {
    next(err);
  }
});

reportsRouter.post('/generate', requireAuth, async (req, res, next) => {
  try {
    const type = z
      .enum(['MORNING', 'EVENING'])
      .default('MORNING')
      .parse(req.query.type ?? req.body?.type ?? 'MORNING');
    const report = await generateAndDeliverReport(req.user!.id, type as ReportType);
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
});
