# CLAUDE.md

## What this repo is

`board-game-shop-web` — a compact React/TypeScript storefront and demo UI for a
three-repo board-game RAG seller. Read `README.md` (purpose, architecture, stack
rationale) and `PLAN.md` (current portfolio/demo direction). Sibling checkouts:
`../seller` (Python AI/RAG service, owns the compose stack) and `../seller-shop`
(Node BFF — the ONLY service this app talks to, default `http://localhost:3000`).
This is a portfolio/showcase project: code quality is the product.

## Product direction

The target is **minimal storefront + polished conversational RAG demo**.

Keep catalog, product detail, cart and checkout deliberately small. They exist to
show production-shaped React/TS and to give recommended games somewhere real to land.
Do not grow this into a broad e-commerce product unless the user explicitly changes
the goal.

The intentional "special" surface is the chat advisor: a recordable conversation UI
that makes the RAG seller visible with grounded game cards, quick replies and
add-to-cart from recommendations. When choosing between more store features and a
clearer filmed RAG demo, prioritize the demo.

Avoid standalone faceted search, auth/account areas, payment realism, advanced
personalization screens, large design-system work, or broad full-stack e2e unless
they directly serve the recorded chat-to-cart showcase.

## Code structure convention

- **Folder = feature** (`src/catalog/`, `src/cart/`, `src/chat/`), never
  folder-by-type.
- **One component per file.** A _private_ subcomponent serving only the file's
  protagonist may cohabit; anything used from outside gets its own module.
- **Components never call `fetch`.** Data access lives in the typed API layer
  (`src/api/` — one module per endpoint) consumed through custom hooks (one hook per
  concern, e.g. `useCart`, `useChatSession`).
- **Everything remote is server state** via TanStack Query — including the cart,
  which lives on the BFF keyed by the localStorage `customer_id` and is mutated with
  optimistic updates (instant UI, rollback on error). No client-state library;
  ephemeral UI state stays in components.
- **Commerce logic belongs to the BFF.** Prices, line/cart totals and order creation
  (server cart → order, atomically) are computed server-side; the client renders
  money, it never derives it (optimistic arithmetic is display-only until the server
  settles).
- **No barrel `index.ts` re-exports.** Deep, explicit imports.
- **Tests mirror features**: Vitest + React Testing Library, HTTP mocked with MSW at
  the network boundary (never mock the hooks). Explicit imports from `vitest`
  (no globals).

## Stack (pinned by design — see README for rationale)

Vite + React 19, TypeScript strict (`noUncheckedIndexedAccess`), TanStack Query,
react-router v7 (library mode), Tailwind CSS v4 (no component kit — the UI is part of
the showcase). Prettier:
`{ "singleQuote": true, "semi": true, "printWidth": 100, "trailingComma": "all" }`
(shared spec with seller-shop — do not drift).

The BFF contract may still be evolving in `seller-shop`. Keep contract types isolated
under `src/contracts/` and endpoint details under `src/api/`; feature components should
not encode backend wiring or seller/RAG internals.

## Language

- Code, comments, docs, commit messages: English.
- **User-facing UI copy: Italian** (it's an Italian shop — e.g. "Aggiungi al
  carrello", "Il negozio è online"). Never mix the two: identifiers English, strings
  the customer reads Italian.
- No `Co-Authored-By` trailers in commits.

## Tooling

Node v22 and npm are available locally (nvm). Use the npm scripts (`lint`,
`format:check`, `typecheck`, `test`, `build`); all must be green before a phase is
done. `VITE_SHOP_API_URL` is a browser-side URL — keep it `http://localhost:3000`
even when running via compose.
