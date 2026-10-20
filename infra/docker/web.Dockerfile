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
RUN pnpm turbo build --filter=@savesphere/web...

# adapter-node bundles every devDependency, so the build output needs no node_modules.
FROM node:26-alpine AS runtime
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /repo/apps/web/build ./build
COPY --from=build --chown=node:node /repo/apps/web/package.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
	CMD wget -qO- http://127.0.0.1:3000/ > /dev/null || exit 1
CMD ["node", "build"]
