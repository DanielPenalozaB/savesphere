# Deployment (Hostinger VPS + Coolify)

```
GitHub push to main → CI (lint, tests, E2E) → images pushed to GHCR → Coolify webhook
                                                                        │
            https://<domain> ── Traefik (TLS) ── web :3000 ── /api/* ──▶ api :3000 ──▶ postgres
```

Only `web` is public. The API and the database live on Coolify's private network.

## One-time setup

### 1. Images on GHCR

The first push to `main` publishes `ghcr.io/danielpenalozab/savesphere-api` and `-web`. On GitHub,
open each package (**Your profile → Packages**) and either:

- make it **public** (simplest, since the images contain no secrets), or
- keep it private and add a registry credential in Coolify (**Settings → Docker Registries**, a
  GitHub PAT with `read:packages`).

### 2. Coolify resource

1. **Projects → New → Docker Compose** (or a public/private Git repository with the Docker
   Compose build pack) and point it at this repo, compose file `infra/compose.prod.yml`.
2. **Domains:** assign `https://<your-domain>` to the **web** service only. Coolify issues the TLS
   certificate.
3. **Environment variables** (mark secrets as secret):

| Variable                                   | Value                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `DOMAIN`                                   | `savesphere.app` (no scheme)                                                                      |
| `POSTGRES_PASSWORD`                        | `openssl rand -hex 24`                                                                            |
| `BETTER_AUTH_SECRET`                       | `openssl rand -hex 32`                                                                            |
| `AI_KEYS_ENCRYPTION_KEY`                   | `openssl rand -base64 32`. **Back this up.** Losing it makes every stored user AI key unreadable. |
| `IMAGE_TAG`                                | `latest`, or a commit SHA to pin or roll back                                                     |
| `INSTANCE_AI_PROVIDER` / `INSTANCE_AI_KEY` | optional instance-wide AI key                                                                     |
| `TELEGRAM_BOT_TOKEN`, `WHATSAPP_*`         | optional; each channel turns on only when set                                                     |

4. Deploy once manually and check `https://<domain>/api/health`.

### 3. Deploy webhook

In Coolify, open the resource → **Webhooks** and copy the deploy URL. Then **Keys & Tokens → API
tokens** and create a token with _deploy_ permission. In GitHub, go to **Settings → Environments →
production → Add secret**:

- `COOLIFY_WEBHOOK_URL`
- `COOLIFY_TOKEN`

From then on, every green push to `main` deploys automatically.

## Migrations

The API container runs `migrate` and `seed` (both idempotent) before starting. If you ever run more
than one API replica, set `RUN_MIGRATIONS=false` on all but one, or run migrations as a Coolify
pre-deployment command instead.

## Backups

In Coolify, open the `postgres` service → **Backups**. Schedule daily backups to S3-compatible
storage **off the VPS** (Backblaze B2, Cloudflare R2, Hetzner Storage Box). Test a restore at least
once. Keep a copy of `AI_KEYS_ENCRYPTION_KEY` and `BETTER_AUTH_SECRET` in a password manager.

## Sizing

The current stack (Postgres, API, web) runs comfortably on 2 vCPU / 4–8 GB. Images are built in
CI, not on the VPS, so deploys don't need build memory.
