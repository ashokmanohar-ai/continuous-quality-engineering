import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

type Finding = { page: string; id: string; impact: string | null; help: string; targets: unknown[] };
const findings: Finding[] = [];

test.afterAll(async () => {
  await mkdir('reports/raw', { recursive: true });
  await writeFile('reports/raw/accessibility.json', JSON.stringify({ findings }, null, 2));
});

async function scan(page: Page, pageName: string): Promise<void> {
  const result = await new AxeBuilder({ page }).analyze();
  findings.push(
    ...result.violations.map((violation) => ({
      page: pageName,
      id: violation.id,
      impact: violation.impact ?? null,
      help: violation.help,
      targets: violation.nodes.map((node) => node.target),
    })),
  );
  expect(
    result.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact ?? '')),
  ).toEqual([]);
}

test('@accessibility login page has no critical or serious Axe violations', async ({ page }) => {
  await page.goto('/');
  await scan(page, 'login');
});

test('@accessibility product page has no critical or serious Axe violations', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email address').fill('customer@acme.test');
  await page.getByLabel('Password').fill('Order123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  await scan(page, 'products');
});
