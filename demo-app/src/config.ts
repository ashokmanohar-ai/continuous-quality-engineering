import { AppError } from './errors.js';

export type AppConfig = {
  host: string;
  port: number;
  databasePath: string;
  sessionTtlMinutes: number;
  environment: 'LOCAL' | 'DEV' | 'QA' | 'UAT';
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const port = Number(env.APP_PORT ?? 3000);
  const sessionTtlMinutes = Number(env.SESSION_TTL_MINUTES ?? 60);
  const environment = (env.TEST_ENV ?? 'LOCAL').toUpperCase();

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new AppError(500, 'INVALID_CONFIG', 'APP_PORT must be an integer between 1 and 65535.');
  }
  if (!Number.isFinite(sessionTtlMinutes) || sessionTtlMinutes <= 0) {
    throw new AppError(500, 'INVALID_CONFIG', 'SESSION_TTL_MINUTES must be greater than zero.');
  }
  if (!['LOCAL', 'DEV', 'QA', 'UAT'].includes(environment)) {
    throw new AppError(500, 'INVALID_CONFIG', 'TEST_ENV must be LOCAL, DEV, QA, or UAT.');
  }

  return {
    host: env.APP_HOST ?? '127.0.0.1',
    port,
    databasePath: env.APP_DB ?? './data/acme-orders.db',
    sessionTtlMinutes,
    environment: environment as AppConfig['environment'],
  };
}
