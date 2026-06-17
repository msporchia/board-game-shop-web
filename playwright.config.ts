import { defineConfig, devices } from '@playwright/test';

/**
 * One end-to-end test on purpose: the chat-to-cart showcase path, run in a real
 * browser against the production build with the BFF mocked at the network layer
 * (see e2e/chat-to-cart.e2e.ts). It is the smoke test that proves the app boots
 * and renders, and it doubles as the source of the README demo recording.
 *
 * Vitest owns unit/integration coverage (tests/**, jsdom + MSW); Playwright only
 * matches `*.e2e.ts`, so the two runners never overlap.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1280, height: 800 },
    video: 'on',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Serve the real production build, so the test also verifies it boots.
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    timeout: 120_000,
    reuseExistingServer: true,
  },
});
