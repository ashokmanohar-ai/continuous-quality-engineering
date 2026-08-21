import { describe, expect, it } from 'vitest';
import { loadConfig } from '../../src/config.js';

describe('loadConfig', () => {
  it('provides safe local defaults', () => {
    expect(loadConfig({})).toEqual({
      host: '127.0.0.1',
      port: 3000,
      databasePath: './data/acme-orders.db',
      sessionTtlMinutes: 60,
      environment: 'LOCAL',
    });
  });

  it('reads every supported setting', () => {
    expect(
      loadConfig({
        APP_HOST: '127.0.0.1',
        APP_PORT: '8080',
        APP_DB: ':memory:',
        SESSION_TTL_MINUTES: '15',
        TEST_ENV: 'qa',
      }),
    ).toMatchObject({
      host: '127.0.0.1',
      port: 8080,
      databasePath: ':memory:',
      sessionTtlMinutes: 15,
      environment: 'QA',
    });
  });

  it.each(['0', '-1', '65536', 'abc', '3.14'])('rejects invalid port %s', (port) => {
    expect(() => loadConfig({ APP_PORT: port })).toThrow('APP_PORT');
  });

  it.each(['0', '-10', 'abc'])('rejects invalid session TTL %s', (ttl) => {
    expect(() => loadConfig({ SESSION_TTL_MINUTES: ttl })).toThrow('SESSION_TTL_MINUTES');
  });

  it('rejects unknown environments', () => {
    expect(() => loadConfig({ TEST_ENV: 'PROD' })).toThrow('TEST_ENV');
  });
});
