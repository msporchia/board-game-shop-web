# Plan

This app's slice of the storefront roadmap. Phase numbers are aligned across the three
repos (seller = [board-game-rag-seller](https://github.com/msporchia/board-game-rag-seller),
shop = [board-game-shop-api](https://github.com/msporchia/board-game-shop-api)) so a
phase is "done" when every involved repo's slice is done.
Status legend: ⬜ not started · 🔶 in progress · ✅ done.

## Phase 0 — Scaffold 🔶 · [implementation spec](docs/phase-0.md)

Vite + React 19 + TypeScript strict, ESLint + Prettier (config aligned with shop),
Vitest + React Testing Library + MSW. Dev compose service joining the seller stack.
CI: lint + tests.

**Done when:** a placeholder page renders a value fetched from the BFF's `/health`;
CI green.

## Phase 1 — Catalog 🔶 · [implementation spec](docs/phase-1.md)

Catalog grid of game cards (image, name, players, duration, complexity, rating);
product detail page rendering the AI-enriched description; loading/error/empty states
as first-class components; client types generated from the BFF's OpenAPI spec.

**Done when:** the full catalog is browsable; a product page shows pipeline-enriched
content; no hand-written DTO duplicates.

## Phase 2 — Cart & checkout ⬜

Cart context (`useReducer`) persisted to localStorage; add/remove/quantity from card
and detail page; cart drawer; `/checkout` page posting the order to the BFF and
showing the recap. `customer_id` generated and persisted in localStorage.

**Done when:** cart survives a reload; checkout lands an order in the shop's DB and
shows a recap; reducer and hooks covered by unit tests.

## Phase 3 — Chat advisor ⬜

Embedded chat panel: message list, game-card recommendations rendered inside the
conversation, quick replies as clickable chips (sent back as `choices`), `session_id`
persisted in localStorage so session memory is tangible across turns and reloads.
**Add-to-cart directly from a recommendation card.**

**Done when:** a multi-turn conversation refines results via chips, remembers context,
and a recommended game lands in the cart without leaving the chat.

## Phase 4 — Faceted search ⬜

Search page: free-text query plus structured facets (players, duration, complexity,
category, brand) mapped 1:1 to the search API; URL-driven state so searches are
shareable/bookmarkable.

**Done when:** facets compose with free text; the URL fully reproduces a search.

## Phase 5 — Polish & showcase ⬜

Visual pass (distinctive, not template-like), a11y audit, full-stack Playwright smoke
e2e (lives here, drives the whole compose stack), screenshots/GIF for the three
READMEs.

**Done when:** the e2e passes in CI; the README walks a recruiter through the
chat→cart loop with images.

## Phase 6 — Personalization surfaced ⬜

The UI side of purchase-history personalization (shop injects history, seller grounds
on it): greeting bubble referencing a real past order, owned games visibly absent from
recommendations, recency phrasing ("la settimana scorsa…").

**Done when:** a purchase visibly changes the next conversation in the UI.

## Ideas beyond the plan

- **"Behind the scenes" panel** — toggle showing the advisor's strategy, accumulated
  filters, and escalation signal per turn (needs a debug echo from the AI service).
  Turns the UI into a demo of the _system_, not just the shop.
- Optimistic UI / suspense boundaries once the basics are solid.
