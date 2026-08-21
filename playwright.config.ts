import { defineConfig, devices } from '@playwright/test';

const layer = process.env.TEST_LAYER ?? 'e2e';

export default defineConfig({
  testDir: `./tests/${layer}`,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  ...(process.env.CI ? { workers: 2 } : {}),
  timeout: 30_000,
  reporter: [
    ['line'],
    ['json', { outputFile: `reports/raw/${layer}-playwright.json` }],
    ['html', { outputFolder: `reports/playwright/${layer}`, open: 'never' }],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  ...(process.env.EXTERNAL_SERVER
    ? {}
    : {
        webServer: {
          command: 'npm run app:start:test',
          url: 'http://127.0.0.1:3000/health',
          reuseExistingServer: !process.env.CI,
          timeout: 60_000,
        },
      }),
  projects: process.env.NIGHTLY
    ? [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ]
    : [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  outputDir: `reports/test-results/${layer}`,
});
