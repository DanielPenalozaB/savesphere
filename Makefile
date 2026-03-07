.PHONY: dev build lint test clean docker-up docker-down

# Orchestration via Turbo
dev:
	yarn turbo dev

build:
	yarn turbo build

lint:
	yarn turbo lint

test:
	yarn turbo test

# Docker
docker-up:
	docker compose up -d

docker-down:
	docker compose down

# Specific apps
api-dev:
	yarn turbo dev --filter=api

web-dev:
	yarn turbo dev --filter=web

# Database setup
db-up:
	docker compose up -d

db-down:
	docker compose down

migrate-up:
	docker compose run --rm migrations

migrate-down:
	docker compose run --rm migrations -command "-path=/migrations/ -database=postgres://postgres:postgres@db:5432/savesphere?sslmode=disable down"

# Contract Generation (To be expanded)
generate:
	@echo "Generating contracts..."
	# Commands for oapi-codegen and openapi-typescript would go here
