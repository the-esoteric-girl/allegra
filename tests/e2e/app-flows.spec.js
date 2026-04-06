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

    await page.getByTestId('bottom-nav-log').click();
    await expect(page.getByRole('heading', { name: 'Log session' })).toBeVisible();

    await page.getByTestId('log-empty-add-move').click();
    await page.locator('#add-move-search').fill(moveName);
    await expect(page.getByText(`No results for "${moveName}"`)).toBeVisible();
    await page.getByTestId('log-create-custom-move').click();

    await page.locator('#create-name').fill(moveName);
    await page.getByTestId('log-create-move-submit').click();

    await page.getByTestId('log-session-notes').fill('Logged via Playwright');
    await page.getByTestId('log-review-session').click();
    await expect(page.getByRole('heading', { name: 'Session summary' })).toBeVisible();
    await page.getByTestId('log-session-submit').click();
    await expect(page.getByRole('heading', { name: 'Session summary' })).not.toBeVisible();
  });

  test('combo modal can create and delete a combo', async ({ page }) => {
    const comboName = `E2E Combo ${Date.now()}`;

    await page.getByRole('link', { name: 'Combos' }).click();
    await page.getByTestId('combos-new-button').click();
    await expect(page.getByRole('heading', { name: 'New combo' })).toBeVisible();

    await page.locator('#combo-name').fill(comboName);
    await page.getByRole('button', { name: 'Add move' }).click();

    const firstMoveRow = page.locator('[class*="moveRow"]').first();
    await expect(firstMoveRow).toBeVisible();
    await firstMoveRow.click();
    await page.getByTestId('combo-add-moves-submit').click();
    await page.getByTestId('combo-create-submit').click();

    await page.getByText(comboName).first().click();
    await expect(page.getByRole('heading', { name: 'Combo', exact: true })).toBeVisible();
    await page.getByTestId('delete-combo-trigger').click();
    await expect(page.getByTestId('delete-combo-dialog-title')).toBeVisible();
    await page.getByTestId('delete-combo-dialog-confirm').click();
    await expect(page).toHaveURL(/\/combos$/);
  });
});
