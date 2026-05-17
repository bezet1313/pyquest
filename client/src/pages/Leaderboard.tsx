import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getPlayerId } from "@/lib/player";
import type { Player } from "@shared/schema";

const RANKS = [
  { icon: "🏆", label: "Arcymag", color: "#c9962a" },
  { icon: "⚔️", label: "Rycerz",  color: "#9ca3af" },
  { icon: "🛡️", label: "Paladyn", color: "#cd7c2a" },
];

export default function Leaderboard() {
  const [, navigate] = useLocation();
  const playerId = getPlayerId();

  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
    queryFn: () => apiRequest("GET", "/api/players"),
  });

  const sorted = [...players].sort((a, b) => b.totalXp - a.totalXp);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="back-btn" onClick={() => navigate("/")} data-testid="button-back">← Odwrót</button>
        <span className="topbar-title">🏆 Tablica Chwały</span>
        <div style={{ width: 60 }} />
      </header>

      <main className="main-content">
        <div className="leaderboard-hero">
          <h2>Tablica Chwały</h2>
          <p>Bohaterowie z największą mocą arcańską</p>
        </div>

        {isLoading ? (
          <div className="loading-screen">
            <div className="snake-loader">🔥</div>
          </div>
        ) : sorted.length < 10 ? (
          <div className="empty-state" data-testid="leaderboard-hidden">
            <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚔️</p>
            <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Tablica czeka na bohaterów</p>
            <p style={{ color: "var(--color-muted, #9c8a8a)", fontSize: "0.9rem" }}>
              Tablica Chwały otwiera się gdy dotrze tu {10 - sorted.length} {10 - sorted.length === 1 ? "bohater" : "bohaterów"} więcej.
            </p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {sorted.map((p, idx) => {
              const isMe = p.id === playerId;
              const completedCount = JSON.parse(p.completedLessons || "[]").length;
              const rank = RANKS[idx];
              return (
                <div
                  key={p.id}
                  className={`leaderboard-row ${isMe ? "leaderboard-me" : ""}`}
                  data-testid={`row-player-${p.id}`}
                >
                  <span className="lb-rank" style={{ color: rank?.color }}>
                    {rank ? rank.icon : `#${idx + 1}`}
                  </span>
                  <span className="lb-avatar">{p.avatar}</span>
                  <div className="lb-info">
                    <span className="lb-name">
                      {p.name}
                      {isMe && <span className="lb-me-tag">Ty</span>}
                    </span>
                    <span className="lb-meta">Poziom {p.level} · {completedCount} sal odkrytych</span>
                  </div>
                  <div className="lb-xp">
                    <span className="lb-xp-val">⚡ {p.totalXp}</span>
                    <span className="lb-xp-label">XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
