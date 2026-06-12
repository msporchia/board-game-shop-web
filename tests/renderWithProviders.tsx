import { type ReactElement } from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AppProviders } from '../src/app/AppProviders.tsx';
import { createQueryClient } from '../src/app/createQueryClient.ts';

interface RenderWithProvidersOptions {
  /** Initial URL for the MemoryRouter (e.g. '/games/101'). */
  route?: string;
}

/**
 * Renders a UI tree inside fresh providers (isolated QueryClient per call, so
 * tests don't share cache) and a MemoryRouter. The shop BFF base URL is fixed
 * to localhost:3000 in tests, matching the MSW handlers.
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/' }: RenderWithProvidersOptions = {},
): RenderResult {
  const client = createQueryClient();
  // Keep the app's retry policy but skip the exponential backoff: a retried
  // failure would otherwise outlast findBy*'s default 1s timeout.
  client.setDefaultOptions({
    queries: { ...client.getDefaultOptions().queries, retryDelay: 0 },
  });
  return render(
    <AppProviders client={client}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AppProviders>,
  );
}
