import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/web',
  fullyParallel: false,
  workers: 2,
  timeout: 30_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    headless: true,
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'small', use: { viewport: { width: 320, height: 640 } } },
    { name: 'phone', use: { viewport: { width: 390, height: 844 } } },
    { name: 'tablet', use: { viewport: { width: 820, height: 1180 } } },
    { name: 'wide', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'landscape', use: { viewport: { width: 844, height: 390 } } },
  ],
  webServer: {
    command: 'node scripts/serve-web.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
});
