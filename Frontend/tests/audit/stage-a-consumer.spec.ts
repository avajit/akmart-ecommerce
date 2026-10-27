import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIT_OUT_DIR = path.resolve(process.cwd(), '../design-audit/stage-a');

// Ensure output directory exists
if (!fs.existsSync(AUDIT_OUT_DIR)) {
  fs.mkdirSync(AUDIT_OUT_DIR, { recursive: true });
}

const consumerPages = [
  { name: 'home', path: '/' },
  { name: 'collection', path: '/collection' },
  { name: 'cart', path: '/cart' },
  { name: 'login', path: '/login' },
  { name: 'contact', path: '/contact' },
  { name: 'about', path: '/about' },
  { name: 'not-found', path: '/non-existent-page-404' },
];

test.describe('Stage A: Consumer Layout & Visual Regression Audit', () => {
  for (const pageConfig of consumerPages) {
    test(`Audit ${pageConfig.name}`, async ({ page }, testInfo) => {
      const projectName = testInfo.project.name;
      const targetDir = path.join(AUDIT_OUT_DIR, pageConfig.name);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Navigate to target route
      await page.goto(pageConfig.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500); // Allow lazy-loaded hydration

      // 1. Assert No Horizontal Overflow (document.scrollWidth <= clientWidth)
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      const overflowPx = scrollWidth - clientWidth;

      // 2. Capture Viewport Screenshot
      const screenshotPath = path.join(targetDir, `${projectName}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      // 3. Axe Core Accessibility Audit (Log issues for ledger report card)
      let seriousAxeViolations = 0;
      try {
        const axeResults = await new AxeBuilder({ page }).analyze();
        const seriousAndCritical = axeResults.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical'
        );
        seriousAxeViolations = seriousAndCritical.length;
      } catch (err) {
        console.warn(`Axe audit warning on ${pageConfig.name}:`, err);
      }

      // Record overflow assertion
      expect(
        overflowPx,
        `Page ${pageConfig.name} has horizontal overflow of ${overflowPx}px on ${projectName}`
      ).toBeLessThanOrEqual(1);
    });
  }
});
