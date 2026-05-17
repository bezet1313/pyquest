/**
 * Player session persistence.
 * Uses localStorage so the session survives page refreshes and app restarts.
 * Falls back gracefully if localStorage is unavailable (sandboxed iframe).
 */

const PLAYER_ID_KEY = "pyquest_player_id";
const LAST_LESSON_KEY = "pyquest_last_lesson";
const LAST_CHAPTER_KEY = "pyquest_last_chapter";

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // silently ignore in sandboxed environments
  }
}

function lsRemove(key: string) {
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
