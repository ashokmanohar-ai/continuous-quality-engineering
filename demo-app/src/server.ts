import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { buildApp } from './app.js';
import { loadConfig } from './config.js';

const config = loadConfig();
if (config.databasePath !== ':memory:') mkdirSync(dirname(config.databasePath), { recursive: true });

const app = await buildApp({
  databasePath: config.databasePath,
  sessionTtlMinutes: config.sessionTtlMinutes,
  logger: process.env.NODE_ENV !== 'test',
});

const shutdown = async (signal: string): Promise<void> => {
  app.log.info({ signal }, 'Graceful shutdown');
  await app.close();
  process.exit(0);
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
