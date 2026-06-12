import { QueryClient } from '@tanstack/react-query';

/**
 * Creates a QueryClient with the app's defaults. A factory (not a shared
 * singleton) so tests can mount with an isolated cache per test.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
