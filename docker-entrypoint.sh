#!/bin/sh
set -e

# Path to the SQLite file — defaults to the persistent volume mount.
# Both drizzle.config.ts and server/storage.ts read DB_PATH directly.
export DB_PATH="${DB_PATH:-/data/data.db}"
DB_DIR="$(dirname "$DB_PATH")"

# If we're running as root (first boot on Railway — volumes are mounted
# with root ownership), fix the data dir and re-exec as nodejs via gosu.
# If we're already nodejs (local `docker run --user` etc), skip straight
# to the app logic.
if [ "$(id -u)" = "0" ]; then
  mkdir -p "$DB_DIR"
  chown -R nodejs:nodejs "$DB_DIR"
  # Re-run this same script as the nodejs user
  exec gosu nodejs:nodejs "$0" "$@"
fi

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
