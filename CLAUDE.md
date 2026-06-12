# CLAUDE.md

## What this repo is

`board-game-shop-web` — the React storefront UI of a three-repo board-game e-commerce
demo. Read `README.md` (role, architecture, stack rationale) and `PLAN.md` (phased
roadmap; each phase gets a detailed spec in `docs/` when it starts). Sibling
checkouts: `../seller` (Python AI/RAG service, owns the compose stack) and
`../seller-shop` (Node BFF — the ONLY service this app talks to, default
`http://localhost:3000`). This is a portfolio/showcase project: code quality is the
product.

## Code structure convention

- **Folder = feature** (`src/catalog/`, `src/cart/`, `src/chat/`), never
  folder-by-type.
- **One component per file.** A _private_ subcomponent serving only the file's
  protagonist may cohabit; anything used from outside gets its own module.
- **Components never call `fetch`.** Data access lives in the typed API layer
  (`src/api/` — one module per endpoint) consumed through custom hooks (one hook per
  concern, e.g. `useCart`, `useChatSession`).
- **Server state vs client state stay distinct**: TanStack Query for everything from
  the BFF; Context + `useReducer` for the cart (deliberately core React — do not
  introduce a state library).
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
