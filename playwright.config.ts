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
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1280, height: 800 },
    video: 'on',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  // `smoke` is the chat-to-cart test (and the GIF source); `capture` only writes the
  // static README screenshots. `test:e2e` runs `smoke`; `demo:screenshots` runs `capture`.
  projects: [
    {
      name: 'smoke',
      testMatch: /chat-to-cart\.e2e\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'capture',
      testMatch: /screenshots\.e2e\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Same screenshots as `capture`, but against the real BFF (only the chat is faked).
    {
      name: 'capture-real',
      testMatch: /screenshots-real\.e2e\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Serve the real production build, so the test also verifies it boots. Port 5173 is
  // the only origin the BFF allows via CORS, so `capture-real` (which talks to the real
  // BFF) must be served from here; the mocked projects intercept the network and don't
  // care about the port. Reuses an already-running server (e.g. `npm run dev`) if present.
  webServer: {
    command: 'npm run build && npm run preview -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    timeout: 120_000,
    reuseExistingServer: true,
  },
});
