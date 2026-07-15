import { createApp } from './app.js';
import { env } from './config/env.js';
import { startScheduler } from './scheduler/cron.js';
import { logger } from './utils/logger.js';

const app = createApp();

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'AI COO backend listening');
  startScheduler();
});
