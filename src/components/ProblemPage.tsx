import CodeMirror from "@uiw/react-codemirror";
import { pythonEditorExtensions } from "./editor/pythonEditorExtensions";
import { TestResultsList } from "./results/TestResultsList";
import {
  Bot,
  CheckCircle2,
  Eye,
  EyeOff,
  GripVertical,
  Keyboard,
  Lightbulb,
  ListRestart,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Play,
  RotateCcw,
  Square,
  Star
} from "lucide-react";
import { type CSSProperties, type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { course, findChapter, findProblem, findProblemSet } from "../content/course";
import { useStore } from "../hooks/courseStoreContext";
import { runPythonProblem, runPythonScratchpad } from "../runner/pythonRunner";
import type { Problem, RunResult, SubmissionRecord } from "../types";
import type { CoachContext } from "../coach/coachPrompts";
import { CoachPanel } from "./CoachPanel";
import { DisciplineChecklist } from "./DisciplineChecklist";
import { MarkdownView } from "./MarkdownView";
import { NotesPanel } from "./NotesPanel";
import { SidebarShowToggle } from "./Sidebar";

const idleResult: RunResult = {
  status: "idle",
  stdout: "",
  stderr: "",
  durationMs: 0,
  tests: []
};

type MobileTab = "prompt" | "code" | "results" | "scratchpad" | "notes";
type DesktopPanel = "results" | "stdout" | "errors" | "scratchpad" | "notes" | "history";
const desktopPanels: DesktopPanel[] = ["results", "stdout", "errors", "scratchpad", "notes", "history"];
const mobileTabs: MobileTab[] = ["prompt", "code", "results", "scratchpad", "notes"];

export function ProblemPage() {
  const { problemId } = useParams();
  const problem = problemId ? findProblem(problemId) : undefined;
  const chapter = problem ? findChapter(problem.chapterId) : undefined;
  const problemSet = problem && !chapter ? findProblemSet(problem.chapterId) : undefined;
  const resolvedParts = useMemo(() => resolveProblemParts(problem), [problem]);
  const [activePartIndex, setActivePartIndex] = useState(0);
  const activePart = resolvedParts[activePartIndex] ?? resolvedParts[0];
  const container = chapter
    ? { id: chapter.id, title: chapter.title, kind: "chapter" as const, backLink: `/chapter/${chapter.id}`, backLabel: "Back to chapter" }
    : problemSet
      ? { id: problemSet.id, title: problemSet.title, kind: "set" as const, backLink: `/set/${problemSet.id}`, backLabel: "Back to set" }
      : undefined;
  const { progress, submissions, settings, saveSetting, markProgress, recordSubmission } = useStore();
  const [code, setCode] = useState(problem?.starterCode ?? "");
  const [result, setResult] = useState<RunResult>(idleResult);
  const [scratchpadCode, setScratchpadCode] = useState(defaultScratchpadCode(problem?.title));
  const [scratchpadResult, setScratchpadResult] = useState<RunResult>(idleResult);
  const [hintCount, setHintCount] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [splitRatio, setSplitRatio] = useState(34);
  const [dockHeight, setDockHeight] = useState(260);
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>("prompt");
  const [activeDesktopPanel, setActiveDesktopPanel] = useState<DesktopPanel>("results");
  const [showHiddenDiagnostics, setShowHiddenDiagnostics] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachMounted, setCoachMounted] = useState(false);
  const [lastRunIncludedHidden, setLastRunIncludedHidden] = useState(false);
  const [constraintsOpen, setConstraintsOpen] = useState(true);
  const [examplesOpen, setExamplesOpen] = useState(true);
  const [starred, setStarred] = useState(false);
  // Abort handles for in-flight runs — populated while a run is loading so the
  // Stop button can terminate a runaway worker (e.g. an infinite loop).
  const runAbortRef = useRef<AbortController | null>(null);
  const scratchpadAbortRef = useRef<AbortController | null>(null);

  const codeStorageKey = problem
    ? activePartIndex === 0
      ? `code:${problem.id}`
      : `code:${problem.id}#${activePart?.id ?? "part"}`
    : undefined;
  const storedCode = codeStorageKey ? settings[codeStorageKey]?.value : undefined;
  const storedScratchpad = problem ? settings[`scratchpad:${problem.id}`]?.value : undefined;
  const storedStarred = problem ? settings[`problem:starred:${problem.id}`]?.value : undefined;
  const storedSplitRatio = settings["workspace:splitRatio"]?.value;
  const storedDockHeight = settings["workspace:bottomDockHeight"]?.value;
  const storedMobileTab = settings["workspace:activeMobileTab"]?.value;
  const storedHiddenDiagnostics = settings["workspace:showHiddenDiagnostics"]?.value;
  const storedFocusMode = settings["workspace:focusMode"]?.value;
  const storedSidebarCollapsed = settings["workspace:sidebarCollapsed"]?.value;

  useEffect(() => {
    if (!problem) return;
    setActivePartIndex(0);
    setScratchpadCode(typeof storedScratchpad === "string" ? storedScratchpad : defaultScratchpadCode(problem.title));
    setResult(idleResult);
    setScratchpadResult(idleResult);
    setHintCount(0);
    setShowSolution(false);
    setLastRunIncludedHidden(false);
    setActiveDesktopPanel("results");
    setConstraintsOpen(true);
    setExamplesOpen(true);
    setStarred(storedStarred === true);
    setShowHiddenDiagnostics(typeof storedHiddenDiagnostics === "boolean" ? storedHiddenDiagnostics : false);
  }, [problem?.id]);

  useEffect(() => {
    if (!problem || !activePart) return;
    setCode(typeof storedCode === "string" ? storedCode : activePart.starterCode);
    setResult(idleResult);
    setHintCount(0);
    setShowSolution(false);
    setLastRunIncludedHidden(false);
  }, [problem?.id, activePartIndex, activePart?.id]);

  useEffect(() => {
    if (!problem) return;
    setStarred(storedStarred === true);
  }, [problem, storedStarred]);

  useEffect(() => {
    if (typeof storedSplitRatio === "number") {
      setSplitRatio(Math.min(48, Math.max(26, storedSplitRatio)));
    }
    if (typeof storedDockHeight === "number") {
      setDockHeight(Math.min(900, Math.max(150, storedDockHeight)));
    }
    if (storedMobileTab === "prompt" || storedMobileTab === "code" || storedMobileTab === "results" || storedMobileTab === "scratchpad" || storedMobileTab === "notes") {
      setActiveMobileTab(storedMobileTab);
    }
    if (typeof storedHiddenDiagnostics === "boolean") {
      setShowHiddenDiagnostics(storedHiddenDiagnostics);
    }
    if (typeof storedFocusMode === "boolean") {
      setFocusMode(storedFocusMode);
    }
    if (typeof storedSidebarCollapsed === "boolean") {
      setSidebarCollapsed(storedSidebarCollapsed);
    }
  }, [storedDockHeight, storedFocusMode, storedHiddenDiagnostics, storedMobileTab, storedSidebarCollapsed, storedSplitRatio]);

  useEffect(() => {
    // Sidebar collapse → `sidebar-collapsed` body class managed by Sidebar
    // itself so it works on any workspace page. ProblemPage only owns the
    // focus-mode class because focus also reshapes the problem layout
    // (brief + split handle), which is problem-page-specific.
    document.body.classList.toggle("problem-focus-mode", focusMode);
    return () => {
      document.body.classList.remove("problem-focus-mode");
    };
  }, [focusMode]);

  const statusText = useMemo(() => {
    if (result.status === "idle") return "Ready";
    if (result.status === "loading") return "Running";
    if (result.status === "passed") return "Passed";
    if (result.status === "failed") return "Failed tests";
    if (result.status === "timeout") return "Timed out";
    if (result.status === "stopped") return "Stopped";
    return "Error";
  }, [result.status]);
  const hiddenSummary = useMemo(() => {
    const hidden = result.tests.filter((test) => test.hidden);
    if (!hidden.length) return "";
    const passed = hidden.filter((test) => test.passed).length;
    return `${passed}/${hidden.length} hidden tests passed`;
  }, [result.tests]);
  const visibleResults = result.tests.filter((test) => !test.hidden);
  const failedHiddenCount = result.tests.filter((test) => test.hidden && !test.passed).length;
  const hasStdout = result.stdout.trim().length > 0;
  const hasErrors = Boolean(result.message || result.stderr);
  const hasScratchpadOutput = Boolean(scratchpadResult.stdout.trim() || scratchpadResult.stderr.trim() || scratchpadResult.message);
  const chapterProblems = useMemo(() => {
    if (!problem) return undefined;
    if (problemSet) return problemSet.problems;
    return course.problems.filter((candidate) => candidate.chapterId === problem.chapterId);
  }, [problem, problemSet]);
  const currentProblemIndex = useMemo(() => {
    if (!problem || !chapterProblems) return -1;
    return chapterProblems.findIndex((candidate) => candidate.id === problem.id);
  }, [chapterProblems, problem]);
  const previousProblem = chapterProblems && currentProblemIndex > 0 ? chapterProblems[currentProblemIndex - 1] : undefined;
  const nextProblem = chapterProblems && currentProblemIndex >= 0 ? chapterProblems[currentProblemIndex + 1] : undefined;
  const recentSubmissions = useMemo(() => {
    if (!problem) return [];
    return submissions.filter((submission) => submission.problemId === problem.id).slice(0, 6);
  }, [problem, submissions]);

  const buildCoachContext = useCallback((): CoachContext => {
    const runState: CoachContext["runState"] =
      result.status === "passed"
        ? "passed"
        : result.status === "failed"
          ? "failed"
          : result.status === "error" || result.status === "timeout"
            ? "error"
            : "unrun";
    const failedVisible = visibleResults
      .filter((test) => !test.passed)
      .slice(0, 4)
      .map((test) => ({
        name: test.name,
        expected: JSON.stringify(test.expected),
        actual: JSON.stringify(test.actual),
        error: test.error
      }));
    const attemptCount = problem
      ? submissions.filter((s) => s.problemId === problem.id).length
      : 0;
    return {
      problemTitle: problem?.title ?? "Problem",
      partTitle: resolvedParts.length > 1 ? activePart.title : undefined,
      prompt: activePart.prompt,
      constraints: problem?.constraints,
      code,
      entrypoint: activePart.entrypoint,
      runState,
      failedVisible,
      failedHiddenCount,
      stdout: result.stdout,
      errorMessage: result.message || result.stderr || undefined,
      attemptCount,
      authored: {
        hints: activePart.hints,
        solution: activePart.solution,
        walkthrough: activePart.walkthrough,
        referenceCode: activePart.solutionCode ?? activePart.referenceCode,
        complexity: activePart.complexity ?? problem?.complexity
      }
    };
  }, [activePart, code, failedHiddenCount, problem, resolvedParts.length, result, submissions, visibleResults]);

  function toggleCoach() {
    setCoachMounted(true);
    setCoachOpen((v) => !v);
  }
  const progressRecord = problem ? progress[`problem:${problem.id}`] : undefined;
  const reviewLabel = formatReviewDate(progressRecord?.dueAt);
  const run = useCallback(async (includeHidden: boolean) => {
    if (!problem || !activePart || !codeStorageKey) return;
    // Ignore Run/Submit (and their keyboard shortcuts) while a run is already
    // in flight — one worker at a time keeps the Stop button unambiguous.
    if (runAbortRef.current) return;
    const controller = new AbortController();
    runAbortRef.current = controller;
    setLastRunIncludedHidden(includeHidden);
    setResult({ ...idleResult, status: "loading" });
    try {
      await saveSetting(codeStorageKey, code);
      const runtimeProblem: Problem = activePartIndex === 0 ? problem : {
        ...problem,
        entrypoint: activePart.entrypoint,
        visibleTests: activePart.visibleTests,
        hiddenTests: activePart.hiddenTests,
        referenceCode: activePart.referenceCode
      };
      const next = await runPythonProblem(runtimeProblem, code, includeHidden, controller.signal);
      setResult(next);
      // A stopped run is the user bailing out, not a graded attempt — leave
      // history and progress untouched.
      if (next.status === "stopped") return;
      setActiveMobileTab("results");
      setActiveDesktopPanel("results");
      await saveSetting("workspace:activeMobileTab", "results");
      await recordSubmission(problem.id, code, next);
      await markProgress("problem", problem.id, next.status === "passed" ? "complete" : "in-progress");
    } finally {
      runAbortRef.current = null;
    }
  }, [activePart, activePartIndex, code, codeStorageKey, markProgress, problem, recordSubmission, saveSetting]);

  const stopRun = useCallback(() => {
    runAbortRef.current?.abort();
  }, []);

  const runScratchpad = useCallback(async () => {
    if (!problem) return;
    if (scratchpadAbortRef.current) return;
    const controller = new AbortController();
    scratchpadAbortRef.current = controller;
    setScratchpadResult({ ...idleResult, status: "loading" });
    try {
      await saveSetting(`scratchpad:${problem.id}`, scratchpadCode);
      const next = await runPythonScratchpad(scratchpadCode, controller.signal);
      setScratchpadResult(next);
      if (next.status === "stopped") return;
      setActiveDesktopPanel("scratchpad");
      setActiveMobileTab("scratchpad");
      await saveSetting("workspace:activeMobileTab", "scratchpad");
    } finally {
      scratchpadAbortRef.current = null;
    }
  }, [problem, saveSetting, scratchpadCode]);

  const stopScratchpad = useCallback(() => {
    scratchpadAbortRef.current?.abort();
  }, []);

  const editorExtensions = useMemo(
    () =>
      pythonEditorExtensions({
        ariaLabel: `${problem?.title ?? "Problem"} Python code editor`,
        keys: [
          { key: "Mod-Enter", run: () => { void run(false); return true; } },
          { key: "Ctrl-Enter", run: () => { void run(false); return true; } },
          { key: "Mod-Shift-Enter", run: () => { void run(true); return true; } },
          { key: "Ctrl-Shift-Enter", run: () => { void run(true); return true; } }
        ]
      }),
    [problem?.title, run]
  );

  const scratchpadExtensions = useMemo(
    () =>
      pythonEditorExtensions({
        ariaLabel: "Python scratchpad editor",
        keys: [
          { key: "Mod-Enter", run: () => { void runScratchpad(); return true; } },
          { key: "Ctrl-Enter", run: () => { void runScratchpad(); return true; } }
        ]
      }),
    [runScratchpad]
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isEditing = Boolean(target?.closest("input, textarea, [contenteditable='true']"));
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void run(event.shiftKey);
        return;
      }
      if (isEditing) return;
      if (event.altKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        toggleFocusMode();
        return;
      }
      if (event.altKey && (event.key === "]" || event.key === "[")) {
        event.preventDefault();
        setActiveDesktopPanel((panel) => {
          const index = desktopPanels.indexOf(panel);
          const offset = event.key === "]" ? 1 : -1;
          return desktopPanels[(index + offset + desktopPanels.length) % desktopPanels.length];
        });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [run]);

  if (!problem || !container) return <Navigate to="/" replace />;

  function setMobileTab(tab: MobileTab) {
    setActiveMobileTab(tab);
    void saveSetting("workspace:activeMobileTab", tab);
  }

  function updateHiddenDiagnostics(value: boolean) {
    setShowHiddenDiagnostics(value);
    void saveSetting("workspace:showHiddenDiagnostics", value);
  }

  function toggleFocusMode() {
    setFocusMode((value) => {
      const next = !value;
      void saveSetting("workspace:focusMode", next);
      return next;
    });
  }


  async function toggleStarred() {
    if (!problem) return;
    const next = !starred;
    await saveSetting(`problem:starred:${problem.id}`, next);
    setStarred(next);
  }


  function handleSeparatorPointerDown(event: PointerEvent<HTMLDivElement>) {
    const container = event.currentTarget.parentElement;
    if (!container) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = container.getBoundingClientRect();
    const update = (clientX: number) => {
      const next = Math.round(((clientX - rect.left) / rect.width) * 100);
      setSplitRatio(Math.min(48, Math.max(26, next)));
    };
    update(event.clientX);
  }

  function handleSeparatorPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const container = event.currentTarget.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const next = Math.round(((event.clientX - rect.left) / rect.width) * 100);
    setSplitRatio(Math.min(48, Math.max(26, next)));
  }

  function handleSeparatorPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    void saveSetting("workspace:splitRatio", splitRatio);
  }

  const dockDragRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const workspaceRef = useRef<HTMLElement | null>(null);

  function clampDockHeight(value: number): number {
    const MIN = 150;
    // Cap so the editor keeps a usable minimum and nothing overflows the
    // viewport-bounded workspace. Fall back to a static cap before mount.
    const workspaceHeight = workspaceRef.current?.clientHeight ?? 0;
    const dynamicMax = workspaceHeight > 0 ? workspaceHeight - 240 : 720;
    const max = Math.max(MIN, dynamicMax);
    return Math.min(max, Math.max(MIN, Math.round(value)));
  }

  function handleDockPointerDown(event: PointerEvent<HTMLDivElement>) {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic or already-released pointers can't be captured; the
      // drag still works via the ref below.
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

  const splitStyle = { "--prompt-width": `${splitRatio}%`, "--dock-height": `${dockHeight}px` } as CSSProperties;

  return (
    <section className="page problem-page">
      <header className="problem-context-bar">
        <SidebarShowToggle />
        <div className="problem-context-main">
          <p className="problem-breadcrumb">
            <Link to={container.backLink}>{container.title}</Link>
            <span>/</span>
            <span>{container.kind === "set" ? "Problem set" : problem.source === "bonus" ? "Bonus drill" : "Guided problem"}</span>
          </p>
          <div className="problem-title-row">
            <h1>{problem.title}</h1>
            <div className="tag-row compact-tags">
              <span>{problem.difficulty}</span>
              <span>{problem.adapter}</span>
              {problem.patterns.slice(0, 3).map((pattern) => (
                <span key={pattern}>{pattern}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="problem-context-actions">
          <Link className="secondary-button compact-button" to={container.backLink}>
            {container.backLabel}
          </Link>
          {previousProblem ? (
            <Link className="secondary-button compact-button problem-nav-link" to={`/problem/${previousProblem.id}`}>
              Previous
            </Link>
          ) : null}
          {nextProblem ? (
            <Link className="secondary-button compact-button problem-nav-link" to={`/problem/${nextProblem.id}`}>
              Next
            </Link>
          ) : null}
          <button className={`secondary-button compact-button star-problem-button ${starred ? "active" : ""}`} type="button" aria-pressed={starred} onClick={toggleStarred}>
            <Star size={17} />
            {starred ? "Starred" : "Star problem"}
          </button>
          <button
            className={`secondary-button compact-button ${coachOpen ? "active" : ""}`}
            type="button"
            aria-pressed={coachOpen}
            onClick={toggleCoach}
          >
            <Bot size={17} />
            Coach
          </button>
          <button
            className="secondary-button compact-button icon-only-button"
            type="button"
            aria-label={focusMode ? "Exit focus" : "Focus"}
            title={focusMode ? "Exit focus" : "Focus"}
            onClick={toggleFocusMode}
          >
            {focusMode ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </header>

      <nav className="mobile-workspace-tabs" aria-label="Problem workspace sections">
        {mobileTabs.map((tab) => (
          <button key={tab} type="button" className={activeMobileTab === tab ? "active" : ""} onClick={() => setMobileTab(tab)}>
            {tab === "scratchpad" ? "scratch" : tab}
          </button>
        ))}
      </nav>

      <div className={`problem-layout beta-workspace ${coachOpen ? "coach-open" : ""}`} style={splitStyle}>
        <aside className={`problem-brief mobile-pane ${activeMobileTab === "prompt" ? "active" : ""}`}>
          <div className="prompt-scroll">
            {resolvedParts.length > 1 ? (
              <nav className="part-tabs" aria-label="Problem parts">
                {resolvedParts.map((part, index) => (
                  <button
                    key={part.id}
                    type="button"
                    className={index === activePartIndex ? "part-tab active" : "part-tab"}
                    onClick={() => setActivePartIndex(index)}
                  >
                    {part.title}
                  </button>
                ))}
              </nav>
            ) : null}
            <section className="prompt-primary">
              <h2>{resolvedParts.length > 1 ? activePart.title : "Prompt"}</h2>
              <MarkdownView content={activePart.prompt} />
            </section>

            {problemSet ? <DisciplineChecklist problemId={problem.id} /> : null}

            {problem.constraints?.length ? (
              <details className="prompt-detail" open={constraintsOpen} onToggle={(event) => setConstraintsOpen(event.currentTarget.open)}>
                <summary>
                  Constraints
                  <small className="prompt-detail-count">{problem.constraints.length}</small>
                </summary>
                <ul className="constraint-chips">
                  {problem.constraints.map((constraint) => (
                    <li key={constraint}>{constraint}</li>
                  ))}
                </ul>
              </details>
            ) : null}

            <details className="prompt-detail" open={examplesOpen} onToggle={(event) => setExamplesOpen(event.currentTarget.open)}>
              <summary>Visible examples</summary>
              <div className="test-preview compact-tests">
                {activePart.visibleTests.map((test) => (
                  <pre key={test.name}>
                    <code>{renderExample(activePart, test)}</code>
                  </pre>
                ))}
              </div>
            </details>

            {hintCount || showSolution ? (
              <div className="prompt-reveal">
                {activePart.hints.slice(0, hintCount).map((hint, index) => (
                  <p key={hint}>
                    <strong>Hint {index + 1}:</strong> {hint}
                  </p>
                ))}
                {showSolution ? (
                  <div className="solution-box">
                    <h2>Solution</h2>
                    <p>{activePart.solution}</p>
                    {activePart.walkthrough ? <p>{activePart.walkthrough}</p> : null}
                    {activePart.solutionCode ? (
                      <pre>
                        <code>{activePart.solutionCode}</code>
                      </pre>
                    ) : null}
                    {(activePart.complexity ?? problem.complexity) ? (
                      <p>
                        <strong>Time:</strong> {(activePart.complexity ?? problem.complexity).time}{" "}
                        <strong>Space:</strong> {(activePart.complexity ?? problem.complexity).space}
                      </p>
                    ) : null}
                    {activePartIndex === 0 && problem.followUps?.length ? (
                      <>
                        <h3>Follow-ups</h3>
                        <ul>
                          {problem.followUps.map((followUp) => (
                            <li key={followUp}>{followUp}</li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="prompt-actions">
            <button className="tertiary-button" type="button" onClick={() => setHintCount((count) => Math.min(count + 1, activePart.hints.length))}>
              <Lightbulb size={16} />
              Reveal hint
            </button>
            <button className="tertiary-button" type="button" onClick={() => setShowSolution((value) => !value)}>
              {showSolution ? <EyeOff size={16} /> : <Eye size={16} />}
              {showSolution ? "Hide solution" : "Show solution"}
            </button>
          </div>
        </aside>

      <div
        className="split-handle"
        role="separator"
        aria-label="Resize prompt and editor panes"
        aria-valuemin={26}
        aria-valuemax={48}
        aria-valuenow={splitRatio}
        tabIndex={0}
        onPointerDown={handleSeparatorPointerDown}
        onPointerMove={handleSeparatorPointerMove}
        onPointerUp={handleSeparatorPointerUp}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          const next = Math.min(48, Math.max(26, splitRatio + (event.key === "ArrowRight" ? 2 : -2)));
          setSplitRatio(next);
          void saveSetting("workspace:splitRatio", next);
        }}
      >
        <GripVertical size={18} />
      </div>

      <section className="workspace" ref={workspaceRef}>
        <div className={`workspace-toolbar mobile-pane ${activeMobileTab === "code" || activeMobileTab === "results" ? "active" : ""}`} aria-label="Run controls">
          <div className="toolbar-status-group">
            <span className={`run-status ${result.status}`}>{statusText}</span>
            {result.durationMs ? <small>{result.durationMs} ms</small> : <small>Local Python</small>}
          </div>
          <div className="toolbar-actions">
            <details className="toolbar-menu">
              <summary className="secondary-button compact-button" aria-label="More workspace actions">
                <MoreHorizontal size={18} />
                More
              </summary>
              <div className="toolbar-menu-panel">
                <button type="button" onClick={() => setCode(activePart.starterCode)}>
                  <RotateCcw size={16} />
                  Reset to starter
                </button>
                {typeof storedCode === "string" && storedCode !== activePart.starterCode ? (
                  <button type="button" onClick={() => setCode(storedCode)}>
                    <RotateCcw size={16} />
                    Restore last saved
                  </button>
                ) : null}
                <div className="shortcut-list" aria-label="Keyboard shortcuts">
                  <strong>
                    <Keyboard size={15} />
                    Shortcuts
                  </strong>
                  <div className="shortcut-row">
                    <span className="shortcut-keys">
                      <kbd>Ctrl/Cmd+Enter</kbd>
                    </span>
                    <span className="shortcut-desc">Run visible tests</span>
                  </div>
                  <div className="shortcut-row">
                    <span className="shortcut-keys">
                      <kbd>Ctrl/Cmd+Shift+Enter</kbd>
                    </span>
                    <span className="shortcut-desc">Submit all tests</span>
                  </div>
                  <div className="shortcut-row">
                    <span className="shortcut-keys">
                      <kbd>Alt+F</kbd>
                    </span>
                    <span className="shortcut-desc">Toggle focus</span>
                  </div>
                  <div className="shortcut-row">
                    <span className="shortcut-keys">
                      <kbd>Alt+[</kbd>
                      <span>/</span>
                      <kbd>Alt+]</kbd>
                    </span>
                    <span className="shortcut-desc">Change output tab</span>
                  </div>
                  <div className="shortcut-row">
                    <span className="shortcut-keys">
                      <kbd>Scratchpad</kbd>
                    </span>
                    <span className="shortcut-desc">Free Python experiments</span>
                  </div>
                </div>
              </div>
            </details>
            {result.status === "loading" ? (
              <button className="primary-button stop-button" type="button" onClick={stopRun}>
                <Square size={18} fill="currentColor" />
                <span className="button-copy">
                  <strong>Stop</strong>
                  <small>end this run</small>
                </span>
              </button>
            ) : (
              <>
                <button className="primary-button run-button" type="button" onClick={() => void run(false)}>
                  <Play size={18} />
                  <span className="button-copy">
                    <strong>Run</strong>
                    <small>visible tests</small>
                  </span>
                  <kbd>⌘↵</kbd>
                </button>
                <button className="primary-button submit-button" type="button" onClick={() => void run(true)}>
                  <CheckCircle2 size={18} />
                  <span className="button-copy">
                    <strong>Submit</strong>
                    <small>all tests</small>
                  </span>
                  <kbd>⇧⌘↵</kbd>
                </button>
              </>
            )}
          </div>
        </div>

        <div className={`workspace-editor mobile-pane ${activeMobileTab === "code" ? "active" : ""}`}>
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

        <div className={`workspace-bottom mobile-pane ${activeMobileTab === "results" || activeMobileTab === "scratchpad" || activeMobileTab === "notes" ? "active" : ""}`}>
          <div className="desktop-workspace-tabs" role="tablist" aria-label="Workspace output panels">
            {desktopPanels.map((panel) => (
              <button
                key={panel}
                type="button"
                role="tab"
                aria-selected={activeDesktopPanel === panel}
                className={activeDesktopPanel === panel ? "active" : ""}
                onClick={() => setActiveDesktopPanel(panel)}
              >
                {panel}
                {panel === "stdout" && hasStdout ? <span className="tab-dot" /> : null}
                {panel === "errors" && hasErrors ? <span className="tab-dot error" /> : null}
                {panel === "scratchpad" && hasScratchpadOutput ? <span className={scratchpadResult.status === "error" ? "tab-dot error" : "tab-dot"} /> : null}
                {panel === "history" && recentSubmissions.length ? <span className="tab-dot" /> : null}
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

          <section className={`workspace-panel result-panel ${activeDesktopPanel === "results" ? "active" : ""} ${activeMobileTab === "results" ? "mobile-active" : ""}`}>
            <h2>Results</h2>
            {result.status === "passed" ? (
              <div className="completion-banner">
                <CheckCircle2 size={20} />
                <div>
                  <strong>{lastRunIncludedHidden ? "All tests passed" : "Visible tests passed"}</strong>
                  <p>
                    {lastRunIncludedHidden
                      ? reviewLabel
                        ? `Progress is marked complete. Review scheduled ${reviewLabel}.`
                        : "Progress is marked complete. Keep momentum with the next problem."
                      : "Submit hidden tests when the visible behavior looks solid."}
                  </p>
                </div>
                <div className="completion-actions">
                  {lastRunIncludedHidden && reviewLabel ? <span className="review-chip">Review {reviewLabel}</span> : null}
                  {!lastRunIncludedHidden ? (
                    <button className="primary-button" type="button" onClick={() => void run(true)}>
                      Submit hidden tests
                    </button>
                  ) : nextProblem ? (
                    <Link className="primary-button" to={`/problem/${nextProblem.id}`}>
                      Next problem
                    </Link>
                  ) : (
                    <Link className="primary-button" to={container.backLink}>
                      {container.backLabel}
                    </Link>
                  )}
                </div>
              </div>
            ) : null}
            {hiddenSummary ? <p className="muted">{hiddenSummary}</p> : null}
            {result.status === "stopped" ? <p className="muted">Run stopped before it finished.</p> : null}
            {hasErrors ? <p className="muted">Errors are available in the Errors tab.</p> : null}
            {hasStdout ? (
              <details className="stdout-preview" open>
                <summary>Printed output ({result.stdout.trim().split("\n").length} {result.stdout.trim().split("\n").length === 1 ? "line" : "lines"})</summary>
                <pre>{result.stdout}</pre>
              </details>
            ) : null}
            <TestResultsList
              tests={result.tests}
              showHiddenDiagnostics={showHiddenDiagnostics}
              onToggleHiddenDiagnostics={updateHiddenDiagnostics}
            />

          </section>

          <section className={`workspace-panel result-panel ${activeDesktopPanel === "stdout" ? "active" : ""}`}>
            <h2>Stdout</h2>
            {hasStdout ? <pre>{result.stdout}</pre> : <p className="muted">Nothing printed yet.</p>}
          </section>

          <section className={`workspace-panel result-panel ${activeDesktopPanel === "errors" ? "active" : ""}`}>
            <h2>Errors</h2>
            {result.message ? <pre className="error-output">{result.message}</pre> : null}
            {result.stderr ? <pre className="error-output">{result.stderr}</pre> : null}
            {!hasErrors ? <p className="muted">No runtime or syntax errors.</p> : null}
          </section>

          <section className={`workspace-panel result-panel scratchpad-panel ${activeDesktopPanel === "scratchpad" ? "active" : ""} ${activeMobileTab === "scratchpad" ? "mobile-active" : ""}`}>
            <div className="scratchpad-header">
              <div>
                <h2>Python scratchpad</h2>
                <p className="muted">Run quick experiments without changing your submitted solution.</p>
              </div>
              {scratchpadResult.status === "loading" ? (
                <button className="secondary-button stop-button" type="button" onClick={stopScratchpad}>
                  <Square size={17} fill="currentColor" />
                  Stop
                </button>
              ) : (
                <button className="secondary-button" type="button" onClick={() => void runScratchpad()}>
                  <Play size={17} />
                  Run scratchpad
                </button>
              )}
            </div>
            <CodeMirror
              value={scratchpadCode}
              height="170px"
              extensions={scratchpadExtensions}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                autocompletion: true,
                bracketMatching: true
              }}
              onChange={setScratchpadCode}
            />
            <div className="scratchpad-output" aria-live="polite">
              <h3>Output</h3>
              {scratchpadResult.status === "idle" ? <p className="muted">No scratchpad run yet.</p> : null}
              {scratchpadResult.status === "loading" ? <p className="muted">Running scratchpad...</p> : null}
              {scratchpadResult.status === "stopped" ? <p className="muted">Run stopped before it finished.</p> : null}
              {scratchpadResult.stdout ? <pre>{scratchpadResult.stdout}</pre> : null}
              {scratchpadResult.stderr ? <pre className="error-output">{scratchpadResult.stderr}</pre> : null}
              {scratchpadResult.message ? <pre className="error-output">{scratchpadResult.message}</pre> : null}
              {scratchpadResult.status === "passed" && !hasScratchpadOutput ? <p className="muted">Ran successfully with no printed output.</p> : null}
            </div>
          </section>

          <section className={`workspace-panel ${activeDesktopPanel === "notes" ? "active" : ""} ${activeMobileTab === "notes" ? "mobile-active" : ""}`}>
            <NotesPanel type="problem" id={problem.id} />
          </section>

          <section className={`workspace-panel result-panel ${activeDesktopPanel === "history" ? "active" : ""}`}>
            <div className="history-heading">
              <ListRestart size={18} />
              <h2>Run history</h2>
            </div>
            <SubmissionHistory submissions={recentSubmissions} />
          </section>
        </div>
      </section>
      {coachMounted ? (
        <CoachPanel
          buildContext={buildCoachContext}
          problemId={problem?.id ?? "unknown"}
          visible={coachOpen}
          onClose={() => setCoachOpen(false)}
        />
      ) : null}
      </div>
    </section>
  );
}

function SubmissionHistory({ submissions }: { submissions: SubmissionRecord[] }) {
  if (!submissions.length) {
    return <p className="muted">No runs yet. Visible and submitted runs appear here.</p>;
  }

  return (
    <div className="history-list">
      {submissions.map((submission) => {
        const tests = submission.result.tests;
        const passed = tests.filter((test) => test.passed).length;
        const hidden = tests.filter((test) => test.hidden).length;
        return (
          <article className={`history-item ${submission.passed ? "passed" : "failed"}`} key={`${submission.id ?? submission.createdAt}-${submission.createdAt}`}>
            <div>
              <strong>{submission.passed ? "Passed" : summarizeStatus(submission.result.status)}</strong>
              <span>{formatSubmissionTime(submission.createdAt)}</span>
            </div>
            <p>
              {passed}/{tests.length || 0} tests passed
              {hidden ? `, ${hidden} hidden included` : ", visible only"}
              {submission.result.durationMs ? `, ${formatDuration(submission.result.durationMs)}` : ""}
            </p>
          </article>
        );
      })}
    </div>
  );
}

function summarizeStatus(status: RunResult["status"]): string {
  if (status === "failed") return "Failed";
  if (status === "timeout") return "Timed out";
  if (status === "error") return "Runtime error";
  if (status === "loading") return "Running";
  if (status === "stopped") return "Stopped";
  return "Run";
}

function formatReviewDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function formatSubmissionTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function formatDuration(value: number): string {
  if (value < 1000) return `${value} ms`;
  return `${(value / 1000).toFixed(1)} s`;
}

function defaultScratchpadCode(title?: string): string {
  const label = title ? ` for ${title}` : "";
  return `# Python scratchpad${label}\n# Use print(...) to inspect quick examples.\n\nprint(\"ready\")\n`;
}

function extractParamNames(starterCode: string, entrypoint: string): string[] {
  const escaped = entrypoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = starterCode.match(new RegExp(`def\\s+${escaped}\\s*\\(([^)]*)\\)`));
  if (!match) return [];
  return match[1]
    .split(",")
    .map((token) => token.trim().split(/[:=\s]/)[0])
    .filter(Boolean);
}

function formatExampleValue(value: unknown): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) return "undefined";
  if (serialized.length <= 60) return serialized;
  return JSON.stringify(value, null, 2);
}

interface ExampleSubject {
  starterCode: string;
  entrypoint: string;
}

function renderExample(subject: ExampleSubject, test: { name: string; args: unknown[]; expected: unknown }): string {
  const params = extractParamNames(subject.starterCode, subject.entrypoint);
  const lines = [`# ${test.name}`];
  test.args.forEach((arg, index) => {
    const name = params[index] ?? `arg${index + 1}`;
    lines.push(`${name} = ${formatExampleValue(arg)}`);
  });
  lines.push(`returns ${formatExampleValue(test.expected)}`);
  return lines.join("\n");
}

interface ResolvedPart {
  id: string;
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
}

function resolveProblemParts(problem: Problem | undefined): ResolvedPart[] {
  if (!problem) return [];
  const baseTitle = problem.parts?.length ? "Part 1" : problem.title;
  const base: ResolvedPart = {
    id: "base",
    title: baseTitle,
    prompt: problem.prompt,
    entrypoint: problem.entrypoint,
    starterCode: problem.starterCode,
    referenceCode: problem.referenceCode,
    solutionCode: problem.solutionCode,
    visibleTests: problem.visibleTests,
    hiddenTests: problem.hiddenTests,
    hints: problem.hints,
    solution: problem.solution,
    walkthrough: problem.walkthrough,
    complexity: problem.complexity
  };
  return [base, ...(problem.parts ?? [])];
}
