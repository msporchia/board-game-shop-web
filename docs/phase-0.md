# Phase 0 — Scaffold: implementation spec

Goal: a Vite + React 19 + TypeScript strict scaffold with tooling, providers, a single
placeholder home page showing live BFF status, tests, Dockerfile + compose, CI. No
catalog/cart/chat features yet — that starts in Phase 1. Conventions in `CLAUDE.md`
apply to every file.

Upstream contract: the BFF (`../seller-shop`, may not be running) exposes
`GET http://localhost:3000/health` → `{ "status": "ok", "service": "board-game-shop-api" }`
with CORS allowing `http://localhost:5173`. Tests must not need it (MSW); the page
must render a graceful offline state when it is unreachable.

## 1. Project setup

- `npm create vite@latest . -- --template react-ts` (or hand-rolled equivalent), then
  adapt. Add `noUncheckedIndexedAccess: true` to the tsconfig.
- Tailwind CSS v4 via the `@tailwindcss/vite` plugin (no PostCSS config).
- Runtime deps: react, react-dom, @tanstack/react-query, react-router (v7, library
  mode — not framework mode).
- Dev deps: vitest, jsdom, @testing-library/react, @testing-library/jest-dom,
  @testing-library/user-event, msw, eslint + typescript-eslint +
  eslint-plugin-react-hooks + eslint-plugin-react-refresh, prettier,
  eslint-config-prettier.
- Scripts: `dev`, `build` (tsc -b && vite build), `preview`, `typecheck`,
  `lint` (eslint .), `format` / `format:check`, `test` (vitest run), `test:watch`.

## 2. Source files

- `src/main.tsx` — entry: mounts `<AppProviders><AppRouter /></AppProviders>`.
- `src/app/AppProviders.tsx` — QueryClientProvider (retry 1, refetchOnWindowFocus
  off for now).
- `src/app/AppRouter.tsx` — BrowserRouter, single route `/` → HomePage.
- `src/api/config.ts` — BFF base URL from `import.meta.env.VITE_SHOP_API_URL`,
  default `http://localhost:3000`.
- `src/api/health.ts` — `HealthStatus` type + `fetchHealth(): Promise<HealthStatus>`
  (typed fetch, throws on !ok). One module per endpoint — the pattern every future
  endpoint follows.
- `src/health/useShopHealth.ts` — `useQuery` hook over fetchHealth.
- `src/home/HomePage.tsx` — placeholder, minimal and clean (the real design pass is
  Phase 5 — don't over-design): title, Italian tagline, and a status badge driven by
  useShopHealth with three states: loading / online (shows the service name from the
  response) / offline (graceful Italian message). Tailwind for styling.

## 3. Tests

- `tests/setup.ts` — jest-dom + MSW server lifecycle (setupServer,
  listen/resetHandlers/close).
- `tests/home/HomePage.test.tsx` — HomePage inside fresh providers; MSW handler for
  the health URL: online badge with service name appears. Second test: handler
  returns 500 → offline state appears.
- Vitest: environment jsdom, setupFiles, globals off. May live in vite.config.ts via
  the `test` key or a separate vitest.config.ts — note the choice.

## 4. Lint/format

- `eslint.config.js` (flat): typescript-eslint recommended + react-hooks +
  react-refresh, eslint-config-prettier last, ignore `dist/`.
- `.prettierrc.json`: exactly the shared spec from CLAUDE.md.

## 5. Docker

- `Dockerfile` (dev-shaped): node:22-alpine, install via lockfile,
  CMD npm run dev -- --host 0.0.0.0. Comment: `# TODO Phase 5: multi-stage nginx build`.
- `docker-compose.yml`: service `seller-web`, build `.`, ports 5173:5173, volumes
  `.:/app` + anonymous `/app/node_modules`. VITE_SHOP_API_URL stays a browser-side
  URL (`http://localhost:3000`) — never a docker hostname.

## 6. CI

`.github/workflows/ci.yml`: push/PR, node 22 + npm cache, `npm ci`, lint,
format:check, typecheck, test, build.

## 7. Housekeeping

- `.gitignore`: node_modules, dist, coverage, .env\* (keep .env.example).
- `.env.example` with VITE_SHOP_API_URL + browser-side comment.
- Remove all Vite template leftovers (logos, demo CSS) — no dead files.
- README.md: update the "Development" section only. PLAN.md: flip Phase 0 ⬜ → 🔶
  (stays 🔶 until the shop slice is done too).

## Verification checklist (all must pass)

1. `npm install` clean.
2. `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`,
   `npm run build` green.
3. `npm run dev` started briefly: the page root serves HTML with the BFF down (offline
   badge, no crash).

Known friction to resolve pragmatically (note decisions): React 19 +
testing-library peer deps, Tailwind v4 plugin setup, MSW v2 API.
