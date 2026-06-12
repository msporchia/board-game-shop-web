import { SHOP_API_URL } from './config.ts';
import { fetchJson } from './http.ts';

/** Shape of the BFF's `GET /health` response. */
export interface HealthStatus {
  status: string;
  service: string;
}

/** Fetches the shop BFF health endpoint; an unreachable/erroring BFF becomes an error state. */
export async function fetchHealth(signal?: AbortSignal): Promise<HealthStatus> {
  return fetchJson<HealthStatus>(`${SHOP_API_URL}/health`, signal);
}
