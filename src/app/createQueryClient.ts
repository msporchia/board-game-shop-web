import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../api/http.ts';

/**
 * Creates a QueryClient with the app's defaults. A factory (not a shared
 * singleton) so tests can mount with an isolated cache per test.
 *
 * Retries once for transient failures (network, 5xx) but never for 4xx —
 * retrying a 404 only delays the not-found state.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status < 500) {
            return false;
          }
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
      },
    },
  });
}
