import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { resetCarts } from './cartStore.ts';
import { server } from './server.ts';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
// RTL auto-cleanup needs a global afterEach, which `globals: false` disables.
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetCarts();
  localStorage.clear();
});
afterAll(() => server.close());
