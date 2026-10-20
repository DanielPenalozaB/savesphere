# SaveSphere: guide for coding agents

Read `README.md` and `docs/architecture.md` first. This file lists the non-obvious rules.

## Environment

- Node 24 (`.nvmrc`), pnpm 12, Docker running (integration tests and E2E use containers).
- `pnpm bootstrap` once, then `pnpm dev`. Packages build to `dist/`; apps import packages from
  `dist`, so run `pnpm build` (or keep `pnpm dev` running) after changing a package.

## Rules

- **Money:** integer minor units only. Use `Money` and `buildEntries` from `@savesphere/core`.
  Never use floats. Balances are derived from `transaction_entries`.
- **Contracts first:** request and response shapes live in `packages/contracts` (Zod). The API
  validates with `ZodValidationPipe(schema)`, and the web app imports the same types.
- **Scoping:** every query filters by the current `userId`. New child tables use `(user_id, id)`
  composite foreign keys (see `packages/db/src/schema/ledger.ts`).
- **Errors:** throw `AppError` (`notFound`, `conflict`, `validation`) or `LedgerError`. Never return
  ad-hoc error shapes.
- **AI is optional:** AI-only endpoints use `@RequiresAi()`, and AI-only UI uses `<AiGate>`. Core
  features must work without AI. Never call real providers in tests (`AI_PROVIDER_MODE=fake`).
- **Schema changes:** edit `packages/db/src/schema/*`, then `pnpm db:generate`, and commit the SQL.
  Never edit merged migrations.
- **i18n:** add every user-facing string to both `apps/web/messages/en.json` and `es.json`.
- **ESM everywhere:** relative imports in packages and the API need `.js` extensions. The web app
  uses `#lib/...` imports.
- **Formatting:** tabs, single quotes, no trailing commas, width 100 (`pnpm format`).

## Tests: where new tests go

| Change                       | Test                                                          |
| ---------------------------- | ------------------------------------------------------------- |
| Pure rule in `core`          | `packages/core/src/*.test.ts` (keep coverage ≥ 90%)           |
| API endpoint / business rule | `apps/api/test/*.int-spec.ts` with `createTestApp` + `signUp` |
| Isolated API helper          | `apps/api/src/**/*.spec.ts`                                   |
| Svelte component             | `apps/web/src/**/*.svelte.spec.ts` (real browser)             |
| User journey                 | `e2e/tests/*.spec.ts` (runs in `ai-off` and `ai-on`)          |

Before finishing: `pnpm lint && pnpm check && pnpm test`.

## Git

Trunk-based. Branch `feat/…` / `fix/…` from `main`, and use a Conventional Commit PR title
(squash-merged). See `docs/git-workflow.md`.
