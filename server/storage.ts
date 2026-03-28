import {
  type Event, type InsertEvent, events,
  type Casualty, type InsertCasualty, casualties,
  type Infrastructure, type InsertInfrastructure, infrastructure,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export interface IStorage {
  // Events
  getEvents(filters?: { category?: string; country?: string; actor?: string; startDate?: string; endDate?: string }): Event[];
  getEventById(id: number): Event | undefined;
  createEvent(event: InsertEvent): Event;

  // Casualties
  getCasualties(filters?: { country?: string; side?: string }): Casualty[];
  getCasualtySummary(): { side: string; totalKilled: number; totalWounded: number; militaryKilled: number; civilianKilled: number }[];
  createCasualty(casualty: InsertCasualty): Casualty;

  // Infrastructure
  getInfrastructure(filters?: { country?: string; category?: string }): Infrastructure[];
  getInfrastructureSummary(): { category: string; totalCount: number; country: string }[];
  createInfrastructure(infra: InsertInfrastructure): Infrastructure;

  // Stats
  getStats(): {
    totalEvents: number;
    totalKilled: number;
    totalWounded: number;
    countriesAffected: number;
    lastUpdated: string;
  };
}

export class DatabaseStorage implements IStorage {
  getEvents(filters?: { category?: string; country?: string; actor?: string; startDate?: string; endDate?: string }): Event[] {
    let query = db.select().from(events);
    const conditions: any[] = [];

    if (filters?.category) conditions.push(eq(events.category, filters.category));
    if (filters?.country) conditions.push(eq(events.country, filters.country));
    if (filters?.actor) conditions.push(eq(events.actor, filters.actor));
    if (filters?.startDate) conditions.push(gte(events.date, filters.startDate));
    if (filters?.endDate) conditions.push(lte(events.date, filters.endDate));

    if (conditions.length > 0) {
      return db.select().from(events).where(and(...conditions)).orderBy(desc(events.date)).all();
    }
    return db.select().from(events).orderBy(desc(events.date)).all();
  }

  getEventById(id: number): Event | undefined {
    return db.select().from(events).where(eq(events.id, id)).get();
  }

  createEvent(event: InsertEvent): Event {
    return db.insert(events).values(event).returning().get();
  }

  getCasualties(filters?: { country?: string; side?: string }): Casualty[] {
    const conditions: any[] = [];
    if (filters?.country) conditions.push(eq(casualties.country, filters.country));
    if (filters?.side) conditions.push(eq(casualties.side, filters.side));

    if (conditions.length > 0) {
      return db.select().from(casualties).where(and(...conditions)).orderBy(desc(casualties.date)).all();
    }
    return db.select().from(casualties).orderBy(desc(casualties.date)).all();
  }

  getCasualtySummary(): { side: string; totalKilled: number; totalWounded: number; militaryKilled: number; civilianKilled: number }[] {
    const result = db.select({
      side: casualties.side,
      totalKilled: sql<number>`SUM(${casualties.killed})`,
      totalWounded: sql<number>`SUM(${casualties.wounded})`,
      militaryKilled: sql<number>`SUM(${casualties.militaryKilled})`,
      civilianKilled: sql<number>`SUM(${casualties.civilianKilled})`,
    }).from(casualties).groupBy(casualties.side).all();
    return result;
  }

  createCasualty(casualty: InsertCasualty): Casualty {
    return db.insert(casualties).values(casualty).returning().get();
  }

  getInfrastructure(filters?: { country?: string; category?: string }): Infrastructure[] {
    const conditions: any[] = [];
    if (filters?.country) conditions.push(eq(infrastructure.country, filters.country));
    if (filters?.category) conditions.push(eq(infrastructure.category, filters.category));

    if (conditions.length > 0) {
      return db.select().from(infrastructure).where(and(...conditions)).orderBy(desc(infrastructure.date)).all();
    }
    return db.select().from(infrastructure).orderBy(desc(infrastructure.date)).all();
  }

  getInfrastructureSummary(): { category: string; totalCount: number; country: string }[] {
    return db.select({
      category: infrastructure.category,
      totalCount: sql<number>`SUM(${infrastructure.count})`,
      country: infrastructure.country,
    }).from(infrastructure).groupBy(infrastructure.category, infrastructure.country).all();
  }

  createInfrastructure(infra: InsertInfrastructure): Infrastructure {
    return db.insert(infrastructure).values(infra).returning().get();
  }

  getStats(): { totalEvents: number; totalKilled: number; totalWounded: number; countriesAffected: number; lastUpdated: string } {
    const eventCount = db.select({ count: sql<number>`COUNT(*)` }).from(events).get();
    const casualtyTotals = db.select({
      totalKilled: sql<number>`SUM(${casualties.killed})`,
      totalWounded: sql<number>`SUM(${casualties.wounded})`,
    }).from(casualties).get();
    const countries = db.select({ count: sql<number>`COUNT(DISTINCT ${events.country})` }).from(events).get();
    const lastEvent = db.select({ date: events.date }).from(events).orderBy(desc(events.date)).limit(1).get();

    return {
      totalEvents: eventCount?.count ?? 0,
      totalKilled: casualtyTotals?.totalKilled ?? 0,
      totalWounded: casualtyTotals?.totalWounded ?? 0,
      countriesAffected: countries?.count ?? 0,
      lastUpdated: lastEvent?.date ?? new Date().toISOString(),
    };
  }
}

export const storage = new DatabaseStorage();
