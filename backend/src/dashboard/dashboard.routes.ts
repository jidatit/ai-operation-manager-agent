import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getDashboard } from './dashboard.service.js';

export const dashboardRouter = Router();

dashboardRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json(await getDashboard(req.user!.id));
  } catch (err) {
    next(err);
  }
});
