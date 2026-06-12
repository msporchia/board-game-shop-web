import { SHOP_API_URL } from './config.ts';
import { fetchJson } from './http.ts';
import { type CartItem } from './cart.ts';

// TODO(cross-repo Phase 2): replace with types generated from the BFF's OpenAPI
// spec once its orders slice lands (see docs/phase-2.md for the agreed contract).

/** Order as returned by the BFF: built atomically from the stored cart, price snapshot included. */
export interface Order {
  id: number;
  createdAt: string;
  currency: 'EUR';
  items: CartItem[];
  totalCents: number;
}

/** Places the order for the customer's current server-side cart (which the BFF then clears). */
export async function createOrder(customerId: string): Promise<Order> {
  return fetchJson<Order>(`${SHOP_API_URL}/orders`, {
    method: 'POST',
    body: { customerId },
  });
}
