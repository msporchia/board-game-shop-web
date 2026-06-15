import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchHealth } from '../api/health.ts';
import type { HealthStatus } from '../contracts/health.ts';

/** TanStack Query hook exposing the shop BFF health as server state. */
export function useShopHealth(): UseQueryResult<HealthStatus> {
  return useQuery({
    queryKey: ['shop-health'],
    queryFn: ({ signal }) => fetchHealth(signal),
  });
}
