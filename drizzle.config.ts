import { defineConfig } from "drizzle-kit";

// DB_PATH lets us point SQLite at a persistent volume (e.g. /data/data.db on
// Railway/Fly) while keeping ./data.db as the default for local dev.
const dbUrl = process.env.DB_PATH || "./data.db";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: dbUrl,
  },
});
