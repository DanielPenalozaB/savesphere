#!/bin/sh
set -e

# Run database migrations before starting the application
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  migrate -path=/app/migrations -database="$DATABASE_URL" up
  echo "Migrations completed."
else
  echo "WARNING: DATABASE_URL is not set. Skipping migrations."
fi

# Start the application
exec /app/main
