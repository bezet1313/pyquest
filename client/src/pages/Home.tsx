import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { curriculum, getTotalLessons } from "@/data/curriculum";
import { getPlayerId, setPlayerId } from "@/lib/player";
import type { Player } from "@shared/schema";

// Class selection — each maps to avatar emoji + title
const CLASSES = [
  { emoji: "🧙", name: "Czarodziej" },
  { emoji: "⚔️", name: "Wojownik" },
  { emoji: "🏹", name: "Łucznik" },
  { emoji: "🛡️", name: "Paladyn" },
  { emoji: "🐉", name: "Nekromanta" },
  { emoji: "🗡️", name: "Łotrzyk" },
  { emoji: "🔮", name: "Mistyk" },
  { emoji: "🦅", name: "Ranger" },
];

// Dungeon SVG logo
function DungeonLogo({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} aria-label="PyQuest logo" fill="none">
      {/* Arch / dungeon gate */}
      <rect x="4" y="4" width="72" height="72" rx="4" fill="none" stroke="#2e1e24" strokeWidth="1"/>
      <path d="M20 60 L20 36 Q20 20 40 20 Q60 20 60 36 L60 60 Z" fill="#110d0f" stroke="#c9962a" strokeWidth="1.5"/>
      {/* Gate bars */}
      <line x1="32" y1="60" x2="32" y2="38" stroke="#6b2d3e" strokeWidth="1.5"/>
      <line x1="40" y1="60" x2="40" y2="34" stroke="#6b2d3e" strokeWidth="1.5"/>
      <line x1="48" y1="60" x2="48" y2="38" stroke="#6b2d3e" strokeWidth="1.5"/>
      <line x1="22" y1="46" x2="58" y2="46" stroke="#6b2d3e" strokeWidth="1"/>
      {/* Python snake eyes glow */}
      <circle cx="34" cy="44" r="2.5" fill="#c9962a" opacity="0.9"/>
      <circle cx="46" cy="44" r="2.5" fill="#c9962a" opacity="0.9"/>
      <circle cx="34" cy="44" r="1" fill="#ff8c00"/>
      <circle cx="46" cy="44" r="1" fill="#ff8c00"/>
      {/* Crown / gem top */}
      <path d="M30 20 L40 12 L50 20" fill="none" stroke="#c9962a" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="40" cy="12" r="2" fill="#7c3aed"/>
    </svg>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [playerId, setLocalPlayerId] = useState<number | null>(getPlayerId());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [selectedClass, setSelectedClass] = useState(0);

  const { data: player, isLoading } = useQuery<Player>({
    queryKey: ["/api/players", playerId],
    queryFn: () => apiRequest("GET", `/api/players/${playerId}`),
    enabled: !!playerId,
  });

  const createPlayer = useMutation({
    mutationFn: (data: { name: string; avatar: string }) =>
      apiRequest("POST", "/api/players", data),
    onSuccess: (p: Player) => {
      setPlayerId(p.id);
      setLocalPlayerId(p.id);
      setShowOnboarding(false);
      qc.invalidateQueries({ queryKey: ["/api/players"] });
    },
  });

  useEffect(() => {
    if (!playerId) setShowOnboarding(true);
  }, []);

  const completedIds: string[] = player ? JSON.parse(player.completedLessons || "[]") : [];
  const totalLessons = getTotalLessons();
  const progress = totalLessons > 0 ? Math.round((completedIds.length / totalLessons) * 100) : 0;

  // ── ONBOARDING ──
  if (showOnboarding || !playerId) {
    return (
      <div className="onboarding-overlay">
        <div className="onboarding-card">
          <div className="onboarding-logo">
            <DungeonLogo size={72} />
          </div>
          <div className="onboarding-eyebrow">✦ Nowa przygoda ✦</div>
          <h1>PyQuest</h1>
          <p>Wejdź do lochu i opanuj magię Pythona. Każda lekcja to potyczka z kodem, każda poprawna odpowiedź przybliża Cię do legendarnych zaklęć.</p>

          <div className="choose-class-label">⚔ Wybierz swoją klasę</div>
          <div className="avatar-grid">
            {CLASSES.map((cls, i) => (
              <button
                key={i}
                className={`avatar-btn ${selectedClass === i ? "selected" : ""}`}
                onClick={() => setSelectedClass(i)}
                title={cls.name}
                data-testid={`avatar-${i}`}
              >
                {cls.emoji}
              </button>
            ))}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-primary)", fontFamily: "var(--font-display)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Klasa: {CLASSES[selectedClass].name}
          </div>

          <input
            className="name-input"
            type="text"
            placeholder="Imię bohatera..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && playerName.trim())
                createPlayer.mutate({ name: playerName.trim(), avatar: CLASSES[selectedClass].emoji });
            }}
            data-testid="input-name"
          />
          <button
            className="btn-primary"
            disabled={!playerName.trim() || createPlayer.isPending}
            onClick={() =>
              createPlayer.mutate({ name: playerName.trim(), avatar: CLASSES[selectedClass].emoji })
            }
            data-testid="button-start"
          >
            {createPlayer.isPending ? "Wchodzę do lochu..." : "⚔ Wejdź do lochu"}
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="snake-loader">🔥</div>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xs)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Otwieramy bramy lochu...</p>
      </div>
    );
  }

  const levelMap: Record<string, string> = {
    beginner: "Nowicjusz",
    intermediate: "Adept",
    advanced: "Mistrz",
  };

  return (
    <div className="app-shell">
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-logo">
          <DungeonLogo size={28} />
          <span className="topbar-title">PyQuest</span>
        </div>
        <div className="topbar-stats">
          <div className="stat-chip xp-chip" data-testid="text-xp">
            <span>⚡</span>
            <span>{player?.totalXp ?? 0} XP</span>
          </div>
          <div className="stat-chip streak-chip" data-testid="text-streak">
            <span>🔥</span>
            <span>{player?.streak ?? 0}</span>
          </div>
          <button className="avatar-topbar" onClick={() => navigate("/profile")} data-testid="button-profile">
            {player?.avatar}
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* Hero */}
        <section className="hero-section">
          <div className="hero-text">
            <span className="hero-greeting">⚔ {player?.name} powraca</span>
            <h2 className="hero-title">Eksploruj Loch</h2>
            <p className="hero-sub">Poziom {player?.level} · {completedIds.length}/{totalLessons} skarbów zdobytych</p>
          </div>
          <div className="hero-progress-ring">
            <svg viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-border)" strokeWidth="5"/>
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke="var(--color-primary)" strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 34 * progress / 100} ${2 * Math.PI * 34}`}
                strokeLinecap="butt"
                transform="rotate(-90 40 40)"
                style={{ filter: "drop-shadow(0 0 4px var(--color-primary))" }}
              />
              <text x="40" y="38" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-primary)" fontFamily="var(--font-display)">{progress}%</text>
              <text x="40" y="52" textAnchor="middle" fontSize="8" fill="var(--color-text-muted)" fontFamily="var(--font-display)">UKOŃCZONO</text>
            </svg>
          </div>
        </section>

        {/* Chapters */}
        <div className="section-title">Poziomy lochu</div>
        <div className="chapters-grid">
          {curriculum.map((chapter) => {
            const chapterLessons = chapter.lessons.map((l) => l.id);
            const done = chapterLessons.filter((id) => completedIds.includes(id)).length;
            const pct = chapterLessons.length > 0 ? Math.round((done / chapterLessons.length) * 100) : 0;

            return (
              <button
                key={chapter.id}
                className="chapter-card"
                style={{ "--chapter-color": chapter.color, "--chapter-accent": chapter.accent } as any}
                onClick={() => navigate(`/chapter/${chapter.id}`)}
                data-testid={`card-chapter-${chapter.id}`}
              >
                <div className="chapter-icon">{chapter.icon}</div>
                <div className="chapter-info">
                  <div className="chapter-level-badge">{levelMap[chapter.level] ?? chapter.level}</div>
                  <h4 className="chapter-name">{chapter.title}</h4>
                  <p className="chapter-desc">{chapter.description}</p>
                  <div className="chapter-bar">
                    <div className="chapter-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="chapter-stats">{done}/{chapterLessons.length} sal · {pct}%</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="quick-actions">
          <button className="action-btn" onClick={() => navigate("/leaderboard")} data-testid="button-leaderboard">
            🏆 Tablica chwały
          </button>
          <button className="action-btn" onClick={() => navigate("/profile")} data-testid="button-profile-2">
            📜 Karta postaci
          </button>
        </div>
      </main>
    </div>
  );
}
