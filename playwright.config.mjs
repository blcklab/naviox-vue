import { defineConfig, devices } from '@playwright/test';

// Runs against REAL installed framework dependencies; never the temporary typing shims.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4173' } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], baseURL: 'http://127.0.0.1:4173' } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], baseURL: 'http://127.0.0.1:4173' } },
  ],
  webServer: [
    { command: 'npm run demo -- --host 127.0.0.1 --port 4173 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI, timeout: 90_000 },
    { command: 'npm run demo:navigation -- --host 127.0.0.1 --port 4174 --strictPort', url: 'http://127.0.0.1:4174', reuseExistingServer: !process.env.CI, timeout: 90_000 },
  ],
});
