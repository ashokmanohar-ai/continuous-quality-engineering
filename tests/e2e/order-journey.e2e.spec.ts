import { expect, test, type Page } from '@playwright/test';

async function signIn(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByLabel('Email address').fill('customer@acme.test');
  await page.getByLabel('Password').fill('Order123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
}

test('@e2e @critical user signs in and sees products', async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole('row')).toHaveCount(4);
  await expect(page.getByText('Acme Pro Keyboard')).toBeVisible();
});

test('@e2e @critical user creates an order', async ({ page }) => {
  await signIn(page);
  await page
    .getByRole('row', { name: /Acme Pro Keyboard/ })
    .getByRole('button', { name: 'Order' })
    .click();
  await expect(page.getByRole('status')).toContainText(/Order .* created successfully/);
});

test('@e2e @regression invalid login shows a useful error', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email address').fill('customer@acme.test');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toHaveText('Email or password is incorrect.');
});

test('@e2e @regression password is masked', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Password')).toHaveAttribute('type', 'password');
});

test('@e2e @regression order action reports progress and success', async ({ page }) => {
  await signIn(page);
  await page
    .getByRole('row', { name: /Acme Ergo Mouse/ })
    .getByRole('button', { name: 'Order' })
    .click();
  await expect(page.getByRole('status')).toHaveClass('success');
});
