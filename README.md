# SaveSphere

A personal finance and budget tracking web application. SaveSphere helps you manage wallets, track transactions, and get AI-powered financial insights — all with a modern, responsive UI.

> **Monorepo:** Yarn 1 + Turbo | **Backend:** Go + Echo + PostgreSQL | **Frontend:** SvelteKit 5 + Tailwind v4

---

## Features

### Authentication & Account Security

- **Email & Password Auth** — Registration and login with bcrypt-hashed passwords
- **Google Sign-In (OAuth 2.0)** — Authorization Code Flow with PKCE, backend token exchange
- **Email Verification** — New accounts require email verification before login
- **Password Reset** — Secure token-based reset flow with email delivery
- **Account Lockout** — 5 failed login attempts triggers a 15-minute lock
- **Session Management** — Short-lived access tokens (15 min) with refresh token rotation (7 days)
- **httpOnly Cookie Auth** — JWTs stored in secure, httpOnly cookies (XSS-resistant)
- **Rate Limiting** — Per-IP rate limiting on all auth endpoints
- **Login Audit Trail** — Every login attempt logged with IP, user agent, provider, and outcome

### Financial Management

- **Wallets** — Create and manage multiple wallets
- **Transactions** — Record income/expense transactions per wallet
- **Liquidity Overview** — Quick view of total available funds
- **AI Financial Intelligence** — Google Gemini-powered safe-to-spend analysis and personalized advice

### UI & UX

- **Responsive Sidebar Navigation** — Collapsible sidebar with grouped navigation
- **Internationalization** — English & Spanish via Paraglide JS
- **Dark/Light/System Theme** — Persistent theme preference
- **Breadcrumb Navigation** — Dynamic route-based breadcrumbs
- **shadcn-svelte Components** — Modern, accessible UI primitives

---

## Tech Stack

### Backend (`apps/api`)

| Layer | Technology |
|-------|------------|
| Language | Go 1.25 |
| Framework | Echo v4 |
| Database | PostgreSQL 15 (pgx/v5) |
| Migrations | golang-migrate (Docker) |
| Auth | JWT (golang-jwt/jwt/v5), bcrypt, OAuth 2.0 + PKCE |
| Validation | go-playground/validator/v10 |
| AI | Google Gemini API |
| Decimal | shopspring/decimal |

### Frontend (`apps/web`)

| Layer | Technology |
|-------|------------|
| Framework | SvelteKit 2 + Svelte 5 (runes) |
| Bundler | Vite 7 |
| Adapter | `@sveltejs/adapter-node` |
| Styling | TailwindCSS v4 |
| UI Components | shadcn-svelte + bits-ui |
| Icons | `@lucide/svelte` |
| Charts | `layerchart` |
| i18n | Paraglide JS (`en`, `es`) |
| Testing | Vitest + Playwright + Storybook |

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local frontend dev without Docker)
- Go 1.25+ (for local backend dev without Docker)

### Full Stack (Docker — Recommended)

```bash
# Clone and install dependencies
yarn install

# Start Postgres + API + Web with hot reload
make dev-up

# View logs
make dev-logs

# Tear down
make dev-down
```

| Service | URL |
|---------|-----|
| Web App | http://localhost:5173 |
| API (direct) | http://localhost:3001 |
| API (proxied) | http://localhost:5173/api/* |
| Postgres | localhost:5432 |

### Database Only (Docker)

```bash
make docker-up   # Start Postgres
make migrate-up  # Run migrations
make migrate-down # Rollback one migration
```

### Individual Apps (Local)

```bash
# Backend
cd apps/api
JWT_SECRET="your-32-char-secret-here" go run ./cmd/app/main.go

# Frontend
cd apps/web
yarn dev          # Vite dev server on :5173
yarn web:check    # Type checking
yarn test:unit    # Unit tests
```

---

## Environment Variables

Create a `.env` file in the project root:

```bash
# Required
JWT_SECRET=your-super-secret-key-min-32-chars-long

# Database (fallback used if unset)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/savesphere?sslmode=disable

# Google OAuth (optional — required for Google Sign-In)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH_REDIRECT_URL=http://localhost:5173/auth/callback

# AI (optional — required for financial advice)
GEMINI_API_KEY=your-gemini-api-key

# App Config
APP_BASE_URL=http://localhost:5173
APP_ENV=development   # or "production"
```

> `.env` is gitignored. Never commit secrets.

---

## Project Structure

```
.
├── apps/
│   ├── api/                      # Go backend
│   │   ├── cmd/app/main.go       # Entry point
│   │   ├── internal/
│   │   │   ├── handlers/         # HTTP handlers
│   │   │   ├── middleware/       # Auth middleware
│   │   │   ├── models/           # Domain models
│   │   │   ├── repository/       # Database queries (pgx)
│   │   │   ├── services/         # Business logic
│   │   │   └── common/response/  # Standardized JSON envelopes
│   │   └── migrations/           # SQL migrations
│   └── web/                      # SvelteKit frontend
│       ├── src/
│       │   ├── routes/           # File-based routing
│       │   │   ├── (app)/        # Authenticated app shell
│       │   │   └── auth/         # Auth pages (sign-in, register, etc.)
│       │   ├── lib/
│       │   │   ├── api/client.ts # Typed fetch wrappers
│       │   │   ├── auth.svelte.ts # Auth state store
│       │   │   ├── components/   # UI components
│       │   │   └── paraglide/    # Generated i18n runtime
│       │   └── hooks.server.ts   # SSR hooks
│       └── messages/             # i18n message files (en, es)
├── docker-compose.dev.yml        # Full dev stack
├── docker-compose.yml            # DB + migrations only
└── turbo.json                    # Turbo task graph
```

---

## API Endpoints

### Public Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Sign in (sets httpOnly cookies) |
| `POST` | `/auth/logout` | Sign out (revokes session + clears cookies) |
| `POST` | `/auth/refresh` | Refresh access token |
| `GET`  | `/auth/me` | Get current user |
| `POST` | `/auth/forgot-password` | Request password reset |
| `POST` | `/auth/reset-password` | Reset password with token |
| `GET`  | `/auth/verify-email` | Verify email with token |
| `POST` | `/auth/google` | Initiate Google OAuth |
| `POST` | `/auth/google/callback` | Google OAuth callback |

### Protected API (`Authorization: Bearer <token>` or cookie)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/wallets` | Create wallet |
| `GET`  | `/api/wallets` | List wallets |
| `GET`  | `/api/wallets/liquidity` | Get total liquidity |
| `POST` | `/api/transactions` | Create transaction |
| `GET`  | `/api/wallets/:id/transactions` | List wallet transactions |
| `DELETE` | `/api/transactions/:id` | Delete transaction |
| `GET`  | `/api/intelligence/safe-to-spend` | AI safe-to-spend analysis |
| `GET`  | `/api/intelligence/advice` | AI financial advice |

---

## Database Schema

### Core Tables

- `users` — Accounts with email, password hash, OAuth provider data, verification status, lockout tracking
- `wallets` — Financial wallets per user
- `categories` — Transaction categories
- `transactions` — Income/expense records
- `planned_purchases` — Future purchase planning

### Auth Tables

- `password_resets` — Token-based password reset requests
- `email_verifications` — Email verification tokens
- `user_sessions` — Refresh token sessions with revocation tracking
- `login_audits` — Login attempt audit trail

---

## Development Commands

```bash
# Root-level
yarn install        # Install all dependencies
yarn dev            # Start both apps in dev mode
yarn build          # Build everything
yarn test           # Run all tests
yarn lint           # Lint everything

# Backend only
yarn api:dev        # Go run with hot reload

# Frontend only
yarn web:dev        # Vite dev server
yarn web:check      # svelte-check + sync
yarn web:format     # Prettier write

# Database
make docker-up      # Start Postgres
make migrate-up     # Run migrations
make migrate-down   # Rollback one migration

# Full stack Docker
make dev-up         # Start DB + API + Web
make dev-down       # Tear down
```

---

## Security Highlights

- **Passwords** — bcrypt with default cost
- **JWTs** — HS256, 15-minute expiry, stored in `httpOnly` cookies
- **OAuth** — PKCE-protected Authorization Code Flow
- **Session Rotation** — Refresh tokens rotated on every use; old ones revoked
- **Rate Limiting** — Per-IP limits on auth endpoints
- **Account Lockout** — Progressive lockout after failed attempts
- **CORS** — Strict origin checking with credentials enabled
- **Cookie Security** — `SameSite=Lax`, `Secure` in production

---

## License

MIT
