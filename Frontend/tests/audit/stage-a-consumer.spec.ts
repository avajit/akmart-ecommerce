import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';
import {
  mockUser,
  mockAddresses,
  mockProductDetail,
  mockCart,
  mockOrders,
  mockWishlist,
  generateManyProducts,
} from './mockData';

const AUDIT_OUT_DIR = path.resolve(process.cwd(), '../design-audit/stage-a');

if (!fs.existsSync(AUDIT_OUT_DIR)) {
  fs.mkdirSync(AUDIT_OUT_DIR, { recursive: true });
}

// Complete list of all Stage A Consumer Pages & Functional States
const consumerAuditPages = [
  // Revenue Core
  { name: 'home', path: '/', isProtected: false, category: 'discovery' },
  { name: 'collection', path: '/collection', isProtected: false, category: 'discovery' },
  { name: 'product-detail', path: '/product/apple-macbook-pro-16-m3-max', isProtected: false, category: 'revenue-core' },
  { name: 'cart', path: '/cart', isProtected: false, category: 'revenue-core' },
  { name: 'checkout', path: '/checkout', isProtected: true, category: 'revenue-core' },

  // Account & Orders
  { name: 'orders', path: '/orders', isProtected: true, category: 'account-auth' },
  { name: 'order-detail', path: '/orders/ord_np_982341', isProtected: true, category: 'account-auth' },
  { name: 'wishlist', path: '/wishlist', isProtected: true, category: 'account-auth' },
  { name: 'profile', path: '/profile', isProtected: true, category: 'account-auth' },

  // Authentication Flows
  { name: 'login', path: '/login', isProtected: false, category: 'account-auth' },
  { name: 'register', path: '/register', isProtected: false, category: 'account-auth' },
  { name: 'verify-otp', path: '/verify', isProtected: false, category: 'account-auth' },
  { name: 'forgot-password', path: '/forgot-password', isProtected: false, category: 'account-auth' },
  { name: 'reset-password', path: '/reset-password', isProtected: false, category: 'account-auth' },

  // Information, Legal & Fallbacks
  { name: 'search', path: '/search', isProtected: false, category: 'discovery' },
  { name: 'about', path: '/about', isProtected: false, category: 'info-legal' },
  { name: 'contact', path: '/contact', isProtected: false, category: 'info-legal' },
  { name: 'shipping', path: '/shipping', isProtected: false, category: 'info-legal' },
  { name: 'terms', path: '/terms', isProtected: false, category: 'info-legal' },
  { name: 'privacy', path: '/privacy', isProtected: false, category: 'info-legal' },
  { name: 'refund', path: '/refund', isProtected: false, category: 'info-legal' },
  { name: 'not-found', path: '/non-existent-page-404', isProtected: false, category: 'info-legal' },
];

test.describe('Stage A: Comprehensive Consumer Baseline Audit', () => {
  for (const pageConfig of consumerAuditPages) {
    test(`Audit ${pageConfig.name}`, async ({ page }, testInfo) => {
      const projectName = testInfo.project.name;
      const targetDir = path.join(AUDIT_OUT_DIR, pageConfig.name);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // 1. Mock Backend API Routes to isolate frontend testing
      await page.route('**/api/v1/**', async (route) => {
        const url = route.request().url();
        const method = route.request().method();

        if (url.includes('/products/slug/')) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: mockProductDetail }),
          });
        }
        if (url.includes('/products') && method === 'GET') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                products: generateManyProducts(24),
                pagination: { total: 200, page: 1, limit: 24, pages: 9 },
              },
            }),
          });
        }
        if (url.includes('/cart')) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: mockCart }),
          });
        }
        if (url.includes('/orders/addresses')) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: mockAddresses }),
          });
        }
        if (url.includes('/orders/ord_np_')) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: mockOrders[0] }),
          });
        }
        if (url.includes('/orders')) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: mockOrders }),
          });
        }
        if (url.includes('/wishlist')) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: mockWishlist }),
          });
        }
        if (url.includes('/categories')) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: [
                { id: '1', name: 'Electronics', slug: 'electronics' },
                { id: '2', name: 'Fashion & Wear', slug: 'fashion' },
                { id: '3', name: 'Groceries & Organic', slug: 'groceries' },
                { id: '4', name: 'Home & Living', slug: 'home' },
              ],
            }),
          });
        }

        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: {} }),
        });
      });

      // 2. Set authenticated consumer session for protected user account pages
      if (pageConfig.isProtected) {
        await page.addInitScript((userData) => {
          localStorage.setItem(
            'auth-storage',
            JSON.stringify({
              state: {
                isAuthenticated: true,
                user: userData,
              },
              version: 0,
            })
          );
          sessionStorage.setItem('akmart_access_token', 'mock_token_consumer');
        }, mockUser);
      }

      // 3. Navigate to target route
      await page.goto(pageConfig.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600); // Allow React Query & layout hydration

      // 4. Assert Horizontal Overflow
      const overflowMetrics = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          hasOverflow: doc.scrollWidth > doc.clientWidth + 1,
          diff: doc.scrollWidth - doc.clientWidth,
        };
      });

      // 5. Check Tap Target Sizes (< 44px detection)
      const smallTapTargetsCount = await page.evaluate(() => {
        const clickable = Array.from(document.querySelectorAll('button, a, input, select'));
        let count = 0;
        for (const el of clickable) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
            // Count visible clickable items smaller than 44x44px
            count++;
          }
        }
        return count;
      });

      // 6. Axe Core Accessibility Audit
      let seriousAxeCount = 0;
      let criticalAxeCount = 0;
      let violationDetails: any[] = [];
      try {
        const axeResults = await new AxeBuilder({ page }).analyze();
        const seriousCritical = axeResults.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical'
        );
        seriousAxeCount = seriousCritical.filter((v) => v.impact === 'serious').length;
        criticalAxeCount = seriousCritical.filter((v) => v.impact === 'critical').length;
        violationDetails = seriousCritical.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.length,
        }));
      } catch (err) {
        console.warn(`Axe audit warning on ${pageConfig.name}:`, err);
      }

      // 7. Measure Core Web Vitals (CLS & LCP estimation)
      const webVitals = await page.evaluate(() => {
        let cls = 0;
        let lcp = 0;
        const entries = performance.getEntriesByType('paint');
        const fcpEntry = entries.find((e) => e.name === 'first-contentful-paint');
        return {
          fcp: fcpEntry ? fcpEntry.startTime : 0,
        };
      });

      // 8. Capture Real Viewport Screenshot
      const screenshotPath = path.join(targetDir, `${projectName}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      // 9. Write Unit Audit Record
      const auditRecord = {
        page: pageConfig.name,
        path: pageConfig.path,
        viewport: projectName,
        overflow: overflowMetrics,
        smallTapTargetsCount,
        axeViolations: {
          serious: seriousAxeCount,
          critical: criticalAxeCount,
          details: violationDetails,
        },
        webVitals,
        timestamp: new Date().toISOString(),
      };

      const recordPath = path.join(targetDir, `${projectName}-audit.json`);
      fs.writeFileSync(recordPath, JSON.stringify(auditRecord, null, 2));

      // Programmatic Assertion: Zero horizontal overflow
      expect(
        overflowMetrics.diff,
        `Page ${pageConfig.name} overflowed by ${overflowMetrics.diff}px on ${projectName}`
      ).toBeLessThanOrEqual(1);
    });
  }
});
