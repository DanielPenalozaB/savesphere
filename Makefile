.PHONY: dev build lint test clean docker-up docker-down dev-up dev-down

# Orchestration via Turbo
dev:
	yarn turbo dev

build:
	yarn turbo build

lint:
	yarn turbo lint

test:
	yarn turbo test

# Docker — Database only (legacy, backwards compatible)
docker-up:
	docker compose up -d

docker-down:
	docker compose down

# Docker — Full development stack (DB + API + Web)
dev-up:
	docker compose -f docker-compose.dev.yml up -d --build

dev-down:
	docker compose -f docker-compose.dev.yml down

dev-logs:
	docker compose -f docker-compose.dev.yml logs -f

# Specific apps
api-dev:
	yarn turbo dev --filter=api

web-dev:
	yarn turbo dev --filter=web

# Database setup
migrate-up:
	docker compose run --rm migrations

migrate-down:
	docker compose run --rm migrations -command "-path=/migrations/ -database=postgres://postgres:postgres@db:5432/savesphere?sslmode=disable down"

# Contract Generation (To be expanded)
generate:
	@echo "Generating contracts..."
	# Commands for oapi-codegen and openapi-typescript would go here
