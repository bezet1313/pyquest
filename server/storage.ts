import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and } from "drizzle-orm";
import * as schema from "@shared/schema";

const sqlite = new Database("data.db");
export const db = drizzle(sqlite, { schema });

// Initialize tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT '🐍',
    total_xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    streak INTEGER NOT NULL DEFAULT 0,
    last_active_date TEXT,
    completed_lessons TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS lesson_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    lesson_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    max_score INTEGER NOT NULL DEFAULT 100,
    attempts INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT
  );
`);

export interface IStorage {
  // Players
  createPlayer(data: schema.InsertPlayer): schema.Player;
  getPlayer(id: number): schema.Player | undefined;
  updatePlayer(id: number, data: Partial<schema.Player>): schema.Player | undefined;
  getAllPlayers(): schema.Player[];

  // Lesson Progress
  upsertLessonProgress(data: schema.InsertLessonProgress): schema.LessonProgress;
  getLessonProgress(playerId: number, lessonId: string): schema.LessonProgress | undefined;
  getPlayerProgress(playerId: number): schema.LessonProgress[];
}

export const storage: IStorage = {
  createPlayer(data) {
    return db.insert(schema.players).values(data).returning().get()!;
  },
  getPlayer(id) {
    return db.select().from(schema.players).where(eq(schema.players.id, id)).get();
  },
  updatePlayer(id, data) {
    return db.update(schema.players).set(data).where(eq(schema.players.id, id)).returning().get();
  },
  getAllPlayers() {
    return db.select().from(schema.players).all();
  },
  upsertLessonProgress(data) {
    const existing = db
      .select()
      .from(schema.lessonProgress)
      .where(
        and(
          eq(schema.lessonProgress.playerId, data.playerId),
          eq(schema.lessonProgress.lessonId, data.lessonId)
        )
      )
      .get();

    if (existing) {
      return db
        .update(schema.lessonProgress)
        .set(data)
        .where(eq(schema.lessonProgress.id, existing.id))
        .returning()
        .get()!;
    } else {
      return db.insert(schema.lessonProgress).values(data).returning().get()!;
    }
  },
  getLessonProgress(playerId, lessonId) {
    return db
      .select()
      .from(schema.lessonProgress)
      .where(
        and(
          eq(schema.lessonProgress.playerId, playerId),
          eq(schema.lessonProgress.lessonId, lessonId)
        )
      )
      .get();
  },
  getPlayerProgress(playerId) {
    return db
      .select()
      .from(schema.lessonProgress)
      .where(eq(schema.lessonProgress.playerId, playerId))
      .all();
  },
};
