# SaveSphere

A calm, minimalist companion for tracking expenses, income, savings and subscriptions, planning
purchases, and (optionally) getting AI-powered insights. Installable as a PWA.

## Stack

| Layer      | Technology                                                                     |
| ---------- | ------------------------------------------------------------------------------ |
| Web        | SvelteKit 3 · Svelte 5 · Tailwind CSS 4 · Paraglide (en/es) · PWA              |
| API        | NestJS 12 (Express) · Better Auth · Zod                                        |
| Database   | PostgreSQL 18 · Drizzle ORM                                                    |
| AI         | Optional, bring-your-own-key via the Vercel AI SDK (Anthropic, OpenAI, Google) |
| Tooling    | pnpm workspaces · Turborepo · TypeScript 6 · Node 24                           |
| Tests      | Vitest (unit, component, integration with Testcontainers) · Playwright (E2E)   |
| Deployment | Docker images on GHCR → Coolify on a VPS                                       |

## Repository layout

```
apps/
  web/              SvelteKit PWA (UI only; proxies /api/* to the API)
  api/              NestJS API: all business logic, auth, AI gating
packages/
  core/             Pure domain logic (Money, ledger rules). No framework, no I/O.
  contracts/        Zod schemas + types shared by web and API (request/response shapes, error codes)
  db/               Drizzle schema, migrations, seeds, migration CLI
e2e/                Playwright tests against the full stack built from production Dockerfiles
infra/
  compose.dev.yml   Local Postgres + Redis
  compose.test.yml  Full stack for E2E
  compose.prod.yml  Production stack for Coolify
  docker/           Dockerfiles
docs/               Architecture, git workflow, deployment
```

Dependency direction: `web → contracts`, `api → core, contracts, db`. `core` and `contracts` never
import from apps.

## Getting started

Requirements: **Node 24** (`nvm use`), **pnpm 12** (`npm i -g pnpm@12`), and **Docker** (Docker
Desktop, Rancher Desktop, OrbStack or Colima).

```bash
pnpm install
cp .env.example .env
pnpm bootstrap      # starts Postgres + Redis, runs migrations and seeds
pnpm dev            # web on http://localhost:5173, API on http://localhost:3000
```

Open http://localhost:5173. The browser only talks to the web server; it forwards `/api/*` to the
API, so cookies stay first-party and there is no CORS to configure.

## Commands

| Command            | What it does                                                            |
| ------------------ | ----------------------------------------------------------------------- |
| `pnpm dev`         | Watch mode for every package and app                                    |
| `pnpm build`       | Build everything (Turborepo caches unchanged packages)                  |
| `pnpm lint`        | ESLint everywhere                                                       |
| `pnpm check`       | Type-check everything (tsc + svelte-check)                              |
| `pnpm format`      | Prettier write                                                          |
| `pnpm test`        | Unit, component and integration tests (needs Docker for integration)    |
| `pnpm test:e2e`    | Builds production images, starts the stack, runs Playwright, tears down |
| `pnpm db:generate` | Generate a migration after editing `packages/db/src/schema`             |
| `pnpm db:migrate`  | Apply migrations to `DATABASE_URL`                                      |
| `pnpm db:studio`   | Drizzle Studio                                                          |
| `pnpm infra:down`  | Stop local Postgres + Redis                                             |

## Testing strategy

| Level           | Where                                      | Runs against                                                  |
| --------------- | ------------------------------------------ | ------------------------------------------------------------- |
| Unit            | `packages/core`, `apps/*/src/**/*.spec.ts` | Nothing; milliseconds                                         |
| Component       | `apps/web/**/*.svelte.spec.ts`             | Real Chromium (Vitest browser mode)                           |
| API integration | `apps/api/test/*.int-spec.ts`              | Real HTTP → NestJS → a throwaway Postgres 18 (Testcontainers) |
| E2E             | `e2e/tests`                                | Production Docker images, in `ai-off` and `ai-on` projects    |

External services are never called in tests: `AI_PROVIDER_MODE=fake` gives deterministic AI
responses, and chat channels are off unless configured.

## Documentation

- [Architecture](docs/architecture.md): modules, data model, optional AI, conventions
- [Git workflow](docs/git-workflow.md): branches, commits, PRs, branch protection, releases
- [Deployment](docs/deployment.md): Coolify on the VPS, secrets, backups
