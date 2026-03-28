/**
 * schema.ts
 * Database schema definitions using Drizzle ORM for SQLite.
 * Defines three tables: events (conflict incidents), casualties (daily snapshots),
 * and infrastructure (damage reports). Zod schemas generated for API validation.
 *
 * Author: Austin Wesley
 */
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// War events — strikes, retaliations, diplomatic, humanitarian
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // ISO date string
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'airstrike' | 'missile' | 'drone' | 'ground' | 'naval' | 'diplomatic' | 'humanitarian' | 'cyber'
  actor: text("actor").notNull(), // 'US' | 'Israel' | 'Iran' | 'Hezbollah' | 'Houthi' | 'Coalition' | 'Other'
  target: text("target").notNull(), // who/what was targeted
  lat: real("lat"),
  lng: real("lng"),
  location: text("location").notNull(), // human-readable location
  country: text("country").notNull(), // 'Iran' | 'Israel' | 'Iraq' | 'Lebanon' | 'Syria' | 'Bahrain' | 'Kuwait' | 'Qatar' | 'UAE' | 'Saudi Arabia'
  source: text("source").notNull(), // source attribution
  sourceUrl: text("source_url"),
  severity: text("severity").notNull(), // 'critical' | 'major' | 'moderate' | 'minor'
});

export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Casualty tracking — daily snapshots per country/side
export const casualties = sqliteTable("casualties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // ISO date
  country: text("country").notNull(),
  side: text("side").notNull(), // 'US' | 'Israel' | 'Iran' | 'Lebanon' | 'Civilian' | 'Other'
  killed: integer("killed").notNull().default(0),
  wounded: integer("wounded").notNull().default(0),
  militaryKilled: integer("military_killed").notNull().default(0),
  civilianKilled: integer("civilian_killed").notNull().default(0),
  source: text("source").notNull(),
});

export const insertCasualtySchema = createInsertSchema(casualties).omit({ id: true });
export type InsertCasualty = z.infer<typeof insertCasualtySchema>;
export type Casualty = typeof casualties.$inferSelect;

// Infrastructure damage tracking
export const infrastructure = sqliteTable("infrastructure", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  country: text("country").notNull(),
  category: text("category").notNull(), // 'residential' | 'medical' | 'military' | 'school' | 'commercial' | 'infrastructure' | 'cultural'
  count: integer("count").notNull().default(0),
  description: text("description"),
  source: text("source").notNull(),
});

export const insertInfrastructureSchema = createInsertSchema(infrastructure).omit({ id: true });
export type InsertInfrastructure = z.infer<typeof insertInfrastructureSchema>;
export type Infrastructure = typeof infrastructure.$inferSelect;
