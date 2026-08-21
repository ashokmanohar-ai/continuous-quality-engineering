import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['demo-app/tests/unit/**/*.spec.ts', 'quality/**/*.spec.ts'],
    environment: 'node',
    testTimeout: 10_000,
    coverage: {
      provider: 'v8',
      include: [
        'demo-app/src/services/**/*.ts',
        'demo-app/src/repositories/**/*.ts',
        'quality/engine/**/*.ts',
      ],
      exclude: ['**/*.spec.ts', '**/cli.ts'],
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: 'reports/coverage',
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
