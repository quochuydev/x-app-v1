import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the home page title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /modern next\.js application/i })).toBeVisible();
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /view dashboard/i }).click();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should navigate to blog', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /read blog/i }).click();
    await expect(page).toHaveURL('/blog');
    await expect(page.getByRole('heading', { name: /blog/i })).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/server-side rendering/i)).toBeVisible();
    await expect(page.getByText(/static generation/i)).toBeVisible();
    await expect(page.getByText(/type safety/i)).toBeVisible();
  });
});
