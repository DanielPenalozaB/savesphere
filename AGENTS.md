# SaveSphere — Agent Guide

> This file is intended for AI coding agents. It contains project-specific context, conventions, and commands that are not obvious from skimming the repository.

---

## Project Overview

SaveSphere is a personal finance and budget tracking web application. It is organized as a Yarn/Turbo monorepo with two main applications:

- **`apps/api`** — Go HTTP API handling authentication, wallets, transactions, and AI-powered financial intelligence.
- **`apps/web`** — SvelteKit SSR/CSR frontend providing the dashboard, wallets management, and transaction views.

The project uses PostgreSQL for persistence and Google Gemini for AI financial advice. Internationalization is built in (English + Spanish).

---

## Monorepo Structure

```
.
├── apps/
│   ├── api/              # Go backend (Echo, pgx, JWT)
│   └── web/              # SvelteKit frontend (Svelte 5, Tailwind v4)
├── packages/
│   └── shared/           # Shared OpenAPI spec (openapi.yaml)
├── docker-compose.yml      # Postgres + migrate services
├── docker-compose.dev.yml  # Full dev stack (DB + API + Web)
├── turbo.json            # Turbo task graph
└── package.json          # Workspace root (Yarn 1.22.22)
```

- **Package manager:** Yarn v1 (`yarn install`)
- **Task runner:** Turbo (`turbo dev`, `turbo build`, etc.)

---

## Technology Stack

### API (`apps/api`)

| Layer | Technology |
|-------|------------|
| Language | Go 1.25 |
| Framework | Echo v4 (`labstack/echo`) |
| Database | PostgreSQL 15 (driver: `jackc/pgx/v5`) |
| Migrations | `golang-migrate` (via Docker Compose) |
| Auth | JWT (`golang-jwt/jwt/v5`), bcrypt passwords |
| Validation | `go-playground/validator/v10` |
| AI | Google Gemini (`google/generative-ai-go`) |
| Decimal math | `shopspring/decimal` |

### Web (`apps/web`)

| Layer | Technology |
|-------|------------|
| Framework | SvelteKit 2 + Svelte 5 (runes) |
| Bundler | Vite 7 |
| Adapter | `@sveltejs/adapter-node` (Node.js runtime) |
| Styling | TailwindCSS v4 (`@tailwindcss/vite`) |
| UI Components | shadcn-svelte + bits-ui |
| Icons | `@lucide/svelte` |
| Charts | `layerchart` |
| Tables | `@tanstack/table-core` |
| i18n | Paraglide JS (`@inlang/paraglide-js`) — locales: `en`, `es` |
| Fonts | Poppins (Google Fonts), Inter variable (`@fontsource-variable/inter`) |

### Testing

| Type | Tool |
|------|------|
| Unit / Server | Vitest (Node environment) |
| Component / Browser | Vitest + `@vitest/browser-playwright` |
| E2E | Playwright (`@playwright/test`) |
| Visual / Stories | Storybook 10 + Vitest addon |

### Tooling

- **Linting:** ESLint 9 flat config (`eslint.config.js`) with recommended JS, TS, Svelte, and Prettier rules.
- **Formatting:** Prettier 3 with `prettier-plugin-svelte` and `prettier-plugin-tailwindcss`.

---

## Build, Dev, and Test Commands

### Root-level (recommended)

```bash
# Install all dependencies
yarn install

# Start both apps in dev mode
yarn dev
# or
make dev

# Build everything
yarn build
# or
make build

# Run all tests
yarn test
# or
make test

# Lint everything
yarn lint
# or
make lint
```

### App-specific

```bash
# API only
yarn api:dev          # Go run
yarn turbo build --filter=api

# Web only
yarn web:dev          # Vite dev server
yarn web:check        # svelte-check + sync
yarn web:format       # Prettier write
```

### Full Stack — Docker Development (Recommended for Quick Start)

```bash
# Start Postgres + API + Web with one command
make dev-up

# View logs
make dev-logs

# Tear down
make dev-down
```

| Service | Host URL | Purpose |
|---------|----------|---------|
| Web (Vite dev) | http://localhost:5173 | Frontend with HMR |
| API (Go) | http://localhost:3001 | Backend (direct access) |
| API (via Web proxy) | http://localhost:5173/api/* | Proxied through Vite |
| Postgres | localhost:5432 | Database |

The web container proxies `/api/*` and `/auth/*` requests to the API container automatically.

### Database Only (Docker)

```bash
# Start Postgres + run migrations
make docker-up
make migrate-up

# Tear down
make docker-down

# Manual migration down
make migrate-down
```

### Web Testing

```bash
cd apps/web

# Unit + server tests
npm run test:unit -- --run

# Full test suite (unit + e2e)
npm run test

# E2E only
npm run test:e2e

# Storybook
npm run storybook
npm run build-storybook
```

---

## Code Organization

### API (`apps/api`)

Standard Go layered layout:

```
cmd/app/main.go              # Entry point: wires deps, starts Echo server
internal/
  database/postgres.go       # Singleton pgx pool init (DATABASE_URL)
  handlers/                  # HTTP handlers (Echo context)
  middleware/                # Auth middleware (JWT validation)
  models/                    # Request/response structs + domain models
  repository/                # Postgres queries (pgx)
  services/                  # Business logic (user, wallet, tx, JWT, AI)
  common/response/           # Standardized JSON response helpers
migrations/                  # golang-migrate SQL files
```

Routing (from `main.go`):

- `GET /health` — public health check
- `POST /auth/register` — public
- `POST /auth/login` — public
- `GET /api/*` — protected by `AuthMiddleware`
  - Wallets: `POST /api/wallets`, `GET /api/wallets`, `GET /api/wallets/liquidity`
  - Transactions: `POST /api/transactions`, `GET /api/wallets/:walletId/transactions`, `DELETE /api/transactions/:id`
  - Intelligence: `GET /api/intelligence/safe-to-spend`, `GET /api/intelligence/advice`

### Web (`apps/web`)

SvelteKit file-based routing with a route group:

```
src/
  routes/
    +layout.svelte            # Root layout (minimal)
    (app)/                    # Group: app shell (sidebar + header)
      +layout.svelte
      +page.svelte            # Dashboard
      +page.ts                # Dashboard load (currently demo data)
      wallets/
        +page.svelte
        +page.server.ts       # Form actions (addWallet)
        currencies-exchange/
      demo/
      demo/paraglide/
    +error.svelte
  lib/
    api/client.ts             # Typed fetch wrappers (apiGet, apiPost)
    components/
      ui/                     # shadcn-svelte primitives (button, table, sidebar, etc.)
      views/                  # Page-level components (dashboard, wallets, exchange)
      app-sidebar.svelte
      navigation/             # Header, nav-user, nav-secondary
    hooks/is-mobile.svelte.ts
    types/                    # Wallet, Transaction, Currency types
    utils.ts                  # cn(), toPath(), toLocalizedPath()
    utils/format.ts           # formatCurrency, formatDate, formatPercent
    theme.svelte.ts           # Theme state manager (light/dark/system)
    paraglide/                # Generated i18n runtime (DO NOT EDIT)
  stories/                    # Storybook examples
  __tests__/                  # Vitest component tests
  e2e/                        # Playwright E2E tests
```

**Important:** The web app currently uses **demo/mock data** in several `+page.ts` load functions and form actions. These are marked with `TODO: Replace with real API call` or `TODO: Integrate with backend API`. The API client (`lib/api/client.ts`) has `API_BASE = ''` and is not yet wired to the Go backend.

---

## Development Conventions

### Go (API)

- Handlers accept `echo.Context`, validate with `validator.New()`, and return via `response.JSON` / `response.BadRequest` / `response.InternalError`.
- Services are defined as interfaces and injected into handlers.
- Repository layer uses `pgx` directly (no ORM).
- Decimal monetary values use `shopspring/decimal`.
- The `common/response` package standardizes JSON envelopes: `{ "message": "...", "data": ... }`.

### Svelte / TypeScript (Web)

- **Svelte 5 runes** are used: `$props()`, `$state()`, etc.
- **Tailwind v4** uses CSS-based configuration (`@import 'tailwindcss'`, `@theme inline`, CSS custom properties for theming).
- **shadcn-svelte** components live in `src/lib/components/ui/`. Each component has an `index.ts` barrel export.
- **Path aliases:**
  - `$lib/*` maps to `src/lib/*`
  - `components.json` aliases: `ui` → `$lib/components/ui`, `utils` → `$lib/utils`
- **i18n:** Use `m.sidebar_nav_dashboard()` from `$lib/paraglide/messages.js`. Messages are defined in `messages/en.json` and `messages/es.json`.
- **Theme:** Use `themeState.setTheme('dark')` from `$lib/theme.svelte.ts`. The `dark` class is toggled on `<html>`.
- **Formatting:**
  - `singleQuote: true`
  - `trailingComma: 'none'`
  - `printWidth: 100`
  - `tabWidth: 2`
  - `useTabs: false`

### ESLint Rules

- `no-undef` is explicitly turned off (TypeScript handles this).
- Svelte/TS parser is configured for `.svelte`, `.svelte.ts`, and `.svelte.js` files.
- `.gitignore` is included in the ESLint ignore list via `@eslint/compat`.

---

## Testing Strategy

- **API:** No test suite is currently present. This is a gap to be aware of.
- **Web Unit/Server:** Vitest with Node environment for `.test.ts` / `.spec.ts` files.
- **Web Component:** Vitest browser mode (Playwright Chromium) for `*.svelte.test.ts` / `*.svelte.spec.ts`.
- **Web E2E:** Playwright tests in `apps/web/e2e/`. The config runs `npm run build && npm run preview` on port 4173.
- **Storybook:** Stories in `src/stories/` can be tested via the Vitest Storybook addon.

---

## Environment Variables

The project expects a `.env` file in the repository root. Key variables include:

| Variable | Consumer | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | `apps/api` | PostgreSQL connection string |
| `GEMINI_API_KEY` | `apps/api` | Google Gemini API key for financial advice |

The API falls back to `postgres://postgres:postgres@localhost:5432/savesphere?sslmode=disable` if `DATABASE_URL` is unset.

> **Do not commit secrets.** The `.env` file is already gitignored.

---

## Database & Migrations

- **Engine:** PostgreSQL 15 (Alpine image via Docker Compose).
- **Migration tool:** `migrate/migrate` container.
- **Migration files:** `apps/api/migrations/000001_initial_schema.up.sql` / `.down.sql`
- **Schema includes:** `users`, `wallets`, `categories`, `transactions`, `planned_purchases`
- **Indexes:** `idx_wallets_user_id`, `idx_transactions_wallet_id`, `idx_transactions_date`, `idx_planned_purchases_user_id`

Run `make migrate-up` after `make docker-up` to initialize the schema.

---

## Deployment

### Container Images

- **API Dockerfile:** Multi-stage build (`golang:1.25-alpine` → `alpine:3.20`). Includes `migrate` CLI and an entrypoint script that runs migrations before starting the app. Exposes port `3000`.
- **API Dockerfile.dev:** Go dev container (`golang:1.25-alpine`) with live-reload via `go run`. Exposes port `3000`.
- **Web Dockerfile:** Multi-stage Node build (`node:20-alpine` builder + runner). Uses the Node adapter output in `build/`. Exposes port `3000`.
- **Web Dockerfile.dev:** Node dev container (`node:20-alpine`) running Vite dev server with HMR. Exposes port `5173`.

### Docker Compose Files

- `docker-compose.yml` — Database + migrations only (local development).
- `docker-compose.dev.yml` — Full development stack (Postgres + migrations + Go API + Vite web dev server).
- `docker-compose.prod.yml` — **Production stack** for Coolify deployment. Includes Postgres, API, and Web services with Traefik labels for same-domain path-based routing.

### Production Architecture

SaveSphere is deployed to production via **Coolify** using pre-built Docker images from **GitHub Container Registry (GHCR)**.

**Workflow:**
1. Push to `master` → GitHub Actions runs lint, type-check, and Go build.
2. GitHub Actions builds and pushes `savesphere-api` and `savesphere-web` images to GHCR.
3. GitHub Actions calls a Coolify deploy webhook.
4. Coolify pulls the new images and redeploys the Docker Compose stack.
5. The API container automatically runs database migrations on startup.

**Routing (same domain):**
- `https://savesphere.app/api/*` → Go API (all backend endpoints)
- `https://savesphere.app/*` → SvelteKit frontend (all pages)

**Key files:**
- `docker-compose.prod.yml` — Production orchestration
- `.github/workflows/ci-cd.yml` — GitHub Actions CI/CD pipeline
- `DEPLOYMENT.md` — Complete deployment guide

For detailed setup instructions, see `DEPLOYMENT.md`.

---

## Security Considerations

- Authentication is JWT-based (`/api/auth/login`, `/api/auth/register`). The token is expected in the `Authorization: Bearer <token>` header for all `/api/*` routes.
- Passwords are hashed with bcrypt.
- CORS is enabled globally on the Echo server.
- AI advice logic explicitly anonymizes transaction data before sending it to Gemini (it strips wallet IDs and user IDs, sending only type, amount, fixed/variable flag, and date).
- The API client in the web app currently has no auth header injection. When wiring the frontend to the backend, ensure the JWT is attached to `fetch` calls in `lib/api/client.ts`.

---

## Known Gaps & TODOs

- Frontend API integration uses `API_BASE = '/api'` and relative URLs. In development, Vite proxies `/api/*` to the backend. In production, Traefik routes `/api/*` to the API container on the same domain.
- No Go API tests exist yet.
- OpenAPI contract generation for frontend types is stubbed in the Makefile (`generate` target) but not implemented.
- The `packages/shared` directory currently only contains `openapi.yaml` and is not consumed as a published package.
