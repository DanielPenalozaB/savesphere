# SaveSphere — Production Deployment Guide

This document describes how SaveSphere is deployed to production using **Docker**, **GitHub Actions**, and **Coolify**.

---

## Architecture Overview

```
┌─────────────┐     push to master      ┌─────────────────┐
│   GitHub    │ ──────────────────►   │  GitHub Actions │
│   Repo      │                       │    (CI/CD)      │
└─────────────┘                       └─────────────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │  Build & Test │
                                       │  • lint       │
                                       │  • type-check │
                                       │  • go build   │
                                       └──────────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ Push to GHCR │
                                       │ • api:latest │
                                       │ • web:latest │
                                       └──────────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ Coolify      │
                                       │ Webhook      │
                                       └──────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Coolify VPS                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Docker Compose Stack (docker-compose.prod.yml)      │    │
│  │                                                      │    │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────────────┐  │    │
│  │  │  postgres│───►│   api   │◄───┤   web (Node)    │  │    │
│  │  │   :15   │    │  (Go)   │    │  (SvelteKit)    │  │    │
│  │  │  volume │    │  :3000  │    │   :3000         │  │    │
│  │  └─────────┘    └────┬────┘    └────────┬────────┘  │    │
│  │                      │                   │           │    │
│  │                      └───────┬───────────┘           │    │
│  │                              │                       │    │
│  │                    ┌─────────▼──────────┐            │    │
│  │                    │   Traefik (Coolify)│            │    │
│  │                    │  • SSL/Let's Encrypt│            │    │
│  │                    │  • Path routing     │            │    │
│  │                    └─────────┬──────────┘            │    │
│  └──────────────────────────────┼───────────────────────┘    │
│                                 │                            │
│                          savesphere.app                      │
│                    /api/*         → api container            │
│                    /*             → web container            │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **Same-domain deployment**: Both frontend and backend are served from `https://savesphere.app`. API requests are routed to the Go backend via the `/api/*` path prefix. This avoids CORS issues and keeps cookies working natively.
- **Database inside Docker Compose**: PostgreSQL runs as a compose service with a named volume (`postgres_data`). Data persists across image redeployments.
- **Migrations on startup**: The API Docker image includes the `migrate` CLI. Migrations run automatically before the API starts on every deployment.
- **GitHub Container Registry (GHCR)**: Images are built in GitHub Actions and pushed to GHCR. Coolify pulls pre-built images — it does not build from source.
- **Webhook-triggered deploys**: After pushing new images, GitHub Actions calls a Coolify deploy webhook to trigger automatic redeployment.

---

## Prerequisites

- A VPS with Coolify installed
- A domain name (`savesphere.app`) managed in Hostinger
- A GitHub account with the `savesphere` repository
- Google OAuth credentials (for auth)
- Google Gemini API key (for AI features)

---

## Environment Variables Reference

### PostgreSQL (`db` service)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_USER` | No | `savesphere` | Database username |
| `POSTGRES_PASSWORD` | **Yes** | — | Strong database password |
| `POSTGRES_DB` | No | `savesphere` | Database name |

### Stack-wide & API (`api` service)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DOMAIN` | No | `savesphere.app` | The target domain to use for SSL, Traefik routing, CORS, and redirects (e.g. `budget.otherdomain.co`). |
| `DATABASE_URL` | Auto | — | Constructed from Postgres vars |
| `JWT_SECRET` | **Yes** | — | Min 32 chars. Generate: `openssl rand -hex 32` |
| `JWT_ACCESS_TOKEN_EXPIRY` | No | `24h` | JWT token lifetime |
| `APP_ENV` | No | `production` | Application environment |
| `APP_BASE_URL` | Auto | `https://${DOMAIN}` | Frontend base URL (automatically derived from `DOMAIN`) |
| `CORS_ALLOWED_ORIGINS` | Auto | `https://${DOMAIN},https://www.${DOMAIN}` | Comma-separated allowed origins (derived from `DOMAIN`) |
| `GOOGLE_CLIENT_ID` | **Yes** | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | **Yes** | — | Google OAuth client secret |
| `OAUTH_REDIRECT_URL` | Auto | `https://${DOMAIN}/auth/callback` | OAuth callback URL (derived from `DOMAIN`) |
| `GEMINI_API_KEY` | **Yes** | — | Google Gemini API key |

### Web (`web` service)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `production` | Node environment |
| `ORIGIN` | Auto | `https://${DOMAIN}` | Public origin for SSR/cookies (derived from `DOMAIN`) |

---

## Step-by-Step Setup

### 1. Configure DNS (Hostinger)

In your Hostinger DNS panel for `savesphere.app`:

1. Add an **A record** for `@` pointing to your VPS IP address.
2. (Optional) Add an **A record** for `www` pointing to the same VPS IP.

Wait for DNS propagation (can take a few minutes to a few hours).

### 2. Create the Coolify Resource

1. Open your Coolify Dashboard.
2. Click **New Resource** → **Docker Compose**.
3. Select your GitHub repository: `DanielPenalozaB/savesphere`.
4. Set **Base Directory** to `/`.
5. Coolify will detect `docker-compose.prod.yml`. If not, specify it manually.
6. Click **Continue**.

### 3. Set Environment Variables

In the Coolify resource settings, go to the **Environment Variables** tab and add all required variables:

```
DOMAIN=savesphere.app # Replace with your own domain name (e.g. budget.otherdomain.co)
POSTGRES_PASSWORD=your-very-strong-password
JWT_SECRET=your-32-char-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GEMINI_API_KEY=your-gemini-api-key
```

All other variables (like `ORIGIN`, `CORS_ALLOWED_ORIGINS`, `APP_BASE_URL`) have sensible defaults derived from `DOMAIN`.

### 4. Configure Domain & SSL

1. In Coolify, open the **web** service settings.
2. Set the FQDN to your domain: `https://savesphere.app` (or your custom domain, e.g. `https://budget.otherdomain.co`).
3. Make sure to toggle **Override default request handler** (or **Generate labels only for Traefik**) in SvelteKit's proxy settings. This ensures Coolify requests the Let's Encrypt SSL certificate but lets our code-defined Traefik rules handle the path routing.
4. The **api** service FQDN field should be left **blank** — Traefik routes `/api/*` to the Go container automatically using the labels defined in `docker-compose.prod.yml`.

### 5. First Deployment

1. Click **Deploy** in Coolify to start the first deployment.
2. Monitor the logs:
   - `db` should start and pass its healthcheck.
   - `api` should run migrations and start on port `3000`.
   - `web` should start on port `3000`.
3. Once complete, verify:
   - `https://<your-domain>` → SvelteKit frontend
   - `https://<your-domain>/api/health` → `{"status":"ok","app":"savesphere-api"}`
   - `https://<your-domain>/api/docs` → Scalar API documentation UI

### 6. Set Up Auto-Deployment Webhook

1. In Coolify, open the resource settings and copy the **Deploy Webhook URL**.
2. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**.
3. Click **New repository secret**.
4. Name: `COOLIFY_WEBHOOK_URL`
5. Value: Paste the webhook URL from Coolify.
6. Click **Add secret**.

From now on, every push to `master` will:
1. Trigger GitHub Actions to build and push new images.
2. Automatically call the Coolify webhook to redeploy.

---

## Continuous Deployment Flow

```
Developer pushes to master
        │
        ▼
GitHub Actions: lint-and-test job
        │
        ▼
GitHub Actions: build-and-push job
        ├── Build API image → push to GHCR
        ├── Build Web image → push to GHCR
        └── Call Coolify webhook
                    │
                    ▼
            Coolify redeploys
            (pulls new images,
             runs migrations,
             restarts services)
```

---

## Troubleshooting

### 502 Bad Gateway

- Check that both `api` and `web` containers are running: `docker ps`
- Check logs in Coolify for startup errors.
- Verify health checks are passing.

### Database Connection Errors

- Ensure `POSTGRES_PASSWORD` is set.
- Check that the `db` container is healthy before `api` starts.
- The `depends_on` with `condition: service_healthy` should handle this automatically.

### Migration Failures

- If migrations fail, the API container will exit.
- Check the API logs for migration error details.
- Fix the migration file and redeploy.

### SSL Certificate Issues

- Ensure DNS A records are correctly pointing to your VPS.
- Verify port 80 and 443 are open in your VPS firewall.
- Coolify's Traefik handles Let's Encrypt automatically, but DNS must resolve first.

### Images Not Updating

- Verify GitHub Actions completed successfully.
- Check that the `latest` tag was pushed to GHCR.
- In Coolify, try a manual **Redeploy** or **Restart**.

---

## Rollback Procedure

If a deployment breaks:

1. **Immediate**: In Coolify, click **Restart** on the resource. This restarts the current containers.
2. **Rollback to previous image**:
   - In GitHub, find the last working commit.
   - The image was tagged with that commit SHA (e.g., `ghcr.io/danielpenalozab/savesphere-api:abc1234`).
   - In Coolify, update the compose file temporarily to use the SHA tag instead of `latest`.
   - Redeploy.
3. **Database rollback**: If a migration caused issues, you can run `migrate down` manually from the API container:
   ```bash
   docker exec savesphere-api migrate -path=/app/migrations -database="$DATABASE_URL" down
   ```

---

## Security Checklist

- [ ] `POSTGRES_PASSWORD` is strong and unique.
- [ ] `JWT_SECRET` is at least 32 characters and randomly generated.
- [ ] Google OAuth credentials are from a production Google Cloud project.
- [ ] `GEMINI_API_KEY` is restricted to your domain if possible.
- [ ] Branch protection is enabled on `master` requiring CI to pass.
- [ ] The VPS firewall only exposes ports 80, 443, and SSH.
- [ ] Coolify admin panel is not publicly accessible (use VPN or IP whitelist).

---

## Useful Commands

### View logs
```bash
# In Coolify UI: Resources → SaveSphere → Logs

# Or via SSH on the VPS:
docker compose -f /data/coolify/.../docker-compose.prod.yml logs -f api
docker compose -f /data/coolify/.../docker-compose.prod.yml logs -f web
```

### Manual migration
```bash
docker exec savesphere-api migrate -path=/app/migrations -database="$DATABASE_URL" up
```

### Restart services
```bash
# In Coolify UI: click Restart on the resource
```

### Check running containers
```bash
docker ps | grep savesphere
```

---

## File Reference

| File | Purpose |
|------|---------|
| `docker-compose.prod.yml` | Production Docker Compose stack for Coolify |
| `.github/workflows/ci-cd.yml` | GitHub Actions CI/CD pipeline |
| `apps/api/Dockerfile` | Multi-stage Go build with migrations |
| `apps/api/entrypoint.sh` | Runs migrations before starting the API |
| `apps/web/Dockerfile` | Multi-stage Node build for SvelteKit |
| `.dockerignore` | Excludes files from Docker build context |
