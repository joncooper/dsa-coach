import CodeMirror from "@uiw/react-codemirror";
import {
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  Lightbulb,
  Lock,
  Pause,
  Play,
  RotateCcw
} from "lucide-react";
import {
  type CSSProperties,
  Fragment,
  type PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { findAssessment } from "../content/assessments";
import {
  codeKey,
  resolveLevelCode,
  resumeShift,
  scorecardKey,
  sessionKey
} from "../content/assessments/seeding";
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
  RunResult,
  SubmissionRecord,
  TestResult
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

type AssessmentPanel = "results" | "output" | "errors";
const assessmentPanels: AssessmentPanel[] = ["results", "output", "errors"];

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

  const { settings, saveSetting, deleteSetting, recordSubmission, submissions } = useStore();

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

  // Hidden-diagnostic reveal preference is shared with ProblemPage so the
  // candidate's "I want to see hidden test details" choice carries between
  // surfaces. Practice mode reads/writes this; exam mode always locks it.
  const storedHiddenDiagnostics = settings["workspace:showHiddenDiagnostics"]?.value;
  const [session, setSession] = useState<AssessmentSessionState | undefined>(storedSession);
  const [level, setLevel] = useState<number>(storedSession?.unlockedLevel ?? 1);
  const [code, setCode] = useState<string>(slices[level - 1]?.starterCode ?? "");
  const [result, setResult] = useState<RunResult>(idleResult);
  const [showHiddenDiagnostics, setShowHiddenDiagnostics] = useState<boolean>(
    typeof storedHiddenDiagnostics === "boolean" ? storedHiddenDiagnostics : false
  );

  useEffect(() => {
    if (typeof storedHiddenDiagnostics === "boolean") {
      setShowHiddenDiagnostics(storedHiddenDiagnostics);
    }
  }, [storedHiddenDiagnostics]);

  const updateHiddenDiagnostics = useCallback(
    (next: boolean) => {
      setShowHiddenDiagnostics(next);
      void saveSetting("workspace:showHiddenDiagnostics", next);
    },
    [saveSetting]
  );
  // Visible feedback that the autosave loop is healthy. Flips to "saving" the
  // moment the candidate edits the buffer and back to "saved" when the
  // debounced write to IndexedDB resolves.
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");
  const [hintCount, setHintCount] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [lastRunIncludedHidden, setLastRunIncludedHidden] = useState(false);
  const [activePanel, setActivePanel] = useState<AssessmentPanel>("results");
  // Output-dock height shares ProblemPage's stored preference so the user's
  // "how tall do I want the dock" choice carries across the whole app.
  const storedDockHeight = settings["workspace:bottomDockHeight"]?.value;
  const [dockHeight, setDockHeight] = useState<number>(
    typeof storedDockHeight === "number" ? Math.min(900, Math.max(150, storedDockHeight)) : 260
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (typeof storedDockHeight === "number") {
      setDockHeight(Math.min(900, Math.max(150, storedDockHeight)));
    }
  }, [storedDockHeight]);

  const workspaceRef = useRef<HTMLElement | null>(null);
  const dockDragRef = useRef<{ startY: number; startHeight: number } | null>(null);

  const clampDockHeight = useCallback((value: number): number => {
    const MIN = 150;
    const workspaceHeight = workspaceRef.current?.clientHeight ?? 0;
    // Leave at least ~240px for the editor + toolbar; fall back to a static
    // ceiling before the workspace has measured itself.
    const dynamicMax = workspaceHeight > 0 ? workspaceHeight - 240 : 720;
    const max = Math.max(MIN, dynamicMax);
    return Math.min(max, Math.max(MIN, Math.round(value)));
  }, []);

  function handleDockPointerDown(event: PointerEvent<HTMLDivElement>) {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic or already-released pointers can't be captured; the drag
      // still works via the ref below.
    }
    dockDragRef.current = { startY: event.clientY, startHeight: dockHeight };
  }

  function handleDockPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dockDragRef.current;
    if (!drag) return;
    setDockHeight(clampDockHeight(drag.startHeight + (drag.startY - event.clientY)));
  }

  function handleDockPointerUp(event: PointerEvent<HTMLDivElement>) {
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // ignore
    }
    const drag = dockDragRef.current;
    dockDragRef.current = null;
    const next = drag
      ? clampDockHeight(drag.startHeight + (drag.startY - event.clientY))
      : dockHeight;
    setDockHeight(next);
    void saveSetting("workspace:bottomDockHeight", next);
  }

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
    setActivePanel("results");
    // The seeded buffer either came straight from settings or from the
    // carry-forward (which selectLevel flushed before the switch), so the
    // newly-active level is by definition already persisted.
    setSaveState("saved");
    // Intentional: only re-seed on level / assessment change; per-keystroke
    // settings updates must not clobber an in-progress edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId, level, slices.length]);

  // Debounced autosave of the in-progress buffer for the current level.
  // Without this, edits are only persisted on Run/Submit — switching levels
  // (or closing the tab) would wipe whatever was typed since the last run.
  // 300ms is short enough that the candidate sees the indicator settle back
  // to "Saved" almost as fast as they pause typing, but long enough that we
  // aren't hammering IndexedDB on every keystroke.
  useEffect(() => {
    if (!assessmentId) return;
    if (!session || session.status !== "in-progress") return;
    const handle = setTimeout(async () => {
      await saveSetting(codeKey(assessmentId, level), code);
      setSaveState("saved");
    }, 300);
    return () => clearTimeout(handle);
  }, [assessmentId, code, level, saveSetting, session]);

  // 1 Hz tick for the countdown; cheap enough to leave on for the report too.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // When paused, freeze every time-based readout at the pause instant. The
  // 1Hz `now` tick keeps firing (it's cheap and feeds other UI), but the
  // anchor we expose to the rest of the component stops advancing.
  const isPaused = Boolean(session?.pausedAt);
  const effectiveNow = useMemo(
    () => (session?.pausedAt ? new Date(session.pausedAt).getTime() : now),
    [session?.pausedAt, now]
  );

  const remainingMs = useMemo(() => {
    if (!session?.endsAt) return Number.POSITIVE_INFINITY;
    return Math.max(0, new Date(session.endsAt).getTime() - effectiveNow);
  }, [session?.endsAt, effectiveNow]);

  // Auto-expire when an in-progress exam's clock hits zero.
  useEffect(() => {
    if (!session || session.mode !== "exam") return;
    if (session.status !== "in-progress") return;
    if (!session.endsAt) return;
    if (isPaused) return;
    if (remainingMs > 0) return;
    void finish("expired");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs, session?.status, session?.mode, isPaused]);

  const phase: "rules" | "workspace" | "report" = !session
    ? "rules"
    : session.status === "in-progress"
      ? "workspace"
      : "report";

  const hasStdout = result.stdout.trim().length > 0;
  // Per-test exceptions count as errors too — a single hidden test that
  // threw should light up the Errors tab even with no top-level traceback.
  const erroredTests = result.tests.filter((t) => Boolean(t.error));
  const hasErrors = Boolean(
    result.message?.trim() || result.stderr?.trim() || erroredTests.length
  );

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

  async function selectLevel(target: number) {
    if (target === level) return;
    // Flush the current level's buffer BEFORE the level-change effect re-seeds
    // the editor — otherwise the debounce timer might not have fired yet and
    // any unsaved keystrokes would be silently overwritten by the carry-forward.
    if (assessmentId) {
      await saveSetting(codeKey(assessmentId, level), code);
    }
    setLevel(target);
  }

  async function pauseSession() {
    if (!session || session.status !== "in-progress" || session.pausedAt) return;
    // Snapshot in-progress code before freezing the UI; the editor is hidden
    // behind the overlay while paused, so this is the last chance to capture
    // the most recent debounce window.
    if (assessmentId) {
      await saveSetting(codeKey(assessmentId, level), code);
    }
    await persistSession({ ...session, pausedAt: new Date().toISOString() });
  }

  async function resumeSession() {
    if (!session?.pausedAt) return;
    const shifted = resumeShift({
      startedAt: session.startedAt,
      endsAt: session.endsAt,
      pausedAt: session.pausedAt,
      resumeNowMs: Date.now()
    });
    await persistSession({
      ...session,
      startedAt: shifted.startedAt,
      endsAt: shifted.endsAt,
      pausedAt: undefined
    });
    // Re-anchor the displayed time immediately so the readout doesn't jump.
    setNow(Date.now());
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
      // Hard-stop runs while paused — accepting submissions with the clock
      // frozen would defeat the integrity of practice/exam timing.
      if (session.pausedAt) return;
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
      // If the run blew up before any tests ran, the diagnostic lives in
      // `message`/`stderr` — jump the candidate to Errors so they aren't
      // staring at "No run results yet". Per-test runtime errors stay on
      // Results, where each test card already shows its own traceback.
      const topLevelError = Boolean(out.message?.trim() || out.stderr?.trim());
      if (topLevelError || out.status === "timeout") {
        setActivePanel("errors");
      } else {
        setActivePanel("results");
      }
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
    // Index the candidate's latest submission per level for the Review pane.
    const latestByLevel: Record<number, SubmissionRecord | undefined> = {};
    if (assessmentId) {
      for (const submission of submissions) {
        const prefix = `${assessmentId}#L`;
        if (!submission.problemId.startsWith(prefix)) continue;
        const level = Number(submission.problemId.slice(prefix.length));
        if (Number.isFinite(level) && !(level in latestByLevel)) {
          // submissions are already ordered newest-first by createdAt DESC.
          latestByLevel[level] = submission;
        }
      }
    }
    return (
      <ReportScreen
        assessment={assessment}
        session={session}
        card={card}
        slices={slices}
        latestByLevel={latestByLevel}
        onReplay={() => void replay()}
      />
    );
  }

  // ---- Workspace phase ----------------------------------------------------
  const isExam = session?.mode === "exam";
  const remainingLabel = formatRemaining(remainingMs);
  const splitStyle = { "--prompt-width": "38%", "--dock-height": `${dockHeight}px` } as CSSProperties;

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
            <Countdown remainingMs={remainingMs} paused={isPaused} />
          ) : (
            <span className={`assessment-elapsed ${isPaused ? "paused" : ""}`}>
              <Clock size={16} aria-hidden /> {formatElapsed(effectiveNow, session?.startedAt)} elapsed
              {isPaused ? <span className="assessment-paused-tag">paused</span> : null}
            </span>
          )}
          {isPaused ? (
            <button
              className="primary-button compact-button"
              type="button"
              onClick={() => void resumeSession()}
            >
              <Play size={16} aria-hidden /> Resume
            </button>
          ) : (
            <button
              className="secondary-button compact-button"
              type="button"
              onClick={() => void pauseSession()}
              title="Pause the clock — step away without burning time."
            >
              <Pause size={16} aria-hidden /> Pause
            </button>
          )}
          <button
            className="primary-button compact-button"
            type="button"
            disabled={isPaused}
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
        onSelect={(n) => void selectLevel(n)}
      />

      <div
        className={`problem-layout beta-workspace ${isPaused ? "is-paused" : ""}`}
        style={splitStyle}
      >
        {isPaused ? (
          <div className="assessment-pause-overlay" role="dialog" aria-modal="true" aria-label="Session paused">
            <div className="assessment-pause-card">
              <Pause size={32} aria-hidden />
              <h2>Paused</h2>
              <p>
                The clock is frozen. {isExam
                  ? "Your remaining exam time is held until you resume."
                  : "Your elapsed time is held until you resume."}
              </p>
              <button
                className="primary-button"
                type="button"
                autoFocus
                onClick={() => void resumeSession()}
              >
                <Play size={18} aria-hidden /> Resume
              </button>
            </div>
          </div>
        ) : null}
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

        <section className="workspace assessment-workspace" ref={workspaceRef}>
          <div className="workspace-toolbar" aria-label="Run controls">
            <div className="toolbar-status-group">
              <span className={`run-status ${result.status}`}>{statusLabel(result.status)}</span>
              {result.durationMs ? <small>{result.durationMs} ms</small> : <small>Local Python</small>}
              <span className={`autosave-indicator ${saveState}`} title="Your work is saved automatically.">
                <span className="autosave-dot" aria-hidden />
                {saveState === "saving" ? "Saving…" : "Saved"}
              </span>
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
                disabled={result.status === "loading" || isPaused}
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
                disabled={result.status === "loading" || isPaused}
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
              onChange={(value) => {
                setCode(value);
                setSaveState("saving");
              }}
            />
          </div>

          <div className="workspace-bottom">
            <div
              className="desktop-workspace-tabs"
              role="tablist"
              aria-label="Workspace output panels"
            >
              {assessmentPanels.map((panel) => (
                <button
                  key={panel}
                  type="button"
                  role="tab"
                  aria-selected={activePanel === panel}
                  className={activePanel === panel ? "active" : ""}
                  onClick={() => setActivePanel(panel)}
                >
                  {panel}
                  {panel === "output" && hasStdout ? <span className="tab-dot" /> : null}
                  {panel === "errors" && hasErrors ? <span className="tab-dot error" /> : null}
                </button>
              ))}
            </div>
            <div
              className="dock-resize-handle"
              role="separator"
              aria-label="Resize output dock"
              aria-orientation="horizontal"
              aria-valuemin={150}
              aria-valuenow={dockHeight}
              tabIndex={0}
              onPointerDown={handleDockPointerDown}
              onPointerMove={handleDockPointerMove}
              onPointerUp={handleDockPointerUp}
              onKeyDown={(event) => {
                if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                event.preventDefault();
                const next = clampDockHeight(dockHeight + (event.key === "ArrowUp" ? 24 : -24));
                setDockHeight(next);
                void saveSetting("workspace:bottomDockHeight", next);
              }}
            />

            <section
              className={`workspace-panel result-panel ${activePanel === "results" ? "active" : ""}`}
              role="tabpanel"
              aria-label="Results"
            >
              <h2>Results</h2>
              <ResultsSummary
                tests={result.tests}
                ranWithHidden={lastRunIncludedHidden}
                onJumpToErrors={hasErrors ? () => setActivePanel("errors") : undefined}
              />
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
                      <button className="primary-button" type="button" onClick={() => void selectLevel(level + 1)}>
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
              {result.status === "error" && !result.tests.length && hasErrors ? (
                <p className="muted">
                  Your code raised an error before any tests could run — see the{" "}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setActivePanel("errors")}
                  >
                    Errors
                  </button>{" "}
                  tab for the traceback.
                </p>
              ) : null}
              {result.status === "timeout" ? (
                <p className="muted">
                  Execution timed out. See the{" "}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setActivePanel("errors")}
                  >
                    Errors
                  </button>{" "}
                  tab for details.
                </p>
              ) : null}
              <TestResultsList
                tests={result.tests}
                showHiddenDiagnostics={showHiddenDiagnostics}
                onToggleHiddenDiagnostics={isExam ? undefined : updateHiddenDiagnostics}
                lockHidden={isExam}
              />
            </section>

            <section
              className={`workspace-panel result-panel ${activePanel === "output" ? "active" : ""}`}
              role="tabpanel"
              aria-label="Output"
            >
              <h2>Output</h2>
              {hasStdout ? (
                <pre>{result.stdout}</pre>
              ) : (
                <p className="muted">Nothing printed yet. Use <code>print(...)</code> to inspect values.</p>
              )}
            </section>

            <section
              className={`workspace-panel result-panel ${activePanel === "errors" ? "active" : ""}`}
              role="tabpanel"
              aria-label="Errors"
            >
              <h2>Errors</h2>
              {result.message ? <pre className="error-output">{result.message}</pre> : null}
              {result.stderr ? <pre className="error-output">{result.stderr}</pre> : null}
              <PerTestErrors
                tests={erroredTests}
                lockHidden={isExam}
                showHiddenDiagnostics={showHiddenDiagnostics}
                onRevealHidden={isExam ? undefined : () => updateHiddenDiagnostics(true)}
              />
              {!hasErrors ? <p className="muted">No runtime or syntax errors.</p> : null}
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
  slices,
  latestByLevel,
  onReplay
}: {
  assessment: Assessment;
  session: AssessmentSessionState;
  card: AssessmentScorecard;
  slices: LevelSlice[];
  latestByLevel: Record<number, SubmissionRecord | undefined>;
  onReplay: () => void;
}) {
  const summary = coachingSummary(card);
  const range = assessment.scoreBand.max - assessment.scoreBand.min;
  const pct = range > 0
    ? Math.max(0, Math.min(100, ((card.totalScore - assessment.scoreBand.min) / range) * 100))
    : 0;
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

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
          <p className="scorecard-total-label">Final score</p>
          <strong className="scorecard-total">{card.totalScore}</strong>
          <div
            className="scorecard-track"
            role="meter"
            aria-valuemin={assessment.scoreBand.min}
            aria-valuemax={assessment.scoreBand.max}
            aria-valuenow={card.totalScore}
            aria-label={`Score ${card.totalScore} of ${assessment.scoreBand.max} (floor ${assessment.scoreBand.min})`}
          >
            <div className="scorecard-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="scorecard-band-row" aria-hidden="true">
            <span>{assessment.scoreBand.min}</span>
            <span>{assessment.scoreBand.max}</span>
          </div>
          <p className="muted scorecard-headline-meta">
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
              <th scope="col">
                <span className="sr-only">Review</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {card.perLevel.map((row) => {
              const slice = slices[row.level - 1];
              const reviewable = row.attempts > 0 || Boolean(slice);
              const expanded = expandedLevel === row.level;
              return (
                <Fragment key={row.level}>
                  <tr>
                    <th scope="row">L{row.level}</th>
                    <td>{row.visibleTotal ? `${row.visiblePassed}/${row.visibleTotal}` : "—"}</td>
                    <td>{row.hiddenTotal ? `${row.hiddenPassed}/${row.hiddenTotal}` : "—"}</td>
                    <td>{row.attempts || "—"}</td>
                    <td>{row.points}</td>
                    <td className="scorecard-review-cell">
                      {reviewable ? (
                        <button
                          type="button"
                          className="tertiary-button"
                          aria-expanded={expanded}
                          onClick={() => setExpandedLevel(expanded ? null : row.level)}
                        >
                          {expanded ? "Hide" : "Review"}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                  {expanded && slice ? (
                    <tr className="scorecard-review-row">
                      <td colSpan={6}>
                        <LevelReview slice={slice} submission={latestByLevel[row.level]} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
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

function LevelReview({
  slice,
  submission
}: {
  slice: LevelSlice;
  submission: SubmissionRecord | undefined;
}) {
  const yourCode = submission?.code ?? "";
  const referenceCode = slice.referenceCode;
  return (
    <div className="level-review">
      <header className="level-review-header">
        <div>
          <h3>{slice.title}</h3>
          <p className="muted">{slice.solution}</p>
        </div>
        {slice.complexity ? (
          <span className="level-review-complexity">
            Time {slice.complexity.time} · Space {slice.complexity.space}
          </span>
        ) : null}
      </header>
      <div className="level-review-grid">
        <section>
          <h4>Your last submission</h4>
          {yourCode ? (
            <pre className="level-review-code"><code>{yourCode}</code></pre>
          ) : (
            <p className="muted">No submission recorded for this level.</p>
          )}
        </section>
        <section>
          <h4>Reference solution</h4>
          <pre className="level-review-code"><code>{referenceCode}</code></pre>
        </section>
      </div>
      {slice.walkthrough ? (
        <p className="level-review-walkthrough">{slice.walkthrough}</p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Results panel bits
// ---------------------------------------------------------------------------

/**
 * At-a-glance summary that sits above the per-test cards in the Results
 * tab. Surfaces the counts a candidate needs after a Submit run without
 * scrolling: visible pass/total, hidden pass/total, failing total, and
 * an explicit errored count. Clicking the errored chip jumps to the
 * Errors tab (when there's anything to show there).
 */
function ResultsSummary({
  tests,
  ranWithHidden,
  onJumpToErrors
}: {
  tests: TestResult[];
  ranWithHidden: boolean;
  onJumpToErrors?: () => void;
}) {
  if (!tests.length) return null;
  const visible = tests.filter((t) => !t.hidden);
  const hidden = tests.filter((t) => t.hidden);
  const visiblePass = visible.filter((t) => t.passed).length;
  const hiddenPass = hidden.filter((t) => t.passed).length;
  const errored = tests.filter((t) => Boolean(t.error)).length;
  const failing = tests.filter((t) => !t.passed).length;

  return (
    <div className={`results-summary ${failing ? "has-failures" : "all-pass"}`}>
      <span
        className={`results-summary-chip ${visiblePass === visible.length ? "pass" : "fail"}`}
      >
        Visible <strong>{visiblePass}/{visible.length}</strong>
      </span>
      {hidden.length ? (
        <span
          className={`results-summary-chip ${hiddenPass === hidden.length ? "pass" : "fail"}`}
        >
          Hidden <strong>{hiddenPass}/{hidden.length}</strong>
        </span>
      ) : (
        <span className="results-summary-note">
          {ranWithHidden ? "No hidden tests for this level." : "Submit to include hidden tests."}
        </span>
      )}
      {failing ? (
        <span className="results-summary-chip strong fail">
          {failing} failing
        </span>
      ) : null}
      {errored ? (
        onJumpToErrors ? (
          <button type="button" className="results-summary-chip error link" onClick={onJumpToErrors}>
            {errored} errored — view
          </button>
        ) : (
          <span className="results-summary-chip error">
            {errored} errored
          </span>
        )
      ) : null}
    </div>
  );
}

/**
 * Per-test traceback list for the Errors tab. Visible-test errors are
 * always shown in full. Hidden-test errors are gated by `lockHidden`
 * (exam) and `showHiddenDiagnostics` (practice opt-in) — a collapsed
 * row offers a reveal button when allowed.
 */
function PerTestErrors({
  tests,
  lockHidden,
  showHiddenDiagnostics,
  onRevealHidden
}: {
  tests: TestResult[];
  lockHidden: boolean;
  showHiddenDiagnostics: boolean;
  onRevealHidden?: () => void;
}) {
  const visible = tests.filter((t) => !t.hidden);
  const hidden = tests.filter((t) => t.hidden);
  if (!visible.length && !hidden.length) return null;

  return (
    <>
      {visible.length ? (
        <section className="per-test-errors">
          <h3>Visible test errors</h3>
          {visible.map((t) => (
            <article key={`v-${t.name}`}>
              <strong>{t.name}</strong>
              <pre className="error-output">{t.error}</pre>
            </article>
          ))}
        </section>
      ) : null}
      {hidden.length ? (
        <section className="per-test-errors">
          <h3>Hidden test errors ({hidden.length})</h3>
          {!lockHidden && showHiddenDiagnostics ? (
            hidden.map((t) => (
              <article key={`h-${t.name}`}>
                <strong>Hidden #{t.name}</strong>
                <pre className="error-output">{t.error}</pre>
              </article>
            ))
          ) : (
            <p className="muted">
              {lockHidden
                ? "Diagnostics hidden during the timed exam."
                : "Hidden by default to preserve practice integrity."}
              {!lockHidden && onRevealHidden ? (
                <>
                  {" "}
                  <button type="button" className="link-button" onClick={onRevealHidden}>
                    Reveal hidden tracebacks
                  </button>
                </>
              ) : null}
            </p>
          )}
        </section>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// Header bits
// ---------------------------------------------------------------------------

function Countdown({ remainingMs, paused }: { remainingMs: number; paused: boolean }) {
  const state =
    remainingMs <= 5 * 60_000 ? "danger" : remainingMs <= 15 * 60_000 ? "warning" : "ok";

  // Announce only at meaningful boundaries (avoids per-second screen-reader
  // spam): when the 15-minute warning crosses, 5-minute, 1-minute, and zero.
  // Each crossing fires once thanks to `latch`. Skip while paused — the clock
  // isn't actually moving so any threshold announcement would be misleading.
  const announce = paused ? null : announcementFor(remainingMs);
  const [latch, setLatch] = useState<string | null>(null);
  useEffect(() => {
    if (announce && announce !== latch) setLatch(announce);
  }, [announce, latch]);

  return (
    <>
      <span
        className={`assessment-countdown ${state} ${paused ? "paused" : ""}`}
        role="timer"
        aria-live="off"
      >
        <Clock size={16} aria-hidden />
        <strong>{formatRemaining(remainingMs)}</strong>
        {paused ? <span className="assessment-paused-tag">paused</span> : null}
      </span>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {paused ? "Timer paused." : latch ?? ""}
      </span>
    </>
  );
}

function announcementFor(remainingMs: number): string | null {
  if (remainingMs <= 0) return "Time has expired.";
  if (remainingMs <= 60_000) return "One minute remaining.";
  if (remainingMs <= 5 * 60_000) return "Five minutes remaining.";
  if (remainingMs <= 15 * 60_000) return "Fifteen minutes remaining.";
  return null;
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

