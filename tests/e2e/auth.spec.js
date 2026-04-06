import { test, expect } from '@playwright/test';
import process from 'node:process';
import { getTestCredentials, signIn, signUp } from './helpers/auth';

test.describe('Auth', () => {
  test('shows validation errors for empty fields', async ({ page }) => {
    await page.goto('/auth');

    await page.locator('form').getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Email and password are required.')).toBeVisible();

    await page.getByRole('button', { name: 'Sign up' }).click();
    await page.locator('#auth-email').fill('new-user@example.com');
    await page.locator('#auth-password').fill('password123!');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Username is required for sign up.')).toBeVisible();
  });

  test('can sign in with provided E2E credentials', async ({ page }) => {
    const { email, password } = getTestCredentials();
    test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD to run sign-in flow');

    await signIn(page, { email, password });
    await expect(page.getByText('Allegra')).toBeVisible();
  });

  test('can create a profile with disposable credentials', async ({ page }) => {
    test.skip(process.env.E2E_ALLOW_SIGNUP !== 'true', 'Set E2E_ALLOW_SIGNUP=true to run signup E2E flow');

    const testSuffix = Date.now();
    const email = `allegra-e2e-${testSuffix}@example.com`;
    const password = 'Password123!';
    const username = `e2e_${testSuffix}`;

    await signUp(page, { email, password, username });
    await expect(page).not.toHaveURL(/\/auth$/);
  });
});
