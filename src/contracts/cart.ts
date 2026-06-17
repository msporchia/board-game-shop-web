import type { paths } from './openapi.ts';

export type Cart =
  paths['/carts/{customerId}']['get']['responses'][200]['content']['application/json'];

export type CartItem = Cart['items'][number];
