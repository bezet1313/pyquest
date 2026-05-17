import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Players table
export const players = sqliteTable("players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  avatar: text("avatar").notNull().default("🐍"),
  totalXp: integer("total_xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  lastActiveDate: text("last_active_date"),
  completedLessons: text("completed_lessons").notNull().default("[]"), // JSON array of lesson IDs
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertPlayerSchema = createInsertSchema(players).omit({ id: true, createdAt: true });
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

// Lesson progress
export const lessonProgress = sqliteTable("lesson_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  playerId: integer("player_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  chapterId: text("chapter_id").notNull(),
  score: integer("score").notNull().default(0),
  maxScore: integer("max_score").notNull().default(100),
  attempts: integer("attempts").notNull().default(0),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  completedAt: text("completed_at"),
});

export const insertLessonProgressSchema = createInsertSchema(lessonProgress).omit({ id: true });
export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;
export type LessonProgress = typeof lessonProgress.$inferSelect;
