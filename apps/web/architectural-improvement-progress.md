# SvelteKit Project Audit

## 1. Current Structure Map

```
apps/web/
├── .storybook/                 # Storybook configuration
├── build/                      # Build output (should be gitignored)
├── e2e/
│   └── demo.test.ts            # Playwright E2E test
├── messages/
│   ├── en.json                 # i18n translation strings
│   └── es.json                 # i18n translation strings
├── src/
│   ├── app.d.ts                # Global App types (empty stubs)
│   ├── app.html                # HTML template with FOUC-prevention theme script
│   ├── demo.spec.ts            # Empty Vitest demo test
│   ├── hooks.server.ts         # Paraglide i18n middleware only
│   ├── hooks.ts                # URL de-localization for routing
│   ├── routes/
│   │   ├── +layout.svelte      # Root layout: sidebar wrapper + hidden SEO locale links
│   │   ├── +page.svelte        # Dashboard (root `/`): hardcoded sample data
│   │   ├── demo/
│   │   │   ├── +page.svelte    # Dead link to `/demo/paraglide`
│   │   │   └── paraglide/
│   │   │       └── +page.svelte # i18n demo page
│   │   ├── wallets/
│   │   │   ├── +page.svelte    # Wallets list: hardcoded sample data + summary cards
│   │   │   ├── active-accounts-stitch.html  # ❌ Raw HTML artifact (629 lines)
│   │   │   └── currencies-exchange/
│   │   │       └── +page.svelte # 376-line mega-component with inline types, data, markup
│   │   ├── linked-accounts.html             # ❌ Raw HTML artifact (444 lines)
│   │   ├── layout.css          # Global Tailwind theme variables
│   │   └── page.svelte.spec.ts # ❌ Test file inside routes directory
│   └── lib/
│       ├── assets/
│       │   └── favicon.svg
│       ├── components/
│       │   ├── app-sidebar.svelte           # Sidebar shell + hardcoded nav data + user data
│       │   ├── navigation/
│       │   │   ├── header.svelte            # Breadcrumb header with inline derivation
│       │   │   ├── nav-intelligence.svelte  # ❌ Identical to nav-main (only label differs)
│       │   │   ├── nav-main.svelte          # Collapsible nav group
│       │   │   ├── nav-management.svelte    # ❌ Identical to nav-main (only label differs)
│       │   │   ├── nav-planning.svelte      # ❌ Identical to nav-main (only label differs)
│       │   │   ├── nav-secondary.svelte     # Simple link list (different pattern)
│       │   │   └── nav-user.svelte          # User dropdown with theme/lang/privacy toggles
│       │   ├── ui/                          # shadcn-svelte components (well-structured)
│       │   │   ├── avatar/, badge/, breadcrumb/, button/, chart/, checkbox/
│       │   │   ├── collapsible/, data-table/, dropdown-menu/, input/, separator/
│       │   │   ├── sheet/, sidebar/, skeleton/, switch/, table/, tooltip/
│       │   └── views/
│       │       ├── dashboard/
│       │       │   ├── dashboard-card/      # Card primitive sub-components
│       │       │   ├── income-vs-expenses.svelte    # Hardcoded chart data
│       │       │   ├── safe-to-spend-chart.svelte   # Budget visualization (mixed concerns)
│       │       │   ├── transaction-list.svelte      # Summary bars + transactions (mixed)
│       │       │   ├── upcoming-bills.svelte        # Hardcoded bill data
│       │       │   └── wallet-card.svelte           # Presentational card
│       │       └── wallets/
│       │           ├── columns.ts           # TanStack table column defs (inline formatting)
│       │           ├── data-table-actions.svelte
│       │           ├── data-table-checkbox.svelte   # ❌ Unused wrapper
│       │           ├── data-table.svelte
│       │           ├── index.ts
│       │           └── types.ts             # Wallet enums + type
│       ├── constants/
│       │   └── route-map.ts               # Breadcrumb label lookup
│       ├── hooks/
│       │   └── is-mobile.svelte.ts        # Sidebar mobile detection
│       ├── paraglide/                     # Auto-generated i18n runtime
│       ├── index.ts                       # Empty $lib entrypoint
│       ├── theme.svelte.ts                # Theme store with localStorage
│       └── utils.ts                       # cn(), type helpers, path localization
├── static/
│   └── robots.txt
├── components.json                        # shadcn/ui config
├── eslint.config.js
├── messages/en.json, es.json
├── package.json                           # Has duplicate @lucide/svelte deps
├── playwright.config.ts
├── svelte.config.js                       # Node adapter, no custom config
├── tsconfig.json
└── vite.config.ts                         # Tailwind, Paraglide, Vitest projects
```

---

## 2. Identified Problems

### 2.1 Zero Data Layer / No API Integration 🔴
**Files:** Every `+page.svelte`, every `views/dashboard/*.svelte`

Every page component contains hardcoded sample arrays (`wallets`, `currencies`, `transactions`, `bills`, `marketTrends`). There are no `+page.ts` or `+page.server.ts` load functions, no `$lib/api/` client, no fetch logic, and no connection to the backend API. This means:
- Adding real data requires touching every single page component
- No SSR benefit from SvelteKit — pages ship static markup with embedded JSON
- No error handling, loading states, or caching strategy exists

### 2.2 Massive Component Duplication (DRY Violation) 🔴
**Files:**
- `nav-main.svelte` (line 1–68)
- `nav-intelligence.svelte` (line 1–68, identical except `sidebar_group_overview` → `sidebar_nav_intelligence_ai`)
- `nav-planning.svelte` (line 1–68, identical except label)
- `nav-management.svelte` (line 1–68, identical except label)

These four files are copy-pasted with only the `Sidebar.GroupLabel` text changed. Any bug fix (e.g., accessibility, active-state logic) must be applied in four places.

### 2.3 Business Logic Inside Pages (Separation of Concerns Violation) 🔴
**Files:**
- `currencies-exchange/+page.svelte` — inline `Currency` and `MarketTrend` interfaces, currency data, market data, exchange calculator state, and 250+ lines of markup
- `wallets/+page.svelte` — inline summary-card calculations, hardcoded wallet arrays
- `+page.svelte` (dashboard) — inline total balance calculation, hardcoded wallet array

Pages are doing the job of data models, stores, and API clients.

### 2.4 Formatting Logic Scattered in UI (DRY + SoC Violation) 🟡
**Files:**
- `columns.ts` — `Intl.NumberFormat` logic inline inside column definitions
- `wallets/+page.svelte` — raw string concatenation for currency display (`$124,500.00`)
- `currencies-exchange/+page.svelte` — hardcoded exchange rate strings (`1 USD = 0.9234 EUR`)

No centralized formatting utilities exist. When COP or JPY formatting rules change, edits happen in multiple files.

### 2.5 Mega-Components with Mixed Responsibilities (KISS + SRP Violation) 🟡
**Files:**
- `transaction-list.svelte` — renders both a "Monthly Spending Summary" (progress bars, category legend) AND a "Recent Transactions" list. Two unrelated UI concerns in one file.
- `safe-to-spend-chart.svelte` — combines a budget progress bar, a decorative background div, and an info/story card. Should be three composable components.
- `currencies-exchange/+page.svelte` — 376 lines spanning currency cards, market trends table, and exchange calculator. A classic "page as component" anti-pattern.

### 2.6 Dead / Unused Code 🟡
**Files:**
- `demo/+page.svelte` — imports `resolve` from `$app/paths` but never uses it
- `data-table-checkbox.svelte` — a wrapper around `Checkbox` that is never imported by `columns.ts` (the column imports the raw `Checkbox` directly)
- `linked-accounts.html` — 629-line raw HTML file inside `src/routes/`. SvelteKit does not serve `.html` routes.
- `active-accounts-stitch.html` — same issue, 444-line HTML artifact

### 2.7 Test Files in Routes Directory (Convention Violation) 🟡
**File:** `routes/page.svelte.spec.ts`

Vitest browser tests are co-located inside the routing directory. SvelteKit convention places tests in `src/__tests__/` or `tests/`, or at minimum mirrors `src/` structure outside of `routes/`.

### 2.8 Global CSS in Routes Directory (Convention Violation) 🟡
**File:** `routes/layout.css`

Global theme variables and base styles live in `src/routes/`. Conventionally this belongs in `src/app.css` (imported by `+layout.svelte`).

### 2.9 Layout Uses Pathname String-Checking (KISS Violation) 🟡
**File:** `routes/+layout.svelte`

```svelte
{#if page.url.pathname.includes('/dashboard')}
  {@render children()}
{:else}
  <Sidebar.Provider>...</Sidebar.Provider>
{/if}
```

This is fragile. A route group `(app)` / `(bare)` would make layout selection explicit and type-safe.

### 2.10 Missing Error Handling & Loading States 🟡
**Files:** All routes

No `+error.svelte` exists. No `handleError` in `hooks.server.ts`. Once real data loading is added, unhandled errors will crash to the generic SvelteKit error page.

### 2.11 Package Dependency Duplication 🟢
**File:** `package.json`

`@lucide/svelte` appears in both `dependencies` (^0.577.0) and `devDependencies` (^1.6.0). This causes version conflicts and larger bundle size.

### 2.12 `app.d.ts` Stubs Are Empty 🟢
**File:** `src/app.d.ts`

All App interfaces (`Error`, `Locals`, `PageData`, `PageState`, `Platform`) are commented out. Adding types for API responses or user sessions requires editing this file.

### 2.13 E2E Test Mismatch 🟢
**File:** `e2e/demo.test.ts`

Asserts an `<h1>` is visible on `/`, but `+page.svelte` uses `<h2>`. This test likely fails.

---

## 3. Proposed Target Architecture

```
apps/web/src/
├── app.html
├── app.css                          # Global styles (moved from routes/layout.css)
├── app.d.ts                         # Typed App interfaces
├── hooks.server.ts                  # + error logging, auth checks
├── hooks.ts
├── routes/
│   ├── (app)/                       # Routes WITH sidebar layout
│   │   ├── +layout.svelte           # Sidebar.Provider + Header + padding
│   │   ├── +layout.ts               # Shared load logic (user, nav state)
│   │   ├── +page.svelte             # Dashboard (thin, data from load)
│   │   ├── +page.ts                 # Load function: fetch wallets, transactions
│   │   ├── wallets/
│   │   │   ├── +page.svelte         # Thin page: renders WalletSummary + WalletTable
│   │   │   ├── +page.ts             # Load function: fetch wallets
│   │   │   └── currencies-exchange/
│   │   │       ├── +page.svelte     # Thin page: renders sub-components
│   │   │       └── +page.ts         # Load function: fetch currencies, rates
│   │   └── transactions/
│   │       └── ...
│   ├── (bare)/                      # Routes WITHOUT sidebar (if any)
│   │   └── ...
│   ├── +error.svelte                # Custom error page
│   └── demo/
│       └── ...
├── lib/
│   ├── api/                         # 🆕 API client layer
│   │   ├── client.ts                # Typed fetch wrapper (uses App.PageData)
│   │   ├── wallets.ts               # Wallet API calls
│   │   ├── currencies.ts            # Currency/exchange API calls
│   │   └── transactions.ts          # Transaction API calls
│   ├── types/                       # 🆕 Centralized domain types
│   │   ├── wallet.ts                # Wallet, WalletTypeEnum, WalletStatusEnum
│   │   ├── currency.ts              # Currency, MarketTrend, ExchangeRate
│   │   └── transaction.ts           # Transaction, Bill, Category
│   ├── stores/                      # 🆕 Shared state
│   │   ├── theme.svelte.ts          # (moved) Theme state
│   │   └── sidebar.svelte.ts        # Sidebar open/collapsed state (if needed)
│   ├── utils/                       # 🆕 Organized utilities
│   │   ├── format.ts                # formatCurrency(), formatDate(), formatPercent()
│   │   ├── cn.ts                    # Tailwind cn() helper
│   │   └── path.ts                  # toPath(), toLocalizedPath()
│   ├── constants/
│   │   └── route-map.ts             # (keep) Breadcrumb labels
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives (keep as-is)
│   │   ├── layout/                  # 🆕 Layout-level components
│   │   │   ├── app-sidebar.svelte   # Sidebar shell (data via props, not hardcoded)
│   │   │   ├── header.svelte        # Breadcrumb header
│   │   │   ├── nav-group.svelte     # 🆕 Single reusable collapsible nav group
│   │   │   └── nav-user.svelte      # User dropdown
│   │   ├── dashboard/               # 🆕 Dashboard-specific widgets
│   │   │   ├── wallet-card.svelte
│   │   │   ├── spending-summary.svelte      # (split from transaction-list)
│   │   │   ├── transaction-list.svelte      # Only the transaction list
│   │   │   ├── budget-progress.svelte       # (split from safe-to-spend)
│   │   │   ├── budget-info-card.svelte      # (split from safe-to-spend)
│   │   │   ├── income-expenses-chart.svelte
│   │   │   └── upcoming-bills-list.svelte
│   │   ├── wallets/                 # 🆕 Wallet-specific components
│   │   │   ├── wallet-table.svelte  # (rename from data-table)
│   │   │   ├── wallet-table-columns.ts
│   │   │   └── wallet-summary-cards.svelte
│   │   └── exchange/                # 🆕 Exchange-specific components
│   │       ├── currency-card.svelte
│   │       ├── market-trends-table.svelte
│   │       └── exchange-calculator.svelte
│   ├── paraglide/                   # Auto-generated (keep)
│   └── index.ts                     # Barrel exports for $lib
│
└── __tests__/                       # 🆕 Tests outside routes/
    ├── unit/
    └── e2e/
```

### Rationale

| Decision | Why |
|----------|-----|
| `lib/api/` | Centralizes all backend communication. Changing the API base URL or adding auth headers requires touching one file. |
| `lib/types/` | Domain types live in one place. Pages import types; they do not define them. |
| `lib/utils/format.ts` | Currency formatting, date formatting, and percent formatting are business rules that should not be copy-pasted into UI components. |
| `lib/components/layout/` | Layout components are separated from page-specific widgets, making it clear what is reusable across routes. |
| `lib/components/dashboard/`, `wallets/`, `exchange/` | Page-specific widgets are grouped by domain, not dumped into a flat folder. |
| `(app)` / `(bare)` route groups | Eliminates the brittle `pathname.includes('/dashboard')` check in `+layout.svelte`. |
| `+page.ts` load functions | Keeps pages as thin presentation layers. Data fetching happens before render, enabling SSR and proper error boundaries. |
| `+error.svelte` | Provides a branded, user-friendly error experience instead of the generic SvelteKit page. |

---

## 4. Migration Path

### 🔴 Critical (fix before adding any new screen)

1. **Remove HTML artifacts from `src/routes/`**
   - Delete `linked-accounts.html` and `active-accounts-stitch.html` (or move to `static/` if they must be kept).
   - **Why:** They pollute the route directory and are not valid SvelteKit routes.

2. **Create `lib/api/client.ts` and move all sample data into `+page.ts` load functions**
   - Create a typed fetch wrapper.
   - For each route, create `+page.ts` and move hardcoded arrays there (even if they still return mock data).
   - Update each `+page.svelte` to use `let { data } = $props()`.
   - **Why:** Decouples data from presentation. The instant the backend is ready, you replace the mock return with a real `fetch()` call in one place per route.

3. **Consolidate the four duplicated nav components into a single `NavGroup.svelte`**
   - Extract `nav-main.svelte` into `NavGroup.svelte` with a `label` prop.
   - Delete `nav-intelligence.svelte`, `nav-planning.svelte`, `nav-management.svelte`.
   - Update `app-sidebar.svelte` to use `<NavGroup label={m.sidebar_group_overview()} items={...} />`.
   - **Why:** Eliminates a 4x duplication. Future nav changes edit one file.

### 🟡 Important (fix within the next sprint)

4. **Create `lib/utils/format.ts` and centralize all formatting**
   - `formatCurrency(amount, currencyCode)` — uses `Intl.NumberFormat`
   - `formatDate(dateString)` — consistent date display
   - `formatPercent(value)` — percent with sign
   - Refactor `columns.ts` to use `formatCurrency`.
   - Refactor `currencies-exchange/+page.svelte` to use formatters.
   - **Why:** Prevents formatting bugs when locales or currencies change.

5. **Split `transaction-list.svelte` into `SpendingSummary.svelte` + `TransactionList.svelte`**
   - `SpendingSummary` handles the progress bars and category legend.
   - `TransactionList` handles only the transaction rows.
   - **Why:** Each component now has a single, clear responsibility.

6. **Split `safe-to-spend-chart.svelte` into smaller components**
   - `BudgetProgressBar.svelte` — the colored progress bar
   - `BudgetInfoCard.svelte` — the story/update card at the bottom
   - Keep `SafeToSpendChart.svelte` as a composition shell.
   - **Why:** The current file mixes three unrelated visual concerns.

7. **Extract `CurrencyCard`, `MarketTrendsTable`, and `ExchangeCalculator` from `currencies-exchange/+page.svelte`**
   - Move each section into its own component under `lib/components/exchange/`.
   - Move `Currency` and `MarketTrend` interfaces to `lib/types/currency.ts`.
   - **Why:** A 376-line page component is unmaintainable. Extracted components are testable and reusable.

8. **Move `layout.css` → `app.css` and update `+layout.svelte` import**
   - **Why:** Global styles do not belong in the routes directory.

9. **Move `page.svelte.spec.ts` out of `routes/`**
   - Place under `src/__tests__/routes/page.svelte.spec.ts` or similar.
   - **Why:** Keeps the routing directory clean and predictable.

10. **Add `+error.svelte` and `handleError` logging**
    - Create `routes/+error.svelte` with a friendly UI.
    - Add `handleError` to `hooks.server.ts` for server-side error logging.
    - **Why:** Required for production-grade error handling.

11. **Fix duplicate `@lucide/svelte` dependency**
    - Remove the older version from `devDependencies` (keep the newer one or vice versa).
    - Run `npm dedupe`.
    - **Why:** Prevents bundle bloat and runtime version conflicts.

12. **Fill in `app.d.ts` interfaces**
    - Define `App.PageData` (e.g., `user`, `locale`).
    - Define `App.Locals` if auth/session data is added.
    - **Why:** Enables TypeScript safety across the entire data flow.

### 🟢 Nice to have (incremental improvements)

13. **Introduce route groups `(app)` and `(bare)`**
    - Move all sidebar-wrapped routes into `routes/(app)/`.
    - Move bare routes (if any) into `routes/(bare)/`.
    - Remove the `pathname.includes('/dashboard')` guard from `+layout.svelte`.
    - **Why:** Makes layout selection explicit and eliminates string-checking fragility.

14. **Create a `LocaleSwitcherLinks.svelte` component**
    - Extract the hidden SEO `<div>` from `+layout.svelte`.
    - **Why:** Keeps layout focused on structure, not SEO micro-logic.

15. **Delete or use `data-table-checkbox.svelte`**
    - Either wire it into `columns.ts` or delete it.
    - **Why:** Dead code is technical debt.

16. **Fix E2E test assertion**
    - Update `e2e/demo.test.ts` to look for `<h2>` instead of `<h1>`, or add an `<h1>` to the page.
    - **Why:** Broken tests reduce CI trust.

17. **Add `+page.server.ts` with form actions for "Add Wallet" / "Exchange" buttons**
    - Once the backend is ready, form actions provide progressive enhancement.
    - **Why:** SvelteKit convention for mutations.

---

## 5. Conventions & Rules to Enforce Going Forward

### Where Things Live

| What | Where | Never In |
|------|-------|----------|
| API calls | `src/lib/api/*.ts` | `+page.svelte`, components |
| Domain types / enums | `src/lib/types/*.ts` | `+page.svelte`, components |
| Formatting / pure functions | `src/lib/utils/format.ts` | Inline in `.svelte` files |
| Global styles | `src/app.css` | `src/routes/*.css` |
| Layout chrome | `src/lib/components/layout/*.svelte` | `src/routes/*` |
| Page-specific widgets | `src/lib/components/{domain}/*.svelte` | Mixed into page files |
| Data loading | `+page.ts` / `+page.server.ts` | `+page.svelte` `<script>` |
| Tests | `src/__tests__/**` or `tests/**` | `src/routes/` |

### Naming Conventions

- **Components:** PascalCase (`WalletCard.svelte`, `NavGroup.svelte`)
- **Utilities / API files:** camelCase (`formatCurrency`, `client.ts`)
- **Types:** PascalCase, prefixed by domain (`Wallet`, `WalletStatusEnum`, `ExchangeRate`)
- **Routes:** kebab-case directories (`currencies-exchange/`, `safe-to-spend/`)
- **Load files:** Always co-located with the page (`+page.ts` next to `+page.svelte`)

### Hard Rules

1. **No hardcoded data arrays inside `.svelte` files.** Mock data belongs in `+page.ts` load functions or a `__mocks__/` directory.
2. **No inline TypeScript interfaces inside pages.** Types live in `src/lib/types/`.
3. **No raw `Intl.NumberFormat` or string-concat formatting in UI.** Use `formatCurrency()` from `utils/format.ts`.
4. **No business logic in `+page.svelte`.** Pages render props. Logic lives in load functions, stores, or `lib/api/`.
5. **No dead imports.** ESLint `unused-imports` should be enabled.
6. **No `.html` files in `src/routes/`.** Raw HTML goes in `static/` or is converted to a Svelte component.
7. **Components over 150 lines must be split.** If a component handles more than one visual concern, extract sub-components.
8. **No copy-paste duplication >10 lines.** Extract a parameterized component or utility.

---

*This audit was generated for the SaveSphere web application. The proposed changes are incremental — no route needs to be rewritten from scratch. Start with the 🔴 Critical items to establish the data layer and eliminate duplication, then proceed through 🟡 Important to clean up formatting and split mega-components.*
