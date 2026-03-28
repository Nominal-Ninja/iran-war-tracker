/**
 * routes.ts
 * Express API route definitions for the Iran War Tracker.
 * All routes are prefixed with /api and use the storage interface
 * for database operations via Drizzle ORM.
 *
 * Author: Austin Wesley
 */
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seedDatabase } from "./seed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed database on startup
  seedDatabase();

  // GET /api/stats — summary KPIs
  app.get("/api/stats", (_req, res) => {
    const stats = storage.getStats();
    res.json(stats);
  });

  // GET /api/events — all events with optional filters
  app.get("/api/events", (req, res) => {
    const { category, country, actor, startDate, endDate } = req.query;
    const events = storage.getEvents({
      category: category as string | undefined,
      country: country as string | undefined,
      actor: actor as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });
    res.json(events);
  });

  // GET /api/events/:id — single event
  app.get("/api/events/:id", (req, res) => {
    const event = storage.getEventById(Number(req.params.id));
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  });

  // GET /api/casualties — all casualty records
  app.get("/api/casualties", (req, res) => {
    const { country, side } = req.query;
    const data = storage.getCasualties({
      country: country as string | undefined,
      side: side as string | undefined,
    });
    res.json(data);
  });

  // GET /api/casualties/summary — aggregated by side
  app.get("/api/casualties/summary", (_req, res) => {
    const summary = storage.getCasualtySummary();
    res.json(summary);
  });

  // GET /api/infrastructure — damage records
  app.get("/api/infrastructure", (req, res) => {
    const { country, category } = req.query;
    const data = storage.getInfrastructure({
      country: country as string | undefined,
      category: category as string | undefined,
    });
    res.json(data);
  });

  // GET /api/infrastructure/summary — aggregated
  app.get("/api/infrastructure/summary", (_req, res) => {
    const summary = storage.getInfrastructureSummary();
    res.json(summary);
  });

  return httpServer;
}
