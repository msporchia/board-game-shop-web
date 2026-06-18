import type { paths } from './openapi.ts';

export type Cart = paths['/cart']['get']['responses'][200]['content']['application/json'];

export type CartItem = Cart['items'][number];
