# Stage 1: Build
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy root configurations (if needed for shared libs later)
# COPY go.work go.work.sum ./

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

# Stage 2: Run
FROM alpine:3.20

WORKDIR /
COPY --from=builder /app/main /main

EXPOSE 3000

CMD ["/main"]
