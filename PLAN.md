# Portfolio Plan

This repo is not planned as a full e-commerce product. Its job is to demonstrate
React/TypeScript competence and provide a clean, recordable UI for the RAG seller.

North star:

> Minimal storefront + polished conversational RAG demo.

Status legend: ⬜ not started · 🔶 in progress · ✅ implemented locally.

## Scope Decision

Keep simple:

- catalog browsing;
- product detail;
- server-side cart;
- simulated checkout/order recap;
- straightforward loading, empty and error states.

Make special:

- the chat advisor UI, because it is the visual proof of the RAG seller;
- recommendation cards inside the conversation;
- quick replies that become real choices/filters;
- add-to-cart from a recommendation without leaving the chat;
- enough motion/polish to film the flow for the seller README.

Avoid unless it directly helps the filmed demo:

- standalone faceted search page;
- real auth (passwords/sessions) or payment — the passwordless identity switcher is
  fine, full account management is not;
- advanced personalization screens;
- large design-system work;
- broad full-stack e2e automation before the core demo is visible.

## 1. Baseline Storefront ✅

Already implemented in this repo:

- Vite + React 19 + strict TypeScript;
- ESLint, Prettier, Vitest, Testing Library, MSW and CI-ready scripts;
- BFF-only API layer;
- catalog grid and product detail page;
- server-side cart client with optimistic add/remove/quantity updates;
- checkout page posting an order and showing the recap;
- MSW-backed tests for the main user flows;
- a passwordless demo identity that can be switched like a basic login (see below).

This file is the single source of product direction.

### Demo identity ✅

There is no real auth (a non-goal). The customer is a local handle — a generated id
plus a friendly name ("Paolo", "Giulia", …) kept in localStorage. The id is sent to
the BFF as the `X-Customer-Id` header, standing in for a token a real backend could
issue. A header switcher lets you create or switch identities; the server-side cart
(and, later, orders) repopulate from the BFF for the active id, which is what makes
persistence/"memory" tangible without building accounts or passwords.

## 2. BFF Contract Alignment 🔶

The `seller-shop` / `board-game-shop-api` interface is the source of truth. The web
app stays BFF-only and adapts to that contract without leaking RAG-service details
into React components.

Implemented locally:

- `POST /chat` contract starts in `seller-shop`;
- `src/contracts/openapi.ts` is generated from the BFF OpenAPI document;
- product, cart, order, health and chat feature contracts are typed slices of that
  generated source;
- MSW handlers mirror the browser-facing BFF contract used by the web tests.

Still open:

- whether the chat response should expose debug/display metadata such as understood
  filters, strategy or grounding notes;
- whether purchase-history context becomes part of the recorded demo.

Done when:

- `src/contracts/` comes from the BFF source of truth;
- MSW handlers mirror the agreed BFF contract;
- no feature component knows about seller/RAG internals.

## 3. Chat Advisor Showcase ✅ (local)

This is the main feature. It is implemented against the BFF contract, covered by MSW
tests, polished and accessible, and recorded against a mocked stack. A real-stack
recording pass (with `seller` + `seller-shop` up) is the remaining open item.

Expected UX:

- chat entry point visible from the shop layout;
- message history with user and advisor turns;
- pending/typing state that looks good in a short screen recording;
- quick replies rendered as tappable chips and sent back as structured choices;
- recommended games rendered as compact cards inside the advisor turn;
- each recommendation can be added to the existing cart;
- `session_id` persisted in localStorage;
- graceful fallback/error state if the chat endpoint fails.

Expected code shape:

- `src/chat/` feature folder;
- `src/api/chat.ts` endpoint module;
- `src/contracts/chat.ts` BFF contract types;
- `useChatSession` hook over TanStack Query mutations;
- no direct calls to the Python seller service;
- MSW tests that cover a multi-turn conversation, quick reply click and
  add-to-cart-from-recommendation.

Implemented locally:

- chat entry point in the app shell;
- message list, pending state, quick replies and recommendation cards;
- persisted `chatSessionId`;
- add-to-cart from a recommendation card;
- chat -> recommendation card -> add-to-cart -> checkout test.

Done when:

- a user can ask for a vague game recommendation, click one quick reply, receive
  grounded game cards and add one to the cart;
- the flow is deterministic enough to film against the local stack or stable fixtures;
- the README can describe this as the purpose of the project without hand-waving.

## 4. Demo Polish ✅ (local)

Done:

- chat drawer accessibility via `useDialogA11y`: focus trap, initial focus, Escape
  close, `aria-modal`, auto-scroll;
- motion polish (slide-in, typing indicator, message transitions) that respects
  `motion-reduce`;
- one Playwright smoke test for the filmed chat-to-cart path, which doubles as the
  source of the demo recording (`npm run demo:record` → `docs/demo/`);
- all gates green: `lint`, `format:check`, `typecheck`, `test`, `test:e2e`, `build`.

Remaining: a real-stack recording once `seller` + `seller-shop` are up, and a
concise CV-ready blurb in the README.

## Later Options

Only add these if they serve the showcase:

- an **order history** view (the BFF already exposes `GET /orders?customerId`) so a
  switched-back identity shows its past orders, not just its cart — the natural next
  grade of the demo-identity work;
- chat **personalization**: the BFF injecting purchase history as `customer_context`
  into `/chat`. Note `seller` does **not** accept `customer_context` today, so this is
  a cross-repo change (seller + BFF), not a web-only one;
- a small "why this recommendation" panel if the BFF exposes grounding/debug metadata;
- faceted search, only if it becomes part of the chat demo rather than a separate
  store feature.
