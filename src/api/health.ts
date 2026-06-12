import { SHOP_API_URL } from './config.ts';

/** Shape of the BFF's `GET /health` response. */
export interface HealthStatus {
  status: string;
  service: string;
}

/**
 * Fetches the shop BFF health endpoint. Throws on a non-2xx response so the
 * caller (TanStack Query) treats an unreachable/erroring BFF as an error state.
 */
export async function fetchHealth(signal?: AbortSignal): Promise<HealthStatus> {
  const response = await fetch(`${SHOP_API_URL}/health`, { signal });
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  return (await response.json()) as HealthStatus;
}
