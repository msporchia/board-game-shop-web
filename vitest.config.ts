import { mergeConfig, defineConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Vitest config kept separate from the production Vite build config; it reuses the
// build plugins via mergeConfig. Globals are off on purpose — tests import from
// 'vitest' explicitly (see tests/**).
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: false,
      setupFiles: ['./tests/setup.ts'],
      css: false,
    },
  }),
);
