import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { authRouter } from './auth/auth.routes.js';
import { connectionsRouter } from './connectors/connections.routes.js';
import { dashboardRouter } from './dashboard/dashboard.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { reportsRouter } from './reports/reports.routes.js';
import { schedulerRouter } from './scheduler/scheduler.routes.js';
import { usersRouter } from './users/users.routes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'ai-coo-backend' });
  });

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/connections', connectionsRouter);
  app.use('/reports', reportsRouter);
  app.use('/dashboard', dashboardRouter);
  app.use('/scheduler', schedulerRouter);

  // Spec aliases
  app.post('/logout', (_req, res, next) => {
    void import('./middleware/auth.js').then(({ clearAuthCookie }) => {
      clearAuthCookie(res);
      res.json({ ok: true });
    }).catch(next);
  });

  app.use(errorHandler);
  return app;
}
