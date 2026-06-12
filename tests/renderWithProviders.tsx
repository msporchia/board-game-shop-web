import { type ReactElement } from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { AppProviders } from '../src/app/AppProviders.tsx';
import { createQueryClient } from '../src/app/createQueryClient.ts';

/**
 * Renders a UI tree inside a fresh AppProviders (isolated QueryClient per call)
 * so tests don't share cache. The shop BFF base URL is fixed to localhost:3000
 * in tests, matching the MSW handlers.
 */
export function renderWithProviders(ui: ReactElement): RenderResult {
  const client = createQueryClient();
  // Keep the app's retry policy but skip the exponential backoff: a retried
  // failure would otherwise outlast findBy*'s default 1s timeout.
  client.setDefaultOptions({
    queries: { ...client.getDefaultOptions().queries, retryDelay: 0 },
  });
  return render(<AppProviders client={client}>{ui}</AppProviders>);
}
