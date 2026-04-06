import { expect } from '@playwright/test';
import process from 'node:process';

export function getTestCredentials() {
  const email = process.env.E2E_EMAIL || '';
  const password = process.env.E2E_PASSWORD || '';
  const username = process.env.E2E_USERNAME || '';
  return { email, password, username };
}

export async function signIn(page, { email, password }) {
  await page.goto('/auth');
  await page.getByRole('button', { name: 'Sign in' }).first().click();
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-password').fill(password);
  await page.locator('form').getByRole('button', { name: 'Sign in' }).click();
  await expect(page).not.toHaveURL(/\/auth$/);
}

export async function signUp(page, { email, password, username }) {
  await page.goto('/auth');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await page.locator('#auth-username').fill(username);
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();
}
