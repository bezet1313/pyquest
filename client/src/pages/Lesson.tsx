import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getLessonById } from "@/data/curriculum";
import { getPlayerId, setLastLesson, clearLastLesson, recordLessonCompleted, incrementDailyCount, getStreak, isStreakAtRisk } from "@/lib/player";
import type { Question } from "@/data/curriculum";

const MAX_HP = 3;

// ── Question components ──────────────────────────────────────────────

function QuizQuestion({
  q,
  onAnswer,
}: {
  q: Question;
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showXpFloat, setShowXpFloat] = useState(false);
  const [shake, setShake] = useState(false);

  const check = (optId: string) => {
    if (revealed) return;
    setSelected(optId);
    setRevealed(true);
    const opt = q.options!.find((o) => o.id === optId);
    const correct = opt?.correct ?? false;
    if (correct) {
      setShowXpFloat(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
    setTimeout(() => onAnswer(correct), correct ? 800 : 1600);
  };

  return (
    <div className={`question-body${shake ? " wrong-shake" : ""}`} style={{ position: "relative" }}>
      {showXpFloat && (
        <div className="xp-float" style={{ top: 0, right: 8 }}>+{q.xp} XP</div>
      )}
      <pre className="prompt-code">{q.prompt}</pre>
      <div className="options-grid">
        {q.options!.map((opt) => {
          let cls = "option-btn";
          if (revealed) {
            if (opt.correct) cls += " correct";
            else if (opt.id === selected) cls += " wrong";
          }
          return (
            <button
              key={opt.id}
              className={cls}
              onClick={() => check(opt.id)}
              data-testid={`option-${opt.id}`}
            >
              <span className="option-letter">{opt.id.toUpperCase()}</span>
              {opt.text}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div
          className={`explanation ${
            q.options!.find((o) => o.id === selected)?.correct
              ? "exp-correct"
              : "exp-wrong"
          }`}
        >
          {q.options!.find((o) => o.id === selected)?.correct
            ? "✦ Cel trafiony!"
            : `✗ Poprawna odpowiedź: ${q.options!.find((o) => o.correct)?.text}`}
          <br />
          💡 {q.explanation}
        </div>
      )}
    </div>
  );
}

function FillQuestion({
  q,
  onAnswer,
}: {
  q: Question;
  onAnswer: (correct: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showXpFloat, setShowXpFloat] = useState(false);
  const [shake, setShake] = useState(false);
  const parts = q.fillTemplate!.split("_____");

  const check = () => {
    if (revealed) return;
    const isCorrect = q.correctFill!.some(
      (f) => f.toLowerCase().trim() === value.toLowerCase().trim()
    );
    setCorrect(isCorrect);
    setRevealed(true);
    if (isCorrect) {
      setShowXpFloat(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
    setTimeout(() => onAnswer(isCorrect), isCorrect ? 800 : 1600);
  };

  return (
    <div className={`question-body${shake ? " wrong-shake" : ""}`} style={{ position: "relative" }}>
      {showXpFloat && (
        <div className="xp-float" style={{ top: 0, right: 8 }}>+{q.xp} XP</div>
      )}
      <pre className="prompt-code">{q.prompt}</pre>
      <div className="fill-template">
        <code className="fill-code">
          {parts[0]}
          <input
            className={`fill-input ${
              revealed ? (correct ? "fill-correct" : "fill-wrong") : ""
            }`}
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
        <button
          className="btn-check"
          onClick={check}
          disabled={!value.trim()}
          data-testid="button-check"
        >
          ✦ Rzuć zaklęcie
        </button>
      )}
      {revealed && (
        <div className={`explanation ${correct ? "exp-correct" : "exp-wrong"}`}>
          {correct
            ? "✦ Zaklęcie zadziałało!"
            : `✗ Właściwe zaklęcie: ${q.correctFill![0]}`}
          <br />
          💡 {q.explanation}
        </div>
      )}
    </div>
  );
}

function OrderQuestion({
  q,
  onAnswer,
}: {
  q: Question;
  onAnswer: (correct: boolean) => void;
}) {
  const [items, setItems] = useState(() =>
    q
      .orderLines!.map((line, i) => ({ line, origIdx: i, id: i }))
      .sort(() => Math.random() - 0.5)
  );
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showXpFloat, setShowXpFloat] = useState(false);
  const [shake, setShake] = useState(false);

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
    const isCorrect =
      JSON.stringify(userOrder) === JSON.stringify(q.correctOrder);
    setCorrect(isCorrect);
    setRevealed(true);
    if (isCorrect) {
      setShowXpFloat(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
    setTimeout(() => onAnswer(isCorrect), isCorrect ? 800 : 1600);
  };

  return (
    <div className={`question-body${shake ? " wrong-shake" : ""}`} style={{ position: "relative" }}>
      {showXpFloat && (
        <div className="xp-float" style={{ top: 0, right: 8 }}>+{q.xp} XP</div>
      )}
      <pre className="prompt-code">{q.prompt}</pre>
      <div className="order-list">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`order-item ${
              revealed ? (correct ? "correct" : "wrong") : ""
            }`}
          >
            <div className="order-arrows">
              <button
                onClick={() => moveUp(idx)}
                disabled={revealed || idx === 0}
                className="arrow-btn"
              >
                ▲
              </button>
              <button
                onClick={() => moveDown(idx)}
                disabled={revealed || idx === items.length - 1}
                className="arrow-btn"
              >
                ▼
              </button>
            </div>
            <code className="order-code">{item.line}</code>
          </div>
        ))}
      </div>
      {!revealed && (
        <button
          className="btn-check"
          onClick={check}
          data-testid="button-check-order"
        >
          ✦ Ułóż zaklęcie
        </button>
      )}
      {revealed && (
        <div className={`explanation ${correct ? "exp-correct" : "exp-wrong"}`}>
          {correct
            ? "✦ Idealna kolejność zaklęć!"
            : "✗ Błędna kolejność — wróg kontratakuje!"}
          <br />
          💡 {q.explanation}
        </div>
      )}
    </div>
  );
}

function CodeQuestion({
  q,
  onAnswer,
}: {
  q: Question;
  onAnswer: (correct: boolean) => void;
}) {
  const [code, setCode] = useState(q.codeTemplate || "");
  const [revealed, setRevealed] = useState(false);
  const [showXpFloat, setShowXpFloat] = useState(false);

  const check = () => {
    if (revealed) return;
    const hasExpected = code
      .toLowerCase()
      .includes((q.expectedOutput || "print(").toLowerCase());
    setRevealed(true);
    if (hasExpected) setShowXpFloat(true);
    setTimeout(() => onAnswer(hasExpected), hasExpected ? 800 : 1600);
  };

  return (
    <div className="question-body" style={{ position: "relative" }}>
      {showXpFloat && (
        <div className="xp-float" style={{ top: 0, right: 8 }}>+{q.xp} XP</div>
      )}
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
      <div className="hint-text">
        📜 Wskazówka: {q.hint || "Użyj print() do wyświetlenia wyniku"}
      </div>
      {!revealed && (
        <button
          className="btn-check"
          onClick={check}
          disabled={!code.trim()}
          data-testid="button-check-code"
        >
          ✦ Rzuć kod
        </button>
      )}
      {revealed && (
        <div className="explanation exp-correct">
          ✦ Zaklęcie napisane! <br />
          💡 {q.explanation}
        </div>
      )}
    </div>
  );
}

// ── HP Hearts ────────────────────────────────────────────────────────

function HpBar({ hp, max }: { hp: number; max: number }) {
  return (
    <div className="hp-bar" aria-label={`HP: ${hp} z ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`hp-heart${i >= hp ? " lost" : ""}`}>
          ❤
        </span>
      ))}
    </div>
  );
}

// ── Main Lesson Page ─────────────────────────────────────────────────

const RESULT_MESSAGES = {
  great: ["Legendarny wyczyn!", "Smok pokonany!", "Arcymistrzowskie zaklęcie!", "Loch zdobyty!"],
  ok: ["Niezły bój!", "Wróg osamotniony!", "Sala przeszukana!", "Awans odblokowany!"],
  bad: ["Wycofaj się i spróbuj znów!", "Potwór przetrwał...", "Loch wygrywa tym razem!", "Trenuj dalej, wojowniku!"],
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

  useEffect(() => {
    if (found) {
      setLastLesson(found.lesson.id, found.chapter.id);
    }
  }, [lessonId]);

  type Phase = "theory" | "questions" | "complete" | "fail";

  const [phase, setPhase] = useState<Phase>("theory");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [resultMsg, setResultMsg] = useState("");
  const [hp, setHp] = useState(MAX_HP);
  const [fromRetry, setFromRetry] = useState(false);
  const [localStreak, setLocalStreak] = useState(getStreak);
  const [streakAtRisk] = useState(isStreakAtRisk);

  // animated XP counter on complete screen
  const [displayXp, setDisplayXp] = useState(0);
  const xpAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        <p style={{ fontFamily: "var(--font-display)", color: "var(--color-text-muted)" }}>
          Sala lochu nie znaleziona.
        </p>
        <button onClick={() => navigate("/")} className="btn-primary">
          ⚔ Wróć do mapy
        </button>
      </div>
    );
  }

  const { lesson, chapter } = found;
  const questions = lesson.questions;
  const totalXp = questions.reduce((s, q) => s + q.xp, 0);
  const earnedXp = questions.reduce((s, q, i) => s + (answers[i] ? q.xp : 0), 0);

  // perfect bonus: +25% if all correct
  const perfectBonus =
    answers.length === questions.length && answers.every(Boolean)
      ? Math.round(earnedXp * 0.25)
      : 0;

  const handleAnswer = (correct: boolean) => {
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);

    // HP deduction on wrong answer
    const newHp = correct ? hp : hp - 1;
    if (!correct) setHp(newHp);

    // Fail when HP reaches 0
    if (!correct && newHp <= 0) {
      setTimeout(() => setPhase("fail"), 600);
      return;
    }

    if (questionIdx < questions.length - 1) {
      setTimeout(() => setQuestionIdx((i) => i + 1), 450);
    } else {
      const finalScore = Math.round(
        (newAnswers.filter(Boolean).length / questions.length) * 100
      );

      // "Almost!" message for 1 mistake at ≥66%
      let msg: string;
      const wrongCount = newAnswers.filter((a) => !a).length;
      if (finalScore >= 66 && finalScore < 80 && wrongCount === 1) {
        msg = "Prawie! 1 błąd cię pokonał";
      } else {
        msg =
          finalScore >= 80
            ? randomMsg(RESULT_MESSAGES.great)
            : finalScore >= 50
            ? randomMsg(RESULT_MESSAGES.ok)
            : randomMsg(RESULT_MESSAGES.bad);
      }

      setTimeout(() => {
        setScore(finalScore);
        setResultMsg(msg);
        setPhase("complete");
        clearLastLesson();
        // Record streak + daily goal
        const newStreak = recordLessonCompleted();
        setLocalStreak(newStreak);
        incrementDailyCount();
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

  // Animate XP count-up when entering complete screen
  useEffect(() => {
    if (phase !== "complete") return;
    const target = earnedXp + perfectBonus;
    if (target === 0) return;
    let cur = 0;
    const step = target / 20;
    xpAnimRef.current = setInterval(() => {
      cur = Math.min(cur + step, target);
      setDisplayXp(Math.round(cur));
      if (cur >= target) clearInterval(xpAnimRef.current!);
    }, 20);
    return () => {
      if (xpAnimRef.current) clearInterval(xpAnimRef.current);
    };
  }, [phase]);

  // Reset all state for retry (from either complete or fail screen)
  const doRetry = () => {
    setPhase("questions");
    setQuestionIdx(0);
    setAnswers([]);
    setScore(0);
    setHp(MAX_HP);
    setDisplayXp(0);
    setFromRetry(true);
  };

  // Navigate directly to next lesson in chapter
  const goNext = () => {
    const currentIdx = chapter.lessons.findIndex((l) => l.id === lesson.id);
    const nextLesson = chapter.lessons[currentIdx + 1];
    if (nextLesson) {
      navigate(`/lesson/${nextLesson.id}`);
    } else {
      navigate(`/chapter/${chapter.id}`);
    }
  };

  const isLastInChapter =
    chapter.lessons[chapter.lessons.length - 1]?.id === lesson.id;

  const q = questions[questionIdx];

  const TYPE_LABEL: Record<string, string> = {
    quiz: "⚔ Walka — wybierz cel",
    fill: "📜 Runy — uzupełnij zaklęcie",
    order: "🗺 Mapa — ułóż ścieżkę",
    code: "🔮 Kuźnia — wykuj kod",
  };

  return (
    <div className="app-shell lesson-shell">
      <header className="topbar">
        <button
          className="back-btn"
          onClick={() => navigate(`/chapter/${chapter.id}`)}
          data-testid="button-back"
        >
          ← Odwrót
        </button>
        <span className="topbar-title">
          {lesson.icon} {lesson.title}
        </span>
        <div className="xp-badge">{totalXp} XP</div>
      </header>

      <main className="lesson-main">
        {/* ── THEORY ── */}
        {phase === "theory" && (
          <div className="theory-card">
            <div
              className="theory-header"
              style={{
                background: `linear-gradient(135deg, ${chapter.color}18, transparent)`,
              }}
            >
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
                    .replace(
                      /`([^`]+)`/g,
                      '<code style="font-family:var(--font-mono);font-size:0.9em;color:var(--color-poison-light);background:rgba(22,163,74,0.08);padding:1px 5px;border-radius:2px;">$1</code>'
                    )
                    .replace(/\n/g, "<br/>"),
                }}
              />
              {lesson.codeExample && (
                <div className="theory-code-block">
                  <div className="code-label">📜 Zwój z przykładem</div>
                  <pre className="theory-pre">
                    <code>{lesson.codeExample}</code>
                  </pre>
                </div>
              )}
            </div>
            <div className="theory-footer">
              <p className="theory-questions-info">
                ⚔ {questions.length} potyczek · ok. {Math.ceil(questions.length * 0.5)} min · {totalXp} XP
              </p>
              {fromRetry && (
                <button
                  className="btn-secondary"
                  style={{ marginBottom: 8 }}
                  onClick={() => {
                    setPhase("questions");
                    setQuestionIdx(0);
                    setAnswers([]);
                    setHp(MAX_HP);
                  }}
                  data-testid="button-skip-theory"
                >
                  Pomiń teorię →
                </button>
              )}
              <button
                className="btn-primary"
                onClick={() => setPhase("questions")}
                data-testid="button-start-questions"
              >
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
                  className={`q-progress-fill${
                    questionIdx === questions.length - 1 ? " progress-pulse" : ""
                  }`}
                  style={{
                    width: `${((questionIdx + 1) / questions.length) * 100}%`,
                    background: chapter.color,
                  }}
                />
              </div>
              <div className="q-counter">
                <HpBar hp={hp} max={MAX_HP} />
                <span className="q-xp">
                  {earnedXp}/{totalXp} XP
                </span>
              </div>
            </div>

            <div
              className="question-type-badge"
              style={{ color: chapter.color, borderColor: `${chapter.color}55` }}
            >
              {TYPE_LABEL[q.type] ?? q.type}
            </div>

            {q.type === "quiz" && (
              <QuizQuestion key={q.id} q={q} onAnswer={handleAnswer} />
            )}
            {q.type === "fill" && (
              <FillQuestion key={q.id} q={q} onAnswer={handleAnswer} />
            )}
            {q.type === "order" && (
              <OrderQuestion key={q.id} q={q} onAnswer={handleAnswer} />
            )}
            {q.type === "code" && (
              <CodeQuestion key={q.id} q={q} onAnswer={handleAnswer} />
            )}
          </div>
        )}

        {/* ── FAIL ── */}
        {phase === "fail" && (
          <div className="fail-card">
            <div className="fail-icon">💀</div>
            <h2 className="fail-title">Poległeś w boju</h2>
            <p className="fail-subtitle">
              {randomMsg(RESULT_MESSAGES.bad)}
            </p>

            {/* Streak warning */}
            {streakAtRisk && localStreak > 0 ? (
              <div className="streak-warning" data-testid="streak-warning">
                🔥 Twoja passa {localStreak} {localStreak === 1 ? "dnia" : "dni"} jest zagrożona!
              </div>
            ) : (
              <div className="streak-warning" data-testid="streak-warning">
                Sprawdź błędy i spróbuj ponownie
              </div>
            )}

            {/* Wrong questions list */}
            {answers.some((a) => !a) && (
              <div className="fail-wrong-list">
                <div className="fail-wrong-title">Błędne odpowiedzi:</div>
                {answers.map((a, i) =>
                  !a ? (
                    <div key={i} className="fail-wrong-item">
                      ✗ Pytanie {i + 1}: {questions[i]?.prompt?.slice(0, 60)}
                      {(questions[i]?.prompt?.length ?? 0) > 60 ? "…" : ""}
                    </div>
                  ) : null
                )}
              </div>
            )}

            <div className="fail-xp-hint">
              Ukończ lekcję poprawnie → +{totalXp} XP
            </div>

            <div className="complete-actions">
              <button
                className="btn-secondary"
                onClick={() => navigate(`/chapter/${chapter.id}`)}
                data-testid="button-back-to-chapter"
              >
                ← Wróć do mapy
              </button>
              <button
                className="btn-primary"
                onClick={doRetry}
                data-testid="button-retry"
              >
                ⚔ Spróbuj ponownie
              </button>
            </div>
          </div>
        )}

        {/* ── COMPLETE ── */}
        {phase === "complete" && (
          <div className="complete-card">
            {isLastInChapter && score >= 50 && (
              <div
                className="chapter-complete-banner"
                style={{ color: chapter.color, borderColor: chapter.color }}
              >
                🏆 Rozdział ukończony!
              </div>
            )}
            <div className="complete-stars">
              {hp === MAX_HP ? "⭐⭐⭐" : hp === 2 ? "⭐⭐" : "⭐"}
            </div>
            <h2 className="complete-title">{resultMsg}</h2>
            <div
              className="complete-score-circle"
              style={{ borderColor: chapter.color }}
            >
              <span className="complete-pct" style={{ color: chapter.color }}>
                {score}%
              </span>
              <span className="complete-pct-label">sukces</span>
            </div>
            <div className="complete-stats">
              <div className="stat-row">
                <span>Zdobyte XP</span>
                <strong
                  style={{
                    color: "var(--color-arcane-light)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  +{displayXp} XP
                </strong>
              </div>
              {perfectBonus > 0 && (
                <div className="stat-row">
                  <span>Bonus perfekcji</span>
                  <strong
                    style={{
                      color: "var(--color-primary)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    +{perfectBonus} XP ✦
                  </strong>
                </div>
              )}
              <div className="stat-row">
                <span>Trafienia</span>
                <strong style={{ fontFamily: "var(--font-display)" }}>
                  {answers.filter(Boolean).length}/{questions.length}
                </strong>
              </div>
              <div className="stat-row">
                <span>Sala</span>
                <strong
                  style={{
                    fontFamily: "var(--font-display)",
                    color: chapter.color,
                  }}
                >
                  {chapter.title}
                </strong>
              </div>
              <div className="stat-row">
                <span>Passa</span>
                <strong style={{ color: "#fb923c", fontFamily: "var(--font-display)" }}>
                  🔥 {localStreak} {localStreak === 1 ? "dzień" : localStreak < 5 ? "dni" : "dni"}
                </strong>
              </div>
            </div>
            <div className="complete-actions">
              <button
                className="btn-secondary"
                onClick={doRetry}
                data-testid="button-retry"
              >
                🔄 Ponów walkę
              </button>
              <button
                className="btn-primary"
                onClick={goNext}
                data-testid="button-next"
              >
                Dalej ⚔
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
