import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, insertLessonProgressSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(httpServer: Server, app: Express) {
  // Create player
  app.post("/api/players", (req, res) => {
    try {
      const data = insertPlayerSchema.parse(req.body);
      const player = storage.createPlayer(data);
      res.json(player);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Get player
  app.get("/api/players/:id", (req, res) => {
    const player = storage.getPlayer(Number(req.params.id));
    if (!player) return res.status(404).json({ error: "Player not found" });
    res.json(player);
  });

  // Update player
  app.patch("/api/players/:id", (req, res) => {
    try {
      const player = storage.updatePlayer(Number(req.params.id), req.body);
      if (!player) return res.status(404).json({ error: "Player not found" });
      res.json(player);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Get all players (leaderboard)
  app.get("/api/players", (_req, res) => {
    const players = storage.getAllPlayers();
    res.json(players);
  });

  // Save lesson progress
  app.post("/api/progress", (req, res) => {
    try {
      const data = insertLessonProgressSchema.parse(req.body);
      const progress = storage.upsertLessonProgress(data);

      // Update player XP and completed lessons
      const player = storage.getPlayer(data.playerId);
      if (player && data.completed) {
        const completedLessons: string[] = JSON.parse(player.completedLessons || "[]");
        if (!completedLessons.includes(data.lessonId)) {
          completedLessons.push(data.lessonId);
          const xpGain = Math.round((data.score / data.maxScore) * 50);
          const newXp = player.totalXp + xpGain;
          const newLevel = Math.floor(newXp / 200) + 1;
          storage.updatePlayer(data.playerId, {
            completedLessons: JSON.stringify(completedLessons),
            totalXp: newXp,
            level: newLevel,
            lastActiveDate: new Date().toISOString().split("T")[0],
          });
        }
      }

      res.json(progress);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Get player progress
  app.get("/api/progress/:playerId", (req, res) => {
    const progress = storage.getPlayerProgress(Number(req.params.playerId));
    res.json(progress);
  });
}
