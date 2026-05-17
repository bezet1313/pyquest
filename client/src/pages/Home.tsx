import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { curriculum, getTotalLessons, getLessonById } from "@/data/curriculum";
import { getPlayerId, setPlayerId, clearPlayer, getLastLesson, clearLastLesson } from "@/lib/player";
import type { Player } from "@shared/schema";

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

function DungeonLogo({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} aria-label="PyQuest logo" fill="none">
      <rect x="4" y="4" width="72" height="72" rx="4" fill="none" stroke="#2e1e24" strokeWidth="1" />
      <path d="M20 60 L20 36 Q20 20 40 20 Q60 20 60 36 L60 60 Z" fill="#110d0f" stroke="#c9962a" strokeWidth="1.5" />
      <line x1="32" y1="60" x2="32" y2="38" stroke="#6b2d3e" strokeWidth="1.5" />
      <line x1="40" y1="60" x2="40" y2="34" stroke="#6b2d3e" strokeWidth="1.5" />
      <line x1="48" y1="60" x2="48" y2="38" stroke="#6b2d3e" strokeWidth="1.5" />
      <line x1="22" y1="46" x2="58" y2="46" stroke="#6b2d3e" strokeWidth="1" />
      <circle cx="34" cy="44" r="2.5" fill="#c9962a" opacity="0.9" />
      <circle cx="46" cy="44" r="2.5" fill="#c9962a" opacity="0.9" />
      <circle cx="34" cy="44" r="1" fill="#ff8c00" />
      <circle cx="46" cy="44" r="1" fill="#ff8c00" />
      <path d="M30 20 L40 12 L50 20" fill="none" stroke="#c9962a" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="40" cy="12" r="2" fill="#7c3aed" />
    </svg>
  );
}

type Screen = "loading" | "resume" | "onboarding" | "home";

export default function Home() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const [screen, setScreen] = useState<Screen>("loading");
  const [playerId, setLocalPlayerId] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [selectedClass, setSelectedClass] = useState(0);

  // Detect saved session on mount
  useEffect(() => {
    const saved = getPlayerId();
    if (saved) {
      setLocalPlayerId(saved);
      setScreen("resume");
    } else {
      setScreen("onboarding");
    }
  }, []);

  const { data: player, isLoading: playerLoading } = useQuery<Player>({
    queryKey: ["/api/players", playerId],
    queryFn: () => api.getPlayer(playerId!),
    enabled: !!playerId && screen !== "onboarding",
  });

  // Once player loads after resume, go to home
  useEffect(() => {
    if (screen === "resume" && player) {
      setScreen("home");
    }
    // If player not found (e.g. DB reset), fall back to onboarding
    if (screen === "resume" && !playerLoading && !player && playerId) {
      clearPlayer();
      setLocalPlayerId(null);
      setScreen("onboarding");
    }
  }, [player, playerLoading, screen]);

  const createPlayer = useMutation({
    mutationFn: (data: { name: string; avatar: string }) => api.createPlayer(data),
    onSuccess: (p: Player) => {
      setPlayerId(p.id);
      setLocalPlayerId(p.id);
      clearLastLesson();
      qc.invalidateQueries({ queryKey: ["/api/players"] });
      setScreen("home");
    },
  });

  const handleNewGame = () => {
    clearPlayer();
    setLocalPlayerId(null);
    setPlayerName("");
    setSelectedClass(0);
    setScreen("onboarding");
  };

  const lastLesson = getLastLesson();
  const completedIds: string[] = player ? JSON.parse(player.completedLessons || "[]") : [];
  const totalLessons = getTotalLessons();
  const progress = totalLessons > 0 ? Math.round((completedIds.length / totalLessons) * 100) : 0;

  // ── INITIAL LOADING ──────────────────────────────────────────────
  if (screen === "loading") {
    return (
      <div className="loading-screen">
        <div className="snake-loader">🔥</div>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xs)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Otwieramy bramy lochu...
        </p>
      </div>
    );
  }

  // ── RESUME SCREEN ────────────────────────────────────────────────
  if (screen === "resume") {
    return (
      <div className="onboarding-overlay">
        <div className="onboarding-card">
          <div className="onboarding-logo"><DungeonLogo size={64} /></div>
          <div className="onboarding-eyebrow">✦ Witaj ponownie ✦</div>
          <h1>PyQuest</h1>

          {playerLoading ? (
            <div style={{ color: "var(--color-text-muted)", fontStyle: "italic", fontSize: "var(--text-sm)" }}>
              <div className="snake-loader" style={{ fontSize: "1.5rem" }}>🔥</div>
              Ładuję Twoją postać...
            </div>
          ) : player ? (
            <>
              {/* Player summary */}
              <div className="resume-card">
                <div className="resume-avatar">{player.avatar}</div>
                <div className="resume-info">
                  <div className="resume-name">{player.name}</div>
                  <div className="resume-meta">Poziom {player.level} · {player.totalXp} XP</div>
                  <div className="resume-progress-bar">
                    <div className="resume-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="resume-meta">{completedIds.length}/{totalLessons} sal ukończonych</div>
                </div>
              </div>

              {/* Last lesson shortcut */}
              {lastLesson && (() => {
                const found = getLessonById(lastLesson.lessonId);
                return found ? (
                  <div className="last-lesson-hint">
                    <span>📍 Ostatnia sala:</span>
                    <strong>{found.lesson.icon} {found.lesson.title}</strong>
                  </div>
                ) : null;
              })()}

              <div className="resume-actions">
                {lastLesson ? (
                  <button
                    className="btn-primary"
                    onClick={() => navigate(`/lesson/${lastLesson.lessonId}`)}
                    data-testid="button-resume-lesson"
                  >
                    ⚔ Wznów ostatnią salę
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={() => setScreen("home")}
                    data-testid="button-continue"
                  >
                    ⚔ Kontynuuj przygodę
                  </button>
                )}
                <button
                  className="btn-primary"
                  onClick={() => setScreen("home")}
                  style={{ background: "rgba(201,150,42,0.1)", border: "1px solid rgba(201,150,42,0.3)", color: "var(--color-primary)", boxShadow: "none" }}
                  data-testid="button-go-home"
                >
                  🗺 Mapa lochu
                </button>
                <button
                  className="btn-new-game"
                  onClick={handleNewGame}
                  data-testid="button-new-game"
                >
                  ↺ Zacznij od początku
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  // ── ONBOARDING ───────────────────────────────────────────────────
  if (screen === "onboarding") {
    return (
      <div className="onboarding-overlay">
        <div className="onboarding-card">
          <div className="onboarding-logo"><DungeonLogo size={72} /></div>
          <div className="onboarding-eyebrow">✦ Nowa przygoda ✦</div>
          <h1>PyQuest</h1>
          <p>Wejdź do lochu i opanuj magię Pythona. Każda lekcja to potyczka z kodem.</p>

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
            onKeyDown={(e) => { if (e.key === "Enter" && playerName.trim()) createPlayer.mutate({ name: playerName.trim(), avatar: CLASSES[selectedClass].emoji }); }}
            data-testid="input-name"
            autoFocus
          />
          <button
            className="btn-primary"
            disabled={!playerName.trim() || createPlayer.isPending}
            onClick={() => createPlayer.mutate({ name: playerName.trim(), avatar: CLASSES[selectedClass].emoji })}
            data-testid="button-start"
          >
            {createPlayer.isPending ? "Wchodzę do lochu..." : "⚔ Wejdź do lochu"}
          </button>
        </div>
      </div>
    );
  }

  // ── HOME ─────────────────────────────────────────────────────────
  const levelMap: Record<string, string> = { beginner: "Nowicjusz", intermediate: "Adept", advanced: "Mistrz" };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-logo">
          <DungeonLogo size={28} />
          <span className="topbar-title">PyQuest</span>
        </div>
        <div className="topbar-stats">
          <div className="stat-chip xp-chip" data-testid="text-xp"><span>⚡</span><span>{player?.totalXp ?? 0} XP</span></div>
          <div className="stat-chip streak-chip" data-testid="text-streak"><span>🔥</span><span>{player?.streak ?? 0}</span></div>
          <button className="avatar-topbar" onClick={() => navigate("/profile")} data-testid="button-profile">{player?.avatar}</button>
        </div>
      </header>

      <main className="main-content">
        {/* Resume banner if there's a last lesson */}
        {lastLesson && (() => {
          const found = getLessonById(lastLesson.lessonId);
          return found ? (
            <div className="resume-banner" onClick={() => navigate(`/lesson/${lastLesson.lessonId}`)} role="button" data-testid="banner-resume">
              <span className="resume-banner-icon">📍</span>
              <div className="resume-banner-text">
                <span className="resume-banner-label">Kontynuuj gdzie skończyłeś</span>
                <span className="resume-banner-lesson">{found.lesson.icon} {found.lesson.title} — {found.chapter.title}</span>
              </div>
              <span className="resume-banner-arrow">→</span>
            </div>
          ) : null;
        })()}

        <section className="hero-section">
          <div className="hero-text">
            <span className="hero-greeting">⚔ {player?.name} powraca</span>
            <h2 className="hero-title">Eksploruj Loch</h2>
            <p className="hero-sub">Poziom {player?.level} · {completedIds.length}/{totalLessons} skarbów zdobytych</p>
          </div>
          <div className="hero-progress-ring">
            <svg viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-border)" strokeWidth="5" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-primary)" strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 34 * progress / 100} ${2 * Math.PI * 34}`}
                strokeLinecap="butt" transform="rotate(-90 40 40)"
                style={{ filter: "drop-shadow(0 0 4px var(--color-primary))" }}
              />
              <text x="40" y="38" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-primary)" fontFamily="var(--font-display)">{progress}%</text>
              <text x="40" y="52" textAnchor="middle" fontSize="8" fill="var(--color-text-muted)" fontFamily="var(--font-display)">UKOŃCZONO</text>
            </svg>
          </div>
        </section>

        <div className="section-title">Poziomy lochu</div>
        <div className="chapters-grid">
          {curriculum.map((chapter) => {
            const chapterLessons = chapter.lessons.map((l) => l.id);
            const done = chapterLessons.filter((id) => completedIds.includes(id)).length;
            const pct = chapterLessons.length > 0 ? Math.round((done / chapterLessons.length) * 100) : 0;
            return (
              <button key={chapter.id} className="chapter-card"
                style={{ "--chapter-color": chapter.color, "--chapter-accent": chapter.accent } as any}
                onClick={() => navigate(`/chapter/${chapter.id}`)} data-testid={`card-chapter-${chapter.id}`}>
                <div className="chapter-icon">{chapter.icon}</div>
                <div className="chapter-info">
                  <div className="chapter-level-badge">{levelMap[chapter.level] ?? chapter.level}</div>
                  <h4 className="chapter-name">{chapter.title}</h4>
                  <p className="chapter-desc">{chapter.description}</p>
                  <div className="chapter-bar"><div className="chapter-bar-fill" style={{ width: `${pct}%` }} /></div>
                  <span className="chapter-stats">{done}/{chapterLessons.length} sal · {pct}%</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="quick-actions">
          <button className="action-btn" onClick={() => navigate("/leaderboard")} data-testid="button-leaderboard">🏆 Tablica chwały</button>
          <button className="action-btn" onClick={() => navigate("/profile")} data-testid="button-profile-2">📜 Karta postaci</button>
        </div>
      </main>
    </div>
  );
}
