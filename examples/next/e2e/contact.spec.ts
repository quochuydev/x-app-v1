import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test('should submit contact form successfully', async ({ page }) => {
    await page.goto('/contact');

    await page.getByLabel(/name/i).fill('John Doe');
    await page.getByLabel(/email/i).fill('john@example.com');
    await page.getByLabel(/subject/i).fill('Test Subject');
    await page.getByLabel(/message/i).fill('This is a test message for the contact form.');

    await page.getByRole('button', { name: /send message/i }).click();

    await expect(page.getByText(/success/i)).toBeVisible();
  });

  test('should display validation errors', async ({ page }) => {
    await page.goto('/contact');

    await page.getByRole('button', { name: /send message/i }).click();

    await expect(page.getByText(/name must be at least 2 characters/i)).toBeVisible();
    await expect(page.getByText(/invalid email address/i)).toBeVisible();
  });

  test('should display contact information', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.getByText(/support@xbase\.com/i)).toBeVisible();
    await expect(page.getByText(/\+1 \(555\) 123-4567/i)).toBeVisible();
  });
});
