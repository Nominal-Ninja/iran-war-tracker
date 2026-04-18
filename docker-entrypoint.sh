#!/bin/sh
set -e

# Path to the SQLite file — defaults to the persistent volume mount.
# Both drizzle.config.ts and server/storage.ts read DB_PATH directly,
# so no symlink hackery is needed.
export DB_PATH="${DB_PATH:-/data/data.db}"

echo "[entrypoint] using DB at $DB_PATH"

# Apply schema (idempotent — safe on every boot). We invoke drizzle-kit's
# bin directly via node because npm/npx are removed from the runtime image
# to eliminate their bundled CVE exposure.
echo "[entrypoint] running drizzle-kit push..."
node /app/node_modules/drizzle-kit/bin.cjs push --force || {
  echo "[entrypoint] drizzle-kit push failed" >&2
  exit 1
}

# Seed data if SEED_ON_BOOT=true. We use tsx's bin directly for the same
# reason. The seed script is idempotent so re-running on restart is fine.
if [ -n "$SEED_ON_BOOT" ] && [ "$SEED_ON_BOOT" = "true" ]; then
  echo "[entrypoint] seeding database..."
  node /app/node_modules/tsx/dist/cli.mjs server/seed.ts || echo "[entrypoint] seed skipped (non-fatal)"
fi

echo "[entrypoint] launching: $*"
exec "$@"
