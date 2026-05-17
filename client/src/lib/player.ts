/**
 * Player session persistence.
 * Uses localStorage so the session survives page refreshes and app restarts.
 * Falls back gracefully if localStorage is unavailable (sandboxed iframe).
 */

const PLAYER_ID_KEY = "pyquest_player_id";
const LAST_LESSON_KEY = "pyquest_last_lesson";
const LAST_CHAPTER_KEY = "pyquest_last_chapter";
const PLAYER_CLASS_KEY = "pyquest_player_class";
const STREAK_KEY = "pyquest_streak";
const STREAK_DATE_KEY = "pyquest_streak_date"; // ISO date string YYYY-MM-DD

export function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function lsSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // silently ignore in sandboxed environments
  }
}

export function lsRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

// In-memory fallback for sandboxed preview
let _memPlayerId: number | null = null;

export function getPlayerId(): number | null {
  const stored = lsGet(PLAYER_ID_KEY);
  if (stored) return Number(stored);
  return _memPlayerId;
}

export function setPlayerId(id: number) {
  _memPlayerId = id;
  lsSet(PLAYER_ID_KEY, String(id));
}

export function clearPlayer() {
  _memPlayerId = null;
  lsRemove(PLAYER_ID_KEY);
  lsRemove(LAST_LESSON_KEY);
  lsRemove(LAST_CHAPTER_KEY);
  lsRemove(PLAYER_CLASS_KEY);
  lsRemove(STREAK_KEY);
  lsRemove(STREAK_DATE_KEY);
}

// ── Last position tracking ────────────────────────────────────────

export function setLastLesson(lessonId: string, chapterId: string) {
  lsSet(LAST_LESSON_KEY, lessonId);
  lsSet(LAST_CHAPTER_KEY, chapterId);
}

export function getLastLesson(): { lessonId: string; chapterId: string } | null {
  const lessonId = lsGet(LAST_LESSON_KEY);
  const chapterId = lsGet(LAST_CHAPTER_KEY);
  if (lessonId && chapterId) return { lessonId, chapterId };
  return null;
}

export function clearLastLesson() {
  lsRemove(LAST_LESSON_KEY);
  lsRemove(LAST_CHAPTER_KEY);
}

// ── Player class ──────────────────────────────────────────────────

export type PlayerClass = "warrior" | "mage" | "rogue";

export function getPlayerClass(): PlayerClass | null {
  const v = lsGet(PLAYER_CLASS_KEY);
  if (v === "warrior" || v === "mage" || v === "rogue") return v;
  return null;
}

export function setPlayerClass(cls: PlayerClass) {
  lsSet(PLAYER_CLASS_KEY, cls);
}

// ── Streak system ─────────────────────────────────────────────────

function todayDateStr(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

function yesterdayDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function getStreak(): number {
  return parseInt(lsGet(STREAK_KEY) ?? "0", 10);
}

export function getStreakDate(): string | null {
  return lsGet(STREAK_DATE_KEY);
}

/**
 * Call once after a lesson is successfully completed.
 * - Same day as last completion: streak unchanged (already counted today)
 * - Next day after last completion: streak +1
 * - Any gap > 1 day: streak resets to 1
 * Returns the new streak value.
 */
export function recordLessonCompleted(): number {
  const today = todayDateStr();
  const lastDate = getStreakDate();
  let streak = getStreak();

  if (lastDate === today) {
    // already completed a lesson today — no change
    return streak;
  } else if (lastDate === yesterdayDateStr()) {
    // consecutive day — increment
    streak += 1;
  } else {
    // gap or first time — reset to 1
    streak = 1;
  }

  lsSet(STREAK_KEY, String(streak));
  lsSet(STREAK_DATE_KEY, today);
  return streak;
}

/**
 * Returns true if the streak is at risk:
 * player has a streak > 0 but hasn't completed a lesson today.
 */
export function isStreakAtRisk(): boolean {
  const streak = getStreak();
  if (streak === 0) return false;
  const lastDate = getStreakDate();
  const today = todayDateStr();
  return lastDate !== today;
}

// ── Daily goal (localStorage only) ───────────────────────────────

export function getDailyGoalKey(): string {
  return `pyquest_daily_${todayDateStr()}`;
}

export function getDailyCount(): number {
  return parseInt(lsGet(getDailyGoalKey()) ?? "0", 10);
}

export function incrementDailyCount() {
  const key = getDailyGoalKey();
  const cur = parseInt(lsGet(key) ?? "0", 10);
  lsSet(key, String(cur + 1));
}
