# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations for workspace
COPY package.json yarn.lock turbo.json ./
COPY apps/web/package.json ./apps/web/

# Install dependencies (utilizing layer caching)
RUN yarn install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared

# Build the application
RUN yarn turbo build --filter=web

# Stage 2: Run
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/apps/web/build ./build
COPY --from=builder /app/apps/web/package.json ./package.json
COPY --from=builder /app/apps/web/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "build"]
