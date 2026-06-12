# Phase 1 — Catalog: implementation spec

Goal: a browsable catalog grid at `/` and a product detail page at `/games/:id`
rendering the AI-enriched description, with loading/error/empty states as first-class
components. Conventions in `CLAUDE.md` apply to every file.

## Upstream contract

The BFF (`../seller-shop`) Phase 1 will expose (per its PLAN; not implemented yet —
tests run on MSW, the UI degrades gracefully without it):

- `GET /products?page=&page_size=` → `{ items: ProductSummary[], page, page_size,
total }` — paginated read of the upstream mock catalog.
- `GET /products/{id}` → `ProductDetail` — base product composed with the enriched
  description produced by the AI service's ingestion pipeline; `404` for unknown ids.

Field names mirror the upstream catalog record (see `../seller`
`app/models/game_data.py`): `id_product`, `name`, `image`, `players`,
`players_display`, `duration_min`, `age_min`, `complexity`, `complexity_level`,
`year`, `internal_rating`, `is_expansion`, `categoria`, `marca`, `tags`, `autori`,
plus `description` (enriched) on the detail.

**Types decision:** the BFF does not emit its OpenAPI spec yet, so
`src/api/products.ts` carries a hand-written mirror of the agreed contract, marked
`TODO` for replacement with `openapi-typescript` output. The phase's "no hand-written
DTO duplicates" done-criterion stays open (phase stays 🔶) until the BFF slice lands
and types are generated.

## 1. API layer

- `src/api/http.ts` — `ApiError` (carries the HTTP status) + `fetchJson<T>` helper so
  endpoint modules stay one-liners and callers can branch on status (404 → not
  found).
- `src/api/products.ts` — contract types + `fetchProducts(page)` /
  `fetchProduct(id)`. One module per endpoint family.
- `src/app/createQueryClient.ts` — retry skips 4xx responses (retrying a 404 is
  noise); still one retry for network/5xx.

## 2. Features

- `src/catalog/useCatalogProducts.ts` — paginated `useQuery`
  (`placeholderData: keepPreviousData` so page flips don't flash the spinner).
- `src/catalog/useProduct.ts` — detail `useQuery` keyed by id.
- `src/catalog/CatalogPage.tsx` — grid of `GameCard` + pagination controls;
  page number driven by the `?page=` search param (shareable URLs).
- `src/catalog/GameCard.tsx` — image (placeholder when `null`), name, players,
  duration, complexity, rating; links to `/games/:id`.
- `src/catalog/ProductDetailPage.tsx` — full record + enriched description;
  distinct "Gioco non trovato" state on 404.
- `src/ui/LoadingState.tsx`, `src/ui/ErrorState.tsx`, `src/ui/EmptyState.tsx` —
  the first-class async states shared across features. `src/ui/` is the one
  deliberate exception to folder-=-feature: tiny cross-feature presentational
  primitives, one component per file.
- `src/app/AppLayout.tsx` — header (shop name linking home, status badge) +
  `<Outlet/>`; `src/health/ShopStatusBadge.tsx` gets its own module (used from the
  layout now, not just the old placeholder home).
- `src/home/` is removed — the catalog _is_ the home page (README routing:
  catalog `/`, product `/games/:id`).

## 3. Tests

- `tests/fixtures/products.ts` — small fixture set shaped exactly like the contract.
- `tests/server.ts` — default happy-path handlers for `/products` (paginates the
  fixtures) and `/products/:id` (404 on unknown id).
- `tests/renderWithProviders.tsx` — grows a `MemoryRouter` (initial route option) so
  pages with `Link`/`useParams` render.
- `tests/catalog/CatalogPage.test.tsx` — grid renders fixture cards; empty catalog →
  empty state; 500 → error state; pagination updates `?page=`.
- `tests/catalog/ProductDetailPage.test.tsx` — enriched description renders; unknown
  id → "Gioco non trovato".
- `tests/health/ShopStatusBadge.test.tsx` — online/offline badge (replaces the
  HomePage test).

## Verification checklist

1. `npm run lint`, `format:check`, `typecheck`, `test`, `build` all green.
2. `npm run dev` with the BFF down: catalog page renders the error state, no crash.
3. PLAN.md: Phase 1 ⬜ → 🔶 with a link to this spec.
