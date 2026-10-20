# syntax=docker/dockerfile:1
# Build context: repository root.
FROM node:26-alpine AS base
RUN npm install -g pnpm@12.14.0
WORKDIR /repo

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch
COPY . .
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
	pnpm install --frozen-lockfile --offline
RUN pnpm turbo build --filter=@savesphere/api...
# Self-contained production bundle: the API plus its workspace packages, prod deps only.
RUN pnpm deploy --legacy --filter=@savesphere/api --prod /out

FROM node:26-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /out ./
COPY --chown=node:node infra/docker/api-entrypoint.sh /usr/local/bin/api-entrypoint
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
	CMD wget -qO- http://127.0.0.1:3000/api/health > /dev/null || exit 1
ENTRYPOINT ["api-entrypoint"]
CMD ["node", "dist/main.js"]
