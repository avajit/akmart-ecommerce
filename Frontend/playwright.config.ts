import { defineConfig, devices } from '@playwright/test';

/**
 * AKMart Multi-Role Visual & Accessibility Audit Test Harness
 */
export default defineConfig({
  testDir: './tests/audit',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  reporter: [
    ['list'],
    ['json', { outputFile: '../design-audit/audit-results.json' }],
  ],
  use: {
    baseURL: process.env.VITE_TEST_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  projects: [
    // 1. Small Phones
    {
      name: 'small-phone-320',
      use: {
        viewport: { width: 320, height: 568 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'small-phone-360',
      use: {
        viewport: { width: 360, height: 640 },
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-A102U) AppleWebKit/537.36 Chrome/100.0.4896.127 Mobile Safari/537.36',
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'small-phone-375',
      use: {
        ...devices['iPhone SE'],
      },
    },

    // 2. Modern Phones
    {
      name: 'phone-390',
      use: {
        ...devices['iPhone 12'],
      },
    },
    {
      name: 'phone-412',
      use: {
        ...devices['Pixel 7'],
      },
    },
    {
      name: 'phone-430',
      use: {
        ...devices['iPhone 14 Pro Max'],
      },
    },

    // 3. Tablets & Foldables
    {
      name: 'tablet-768-portrait',
      use: {
        ...devices['iPad Mini'],
      },
    },
    {
      name: 'tablet-1024-landscape',
      use: {
        ...devices['iPad Mini landscape'],
      },
    },

    // 4. Desktop & Laptop
    {
      name: 'desktop-1280',
      use: {
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'desktop-1440',
      use: {
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'desktop-1920',
      use: {
        viewport: { width: 1920, height: 1080 },
      },
    },

    // 5. Landscape Phones
    {
      name: 'phone-landscape-844',
      use: {
        viewport: { width: 844, height: 390 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
