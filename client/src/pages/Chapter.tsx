import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { curriculum } from "@/data/curriculum";
import { getPlayerId } from "@/lib/player";
import type { Player } from "@shared/schema";

export default function Chapter() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const [, navigate] = useLocation();
  const playerId = getPlayerId();

  const chapter = curriculum.find((c) => c.id === chapterId);

  const { data: player } = useQuery<Player>({
    queryKey: ["/api/players", playerId],
    queryFn: () => apiRequest("GET", `/api/players/${playerId}`),
    enabled: !!playerId,
  });

  if (!chapter) {
    return (
      <div className="error-screen">
        <p style={{ fontFamily: "var(--font-display)", color: "var(--color-text-muted)" }}>Sala lochu nie znaleziona.</p>
        <button onClick={() => navigate("/")} className="btn-primary">⚔ Wróć do mapy</button>
      </div>
    );
  }

  const completedIds: string[] = player ? JSON.parse(player.completedLessons || "[]") : [];
  const done = chapter.lessons.filter((l) => completedIds.includes(l.id)).length;
  const pct = chapter.lessons.length > 0 ? Math.round((done / chapter.lessons.length) * 100) : 0;

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="back-btn" onClick={() => navigate("/")} data-testid="button-back">← Mapa lochu</button>
        <span className="topbar-title">{chapter.icon} {chapter.title.split(' ')[0]}</span>
        <div style={{ width: 60 }} />
      </header>

      <main className="main-content">
        {/* Chapter hero */}
        <div
          className="chapter-hero"
          style={{ "--chapter-color": chapter.color } as any}
        >
          <div className="chapter-hero-icon">{chapter.icon}</div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xs)",
              color: chapter.color,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}>
              {chapter.level === "beginner" ? "Nowicjusz" : chapter.level === "intermediate" ? "Adept" : "Mistrz"}
            </div>
            <h2>{chapter.title}</h2>
            <p>{chapter.description}</p>
            <div style={{ marginTop: "var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <div style={{ flex: 1, height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: 0, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: chapter.color, boxShadow: `0 0 6px ${chapter.color}`, transition: "width 0.8s" }} />
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xs)", color: chapter.color, letterSpacing: "0.06em" }}>{done}/{chapter.lessons.length}</span>
            </div>
          </div>
        </div>

        <div className="section-title">Sale lochu</div>

        <div className="lessons-list">
          {chapter.lessons.map((lesson, idx) => {
            const isDone = completedIds.includes(lesson.id);
            const prevDone = idx === 0 || completedIds.includes(chapter.lessons[idx - 1].id);
            const locked = !prevDone && idx > 0;
            const lessonXp = lesson.questions.reduce((s, q) => s + q.xp, 0);

            return (
              <button
                key={lesson.id}
                className={`lesson-row ${isDone ? "done" : ""} ${locked ? "locked" : ""}`}
                onClick={() => !locked && navigate(`/lesson/${lesson.id}`)}
                disabled={locked}
                data-testid={`card-lesson-${lesson.id}`}
                style={{ "--chapter-color": chapter.color } as any}
              >
                <div className="lesson-row-icon">
                  {isDone ? "✅" : locked ? "🔒" : lesson.icon}
                </div>
                <div className="lesson-row-info">
                  <span className="lesson-row-title">{lesson.title}</span>
                  <span className="lesson-row-desc">
                    {isDone ? "Sala ukończona" : locked ? "Odblokuj poprzednią salę" : lesson.description}
                  </span>
                </div>
                <div className="lesson-row-meta">
                  <span className="lesson-xp">{lessonXp} XP</span>
                  {isDone && <span className="lesson-done-badge">✦</span>}
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
