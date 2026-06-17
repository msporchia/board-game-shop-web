import type { paths } from './openapi.ts';

export type Order = paths['/orders']['post']['responses'][201]['content']['application/json'];

export type OrderItem = Order['items'][number];
