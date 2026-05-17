/**
 * Storage abstraction layer
 * - Web (iframe/dev): calls Express API
 * - Native (Capacitor / Electron): uses localStorage directly
 *
 * Detection: window.__NATIVE__ is injected by Electron preload.
 * Capacitor is detected via window.Capacitor?.isNativePlatform().
 */

declare global {
  interface Window {
    __NATIVE__?: boolean;
    Capacitor?: { isNativePlatform: () => boolean };
  }
}

export function isNative(): boolean {
  return (
    window.__NATIVE__ === true ||
    (typeof window.Capacitor !== "undefined" && window.Capacitor.isNativePlatform())
  );
}

// ── Local storage helpers ──────────────────────────────────────────
const PLAYER_KEY = "pyquest_player";
const PROGRESS_KEY = "pyquest_progress";

export interface LocalPlayer {
  id: number;
  name: string;
  avatar: string;
  totalXp: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  completedLessons: string; // JSON array
  createdAt: string;
}

export interface LocalProgress {
  id: number;
  playerId: number;
  lessonId: string;
  chapterId: string;
  score: number;
  maxScore: number;
  attempts: number;
  completed: boolean;
  completedAt: string | null;
}

function loadPlayers(): LocalPlayer[] {
  try {
    return JSON.parse(localStorage.getItem(PLAYER_KEY) || "[]");
  } catch {
    return [];
  }
}

function savePlayers(players: LocalPlayer[]) {
  localStorage.setItem(PLAYER_KEY, JSON.stringify(players));
}

function loadProgress(): LocalProgress[] {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveProgress(progress: LocalProgress[]) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

// ── Native API (mirrors server API shape) ─────────────────────────

export const nativeApi = {
  createPlayer(data: { name: string; avatar: string }): LocalPlayer {
    const players = loadPlayers();
    const player: LocalPlayer = {
      id: Date.now(),
      name: data.name,
      avatar: data.avatar,
      totalXp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      completedLessons: "[]",
      createdAt: new Date().toISOString(),
    };
    players.push(player);
    savePlayers(players);
    return player;
  },

  getPlayer(id: number): LocalPlayer | undefined {
    return loadPlayers().find((p) => p.id === id);
  },

  updatePlayer(id: number, data: Partial<LocalPlayer>): LocalPlayer | undefined {
    const players = loadPlayers();
    const idx = players.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    players[idx] = { ...players[idx], ...data };
    savePlayers(players);
    return players[idx];
  },

  getAllPlayers(): LocalPlayer[] {
    return loadPlayers().sort((a, b) => b.totalXp - a.totalXp);
  },

  upsertProgress(data: Omit<LocalProgress, "id">): LocalProgress {
    const all = loadProgress();
    const existing = all.find(
      (p) => p.playerId === data.playerId && p.lessonId === data.lessonId
    );
    if (existing) {
      Object.assign(existing, data);
      saveProgress(all);

      // Update player XP if newly completed
      if (data.completed) {
        const player = nativeApi.getPlayer(data.playerId);
        if (player) {
          const completedLessons: string[] = JSON.parse(player.completedLessons || "[]");
          if (!completedLessons.includes(data.lessonId)) {
            completedLessons.push(data.lessonId);
            const xpGain = Math.round((data.score / data.maxScore) * 50);
            const newXp = player.totalXp + xpGain;
            const newLevel = Math.floor(newXp / 200) + 1;
            nativeApi.updatePlayer(data.playerId, {
              completedLessons: JSON.stringify(completedLessons),
              totalXp: newXp,
              level: newLevel,
              lastActiveDate: new Date().toISOString().split("T")[0],
            });
          }
        }
      }

      return existing;
    } else {
      const record: LocalProgress = { id: Date.now(), ...data };
      all.push(record);
      saveProgress(all);

      if (data.completed) {
        const player = nativeApi.getPlayer(data.playerId);
        if (player) {
          const completedLessons: string[] = JSON.parse(player.completedLessons || "[]");
          if (!completedLessons.includes(data.lessonId)) {
            completedLessons.push(data.lessonId);
            const xpGain = Math.round((data.score / data.maxScore) * 50);
            const newXp = player.totalXp + xpGain;
            const newLevel = Math.floor(newXp / 200) + 1;
            nativeApi.updatePlayer(data.playerId, {
              completedLessons: JSON.stringify(completedLessons),
              totalXp: newXp,
              level: newLevel,
              lastActiveDate: new Date().toISOString().split("T")[0],
            });
          }
        }
      }

      return record;
    }
  },

  getProgress(playerId: number): LocalProgress[] {
    return loadProgress().filter((p) => p.playerId === playerId);
  },
};
