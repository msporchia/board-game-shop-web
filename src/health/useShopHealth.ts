import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchHealth, type HealthStatus } from '../api/health.ts';

/** TanStack Query hook exposing the shop BFF health as server state. */
export function useShopHealth(): UseQueryResult<HealthStatus> {
  return useQuery({
    queryKey: ['shop-health'],
    queryFn: ({ signal }) => fetchHealth(signal),
  });
}
