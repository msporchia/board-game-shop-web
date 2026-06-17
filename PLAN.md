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
- auth, payment, account area or realistic order management;
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
- MSW-backed tests for the main user flows.

Historical implementation specs live in:

- [docs/phase-0.md](docs/phase-0.md) — scaffold;
- [docs/phase-1.md](docs/phase-1.md) — catalog;
- [docs/phase-2.md](docs/phase-2.md) — cart and checkout.

Those docs remain useful background, but this file is now the source of product
direction.

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

## 3. Chat Advisor Showcase 🔶

This is the main feature. The MVP is implemented against the BFF contract and covered
by MSW tests; it still needs visual polish and a real-stack recording pass.

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

## 4. Demo Polish ⬜

Polish only after the chat path exists.

Focus areas:

- make the app feel less scaffold-like while keeping the UI quiet and compact;
- improve cart drawer accessibility: focus management, Escape close, `aria-modal`;
- stabilize layout so text, cards and buttons do not jump during recording;
- add a short README GIF or screenshots of the chat-to-cart flow;
- include a concise CV-ready project description.

Done when:

- `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test` and
  `npm run build` are green;
- the recorded flow shows the RAG seller value in under a minute;
- the README tells a reviewer exactly what to look at and why it exists.

## Later Options

Only add these if they serve the showcase:

- a small "why this recommendation" panel if the BFF exposes useful grounding/debug
  metadata;
- one Playwright smoke test for the filmed path;
- faceted search, only if it becomes part of the chat demo rather than a separate
  store feature.
