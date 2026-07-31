import { test, expect } from '@playwright/test';

test.describe('Supplier Product Catalogue E2E Test Suite', () => {
  test('1. Full Round-Trip Creation, Edit Reload, & Update Persistence', async ({ page }) => {
    // Phase 1: Navigate & Create
    await page.goto('/#/products/new');
    await page.waitForLoadState('networkidle');

    // Fill form fields
    const testName = `E2E Supplier Product ${Date.now()}`;
    await page.locator('input[placeholder*="Paracetamol"]').fill(testName);
    await page.locator('textarea[placeholder*="description"]').fill('E2E Test Description');
    await page.locator('input[placeholder*="Brand"]').fill('E2E Brand');
    await page.locator('input[placeholder*="Category"]').fill('E2E Category');

    // Fill Variant details
    await page.locator('input[placeholder*="Box of 100"]').fill('E2E Pack of 50');
    await page.locator('input[placeholder*="VND-PARA-100"]').fill(`E2E-SKU-${Date.now()}`);
    
    // Save Product
    await page.locator('button:has-text("Save Product")').click();
    await page.waitForTimeout(1500);

    // Verify redirected back to products list
    await expect(page).toHaveURL(/.*\/products.*/);
    await expect(page.locator('table')).toContainText(testName);

    // Retrieve row ID attribute to navigate to edit page
    const row = page.locator(`tr:has-text("${testName}")`);
    const idAttr = await row.getAttribute('id');
    const recordId = idAttr ? idAttr.replace('row-', '') : '';

    // Phase 2: Edit Reload & Assert Persistence
    await page.goto(`/#/products/${recordId}/edit`);
    await page.waitForLoadState('networkidle');

    // Assert reloaded values match exactly
    await expect(page.locator('input[placeholder*="Paracetamol"]')).toHaveValue(testName);
    await expect(page.locator('textarea[placeholder*="description"]')).toHaveValue('E2E Test Description');
    await expect(page.locator('input[placeholder*="Brand"]')).toHaveValue('E2E Brand');

    // Phase 3: Update & Re-verify
    const updatedName = `${testName} (Updated)`;
    await page.locator('input[placeholder*="Paracetamol"]').fill(updatedName);
    await page.locator('button:has-text("Save Product")').click();
    await page.waitForTimeout(1500);

    // Reload edit page and verify updated value persisted
    await page.goto(`/#/products/${recordId}/edit`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[placeholder*="Paracetamol"]')).toHaveValue(updatedName);
  });
});
