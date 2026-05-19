import CodeMirror from "@uiw/react-codemirror";
import {
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  Lightbulb,
  Lock,
  Play,
  RotateCcw
} from "lucide-react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { findAssessment } from "../content/assessments";
import { codeKey, resolveLevelCode, scorecardKey, sessionKey } from "../content/assessments/seeding";
import {
  coachingSummary,
  mergeBestResult,
  summarizeScorecard
} from "../content/assessments/scoring";
import { findProblem } from "../content/course";
import { useStore } from "../hooks/courseStoreContext";
import { runPythonProblem } from "../runner/pythonRunner";
import type {
  Assessment,
  AssessmentLevel,
  AssessmentLevelResult,
  AssessmentScorecard,
  AssessmentSessionState,
  Problem,
  ProblemPart,
  RunResult
} from "../types";
import { MarkdownView } from "./MarkdownView";
import { TestResultsList } from "./results/TestResultsList";
import { pythonEditorExtensions } from "./editor/pythonEditorExtensions";

const idleResult: RunResult = {
  status: "idle",
  stdout: "",
  stderr: "",
  durationMs: 0,
  tests: []
};

/**
 * Level slice the workspace renders against — uniform across the base
 * Problem (L1) and its `parts[]` (L2–L4) so dispatch is trivial.
 */
interface LevelSlice {
  level: number;
  title: string;
  prompt: string;
  entrypoint: string;
  starterCode: string;
  referenceCode: string;
  solutionCode?: string;
  visibleTests: Problem["visibleTests"];
  hiddenTests: Problem["hiddenTests"];
  hints: string[];
  solution: string;
  walkthrough?: string;
  complexity?: Problem["complexity"];
  meta: AssessmentLevel;
}

function levelSlices(problem: Problem, assessment: Assessment): LevelSlice[] {
  const parts: (Problem | ProblemPart)[] = [problem, ...(problem.parts ?? [])];
  return assessment.levels.map((meta, idx) => {
    const src = parts[idx];
    if (idx === 0) {
      const p = src as Problem;
      return {
        level: meta.level,
        title: `Level ${meta.level}: ${assessment.title}`,
        prompt: p.prompt,
        entrypoint: p.entrypoint,
        starterCode: p.starterCode,
        referenceCode: p.referenceCode,
        solutionCode: p.solutionCode,
        visibleTests: p.visibleTests,
        hiddenTests: p.hiddenTests,
        hints: p.hints,
        solution: p.solution,
        walkthrough: p.walkthrough,
        complexity: p.complexity,
        meta
      };
    }
    const part = src as ProblemPart;
    return {
      level: meta.level,
      title: part.title,
      prompt: part.prompt,
      entrypoint: part.entrypoint,
      starterCode: part.starterCode,
      referenceCode: part.referenceCode,
      solutionCode: part.solutionCode,
      visibleTests: part.visibleTests,
      hiddenTests: part.hiddenTests,
      hints: part.hints,
      solution: part.solution,
      walkthrough: part.walkthrough,
      complexity: part.complexity,
      meta
    };
  });
}

export function AssessmentPage() {
  const { assessmentId } = useParams();
  const assessment = assessmentId ? findAssessment(assessmentId) : undefined;
  const problem = assessment ? findProblem(assessment.problemId) : undefined;

  const { settings, saveSetting, deleteSetting, recordSubmission } = useStore();

  const slices = useMemo(
    () => (assessment && problem ? levelSlices(problem, assessment) : []),
    [assessment, problem]
  );

  const sessionKeyName = assessmentId ? sessionKey(assessmentId) : undefined;
  const storedSession = sessionKeyName
    ? (settings[sessionKeyName]?.value as AssessmentSessionState | undefined)
    : undefined;
  const storedScorecard = assessmentId
    ? (settings[scorecardKey(assessmentId)]?.value as AssessmentScorecard | undefined)
    : undefined;

  const [session, setSession] = useState<AssessmentSessionState | undefined>(storedSession);
  const [level, setLevel] = useState<number>(storedSession?.unlockedLevel ?? 1);
  const [code, setCode] = useState<string>(slices[level - 1]?.starterCode ?? "");
  const [result, setResult] = useState<RunResult>(idleResult);
  const [hintCount, setHintCount] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [lastRunIncludedHidden, setLastRunIncludedHidden] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Re-seed the editor whenever the active level changes (mount, level switch,
  // or session start/replay). Reads the carry-forward rule from the pure
  // resolver so the logic stays unit-tested.
  useEffect(() => {
    if (!assessmentId || !slices.length) return;
    const slice = slices[level - 1];
    if (!slice) return;
    const saved = settings[codeKey(assessmentId, level)]?.value;
    const prevSaved = level > 1 ? settings[codeKey(assessmentId, level - 1)]?.value : undefined;
    setCode(
      resolveLevelCode({
        level,
        savedForLevel: typeof saved === "string" ? saved : undefined,
        savedForPrevLevel: typeof prevSaved === "string" ? prevSaved : undefined,
        levelStarter: slice.starterCode
      })
    );
    setResult(idleResult);
    setHintCount(0);
    setShowSolution(false);
    setLastRunIncludedHidden(false);
    // Intentional: only re-seed on level / assessment change; per-keystroke
    // settings updates must not clobber an in-progress edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId, level, slices.length]);

  // 1 Hz tick for the countdown; cheap enough to leave on for the report too.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remainingMs = useMemo(() => {
    if (!session?.endsAt) return Number.POSITIVE_INFINITY;
    return Math.max(0, new Date(session.endsAt).getTime() - now);
  }, [session?.endsAt, now]);

  // Auto-expire when an in-progress exam's clock hits zero.
  useEffect(() => {
    if (!session || session.mode !== "exam") return;
    if (session.status !== "in-progress") return;
    if (!session.endsAt) return;
    if (remainingMs > 0) return;
    void finish("expired");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs, session?.status, session?.mode]);

  const phase: "rules" | "workspace" | "report" = !session
    ? "rules"
    : session.status === "in-progress"
      ? "workspace"
      : "report";

  if (!assessment || !problem) return <Navigate to="/assessments" replace />;
  const slice = slices[level - 1];
  if (!slice) return <Navigate to="/assessments" replace />;

  async function persistSession(next: AssessmentSessionState | undefined) {
    if (!sessionKeyName) return;
    setSession(next);
    if (next) {
      await saveSetting(sessionKeyName, next);
    } else {
      await deleteSetting(sessionKeyName);
    }
  }

  async function startSession(mode: "exam" | "practice") {
    if (!assessment) return;
    const startedAt = new Date().toISOString();
    const next: AssessmentSessionState = {
      assessmentId: assessment.id,
      mode,
      startedAt,
      endsAt:
        mode === "exam"
          ? new Date(Date.now() + assessment.totalMinutes * 60_000).toISOString()
          : undefined,
      unlockedLevel: 1,
      levelResults: {},
      status: "in-progress"
    };
    setLevel(1);
    setNow(Date.now());
    await persistSession(next);
  }

  async function finish(reason: "submitted" | "expired") {
    if (!session || !assessment) return;
    const finishedAt = new Date().toISOString();
    const next: AssessmentSessionState = { ...session, status: reason, finishedAt };
    await persistSession(next);
    const elapsedMs = new Date(finishedAt).getTime() - new Date(session.startedAt).getTime();
    const card = summarizeScorecard(assessment, next, elapsedMs);
    if (assessmentId) await saveSetting(scorecardKey(assessmentId), card);
  }

  async function replay() {
    if (!assessmentId) return;
    // Clear session, scorecard, and per-level buffers; rules screen will pick
    // up the fresh slate from absent settings.
    await deleteSetting(sessionKey(assessmentId));
    await deleteSetting(scorecardKey(assessmentId));
    for (let l = 1; l <= 4; l += 1) {
      await deleteSetting(codeKey(assessmentId, l));
    }
    setSession(undefined);
    setLevel(1);
    setResult(idleResult);
  }

  const run = useCallback(
    async (includeHidden: boolean) => {
      if (!session || !assessment || !problem || !assessmentId) return;
      const active = slices[level - 1];
      if (!active) return;
      setLastRunIncludedHidden(includeHidden);
      setResult({ ...idleResult, status: "loading" });
      await saveSetting(codeKey(assessmentId, level), code);

      const runtime: Problem =
        level === 1
          ? problem
          : {
              ...problem,
              entrypoint: active.entrypoint,
              visibleTests: active.visibleTests,
              hiddenTests: active.hiddenTests,
              referenceCode: active.referenceCode
            };
      const out = await runPythonProblem(runtime, code, includeHidden);
      setResult(out);
      await recordSubmission(`${assessmentId}#L${level}`, code, out);

      const visiblePassed = out.tests.filter((t) => !t.hidden && t.passed).length;
      const hiddenPassed = out.tests.filter((t) => t.hidden && t.passed).length;
      const fresh: AssessmentLevelResult = {
        level,
        visiblePassed,
        visibleTotal: active.visibleTests.length,
        // Always score against the full hidden suite — a visible-only run
        // shouldn't earn unearned credit by counting only 4/4 visible.
        hiddenPassed: includeHidden ? hiddenPassed : 0,
        hiddenTotal: active.hiddenTests.length,
        attempts: 1,
        points: 0,
        lastRunAt: new Date().toISOString()
      };
      const prev = session.levelResults[level];
      const merged = mergeBestResult(prev, fresh);
      merged.attempts = (prev?.attempts ?? 0) + 1;
      const nextUnlocked = Math.min(4, Math.max(session.unlockedLevel, level + 1));
      const nextSession: AssessmentSessionState = {
        ...session,
        levelResults: { ...session.levelResults, [level]: merged },
        unlockedLevel: nextUnlocked
      };
      await persistSession(nextSession);
    },
    // persistSession / replay / finish close over session+assessmentId; we
    // deliberately depend on the values they read so callbacks stay fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assessmentId, assessment, code, level, problem, session, slices]
  );

  const editorExtensions = useMemo(
    () =>
      pythonEditorExtensions({
        ariaLabel: `${assessment?.title ?? "Assessment"} Python code editor`,
        keys: [
          { key: "Mod-Enter", run: () => { void run(false); return true; } },
          { key: "Ctrl-Enter", run: () => { void run(false); return true; } },
          { key: "Mod-Shift-Enter", run: () => { void run(true); return true; } },
          { key: "Ctrl-Shift-Enter", run: () => { void run(true); return true; } }
        ]
      }),
    [assessment?.title, run]
  );

  // ---- Rules phase --------------------------------------------------------
  if (phase === "rules") {
    return (
      <RulesScreen
        assessment={assessment}
        lastScorecard={storedScorecard}
        onStart={(mode) => void startSession(mode)}
      />
    );
  }

  // ---- Report phase -------------------------------------------------------
  if (phase === "report" && session) {
    const elapsedMs =
      session.finishedAt && session.startedAt
        ? new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()
        : 0;
    const card = storedScorecard ?? summarizeScorecard(assessment, session, elapsedMs);
    return (
      <ReportScreen
        assessment={assessment}
        session={session}
        card={card}
        onReplay={() => void replay()}
      />
    );
  }

  // ---- Workspace phase ----------------------------------------------------
  const isExam = session?.mode === "exam";
  const remainingLabel = formatRemaining(remainingMs);
  const splitStyle = { "--prompt-width": "38%", "--dock-height": "260px" } as CSSProperties;

  return (
    <section className="page assessment-page">
      <header className="assessment-context-bar">
        <div className="assessment-context-main">
          <p className="assessment-breadcrumb">
            <Link to="/assessments">CodeSignal ICF Practice</Link>
            <span>/</span>
            <span>{assessment.title}</span>
          </p>
          <div className="assessment-title-row">
            <h1>{assessment.title}</h1>
            <span className={`assessment-mode-pill ${isExam ? "exam" : "practice"}`}>
              {isExam ? "Timed exam" : "Practice"}
            </span>
          </div>
        </div>
        <div className="assessment-context-actions">
          {isExam && Number.isFinite(remainingMs) ? (
            <Countdown remainingMs={remainingMs} />
          ) : (
            <span className="assessment-elapsed">
              <Clock size={16} aria-hidden /> {formatElapsed(now, session?.startedAt)} elapsed
            </span>
          )}
          <button
            className="primary-button compact-button"
            type="button"
            onClick={() => void finish("submitted")}
          >
            <Flag size={16} aria-hidden /> Finish
          </button>
        </div>
      </header>

      <LevelPills
        levels={assessment.levels}
        activeLevel={level}
        unlockedLevel={session?.unlockedLevel ?? 1}
        onSelect={(n) => setLevel(n)}
      />

      <div className="problem-layout beta-workspace" style={splitStyle}>
        <aside className="problem-brief">
          <div className="prompt-scroll">
            <section className="prompt-primary">
              <h2>{slice.title}</h2>
              <p className="muted assessment-level-hint">
                Suggested time: ~{slice.meta.recommendedMinutes} min · weight {slice.meta.maxPoints} pts
              </p>
              <MarkdownView content={slice.prompt} />
            </section>

            <details className="prompt-detail" open>
              <summary>Visible examples</summary>
              <div className="test-preview compact-tests">
                {slice.visibleTests.slice(0, 3).map((test) => (
                  <pre key={test.name}>
                    <code>{summarizeTest(test)}</code>
                  </pre>
                ))}
              </div>
            </details>

            {!isExam && (hintCount > 0 || showSolution) ? (
              <div className="prompt-reveal">
                {slice.hints.slice(0, hintCount).map((hint, idx) => (
                  <p key={hint}>
                    <strong>Hint {idx + 1}:</strong> {hint}
                  </p>
                ))}
                {showSolution ? (
                  <div className="solution-box">
                    <h3>Solution idea</h3>
                    <p>{slice.solution}</p>
                    {slice.walkthrough ? <p>{slice.walkthrough}</p> : null}
                    {slice.solutionCode ? (
                      <pre>
                        <code>{slice.solutionCode}</code>
                      </pre>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {!isExam ? (
            <div className="prompt-actions">
              <button
                className="tertiary-button"
                type="button"
                onClick={() => setHintCount((c) => Math.min(c + 1, slice.hints.length))}
              >
                <Lightbulb size={16} aria-hidden /> Reveal hint
              </button>
              <button
                className="tertiary-button"
                type="button"
                onClick={() => setShowSolution((v) => !v)}
              >
                <Eye size={16} aria-hidden />
                {showSolution ? "Hide solution" : "Show solution"}
              </button>
            </div>
          ) : (
            <p className="prompt-actions muted assessment-exam-note">
              <Lock size={14} aria-hidden /> Hints and the solution are locked during a timed exam.
            </p>
          )}
        </aside>

        <section className="workspace assessment-workspace">
          <div className="workspace-toolbar" aria-label="Run controls">
            <div className="toolbar-status-group">
              <span className={`run-status ${result.status}`}>{statusLabel(result.status)}</span>
              {result.durationMs ? <small>{result.durationMs} ms</small> : <small>Local Python</small>}
            </div>
            <div className="toolbar-actions">
              <button
                className="secondary-button compact-button"
                type="button"
                onClick={() => setCode(slice.starterCode)}
              >
                <RotateCcw size={16} aria-hidden /> Reset starter
              </button>
              <button
                className="primary-button run-button"
                type="button"
                disabled={result.status === "loading"}
                onClick={() => void run(false)}
              >
                <Play size={18} aria-hidden />
                <span className="button-copy">
                  <strong>Run</strong>
                  <small>visible tests</small>
                </span>
                <kbd>⌘↵</kbd>
              </button>
              <button
                className="primary-button submit-button"
                type="button"
                disabled={result.status === "loading"}
                onClick={() => void run(true)}
              >
                <CheckCircle2 size={18} aria-hidden />
                <span className="button-copy">
                  <strong>Submit</strong>
                  <small>all tests</small>
                </span>
                <kbd>⇧⌘↵</kbd>
              </button>
            </div>
          </div>

          <div className="workspace-editor">
            <CodeMirror
              value={code}
              height="100%"
              style={{ height: "100%" }}
              extensions={editorExtensions}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                autocompletion: true,
                bracketMatching: true
              }}
              onChange={setCode}
            />
          </div>

          <div className="workspace-bottom">
            <section className="workspace-panel result-panel active">
              <h2>Results</h2>
              {result.status === "passed" && lastRunIncludedHidden ? (
                <div className="completion-banner">
                  <CheckCircle2 size={20} />
                  <div>
                    <strong>Level {level} cleared on all tests</strong>
                    <p>
                      {level < 4
                        ? "Continue to the next level — your code carries forward."
                        : "Final level cleared. Finish the assessment to see your score."}
                    </p>
                  </div>
                  <div className="completion-actions">
                    {level < 4 ? (
                      <button className="primary-button" type="button" onClick={() => setLevel(level + 1)}>
                        Continue to Level {level + 1}
                      </button>
                    ) : (
                      <button className="primary-button" type="button" onClick={() => void finish("submitted")}>
                        Finish assessment
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
              <TestResultsList
                tests={result.tests}
                showHiddenDiagnostics={false}
                lockHidden={isExam}
              />
            </section>
          </div>
        </section>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Rules screen
// ---------------------------------------------------------------------------

function RulesScreen({
  assessment,
  lastScorecard,
  onStart
}: {
  assessment: Assessment;
  lastScorecard?: AssessmentScorecard;
  onStart: (mode: "exam" | "practice") => void;
}) {
  return (
    <section className="page assessment-rules-page">
      <header className="page-header">
        <p className="page-breadcrumb">
          <Link to="/assessments">CodeSignal ICF Practice</Link> / {assessment.title}
        </p>
        <h1>{assessment.title}</h1>
        <p className="page-intro">{assessment.intro}</p>
      </header>

      <section className="rules-block">
        <h2>How it works</h2>
        <ul>
          <li>
            One evolving problem, <strong>four progressive levels</strong>. Your code from
            each level carries forward into the next — extend the same{" "}
            <code>solution(queries)</code> function.
          </li>
          <li>
            <strong>{assessment.totalMinutes} minutes total</strong> in timed exam mode.
            The clock keeps running even if you leave the tab.
          </li>
          <li>
            Each level has visible example tests and additional hidden tests. Hidden test
            diagnostics stay hidden during the exam; you see only pass/fail counts.
          </li>
          <li>
            You can re-run and re-submit a level as many times as you like — your best
            result counts. You can revisit any level you have unlocked.
          </li>
          <li>
            <strong>Read all four levels before you code</strong>; design a data model in
            Level 1 that survives to Level 4.
          </li>
        </ul>
      </section>

      <section className="rules-block">
        <h2>Level plan</h2>
        <ol className="rules-level-plan">
          {assessment.levels.map((lvl) => (
            <li key={lvl.level}>
              <strong>Level {lvl.level}</strong> · ~{lvl.recommendedMinutes} min · weight {lvl.maxPoints} pts
            </li>
          ))}
        </ol>
      </section>

      {lastScorecard ? (
        <section className="rules-block">
          <h2>Last attempt</h2>
          <p>
            <strong>{lastScorecard.totalScore}</strong> ({lastScorecard.mode}) ·{" "}
            {lastScorecard.completedLevels} of 4 levels cleared
          </p>
        </section>
      ) : null}

      <div className="assessment-rules-actions">
        <button className="primary-button" type="button" onClick={() => onStart("exam")}>
          Begin timed exam ({assessment.totalMinutes}:00)
        </button>
        <button className="secondary-button" type="button" onClick={() => onStart("practice")}>
          Practice (untimed, hints unlocked)
        </button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Report screen
// ---------------------------------------------------------------------------

function ReportScreen({
  assessment,
  session,
  card,
  onReplay
}: {
  assessment: Assessment;
  session: AssessmentSessionState;
  card: AssessmentScorecard;
  onReplay: () => void;
}) {
  const summary = coachingSummary(card);
  return (
    <section className="page assessment-report-page">
      <header className="page-header">
        <p className="page-breadcrumb">
          <Link to="/assessments">CodeSignal ICF Practice</Link> / {assessment.title}
        </p>
        <h1>
          {session.status === "expired" ? "Time expired" : "Assessment complete"}
        </h1>
        <p className="page-intro">{summary}</p>
      </header>

      <section className="scorecard">
        <div className="scorecard-headline">
          <div className="scorecard-band">
            <span className="scorecard-band-floor">{assessment.scoreBand.min}</span>
            <strong className="scorecard-total">{card.totalScore}</strong>
            <span className="scorecard-band-ceiling">{assessment.scoreBand.max}</span>
          </div>
          <p className="muted">
            {card.rawPoints} / {card.maxRawPoints} raw points · {card.completedLevels} of 4 levels fully cleared ·{" "}
            {formatElapsedMs(card.elapsedMs)} used
          </p>
        </div>

        <table className="scorecard-table">
          <thead>
            <tr>
              <th scope="col">Level</th>
              <th scope="col">Visible</th>
              <th scope="col">Hidden</th>
              <th scope="col">Attempts</th>
              <th scope="col">Points</th>
            </tr>
          </thead>
          <tbody>
            {card.perLevel.map((row) => (
              <tr key={row.level}>
                <th scope="row">L{row.level}</th>
                <td>{row.visibleTotal ? `${row.visiblePassed}/${row.visibleTotal}` : "—"}</td>
                <td>{row.hiddenTotal ? `${row.hiddenPassed}/${row.hiddenTotal}` : "—"}</td>
                <td>{row.attempts || "—"}</td>
                <td>{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="muted scorecard-band-note">
          Score band {assessment.scoreBand.min}–{assessment.scoreBand.max}; raw points map
          linearly into the band (floor = no attempts, ceiling = every test passed across
          every level).
        </p>
      </section>

      <div className="assessment-report-actions">
        <button className="primary-button" type="button" onClick={onReplay}>
          Replay assessment
        </button>
        <Link className="secondary-button" to="/assessments">
          Back to assessments
        </Link>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Header bits
// ---------------------------------------------------------------------------

function Countdown({ remainingMs }: { remainingMs: number }) {
  const state =
    remainingMs <= 5 * 60_000 ? "danger" : remainingMs <= 15 * 60_000 ? "warning" : "ok";
  return (
    <span className={`assessment-countdown ${state}`} role="timer" aria-live="off">
      <Clock size={16} aria-hidden />
      <strong>{formatRemaining(remainingMs)}</strong>
    </span>
  );
}

function LevelPills({
  levels,
  activeLevel,
  unlockedLevel,
  onSelect
}: {
  levels: AssessmentLevel[];
  activeLevel: number;
  unlockedLevel: number;
  onSelect: (level: number) => void;
}) {
  return (
    <nav className="assessment-level-pills" aria-label="Levels">
      {levels.map((lvl) => {
        const locked = lvl.level > unlockedLevel;
        return (
          <button
            key={lvl.level}
            type="button"
            className={`assessment-level-pill ${lvl.level === activeLevel ? "active" : ""} ${locked ? "locked" : ""}`}
            aria-disabled={locked}
            aria-current={lvl.level === activeLevel ? "step" : undefined}
            onClick={() => {
              if (locked) return;
              onSelect(lvl.level);
            }}
          >
            {locked ? <Lock size={14} aria-hidden /> : null}
            L{lvl.level}
          </button>
        );
      })}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function formatRemaining(ms: number): string {
  if (!Number.isFinite(ms)) return "∞";
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatElapsed(now: number, startedAt: string | undefined): string {
  if (!startedAt) return "0:00";
  const ms = Math.max(0, now - new Date(startedAt).getTime());
  return formatRemaining(ms);
}

function formatElapsedMs(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function statusLabel(status: RunResult["status"]): string {
  if (status === "idle") return "Ready";
  if (status === "loading") return "Running";
  if (status === "passed") return "Passed";
  if (status === "failed") return "Failed tests";
  if (status === "timeout") return "Timed out";
  return "Error";
}

function summarizeTest(test: { name: string; args: unknown[]; expected: unknown }): string {
  return `# ${test.name}\nqueries = ${stringify(test.args[0])}\nreturns ${stringify(test.expected)}`;
}

function stringify(value: unknown): string {
  const compact = JSON.stringify(value);
  if (compact === undefined) return "undefined";
  if (compact.length <= 70) return compact;
  return JSON.stringify(value, null, 2);
}

