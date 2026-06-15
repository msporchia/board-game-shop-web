import type { CartItem } from './cart.ts';

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
