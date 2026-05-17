import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { curriculum, getTotalLessons } from "@/data/curriculum";
import { getPlayerId } from "@/lib/player";
import type { Player } from "@shared/schema";

function getLevelTitle(level: number) {
  if (level >= 10) return "Legendarny Arcymag";
  if (level >= 7) return "Mistrz Zaklęć";
  if (level >= 5) return "Starszy Adept";
  if (level >= 3) return "Adept Pythona";
  if (level >= 2) return "Nowicjusz";
  return "Uczony Czeladnik";
}

export default function Profile() {
  const [, navigate] = useLocation();
  const playerId = getPlayerId();

  const { data: player } = useQuery<Player>({
    queryKey: ["/api/players", playerId],
    queryFn: () => apiRequest("GET", `/api/players/${playerId}`),
    enabled: !!playerId,
  });

  const completedIds: string[] = player ? JSON.parse(player.completedLessons || "[]") : [];
  const totalLessons = getTotalLessons();
  const lvl = player?.level ?? 1;
  const xpInLevel = (player?.totalXp ?? 0) % 200;
  const xpToNext = 200 - xpInLevel;
  const xpProgress = (xpInLevel / 200) * 100;

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="back-btn" onClick={() => navigate("/")} data-testid="button-back">← Odwrót</button>
        <span className="topbar-title">📜 Karta postaci</span>
        <div style={{ width: 60 }} />
      </header>

      <main className="main-content">
        <div className="profile-hero">
          <div className="profile-avatar-big">{player?.avatar}</div>
          <h2 className="profile-name" data-testid="text-username">{player?.name}</h2>
          <div className="profile-level-badge">Poziom {lvl} — {getLevelTitle(lvl)}</div>
        </div>

        {/* XP bar */}
        <div className="xp-bar-card">
          <div className="xp-bar-header">
            <span style={{ color: "var(--color-primary)" }}>⚡ {player?.totalXp ?? 0} XP łącznie</span>
            <span className="xp-to-next">{xpToNext} XP do poz. {lvl + 1}</span>
          </div>
          <div className="xp-bar-bg">
            <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stats-card">
            <div className="stats-icon">⚔️</div>
            <div className="stats-value" data-testid="text-completed">{completedIds.length}</div>
            <div className="stats-label">Sal ukończonych</div>
          </div>
          <div className="stats-card">
            <div className="stats-icon">🔥</div>
            <div className="stats-value">{player?.streak ?? 0}</div>
            <div className="stats-label">Dni z rzędu</div>
          </div>
          <div className="stats-card">
            <div className="stats-icon">🗺️</div>
            <div className="stats-value">{totalLessons - completedIds.length}</div>
            <div className="stats-label">Sal do odkrycia</div>
          </div>
          <div className="stats-card">
            <div className="stats-icon">💎</div>
            <div className="stats-value">{player?.level ?? 1}</div>
            <div className="stats-label">Poziom bohatera</div>
          </div>
        </div>

        {/* Chapter progress */}
        <div className="section-title">Postęp w lochach</div>
        <div className="chapter-progress-list">
          {curriculum.map((ch) => {
            const done = ch.lessons.filter((l) => completedIds.includes(l.id)).length;
            const pct = ch.lessons.length > 0 ? Math.round((done / ch.lessons.length) * 100) : 0;
            return (
              <div key={ch.id} className="chapter-progress-row">
                <span className="ch-prog-icon">{ch.icon}</span>
                <div className="ch-prog-info">
                  <span>{ch.title}</span>
                  <div className="ch-prog-bar-bg">
                    <div className="ch-prog-bar-fill" style={{ width: `${pct}%`, background: ch.color }} />
                  </div>
                </div>
                <span className="ch-prog-pct" style={{ color: ch.color }}>{done}/{ch.lessons.length}</span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
