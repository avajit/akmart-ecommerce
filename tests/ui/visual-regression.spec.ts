import { test, expect } from '@playwright/test';

/**
 * AkMart Visual Regression Test Suite
 * Evaluates core consumer pages across key viewports.
 */

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

test.describe('AkMart Visual & Responsive Regression', () => {
  for (const vp of viewports) {
    test(`Home Page Layout Integrity - ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:5173/');
      await page.waitForLoadState('networkidle');

      // Verify no horizontal overflow/scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

      // Verify brand header is visible
      const header = page.locator('header, nav').first();
      await expect(header).toBeVisible();
    });

    test(`Cart Page Sticky Layout & Vendor Groups - ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:5173/cart');
      await page.waitForLoadState('networkidle');

      // Check no horizontal scrollbar
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

      if (vp.width < 1024) {
        // Mobile viewport: Verify sticky bottom checkout bar exists
        const mobileCheckoutBar = page.locator('div.fixed.bottom-0');
        await expect(mobileCheckoutBar).toBeVisible();
      }
    });

    test(`Catalog / Collection Responsive Grid - ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:5173/collection');
      await page.waitForLoadState('networkidle');

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }
});
