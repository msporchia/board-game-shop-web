import type { paths } from './openapi.ts';

export type Product =
  paths['/products/{id}']['get']['responses'][200]['content']['application/json'];

export type ProductsPage =
  paths['/products']['get']['responses'][200]['content']['application/json'];
