// TODO(cross-repo Phase 2): replace with types generated from the BFF's OpenAPI
// spec once its cart slice lands (see docs/phase-2.md for the agreed contract).

/** Cart line as composed by the BFF: denormalized snapshot, server-computed total. */
export interface CartItem {
  productId: number;
  name: string;
  image: string | null;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
}

/** Server-side cart keyed by the localStorage customer id; all totals are the BFF's. */
export interface Cart {
  customerId: string;
  currency: 'EUR';
  items: CartItem[];
  totalItems: number;
  totalCents: number;
}
