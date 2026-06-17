import type { paths } from './openapi.ts';

export type HealthStatus = paths['/health']['get']['responses'][200]['content']['application/json'];
