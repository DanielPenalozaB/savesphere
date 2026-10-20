#!/bin/sh
set -e

# Migrations and reference data are idempotent; disable with RUN_MIGRATIONS=false
# (e.g. for the worker, or when running more than one API replica).
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
	node node_modules/@savesphere/db/dist/cli/migrate.js
	node node_modules/@savesphere/db/dist/cli/seed.js
fi

exec "$@"
