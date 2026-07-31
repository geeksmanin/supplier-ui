import { test, expect } from '@playwright/test';

test('has title or loads login page', async ({ page }) => {
  await page.goto('/');
  // Basic assertion to ensure page loads and renders app container
  await expect(page).toHaveTitle(/.*(Customer|Catalogue|Distributors).*/i);
});
