import { test, expect } from '@playwright/test';
import { getTestCredentials, signIn } from './helpers/auth';

async function createMoveAndLogSession(page, moveName) {
  await page.getByTestId('bottom-nav-log').click();
  await page.getByTestId('log-empty-add-move').click();
  await page.locator('#add-move-search').fill(moveName);
  await page.getByTestId('log-create-custom-move').click();
  await page.locator('#create-name').fill(moveName);
  await page.getByTestId('log-create-move-submit').click();
  await page.getByTestId('log-review-session').click();
  await page.getByTestId('log-session-submit').click();
}

async function createCombo(page, comboName) {
  await page.getByRole('link', { name: 'Combos' }).click();
  await page.getByTestId('combos-new-button').click();
  await page.locator('#combo-name').fill(comboName);
  await page.getByRole('button', { name: 'Add move' }).click();
  await page.locator('[class*="moveRow"]').first().click();
  await page.getByTestId('combo-add-moves-submit').click();
  await page.getByTestId('combo-create-submit').click();
}

test.describe('Delete confirm dialogs', () => {
  test.beforeEach(async ({ page }) => {
    const { email, password } = getTestCredentials();
    test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD to run authenticated flows');
    await signIn(page, { email, password });
  });

  test('combo delete requires confirmation', async ({ page }) => {
    const comboName = `E2E Combo Delete ${Date.now()}`;
    await createCombo(page, comboName);

    await page.getByText(comboName).first().click();
    await page.getByTestId('delete-combo-trigger').click();
    await expect(page.getByTestId('delete-combo-dialog-title')).toBeVisible();
    await page.getByTestId('delete-combo-dialog-cancel').click();
    await expect(page.getByTestId('delete-combo-dialog-title')).not.toBeVisible();

    await page.getByTestId('delete-combo-trigger').click();
    await page.getByTestId('delete-combo-dialog-confirm').click();
    await expect(page).toHaveURL(/\/combos$/);
  });

  test('move delete requires confirmation', async ({ page }) => {
    const moveName = `E2E Move Delete ${Date.now()}`;
    await createMoveAndLogSession(page, moveName);

    await page.getByPlaceholder('Search moves...').fill(moveName);
    await page.getByText(moveName).first().click();

    await page.getByTestId('delete-move-trigger').click();
    await expect(page.getByTestId('delete-move-dialog-title')).toBeVisible();
    await page.getByTestId('delete-move-dialog-cancel').click();
    await expect(page.getByTestId('delete-move-dialog-title')).not.toBeVisible();

    await page.getByTestId('delete-move-trigger').click();
    await page.getByTestId('delete-move-dialog-confirm').click();
    await expect(page).toHaveURL(/\/$/);
    await page.getByPlaceholder('Search moves...').fill(moveName);
    await expect(page.getByText('No moves found')).toBeVisible();
  });

  test('session delete requires confirmation', async ({ page }) => {
    const moveName = `E2E Session Move ${Date.now()}`;
    await createMoveAndLogSession(page, moveName);

    await page.getByRole('link', { name: 'You' }).click();
    await page.locator('[data-testid^="session-toggle-"]').first().click();

    const deleteButtons = page.locator('[data-testid^="delete-session-"]');
    const beforeCount = await deleteButtons.count();
    await deleteButtons.first().click();
    await expect(page.getByTestId('delete-session-dialog-title')).toBeVisible();
    await page.getByTestId('delete-session-dialog-cancel').click();
    await expect(page.getByTestId('delete-session-dialog-title')).not.toBeVisible();

    await deleteButtons.first().click();
    await page.getByTestId('delete-session-dialog-confirm').click();
    await expect(page.getByTestId('delete-session-dialog-title')).not.toBeVisible();
    await expect
      .poll(async () => page.locator('[data-testid^="delete-session-"]').count())
      .toBeLessThan(beforeCount);
  });
});
