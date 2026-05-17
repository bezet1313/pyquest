import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { curriculum, getTotalLessons } from "@/data/curriculum";
import { getPlayerId, clearPlayer } from "@/lib/player";
import type { Player } from "@shared/schema";

function getLevelTitle(level: number) {
  if (level >= 10) return "Legendarny Arcymag";
  if (level >= 7)  return "Mistrz Zaklęć";
  if (level >= 5)  return "Starszy Adept";
  if (level >= 3)  return "Adept Pythona";
  if (level >= 2)  return "Nowicjusz";
  return "Uczony Czeladnik";
}

export default function Profile() {
  const [, navigate] = useLocation();
  const playerId = getPlayerId();
  const qc = useQueryClient();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const { data: player } = useQuery<Player>({
    queryKey: ["/api/players", playerId],
    queryFn: () => api.getPlayer(playerId!),
    enabled: !!playerId,
  });

  // Reset progress — clears server-side completed lessons and XP
  const resetProgress = useMutation({
    mutationFn: () =>
      api.updatePlayer(playerId!, {
        totalXp: 0,
        level: 1,
        streak: 0,
        completedLessons: "[]",
        lastActiveDate: null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/players"] });
      qc.invalidateQueries({ queryKey: ["/api/progress"] });
      setShowResetConfirm(false);
      setResetDone(true);
    },
  });

  // Full new game — wipes player identity too
  const handleNewGame = () => {
    clearPlayer();
    navigate("/");
    // Force a full reload so Home shows onboarding
    window.location.hash = "/";
    window.location.reload();
  };

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
        {/* Reset confirm dialog */}
        {showResetConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-dialog">
              <div className="confirm-icon">⚠️</div>
              <h3 className="confirm-title">Zresetować postęp?</h3>
              <p className="confirm-body">
                Twoje XP, poziom i ukończone sale zostaną wyzerowane. Postać pozostaje — tylko postęp nauki zniknie.
              </p>
              <div className="confirm-actions">
                <button
                  className="btn-danger"
                  onClick={() => resetProgress.mutate()}
                  disabled={resetProgress.isPending}
                  data-testid="button-confirm-reset"
                >
                  {resetProgress.isPending ? "Resetuję..." : "✗ Tak, zresetuj postęp"}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowResetConfirm(false)}
                  data-testid="button-cancel-reset"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        )}

        {resetDone && (
          <div className="reset-banner">
            ✓ Postęp zresetowany — zacznij od nowa, bohaterze!
          </div>
        )}

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

        {/* Danger zone */}
        <div className="section-title" style={{ marginTop: "var(--space-4)" }}>Zarządzanie postępem</div>
        <div className="danger-zone">
          <div className="danger-row">
            <div className="danger-info">
              <span className="danger-title">Resetuj postęp nauki</span>
              <span className="danger-desc">Wyzeruj XP i ukończone lekcje. Postać pozostaje.</span>
            </div>
            <button
              className="btn-danger-outline"
              onClick={() => { setResetDone(false); setShowResetConfirm(true); }}
              data-testid="button-reset-progress"
            >
              Resetuj
            </button>
          </div>
          <div className="danger-divider" />
          <div className="danger-row">
            <div className="danger-info">
              <span className="danger-title">Zacznij zupełnie od nowa</span>
              <span className="danger-desc">Usuwa postać i cały postęp. Wrócisz do ekranu tworzenia bohatera.</span>
            </div>
            <button
              className="btn-danger-outline"
              onClick={handleNewGame}
              data-testid="button-new-game"
            >
              Nowa gra
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
