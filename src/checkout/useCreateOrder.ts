import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { createOrder } from '../api/orders.ts';
import type { Order } from '../contracts/orders.ts';
import { getCustomerId } from '../customer/customerId.ts';

/** Places the order from the server cart; on success the cart query is refreshed (BFF cleared it). */
export function useCreateOrder(): UseMutationResult<Order, Error, void> {
  const customerId = getCustomerId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createOrder(customerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart', customerId] }),
  });
}
