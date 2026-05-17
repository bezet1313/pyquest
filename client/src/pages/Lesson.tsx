import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getLessonById } from "@/data/curriculum";
import { getPlayerId, setLastLesson, clearLastLesson } from "@/lib/player";
import type { Question } from "@/data/curriculum";

// ── Question components ──────────────────────────────────────────────

function QuizQuestion({ q, onAnswer }: { q: Question; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const check = (optId: string) => {
    if (revealed) return;
    setSelected(optId);
    setRevealed(true);
    const opt = q.options!.find((o) => o.id === optId);
    setTimeout(() => onAnswer(opt?.correct ?? false), 950);
  };

  return (
    <div className="question-body">
      <pre className="prompt-code">{q.prompt}</pre>
      <div className="options-grid">
        {q.options!.map((opt) => {
          let cls = "option-btn";
          if (revealed) {
            if (opt.correct) cls += " correct";
            else if (opt.id === selected) cls += " wrong";
          }
          return (
            <button key={opt.id} className={cls} onClick={() => check(opt.id)} data-testid={`option-${opt.id}`}>
              <span className="option-letter">{opt.id.toUpperCase()}</span>
              {opt.text}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className={`explanation ${q.options!.find((o) => o.id === selected)?.correct ? "exp-correct" : "exp-wrong"}`}>
          💡 {q.explanation}
        </div>
      )}
    </div>
  );
}

function FillQuestion({ q, onAnswer }: { q: Question; onAnswer: (correct: boolean) => void }) {
  const [value, setValue] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);
  const parts = q.fillTemplate!.split("_____");

  const check = () => {
    if (revealed) return;
    const isCorrect = q.correctFill!.some(
      (f) => f.toLowerCase().trim() === value.toLowerCase().trim()
    );
    setCorrect(isCorrect);
    setRevealed(true);
    setTimeout(() => onAnswer(isCorrect), 950);
  };

  return (
    <div className="question-body">
      <pre className="prompt-code">{q.prompt}</pre>
      <div className="fill-template">
        <code className="fill-code">
          {parts[0]}
          <input
            className={`fill-input ${revealed ? (correct ? "fill-correct" : "fill-wrong") : ""}`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            disabled={revealed}
            placeholder="???"
            autoFocus
            data-testid="input-fill"
          />
          {parts[1]}
        </code>
      </div>
      {!revealed && (
        <button className="btn-check" onClick={check} disabled={!value.trim()} data-testid="button-check">
          ✦ Rzuć zaklęcie
        </button>
      )}
      {revealed && (
        <div className={`explanation ${correct ? "exp-correct" : "exp-wrong"}`}>
          {correct ? "✦ Zaklęcie zadziałało!" : `✗ Właściwe zaklęcie: ${q.correctFill![0]}`}
          <br />💡 {q.explanation}
        </div>
      )}
    </div>
  );
}

function OrderQuestion({ q, onAnswer }: { q: Question; onAnswer: (correct: boolean) => void }) {
  const [items, setItems] = useState(() =>
    q.orderLines!.map((line, i) => ({ line, origIdx: i, id: i })).sort(() => Math.random() - 0.5)
  );
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const newItems = [...items];
    [newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]];
    setItems(newItems);
  };
  const moveDown = (idx: number) => {
    if (idx === items.length - 1) return;
    const newItems = [...items];
    [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
    setItems(newItems);
  };

  const check = () => {
    if (revealed) return;
    const userOrder = items.map((it) => it.origIdx);
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(q.correctOrder);
    setCorrect(isCorrect);
    setRevealed(true);
    setTimeout(() => onAnswer(isCorrect), 1200);
  };

  return (
    <div className="question-body">
      <pre className="prompt-code">{q.prompt}</pre>
      <div className="order-list">
        {items.map((item, idx) => (
          <div key={item.id} className={`order-item ${revealed ? (correct ? "correct" : "wrong") : ""}`}>
            <div className="order-arrows">
              <button onClick={() => moveUp(idx)} disabled={revealed || idx === 0} className="arrow-btn">▲</button>
              <button onClick={() => moveDown(idx)} disabled={revealed || idx === items.length - 1} className="arrow-btn">▼</button>
            </div>
            <code className="order-code">{item.line}</code>
          </div>
        ))}
      </div>
      {!revealed && (
        <button className="btn-check" onClick={check} data-testid="button-check-order">
          ✦ Ułóż zaklęcie
        </button>
      )}
      {revealed && (
        <div className={`explanation ${correct ? "exp-correct" : "exp-wrong"}`}>
          {correct ? "✦ Idealna kolejność zaklęć!" : "✗ Błędna kolejność — wróg kontratakuje!"}
          <br />💡 {q.explanation}
        </div>
      )}
    </div>
  );
}

function CodeQuestion({ q, onAnswer }: { q: Question; onAnswer: (correct: boolean) => void }) {
  const [code, setCode] = useState(q.codeTemplate || "");
  const [revealed, setRevealed] = useState(false);

  const check = () => {
    if (revealed) return;
    const hasExpected = code.toLowerCase().includes((q.expectedOutput || "print(").toLowerCase());
    setRevealed(true);
    setTimeout(() => onAnswer(hasExpected), 950);
  };

  return (
    <div className="question-body">
      <pre className="prompt-code">{q.prompt}</pre>
      <textarea
        className="code-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={6}
        spellCheck={false}
        disabled={revealed}
        data-testid="input-code"
      />
      <div className="hint-text">📜 Wskazówka: {q.hint || "Użyj print() do wyświetlenia wyniku"}</div>
      {!revealed && (
        <button className="btn-check" onClick={check} disabled={!code.trim()} data-testid="button-check-code">
          ✦ Rzuć kod
        </button>
      )}
      {revealed && (
        <div className="explanation exp-correct">
          ✦ Zaklęcie napisane! <br />💡 {q.explanation}
        </div>
      )}
    </div>
  );
}

// ── Main Lesson Page ─────────────────────────────────────────────────

const RESULT_MESSAGES = {
  great: ["Legendarny wyczyn!", "Smok pokonany!", "Arcymistrzowskie zaklęcie!", "Loch zdobyty!"],
  ok:    ["Niezły bój!", "Wróg osamotniony!", "Sala przeszukana!", "Awans odblokowany!"],
  bad:   ["Wycofaj się i spróbuj znów!", "Potwór przetrwał...", "Loch wygrywa tym razem!", "Trenuj dalej, wojowniku!"],
};

function randomMsg(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Lesson() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const playerId = getPlayerId();

  const found = getLessonById(lessonId ?? "");

  // Save last lesson on enter, clear on complete
  useEffect(() => {
    if (found) {
      setLastLesson(found.lesson.id, found.chapter.id);
    }
  }, [lessonId]);

  const [phase, setPhase] = useState<"theory" | "questions" | "complete">("theory");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [resultMsg, setResultMsg] = useState("");

  const saveProgress = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/progress", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/players"] });
      qc.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  if (!found) {
    return (
      <div className="error-screen">
        <p style={{ fontFamily: "var(--font-display)", color: "var(--color-text-muted)" }}>Sala lochu nie znaleziona.</p>
        <button onClick={() => navigate("/")} className="btn-primary">⚔ Wróć do mapy</button>
      </div>
    );
  }

  const { lesson, chapter } = found;
  const questions = lesson.questions;
  const totalXp = questions.reduce((s, q) => s + q.xp, 0);
  const earnedXp = questions.reduce((s, q, i) => s + (answers[i] ? q.xp : 0), 0);

  const handleAnswer = (correct: boolean) => {
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);

    if (questionIdx < questions.length - 1) {
      setTimeout(() => setQuestionIdx((i) => i + 1), 450);
    } else {
      const finalScore = Math.round((newAnswers.filter(Boolean).length / questions.length) * 100);
      const msg =
        finalScore >= 80
          ? randomMsg(RESULT_MESSAGES.great)
          : finalScore >= 50
          ? randomMsg(RESULT_MESSAGES.ok)
          : randomMsg(RESULT_MESSAGES.bad);

      setTimeout(() => {
        setScore(finalScore);
        setResultMsg(msg);
        setPhase("complete");
        clearLastLesson(); // lesson done — clear resume pointer
        if (playerId) {
          saveProgress.mutate({
            playerId,
            lessonId: lesson.id,
            chapterId: chapter.id,
            score: finalScore,
            maxScore: 100,
            attempts: 1,
            completed: true,
            completedAt: new Date().toISOString(),
          });
        }
      }, 600);
    }
  };

  const q = questions[questionIdx];

  const TYPE_LABEL: Record<string, string> = {
    quiz:  "⚔ Walka — wybierz cel",
    fill:  "📜 Runy — uzupełnij zaklęcie",
    order: "🗺 Mapa — ułóż ścieżkę",
    code:  "🔮 Kuźnia — wykuj kod",
  };

  return (
    <div className="app-shell lesson-shell">
      <header className="topbar">
        <button className="back-btn" onClick={() => navigate(`/chapter/${chapter.id}`)} data-testid="button-back">
          ← Odwrót
        </button>
        <span className="topbar-title">{lesson.icon} {lesson.title}</span>
        <div className="xp-badge">{totalXp} XP</div>
      </header>

      <main className="lesson-main">
        {/* ── THEORY ── */}
        {phase === "theory" && (
          <div className="theory-card">
            <div className="theory-header" style={{ background: `linear-gradient(135deg, ${chapter.color}18, transparent)` }}>
              <span className="theory-icon">{lesson.icon}</span>
              <div>
                <div className="theory-chapter">{chapter.title}</div>
                <h2>{lesson.title}</h2>
              </div>
            </div>
            <div className="theory-body">
              <div
                className="theory-text"
                dangerouslySetInnerHTML={{
                  __html: lesson.theory
                    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                    .replace(/`([^`]+)`/g, '<code style="font-family:var(--font-mono);font-size:0.9em;color:var(--color-poison-light);background:rgba(22,163,74,0.08);padding:1px 5px;border-radius:2px;">$1</code>')
                    .replace(/\n/g, "<br/>"),
                }}
              />
              {lesson.codeExample && (
                <div className="theory-code-block">
                  <div className="code-label">📜 Zwój z przykładem</div>
                  <pre className="theory-pre"><code>{lesson.codeExample}</code></pre>
                </div>
              )}
            </div>
            <div className="theory-footer">
              <p className="theory-questions-info">⚔ {questions.length} potyczek · {totalXp} XP w puli</p>
              <button className="btn-primary" onClick={() => setPhase("questions")} data-testid="button-start-questions">
                Do walki! ⚔
              </button>
            </div>
          </div>
        )}

        {/* ── QUESTIONS ── */}
        {phase === "questions" && (
          <div className="question-card">
            <div className="question-header">
              <div className="q-progress-bar">
                <div
                  className="q-progress-fill"
                  style={{
                    width: `${(questionIdx / questions.length) * 100}%`,
                    background: chapter.color,
                  }}
                />
              </div>
              <div className="q-counter">
                <span>Potyczka {questionIdx + 1} / {questions.length}</span>
                <span className="q-xp">+{q.xp} XP</span>
              </div>
            </div>

            <div
              className="question-type-badge"
              style={{ color: chapter.color, borderColor: `${chapter.color}55` }}
            >
              {TYPE_LABEL[q.type] ?? q.type}
            </div>

            {q.type === "quiz"  && <QuizQuestion  key={q.id} q={q} onAnswer={handleAnswer} />}
            {q.type === "fill"  && <FillQuestion  key={q.id} q={q} onAnswer={handleAnswer} />}
            {q.type === "order" && <OrderQuestion key={q.id} q={q} onAnswer={handleAnswer} />}
            {q.type === "code"  && <CodeQuestion  key={q.id} q={q} onAnswer={handleAnswer} />}
          </div>
        )}

        {/* ── COMPLETE ── */}
        {phase === "complete" && (
          <div className="complete-card">
            <div className="complete-stars">
              {score >= 80 ? "⭐⭐⭐" : score >= 50 ? "⭐⭐" : "⭐"}
            </div>
            <h2 className="complete-title">{resultMsg}</h2>
            <div className="complete-score-circle" style={{ borderColor: chapter.color }}>
              <span className="complete-pct" style={{ color: chapter.color }}>{score}%</span>
              <span className="complete-pct-label">sukces</span>
            </div>
            <div className="complete-stats">
              <div className="stat-row">
                <span>Zdobyte XP</span>
                <strong style={{ color: "var(--color-arcane-light)", fontFamily: "var(--font-display)" }}>+{earnedXp} XP</strong>
              </div>
              <div className="stat-row">
                <span>Trafienia</span>
                <strong style={{ fontFamily: "var(--font-display)" }}>{answers.filter(Boolean).length}/{questions.length}</strong>
              </div>
              <div className="stat-row">
                <span>Sala</span>
                <strong style={{ fontFamily: "var(--font-display)", color: chapter.color }}>{chapter.title}</strong>
              </div>
            </div>
            <div className="complete-actions">
              <button
                className="btn-secondary"
                onClick={() => { setPhase("theory"); setQuestionIdx(0); setAnswers([]); setScore(0); }}
                data-testid="button-retry"
              >
                🔄 Ponów walkę
              </button>
              <button className="btn-primary" onClick={() => navigate(`/chapter/${chapter.id}`)} data-testid="button-next">
                Dalej ⚔
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
