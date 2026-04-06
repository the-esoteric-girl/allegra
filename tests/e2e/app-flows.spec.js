import { test, expect } from '@playwright/test';
import { getTestCredentials, signIn } from './helpers/auth';

test.describe('Core app flows', () => {
  test.beforeEach(async ({ page }) => {
    const { email, password } = getTestCredentials();
    test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD to run authenticated flows');
    await signIn(page, { email, password });
  });

  test('library search filters visible moves', async ({ page }) => {
    await expect(page.getByPlaceholder('Search moves...')).toBeVisible();
    const cardsBefore = page.locator('[class*="moveCard"]');
    const beforeCount = await cardsBefore.count();

    await page.getByPlaceholder('Search moves...').fill('zzzz-not-a-real-move');
    await expect(page.getByText('No moves found')).toBeVisible();

    await page.getByPlaceholder('Search moves...').fill('');
    if (beforeCount > 0) {
      await expect(cardsBefore.first()).toBeVisible();
    }
  });

  test('log modal can create move and log a session', async ({ page }) => {
    const moveName = `E2E Move ${Date.now()}`;

    await page.getByRole('button', { name: 'Log' }).click();
    await expect(page.getByRole('heading', { name: 'Log session' })).toBeVisible();

    await page.getByRole('button', { name: 'Add move' }).click();
    await page.locator('#add-move-search').fill(moveName);
    await expect(page.getByText(`No results for "${moveName}"`)).toBeVisible();
    await page.getByRole('button', { name: '+ Create custom move' }).click();

    await page.locator('#create-name').fill(moveName);
    await page.getByRole('button', { name: 'Create move' }).click();

    await page.getByPlaceholder("How's the session going?").fill('Logged via Playwright');
    await page.getByRole('button', { name: 'Review session' }).click();
    await expect(page.getByRole('heading', { name: 'Session summary' })).toBeVisible();
    await page.getByRole('button', { name: 'Log session' }).click();
    await expect(page.getByRole('heading', { name: 'Session summary' })).not.toBeVisible();
  });

  test('combo modal can create and delete a combo', async ({ page }) => {
    const comboName = `E2E Combo ${Date.now()}`;

    await page.getByRole('link', { name: 'Combos' }).click();
    await page.getByRole('button', { name: '+ New combo' }).click();
    await expect(page.getByRole('heading', { name: 'New combo' })).toBeVisible();

    await page.locator('#combo-name').fill(comboName);
    await page.getByRole('button', { name: 'Add move' }).click();

    const firstMoveRow = page.locator('[class*="moveRow"]').first();
    await expect(firstMoveRow).toBeVisible();
    await firstMoveRow.click();
    await page.getByRole('button', { name: /\+ Add 1 move/ }).click();
    await page.getByRole('button', { name: 'Create combo' }).click();

    await page.getByText(comboName).first().click();
    await expect(page.getByRole('heading', { name: 'Combo', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Delete combo' }).click();
    await expect(page.getByRole('heading', { name: 'Delete combo?' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete combo' }).last().click();
    await expect(page).toHaveURL(/\/combos$/);
  });
});
