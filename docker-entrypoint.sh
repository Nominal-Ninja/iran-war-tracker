#!/bin/sh
set -e

# Path to the SQLite file — defaults to the persistent volume
DB_PATH="${DB_PATH:-/data/data.db}"

# Symlink the expected path (drizzle.config.ts uses ./data.db) to the volume
# so both drizzle-kit and the server write to the same persistent location.
if [ ! -L /app/data.db ] && [ ! -f /app/data.db ]; then
  ln -sf "$DB_PATH" /app/data.db
fi

echo "[entrypoint] using DB at $DB_PATH"

# Apply schema (idempotent — safe on every boot)
echo "[entrypoint] running drizzle-kit push..."
npx --no-install drizzle-kit push --force || {
  echo "[entrypoint] drizzle-kit push failed" >&2
  exit 1
}

# Seed data if DB is empty (first boot). The seed script upserts safely
# according to the Apr 4 session notes, so re-running on restart is fine.
if [ -n "$SEED_ON_BOOT" ] && [ "$SEED_ON_BOOT" = "true" ]; then
  echo "[entrypoint] seeding database..."
  npx --no-install tsx server/seed.ts || echo "[entrypoint] seed skipped (non-fatal)"
fi

echo "[entrypoint] launching: $*"
exec "$@"
