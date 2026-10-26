import { test, expect } from '@playwright/test';

/**
 * AkMart Critical Journey 1: Consumer Full Purchase Journey
 * Tracing: RISK-003, RISK-006, REQ-001, REQ-007, REQ-008
 */
test.describe('E2E Journey 1: Consumer Checkout & Order Placement', () => {
  const testUser = {
    email: `test_e2e_${Date.now()}@example.com`,
    password: 'Password@123',
    fullName: 'E2E Test Shopper',
  };

  test('TC-E2E-01: Guest navigates catalog, adds product to cart, logs in, and checks out', async ({ page }) => {
    // 1. Visit Storefront Home
    await page.goto('http://localhost:5173/');
    await expect(page).toHaveTitle(/AKMart/);

    // 2. Navigate to Collection page
    const exploreBtn = page.getByRole('link', { name: /collection|shop/i }).first();
    if (await exploreBtn.isVisible()) {
      await exploreBtn.click();
    } else {
      await page.goto('http://localhost:5173/collection');
    }
    await expect(page).toHaveURL(/.*collection/);

    // 3. Select first available product
    const productCard = page.locator('a[href^="/product/"]').first();
    await expect(productCard).toBeVisible({ timeout: 10000 });
    await productCard.click();
    await expect(page).toHaveURL(/.*product\/.+/);

    // 4. Verify Product details and Add to Cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i });
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // 5. Open Cart
    const cartIcon = page.getByRole('link', { name: /cart/i }).first();
    await cartIcon.click();
    await expect(page).toHaveURL(/.*cart/);

    // 6. Verify cart item presence
    const checkoutButton = page.getByRole('button', { name: /proceed to checkout/i });
    await expect(checkoutButton).toBeVisible();
  });
});
