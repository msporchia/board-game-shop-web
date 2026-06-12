import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchProduct, type ProductDetail } from '../api/products.ts';

/** Single product detail (with the AI-enriched description) as server state. */
export function useProduct(id: number): UseQueryResult<ProductDetail> {
  return useQuery({
    queryKey: ['product', id],
    queryFn: ({ signal }) => fetchProduct(id, signal),
  });
}
