# Stage 1: Build application
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy module files for caching
COPY apps/api/go.mod apps/api/go.sum ./apps/api/
WORKDIR /app/apps/api
RUN go mod download

# Copy source code
WORKDIR /app
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Build the application
WORKDIR /app/apps/api
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/main ./cmd/app/main.go

# Stage 2: Copy migrate binary
FROM migrate/migrate AS migrate

# Stage 3: Run
FROM alpine:3.20

WORKDIR /app

# Install ca-certificates for HTTPS requests (OAuth, Gemini API, etc.)
RUN apk add --no-cache ca-certificates

# Copy application binary
COPY --from=builder /app/main /app/main

# Copy migrate binary and migrations
COPY --from=migrate /usr/local/bin/migrate /usr/local/bin/migrate
COPY apps/api/migrations /app/migrations

# Copy entrypoint script
COPY apps/api/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
