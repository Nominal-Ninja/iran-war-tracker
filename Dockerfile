# syntax=docker/dockerfile:1.7
# ---------- Stage 1: Build ----------
# Uses Debian slim (not Alpine) because better-sqlite3 is a native module
# and glibc-based images avoid musl recompile headaches.
FROM node:20-bookworm-slim AS builder

# Native build toolchain for better-sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 \
      make \
      g++ \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# Copy source and build (vite client + esbuild server bundle)
COPY . .
RUN npm run build

# Prune devDependencies for a leaner runtime stage
RUN npm prune --omit=dev

# ---------- Stage 2: Runtime ----------
FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=/data/data.db

# tini for proper signal handling (clean shutdowns)
RUN apt-get update && apt-get install -y --no-install-recommends \
      tini \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Non-root user
RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs nodejs

WORKDIR /app

# Copy built artifacts + production node_modules + config needed at runtime
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared
COPY --from=builder --chown=nodejs:nodejs /app/server/seed.ts ./server/seed.ts
COPY --chown=nodejs:nodejs docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Persistent volume for the SQLite file (mount in Railway/Fly)
RUN mkdir -p /data && chown nodejs:nodejs /data
VOLUME ["/data"]

USER nodejs
EXPOSE 3000

# Lightweight healthcheck — hits /api/stats via node's built-in http
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/stats',r=>{process.exit(r.statusCode<500?0:1)}).on('error',()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/index.cjs"]
