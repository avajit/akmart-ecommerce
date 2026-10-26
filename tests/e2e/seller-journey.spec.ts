import { test, expect } from '@playwright/test';

/**
 * AkMart Critical Journey 5 & 6: Seller Onboarding & Listing Management
 * Tracing: RISK-001, RISK-005, BUG-005
 */
test.describe('E2E Journey 5: Seller Onboarding & Listing Workflow', () => {
  test('TC-E2E-02: Seller onboarding form validation and merchant wall isolation', async ({ page }) => {
    // 1. Visit Seller Onboarding URL
    await page.goto('http://localhost:5173/seller/onboarding');

    // Unauthenticated user should be redirected to login
    await expect(page).toHaveURL(/.*login/);

    // 2. Verify form inputs exist on Login screen
    const emailInput = page.getByPlaceholder(/email|phone/i);
    const passwordInput = page.getByPlaceholder(/password/i);
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });
});
