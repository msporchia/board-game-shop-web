# Cross-repo showcase plan

This document coordinates the three repos as one portfolio project. The goal is not
to build a full e-commerce product; it is to show solid ownership across Python RAG,
Node/TypeScript backend work, and a React/TypeScript storefront.

North star:

> A customer asks the AI advisor for help, receives grounded board-game
> recommendations as buyable cards, and adds one to the cart from the conversation.

That is the primary recorded demo. Checkout, order history and personalization are
useful supporting pieces, but they are not allowed to delay the chat-to-cart slice.

## What this proves

- `seller`: production-shaped AI/RAG engineering, retrieval quality, grounding and
  eval discipline.
- `seller-shop`: Node + TypeScript BFF work, runtime validation, OpenAPI/contracts,
  commerce ownership and service-to-service composition.
- `seller-web`: React + TypeScript UI, typed API consumption, TanStack Query server
  state, optimistic cart UX, MSW-tested flows and a polished chat demo.

## Repo responsibilities

### seller

Owns AI and retrieval.

- Owns `/search` and `/chat` behavior.
- Owns RAG grounding, retrieval filters, session memory inside the AI service and evals.
- Accepts optional `customer_context` from the shop BFF, but does not own customer
  identity, carts, prices or orders.
- Does not get called directly by the browser.

### seller-shop

Owns commerce and BFF composition.

- Owns catalog API, server-side carts, orders, price snapshots and order history.
- Owns the public browser-facing API and emitted OpenAPI spec.
- Validates every HTTP/env/file/upstream boundary with Zod or equivalent runtime
  parsing.
- Proxies `/chat` to `seller`.
- Enriches seller recommendations with shop-owned fields needed by the browser:
  product id, image, price and buyability.
- May inject purchase history into `/chat` as `customer_context`, after the core
  chat-to-cart path is working.

### seller-web

Owns the customer experience.

- Talks only to `seller-shop`.
- Consumes BFF contracts from generated OpenAPI types.
- Renders catalog, product detail, cart, checkout, chat, recommendations and quick
  replies.
- Never computes money or checkout totals.
- Keeps `customerId` and `chatSessionId` in localStorage for the demo identity.
- Owns screenshots/GIF and, if cheap, a single smoke test for the recorded path.

### Human/product owner

Keeps scope tight.

- Decides which visual details are worth polishing.
- Decides when the project is good enough for CV/portfolio use.
- Keeps the three READMEs telling the same story.
- Prefer one impressive vertical slice over many half-polished pages.

## Contract handshake

Contracts come before UI polish. If web needs a field, it should be added to the BFF
contract first, then consumed from generated types or from an explicitly documented
temporary mirror.

### Existing BFF surface

Customer-scoped routes take the active identity from a required `X-Customer-Id`
header — there is no id in the path, body or query:

- `GET /health`
- `GET /products`
- `GET /products/{id}`
- `GET /cart`
- `PUT /cart/items/{productId}`
- `DELETE /cart/items/{productId}`
- `POST /orders`
- read-model: `GET /orders`

### Chat route: `POST /chat`

Browser-facing request (with header `X-Customer-Id: demo-customer`):

```json
{
  "sessionId": "demo-chat-session",
  "message": "Cerco un cooperativo per due",
  "choices": ["max 30 minuti"],
  "k": 4
}
```

BFF behavior:

- validates request;
- optionally reads recent orders for `customerId`;
- optionally builds `customer_context`;
- forwards to `seller` `/chat`;
- validates seller response;
- enriches returned game cards with shop-owned fields when needed: price, image,
  buyable product id;
- returns a stable web contract.

Browser-facing response:

```json
{
  "message": "Se giocate in due e volete collaborare, partirei da Pandemic...",
  "games": [
    {
      "id": 5,
      "name": "Pandemic",
      "image": "https://example.test/pandemic.jpg",
      "priceCents": 3650,
      "playersDisplay": "2-4",
      "durationMin": 45,
      "complexity": "Medio"
    }
  ],
  "quickReplies": ["max 30 minuti", "piu leggero", "un'altra idea"]
}
```

Seller-facing forwarded shape can remain close to seller's existing contract:

```json
{
  "session_id": "demo-chat-session",
  "message": "Cerco un cooperativo per due",
  "choices": ["max 30 minuti"],
  "k": 4,
  "customer_context": {
    "owned_product_ids": [3],
    "recent_orders": [
      {
        "id": 12,
        "created_at": "2026-06-12T10:00:00.000Z",
        "items": [
          {
            "product_id": 3,
            "name": "Azul",
            "quantity": 1
          }
        ]
      }
    ]
  }
}
```

`customer_context` can be omitted until purchase-history personalization becomes part
of the recorded demo.

### Later route: `GET /search`

Standalone faceted search is not part of the main web scope. Add it only if it
supports the chat demo or becomes useful for the BFF contract story.

## Showcase priorities

1. Chat-to-cart loop

- Chat panel renders advisor turns and recommendation cards.
- Quick replies are real structured choices.
- Recommendation cards have add-to-cart actions.
- Add-to-cart updates/invalidates the existing server cart.
- The user does not leave the conversation to buy the recommendation.

2. Contract-first TypeScript loop

- BFF emits OpenAPI from route schemas when stable.
- Web generates or validates types from the BFF source of truth.
- Manual mirrors in `seller-web/src/contracts` are removed or clearly marked as
  temporary.
- MSW fixtures stay aligned with the public browser contract.

3. README assets

- One screenshot of catalog/cart as baseline app context.
- One screenshot or GIF of chat recommendation to cart.
- One short explanation of how the browser, BFF and RAG service cooperate.
- Each README links the other two repos and tells the same architecture story.

4. Optional architecture sparkle

Only after chat-to-cart works:

- a small "why this recommendation" or "behind the scenes" panel if the BFF exposes
  useful metadata;
- purchase-history personalization if it is already reliable enough to film;
- one Playwright smoke test for the recorded path.

## Milestones

### Milestone 1: Make current state honest

Seller-shop:

- README reflects implemented catalog/cart/order behavior and current chat contract work.
- Quality gates and HTTP boundary tests are visible.

Seller-web:

- README reflects implemented catalog, product detail, cart, checkout and chat MVP.
- Open items are explicit: real-stack chat recording, demo polish and optional
  architecture sparkle.
- PLAN points to chat-to-cart as the primary showcase slice.

All repos:

- The README story is consistent: minimal shop surface, RAG seller demo, BFF boundary.

### Milestone 2: Chat proxy contract

Seller-shop:

- Add or finalize `POST /chat`.
- Validate browser request and seller response.
- Forward `session_id`, `message`, `choices`, `k` and optional `customer_context`.
- Return camelCase `quickReplies` and shop-enriched `games` to web.

Seller-web:

- Add `src/contracts/chat.ts` and `src/api/chat.ts`.
- Add MSW handlers for a deterministic chat fixture.

Done when:

- The web can test against the same response shape the BFF promises.

### Milestone 3: Chat UI MVP

Seller-web:

- Add chat panel with message list, input, quick replies and recommendation cards.
- Persist `chatSessionId`.
- Add "add recommendation to cart".
- Cover multi-turn chat, quick reply click and add-to-cart with tests.

Done when:

- A multi-turn chat works through browser -> BFF -> seller -> BFF -> browser, or
  against stable MSW fixtures while backend work is still in progress.

### Milestone 4: Showcase finish

Seller-web:

- Produce screenshots/GIF.
- Polish layout, empty/error/loading states and keyboard basics.
- Add one smoke test only if it is cheap and stable.

Seller-shop:

- Tighten error handling, transaction behavior, DB parsing and API docs.

All repos:

- Commands are reproducible from a fresh checkout.
- The recorded flow can be shown in under a minute.

## Non-goals

- Real auth.
- Real payment.
- Full production migrations.
- Admin/backoffice.
- A huge design system.
- A complex product search UI before chat-to-cart works.
- Purchase-history personalization before the core chat-to-cart demo works.
- Calling paid LLM APIs just to make the demo look better.

## Collaboration rules

- Web never calls `seller` directly.
- Web never computes prices, line totals, cart totals or order totals.
- Seller-shop never invents AI behavior; it validates, adapts and composes services.
- Seller never owns commerce identity or order history; it receives optional context
  from the BFF.
- Contract changes start in seller-shop, then web consumes them.
- If a field is only for UI display, still document whether it comes from shop-owned
  data or seller-owned data.
