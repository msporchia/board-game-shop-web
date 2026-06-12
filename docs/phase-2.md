# Phase 2 — Cart & checkout: implementation spec

Goal: a server-side cart on the BFF keyed by the localStorage `customerId`, mutated
optimistically from card, detail page and cart drawer; a `/checkout` page that posts
the order (built server-side from the stored cart) and shows the recap. Conventions
in `CLAUDE.md` apply; the commerce principle is new and binding: **the client renders
money, it never computes it** — optimistic arithmetic is display-only until the
server settles.

## 0. Phase 1 contract realignment (prerequisite)

The BFF's Phase 1 spec was revised after our slice landed: legacy source names are
translated at its seed boundary, so the wire model is camelCase (`id`, `name`,
`tags`, `authors`, `players`, `playersDisplay`, `durationMin`, `ageMin`,
`complexity`, `complexityLevel`, `year`, `rating`, `isExpansion`, `category`,
`brand`, `image`) and `GET /products?page&pageSize` returns
`{ products, page, pageSize, hasNext }` (no `total` — pagination UI shows
"Pagina N" and disables "Successiva" on `!hasNext`). Non-2xx bodies are
`{ error, message }`. `src/api/products.ts`, fixtures, MSW handlers and the catalog
components are realigned in this phase.

## Upstream contract (BFF Phase 2 — agreed, not implemented yet; MSW carries tests)

- Products gain `priceCents: number` — priced by the BFF (`shop.db`), absent
  upstream. The web types it `number | null` and **a price-less product cannot be
  bought** (purchase button disabled): this keeps the UI honest against a BFF that
  is still on Phase 1.
- `GET /carts/{customerId}` → `200 Cart` (empty cart for a new customer).
- `PUT /carts/{customerId}/items/{productId}` body `{ quantity }` (int, 1..99) →
  `200 Cart`; `404` unknown product, `422` invalid quantity/unpriced product.
- `DELETE /carts/{customerId}/items/{productId}` → `200 Cart`.
- `Cart`: `{ customerId, currency: 'EUR', items: CartItem[], totalItems,
totalCents }`; `CartItem`: `{ productId, name, image, unitPriceCents, quantity,
lineTotalCents }` — denormalized snapshot composed by the BFF; all totals
  server-computed.
- `POST /orders` body `{ customerId }` → `201 Order` built atomically from the
  stored cart (price snapshot, server timestamp), which is then cleared; `422` on an
  empty cart. `Order`: `{ id, createdAt, currency, items: CartItem[], totalCents }`.

Money is integer cents end-to-end; the UI formats with
`Intl.NumberFormat('it-IT', { currency: 'EUR' })` (`src/ui/money.ts`).

## 1. API layer

- `src/api/http.ts` — `fetchJson` grows `{ method, body, signal }` options (JSON
  body + content-type when present).
- `src/api/cart.ts` — `Cart`/`CartItem` types + `fetchCart`, `putCartItem`,
  `deleteCartItem`.
- `src/api/orders.ts` — `Order` type + `createOrder(customerId)`.
- `src/customer/customerId.ts` — `getCustomerId()`: demo identity, generated with
  `crypto.randomUUID()` and persisted in localStorage (no auth, by design).

## 2. Features

- `src/cart/useCart.ts` — the one cart hook: `['cart', customerId]` query +
  set-quantity / remove mutations with optimistic updates (cancel → snapshot →
  rewrite cache, including display-only total recomputation → rollback on error →
  invalidate on settle). Exposes `cart`, `isPending`, `isError`, `itemCount`,
  `addItem(product)`, `setItemQuantity(item, quantity)` (≤ 0 removes, clamped to
  99), `removeItem(productId)`.
- `src/cart/AddToCartButton.tsx` — used on card and detail page; disabled with
  "Non disponibile" when the product has no price; accessible name includes the
  product ("Aggiungi {name} al carrello").
- `src/cart/CartButton.tsx` — header button with live item-count badge.
- `src/cart/CartDrawer.tsx` — right slide-over: items with quantity stepper and
  remove, server totals, link to `/checkout`.
- `src/checkout/useCreateOrder.ts` — order mutation; invalidates the cart on
  success (the BFF cleared it).
- `src/checkout/CheckoutPage.tsx` — cart recap with line/cart totals, "Conferma
  ordine" (pending/error states), then the order recap (number, date, items, total).
- `src/app/AppLayout.tsx` — gains the cart button + drawer (open state is local UI
  state); `src/app/AppRouter.tsx` — adds `/checkout`.
- `src/catalog/*` — realigned to the camelCase contract; card and detail show the
  price and host `AddToCartButton`.

## 3. Tests

- `tests/cartStore.ts` — small stateful in-memory cart/order store behind the MSW
  handlers (reset in `tests/setup.ts` together with `localStorage`), so flows
  survive refetch-after-invalidate like the real BFF would.
- `tests/server.ts` — default handlers for carts and orders on top of the realigned
  product handlers.
- `tests/cart/cartFlow.test.tsx` — integration through `AppLayout` + catalog: add
  from a card → badge count → drawer shows item and server total → quantity stepper
  updates the total → unmount/remount (same localStorage identity, same store)
  still shows the cart: the "leave and come back" guarantee.
- `tests/checkout/CheckoutPage.test.tsx` — seeded cart → recap with totals →
  confirm → order recap, cart emptied; empty-cart state.
- Catalog tests realigned (pagination via `hasNext`, "Pagina N").

## Verification checklist

1. `npm run lint`, `format:check`, `typecheck`, `test`, `build` all green.
2. `npm run dev` with the BFF down: catalog error state, no crash.
3. PLAN.md Phase 2 ⬜ → 🔶 (here) and seller-shop PLAN.md Phase 2 updated (cart
   decision recorded, pricing ownership stated).
