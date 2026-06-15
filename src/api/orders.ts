import { fetchJson } from './http.ts';
import type { Order } from '../contracts/orders.ts';

const ENDPOINTS = {
  orders: () => `/orders`,
} as const;

/** Places the order for the customer's current server-side cart (which the BFF then clears). */
export async function createOrder(customerId: string): Promise<Order> {
  return fetchJson<Order>(ENDPOINTS.orders(), {
    method: 'POST',
    body: { customerId },
  });
}
