import { type CSSProperties, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import type { ContentGraph, RunResult, Scenario, ScenarioCheckpoint, ScenarioSet, TestResult, TestVisibility } from "../../../src/core/types";
import { API_BASE } from "./apiBase";
import { BasicCodeEditor } from "./CodeEditor";
import { runScenarioPythonTests } from "./pyodideRunner";
import { OpenNavigationButton, PanelCloseIcon, PanelOpenIcon, ShowSidebarButton } from "./SidebarControls";

export interface ScenarioAttemptSummary {
  attemptId: string;
  scenarioId: string;
  scenarioTitle: string;
  workspacePath: string;
  startedAt: string;
  updatedAt: string;
  endedAt?: string;
  checkpoints: ScenarioCheckpointResponse[];
  aiTurns: ScenarioAiTurn[];
  visibleRuns: ScenarioRunRecord[];
  hiddenRuns: ScenarioRunRecord[];
  judge?: ScenarioJudgeReport;
}

interface ScenarioCheckpointResponse {
  checkpointId: string;
  answer: string;
  createdAt: string;
}

interface ScenarioAiTurn {
  id: string;
  kind: "coach" | "judge";
  userMessage: string;
  response: string;
  createdAt: string;
}

interface ScenarioRunRecord extends RunResult {
  runId: string;
  visibility: TestVisibility;
  command: string;
  exitCode: number | null;
  ranAt: string;
}

interface ScenarioHiddenTestFile {
  path: string;
  content: string;
  visibility: "hidden";
}

interface ScenarioEditableFile {
  path: string;
  content: string;
}

interface ScenarioJudgeReport {
  overall: "strong_hire" | "hire" | "mixed" | "no_hire";
  summary: string;
  scores: Array<{
    metricId: string;
    label: string;
    score: number;
    evidence: string;
    improvement: string;
  }>;
  highestRiskWeakness: string;
  nextDrill: string;
  createdAt: string;
}

interface CodexStatus {
  available: boolean;
  provider?: string;
  model?: string | null;
  reason?: string;
}

const DEFAULT_TEST_PANE_SHARE = 42;
const MIN_TEST_PANE_SHARE = 18;
const MAX_TEST_PANE_SHARE = 68;
const STALE_ACTIVE_ATTEMPT_GRACE_MS = 10 * 60 * 1000;
type ScenarioSupportTab = "interviewer" | "plan" | "scratchpad" | "notes";
const scenarioSupportTabs: Array<{ id: ScenarioSupportTab; label: string }> = [
  { id: "interviewer", label: "Interviewer" },
  { id: "plan", label: "Plan" },
  { id: "scratchpad", label: "Scratchpad" },
  { id: "notes", label: "Notes" }
];

export function ScenarioSetScreen({
  graph,
  scenarioSet,
  attempts,
  sidebarCollapsed,
  onShowSidebar,
  onOpenMobileNav,
  onOpenScenario
}: {
  graph: ContentGraph;
  scenarioSet: ScenarioSet;
  attempts: ScenarioAttemptSummary[];
  sidebarCollapsed: boolean;
  onShowSidebar: () => void;
  onOpenMobileNav: () => void;
  onOpenScenario: (scenarioId: string, attemptId?: string) => void;
}) {
  const latestByScenario = useMemo(() => latestAttemptsByScenario(attempts), [attempts]);
  const isOnsiteSet = scenarioSet.id === "ramp-onsite-coding";

  return (
    <section className="page stack scenario-index-page">
      <div className="page-header">
        <OpenNavigationButton onClick={onOpenMobileNav} />
        {sidebarCollapsed ? <ShowSidebarButton onClick={onShowSidebar} /> : null}
        <div className="page-header-main">
          <p className="eyebrow">{isOnsiteSet ? "Onsite interview rehearsal" : "AI backend interview simulator"}</p>
          <h1>{scenarioSet.title}</h1>
          <p className="lead">{scenarioSet.summary}</p>
        </div>
      </div>

      <section className="scenario-guidance">
        <div>
          <h2>{isOnsiteSet ? "How to run a rehearsal" : "How to run a drill"}</h2>
          <p>
            {isOnsiteSet
              ? "Start a scenario, work in the in-app Python editor, run visible tests here, and treat the Codex panel like a sparse interviewer: clarifying questions, time checks, and a debrief after the session."
              : "Start a scenario, work in the in-app Python editor, and treat Codex like the interview AI tool: ask it to inspect, propose tests, review diffs, and pressure-test your plan while you stay in command."}
          </p>
        </div>
        <div>
          <h2>{isOnsiteSet ? "What the debrief scores" : "What this scores"}</h2>
          <p>
            {isOnsiteSet
              ? "The live round stays fair and low-signal. After you end it, the debrief evaluates framing, invariants, correctness, tests, tradeoffs, and communication."
              : "The judge looks at codebase comprehension, framing, AI direction, MVP judgment, correctness, testing, tradeoffs, and communication. Passing tests is necessary, but not the whole signal."}
          </p>
        </div>
      </section>

      <div className="scenario-grid">
        {scenarioSet.entries.map((entry) => {
          const scenario = graph.scenarios.find((candidate) => candidate.id === entry.scenario);
          if (!scenario) return null;
          const latest = latestByScenario.get(scenario.id);
          const latestStatus = latest?.hiddenRuns[0]?.status ?? latest?.visibleRuns[0]?.status;
          return (
            <button
              key={scenario.id}
              type="button"
              className="scenario-card"
              onClick={() => onOpenScenario(scenario.id, latest?.attemptId)}
            >
              <p className="eyebrow">{entry.category ?? "scenario"} / {scenario.timeboxMinutes} min</p>
              <h2>{scenario.title}</h2>
              <p>{scenario.summary}</p>
              <div className="tag-row compact-tags">
                <span>{scenario.difficulty}</span>
                {scenario.concepts.slice(0, 3).map((concept) => <span key={concept}>{concept}</span>)}
              </div>
              <footer>
                <span>{latest ? `Resume attempt / ${latestStatus ?? "started"}` : "Start scenario"}</span>
                <span aria-hidden="true">{"->"}</span>
              </footer>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function ScenarioWorkspaceScreen({
  scenario,
  attemptId,
  sidebarCollapsed,
  onShowSidebar,
  onOpenMobileNav,
  onBack,
  onAttemptStarted,
  onAttemptsChanged
}: {
  scenario: Scenario;
  attemptId?: string;
  sidebarCollapsed: boolean;
  onShowSidebar: () => void;
  onOpenMobileNav: () => void;
  onBack: () => void;
  onAttemptStarted: (attemptId: string) => void;
  onAttemptsChanged: () => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [attempt, setAttempt] = useState<ScenarioAttemptSummary | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [diff, setDiff] = useState("");
  const [checkpointDrafts, setCheckpointDrafts] = useState<Record<string, string>>({});
  const [coachInput, setCoachInput] = useState("");
  const [finalExplanation, setFinalExplanation] = useState("");
  const [codexStatus, setCodexStatus] = useState<CodexStatus | null>(null);
  const [supportTab, setSupportTab] = useState<ScenarioSupportTab>("interviewer");
  const [scenarioScratchpad, setScenarioScratchpad] = useState("");
  const [scenarioNotes, setScenarioNotes] = useState("");
  const [promptCollapsed, setPromptCollapsed] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timerVisible, setTimerVisible] = useState(true);
  const [pacingVisible, setPacingVisible] = useState(false);
  const [timerBaseOverride, setTimerBaseOverride] = useState<number | null>(null);
  const [timerPausedAt, setTimerPausedAt] = useState<number | null>(null);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [editableFiles, setEditableFiles] = useState<ScenarioEditableFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState("");
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [testsCollapsed, setTestsCollapsed] = useState(false);
  const [testPaneShare, setTestPaneShare] = useState(DEFAULT_TEST_PANE_SHARE);
  const [restartConfirming, setRestartConfirming] = useState(false);
  const sessionPaneRef = useRef<HTMLElement | null>(null);
  const resizingTestsRef = useRef(false);
  const editableFilesRef = useRef<ScenarioEditableFile[]>([]);
  const activeFilePathRef = useRef("");
  const lastSavedFileContentsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    editableFilesRef.current = editableFiles;
  }, [editableFiles]);

  useEffect(() => {
    activeFilePathRef.current = activeFilePath;
  }, [activeFilePath]);

  useEffect(() => {
    let alive = true;
    setError("");
    void (async () => {
      try {
        const [{ prompt: nextPrompt }, status] = await Promise.all([
          getJson<{ prompt: string }>(`/scenarios/prompt?scenarioId=${encodeURIComponent(scenario.id)}`),
          safeGetJson<CodexStatus>("/codex/status")
        ]);
        if (!alive) return;
        setPrompt(nextPrompt);
        setCodexStatus(status);
      } catch (err) {
        if (alive) setError(errorMessage(err));
      }
    })();
    return () => {
      alive = false;
    };
  }, [scenario.id]);

  useEffect(() => {
    let alive = true;
    setAttempt(null);
    setDiff("");
    setCheckpointDrafts({});
    setSupportTab("interviewer");
    setScenarioScratchpad("");
    setScenarioNotes("");
    setRestartConfirming(false);
    setEditableFiles([]);
    setActiveFilePath("");
    setTestsCollapsed(false);
    setTestPaneShare(DEFAULT_TEST_PANE_SHARE);
    setPacingVisible(false);
    lastSavedFileContentsRef.current = {};
    setSessionEnded(false);
    setTimerPaused(false);
    setTimerBaseOverride(null);
    setTimerPausedAt(null);
    if (!attemptId) return () => {
      alive = false;
    };
    void (async () => {
      try {
        const { attempt: nextAttempt } = await getJson<{ attempt: ScenarioAttemptSummary }>(
          `/scenarios/attempt?attemptId=${encodeURIComponent(attemptId)}`
        );
        if (!alive) return;
        setAttempt(nextAttempt);
        setCheckpointDrafts(draftsFromAttempt(nextAttempt));
        setSessionEnded(Boolean(nextAttempt.endedAt));
        const now = Date.now();
        const staleResume = isStaleActiveScenarioAttempt(nextAttempt, scenario.timeboxMinutes, now);
        if (staleResume) {
          setTimerBaseOverride(now);
          setTimerPausedAt(now);
          setClockNow(now);
          setTimerPaused(true);
        } else {
          setTimerPaused(Boolean(nextAttempt.endedAt));
          setClockNow(now);
        }
        await loadEditableFiles(nextAttempt.attemptId, alive);
        await refreshDiff(nextAttempt.attemptId, alive);
      } catch (err) {
        if (alive) setError(errorMessage(err));
      }
    })();
    return () => {
      alive = false;
    };
  }, [attemptId, scenario.timeboxMinutes]);

  useEffect(() => {
    if (timerPaused) return undefined;
    const timer = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [timerPaused]);

  useEffect(() => {
    if (!restartConfirming) return undefined;
    const timer = window.setTimeout(() => setRestartConfirming(false), 6000);
    return () => window.clearTimeout(timer);
  }, [restartConfirming]);

  useEffect(() => {
    if (!attempt || !activeFilePath) return undefined;
    const file = editableFiles.find((candidate) => candidate.path === activeFilePath);
    if (!file) return undefined;
    if (lastSavedFileContentsRef.current[file.path] === file.content) {
      setSaveState("saved");
      return undefined;
    }
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      void saveEditableFile(file.path, file.content).catch((err) => {
        setSaveState("error");
        setError(errorMessage(err));
      });
    }, 650);
    return () => window.clearTimeout(timer);
  }, [activeFilePath, attempt, editableFiles]);

  async function startAttempt() {
    await withBusy("Starting scenario", async () => {
      await startFreshAttempt();
    });
  }

  async function restartAttempt() {
    if (!attempt) return;
    if (!restartConfirming) {
      setRestartConfirming(true);
      return;
    }
    await withBusy("Starting over", async () => {
      await flushActiveFile();
      await startFreshAttempt();
    });
  }

  async function startFreshAttempt() {
    const { attempt: nextAttempt } = await postJson<{ attempt: ScenarioAttemptSummary }>("/scenarios/start", { scenarioId: scenario.id });
    setAttempt(nextAttempt);
    setCheckpointDrafts({});
    setDiff("");
    setCoachInput("");
    setFinalExplanation("");
    setSupportTab("interviewer");
    setScenarioScratchpad("");
    setScenarioNotes("");
    setRestartConfirming(false);
    setTestsCollapsed(false);
    setTestPaneShare(DEFAULT_TEST_PANE_SHARE);
    setPacingVisible(false);
    setSessionEnded(false);
    setTimerPaused(false);
    setTimerBaseOverride(null);
    setTimerPausedAt(null);
    setClockNow(Date.now());
    await loadEditableFiles(nextAttempt.attemptId);
    onAttemptStarted(nextAttempt.attemptId);
    onAttemptsChanged();
  }

  function toggleTimerPaused() {
    if (!attempt || debriefOpen) return;
    const now = Date.now();
    if (timerPaused) {
      const naturalBase = Date.parse(attempt.startedAt);
      setTimerBaseOverride((base) => timerPausedAt ? (base ?? naturalBase) + (now - timerPausedAt) : base);
      setTimerPausedAt(null);
      setClockNow(now);
      setTimerPaused(false);
      return;
    }
    setClockNow(now);
    setTimerPausedAt(now);
    setTimerPaused(true);
  }

  function restartTimer() {
    if (!attempt || debriefOpen) return;
    const now = Date.now();
    setTimerBaseOverride(now);
    setTimerPausedAt(null);
    setClockNow(now);
    setTimerPaused(false);
  }

  async function openAttempt(target: "cursor" | "vscode" | "finder") {
    if (!attempt) return;
    await withBusy(`Opening ${target}`, async () => {
      await flushActiveFile();
      await postJson("/scenarios/open", { attemptId: attempt.attemptId, target });
    });
  }

  async function runVisible() {
    if (!attempt) return;
    await withBusy("Running visible tests", async () => {
      await flushActiveFile();
      const result = await runScenarioPythonTests(editableFilesRef.current, "visible");
      const { attempt: nextAttempt } = await postJson<{ attempt: ScenarioAttemptSummary; run: ScenarioRunRecord }>(
        "/scenarios/runs",
        { attemptId: attempt.attemptId, visibility: "visible", result }
      );
      setAttempt(nextAttempt);
      await refreshDiff(nextAttempt.attemptId);
      onAttemptsChanged();
    });
  }

  async function submitHidden() {
    if (!attempt) return;
    await withBusy("Submitting hidden tests", async () => {
      await flushActiveFile();
      const { files: hiddenFiles } = await getJson<{ files: ScenarioHiddenTestFile[] }>(
        `/scenarios/hidden-tests?attemptId=${encodeURIComponent(attempt.attemptId)}`
      );
      const sourceFiles = editableFilesRef.current.filter((file) => !file.path.startsWith("tests/"));
      const result = await runScenarioPythonTests([...sourceFiles, ...hiddenFiles], "hidden");
      const { attempt: nextAttempt } = await postJson<{ attempt: ScenarioAttemptSummary; run: ScenarioRunRecord }>(
        "/scenarios/runs",
        { attemptId: attempt.attemptId, visibility: "hidden", result }
      );
      setAttempt(nextAttempt);
      await refreshDiff(nextAttempt.attemptId);
      onAttemptsChanged();
    });
  }

  async function saveCheckpoint(checkpoint: ScenarioCheckpoint) {
    if (!attempt) return;
    await withBusy("Saving checkpoint", async () => {
      const { attempt: nextAttempt } = await postJson<{ attempt: ScenarioAttemptSummary }>("/scenarios/checkpoint", {
        attemptId: attempt.attemptId,
        checkpointId: checkpoint.id,
        answer: checkpointDrafts[checkpoint.id] ?? ""
      });
      setAttempt(nextAttempt);
      onAttemptsChanged();
    });
  }

  async function endSession() {
    if (!attempt) return;
    await withBusy("Ending session", async () => {
      await flushActiveFile();
      const { attempt: nextAttempt } = await postJson<{ attempt: ScenarioAttemptSummary }>("/scenarios/end-session", {
        attemptId: attempt.attemptId
      });
      setAttempt(nextAttempt);
      setSessionEnded(true);
      setTimerPaused(true);
      setTimerPausedAt(null);
      if (nextAttempt.endedAt) setClockNow(Date.parse(nextAttempt.endedAt));
      onAttemptsChanged();
    });
  }

  async function askCoach() {
    if (!attempt || !coachInput.trim()) return;
    await withBusy("Asking interviewer", async () => {
      await flushActiveFile();
      const { attempt: nextAttempt } = await postJson<{ attempt: ScenarioAttemptSummary; response: string }>(
        "/scenarios/coach",
        { attemptId: attempt.attemptId, message: coachInput }
      );
      setAttempt(nextAttempt);
      setCoachInput("");
      onAttemptsChanged();
    });
  }

  async function judgeAttempt() {
    if (!attempt) return;
    await withBusy("Judging attempt", async () => {
      await flushActiveFile();
      const { attempt: nextAttempt } = await postJson<{ attempt: ScenarioAttemptSummary; report: ScenarioJudgeReport }>(
        "/scenarios/judge",
        { attemptId: attempt.attemptId, finalExplanation }
      );
      setAttempt(nextAttempt);
      onAttemptsChanged();
    });
  }

  async function refreshDiff(attemptToRefresh = attempt?.attemptId, alive = true) {
    if (!attemptToRefresh) return;
    const { diff: nextDiff } = await getJson<{ diff: string }>(`/scenarios/diff?attemptId=${encodeURIComponent(attemptToRefresh)}`);
    if (alive) setDiff(nextDiff);
  }

  async function loadEditableFiles(attemptToLoad: string, alive = true) {
    const { files } = await getJson<{ files: ScenarioEditableFile[] }>(`/scenarios/files?attemptId=${encodeURIComponent(attemptToLoad)}`);
    if (!alive) return;
    const saved: Record<string, string> = {};
    for (const file of files) saved[file.path] = file.content;
    lastSavedFileContentsRef.current = saved;
    editableFilesRef.current = files;
    setEditableFiles(files);
    setActiveFilePath((current) => preferredScenarioFile(files, current));
    setSaveState("saved");
  }

  async function saveEditableFile(path: string, content: string): Promise<ScenarioAttemptSummary | null> {
    if (!attempt) return null;
    setSaveState("saving");
    const { attempt: nextAttempt } = await postJson<{ attempt: ScenarioAttemptSummary }>("/scenarios/file", {
      attemptId: attempt.attemptId,
      path,
      content
    });
    lastSavedFileContentsRef.current = {
      ...lastSavedFileContentsRef.current,
      [path]: content
    };
    setAttempt(nextAttempt);
    setSaveState("saved");
    onAttemptsChanged();
    return nextAttempt;
  }

  async function flushActiveFile() {
    const path = activeFilePathRef.current;
    if (!attempt || !path) return;
    const file = editableFilesRef.current.find((candidate) => candidate.path === path);
    if (!file || lastSavedFileContentsRef.current[path] === file.content) return;
    await saveEditableFile(path, file.content);
  }

  async function selectEditableFile(path: string) {
    await flushActiveFile();
    setActiveFilePath(path);
    const file = editableFilesRef.current.find((candidate) => candidate.path === path);
    setSaveState(file && lastSavedFileContentsRef.current[path] !== file.content ? "saving" : "saved");
  }

  function updateActiveFile(content: string) {
    const path = activeFilePathRef.current;
    if (!path) return;
    setEditableFiles((files) => files.map((file) => file.path === path ? { ...file, content } : file));
  }

  function runFromEditor(includeHidden: boolean) {
    if (includeHidden && !debriefOpen) {
      setError("Hidden tests unlock after you end the session.");
      return;
    }
    void (includeHidden ? submitHidden() : runVisible());
  }

  function resizeTestsPane(clientY: number) {
    const pane = sessionPaneRef.current;
    if (!pane) return;
    const rect = pane.getBoundingClientRect();
    if (!rect.height) return;
    const testsPixels = rect.bottom - clientY;
    const nextShare = Math.round((testsPixels / rect.height) * 100);
    setTestPaneShare(clampNumber(nextShare, MIN_TEST_PANE_SHARE, MAX_TEST_PANE_SHARE));
  }

  function beginTestsPaneResize(clientY: number, moveEventName: "mousemove" | "pointermove", upEventName: "mouseup" | "pointerup") {
    if (!sessionPaneRef.current) return;
    if (resizingTestsRef.current) return;
    resizingTestsRef.current = true;
    setTestsCollapsed(false);
    document.body.classList.add("scenario-resizing-tests");
    resizeTestsPane(clientY);

    const handleMove = (moveEvent: globalThis.MouseEvent | globalThis.PointerEvent) => {
      resizeTestsPane(moveEvent.clientY);
    };
    const handleUp = () => {
      resizingTestsRef.current = false;
      document.body.classList.remove("scenario-resizing-tests");
      window.removeEventListener(moveEventName, handleMove as EventListener);
      window.removeEventListener(upEventName, handleUp);
    };
    window.addEventListener(moveEventName, handleMove as EventListener);
    window.addEventListener(upEventName, handleUp, { once: true });
  }

  function handleTestsResizePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    beginTestsPaneResize(event.clientY, "pointermove", "pointerup");
  }

  function handleTestsResizeMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    event.preventDefault();
    beginTestsPaneResize(event.clientY, "mousemove", "mouseup");
  }

  function handleTestsResizerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setTestsCollapsed(false);
      setTestPaneShare((share) => clampNumber(share + 5, MIN_TEST_PANE_SHARE, MAX_TEST_PANE_SHARE));
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setTestsCollapsed(false);
      setTestPaneShare((share) => clampNumber(share - 5, MIN_TEST_PANE_SHARE, MAX_TEST_PANE_SHARE));
    } else if (event.key === "Home") {
      event.preventDefault();
      setTestsCollapsed(false);
      setTestPaneShare(MAX_TEST_PANE_SHARE);
    } else if (event.key === "End") {
      event.preventDefault();
      setTestsCollapsed(false);
      setTestPaneShare(MIN_TEST_PANE_SHARE);
    }
  }

  async function withBusy(label: string, action: () => Promise<void>) {
    setBusy(label);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy("");
    }
  }

  const latestVisible = attempt?.visibleRuns[0];
  const latestHidden = attempt?.hiddenRuns[0];
  const latestCoachTurns = attempt?.aiTurns.filter((turn) => turn.kind === "coach").slice(0, 3) ?? [];
  const activeFile = editableFiles.find((file) => file.path === activeFilePath);
  const activeFileLanguage = languageForScenarioFile(activeFilePath);
  const workspacePath = attempt?.workspacePath;
  const isOnsiteInterview = isOnsiteScenario(scenario, prompt);
  const debriefOpen = sessionEnded || Boolean(attempt?.endedAt) || Boolean(attempt?.judge);
  const timerBaseMs = attempt ? timerBaseOverride ?? Date.parse(attempt.startedAt) : 0;
  const timerStopMs = attempt?.endedAt ? Date.parse(attempt.endedAt) : timerPausedAt ?? clockNow;
  const elapsedMs = attempt ? Math.max(0, timerStopMs - timerBaseMs) : 0;
  const elapsedMinutes = elapsedMs / 60000;
  const remainingMinutes = Math.max(0, scenario.timeboxMinutes - elapsedMinutes);
  const phaseState = interviewPhaseState(scenario.timeboxMinutes, elapsedMinutes);
  const interviewerQuestion = currentInterviewerQuestion(phaseState.active.label, latestCoachTurns[0]);
  const rightRailQuestion = debriefOpen
    ? "The live interview is over. Add your final explanation, then use the debrief tools below the test output."
    : interviewerQuestion;
  const timeCheckCopy = debriefOpen
    ? "Session ended. Review the visible failures, run hidden tests if useful, then generate the debrief."
    : timerPaused && attempt
      ? `${Math.ceil(remainingMinutes)} minutes on the current pacing plan. Resume or restart the timer when you begin.`
    : attempt
      ? `${Math.ceil(remainingMinutes)} minutes remaining. ${phaseState.active.label} is the active pacing band.`
      : "Timer starts when the session starts.";
  const interviewerInputLabel = debriefOpen ? "Interview chat closed" : "Ask or answer out loud";
  const interviewerInputPlaceholder = debriefOpen
    ? "Live interviewer input is disabled after ending the session."
    : isOnsiteInterview
      ? "Ask a clarification, or tell the interviewer what you are about to do."
      : "Ask for review, tests, or a subtle nudge.";
  const debriefLockCopy = debriefOpen
    ? "Debrief is open below. Add a final explanation, run hidden tests, then generate feedback."
    : "Debrief unlocks when you end the session.";
  const sessionPaneClassName = [
    "scenario-main-pane",
    "scenario-session-pane",
    attempt ? "scenario-session-active" : "",
    debriefOpen ? "scenario-session-debrief" : "",
    testsCollapsed ? "scenario-tests-collapsed" : ""
  ].filter(Boolean).join(" ");
  const sessionPaneStyle = attempt && !debriefOpen && !testsCollapsed
    ? ({
        "--scenario-editor-share": `${100 - testPaneShare}fr`,
        "--scenario-tests-share": `${testPaneShare}fr`
      } as CSSProperties)
    : undefined;
  const scenarioLayoutClassName = [
    "scenario-layout",
    "scenario-interview-layout",
    promptCollapsed ? "scenario-prompt-collapsed" : ""
  ].filter(Boolean).join(" ");

  return (
    <section className={`scenario-workspace ${isOnsiteInterview ? "scenario-onsite-workspace" : ""}`}>
      <header className="scenario-interview-header">
        <div className="scenario-interview-title">
          <OpenNavigationButton onClick={onOpenMobileNav} />
          {sidebarCollapsed ? <ShowSidebarButton onClick={onShowSidebar} /> : null}
          <button type="button" className="secondary-button compact-button" onClick={onBack}>Back</button>
          <div>
            <p className="problem-breadcrumb">
              <span>{isOnsiteInterview ? "Ramp Prep / Onsite Rehearsal" : "Ramp AI Backend Drills"}</span>
              <span>/</span>
              <span>{scenario.difficulty}</span>
            </p>
            <h1>{isOnsiteInterview ? `Ramp Onsite: ${scenario.title}` : scenario.title}</h1>
          </div>
        </div>
        <div className="scenario-interview-actions">
          <div className={`scenario-timer-control ${timerVisible ? "" : "timer-hidden"}`} aria-label="Interview timer controls">
            {timerVisible ? (
              <div className="scenario-timer" aria-label="Elapsed interview time">
                <span>{attempt ? formatClock(elapsedMs) : "--:--"}</span>
                <small>{debriefOpen ? "Ended" : timerPaused ? "Paused" : "Elapsed"}</small>
              </div>
            ) : (
              <span className="scenario-timer-hidden-label">Timer hidden</span>
            )}
            <button
              type="button"
              className="secondary-button compact-button subtle-button"
              onClick={() => setTimerVisible((visible) => !visible)}
              aria-pressed={!timerVisible}
            >
              {timerVisible ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="secondary-button compact-button subtle-button"
              onClick={toggleTimerPaused}
              disabled={!attempt || debriefOpen}
            >
              {debriefOpen ? "Ended" : timerPaused ? "Resume" : "Pause"}
            </button>
            <button
              type="button"
              className="secondary-button compact-button subtle-button"
              onClick={restartTimer}
              disabled={!attempt || debriefOpen}
            >
              Reset timer
            </button>
          </div>
          <button
            type="button"
            className={`secondary-button compact-button scenario-restart-button ${restartConfirming ? "confirming" : ""}`}
            onClick={() => void restartAttempt()}
            disabled={!attempt || Boolean(busy)}
            title={restartConfirming ? "Click again to start a fresh attempt from starter files" : "Start a fresh attempt from starter files"}
          >
            {restartConfirming ? "Confirm start over" : "Start over"}
          </button>
          <button type="button" className="primary-button compact-button" onClick={() => void runVisible()} disabled={Boolean(busy) || !attempt}>
            Run tests
          </button>
          <button
            type="button"
            className="secondary-button compact-button scenario-danger-button"
            onClick={() => void endSession()}
            disabled={!attempt || debriefOpen}
          >
            End session
          </button>
        </div>
      </header>

      {error ? <p className="scenario-error" role="alert">{error}</p> : null}
      {busy ? <p className="scenario-busy">{busy}...</p> : null}

      <div className={scenarioLayoutClassName}>
        <aside className={`scenario-prompt-pane scenario-live-left-pane ${promptCollapsed ? "is-collapsed" : ""}`}>
          {promptCollapsed ? (
            <button
              type="button"
              className="scenario-prompt-restore-button"
              onClick={() => setPromptCollapsed(false)}
              aria-label="Show prompt"
              title="Show prompt"
            >
              <PanelOpenIcon />
              <span>Prompt</span>
            </button>
          ) : (
            <section className="prompt-primary scenario-tab-panel">
              <div className="prompt-primary-heading scenario-prompt-heading-row">
                <h2>Prompt</h2>
                <button
                  type="button"
                  className="dock-collapse-button scenario-prompt-collapse-button"
                  onClick={() => setPromptCollapsed(true)}
                  aria-label="Hide prompt"
                  title="Hide prompt"
                >
                  <PanelCloseIcon />
                </button>
              </div>
              {prompt ? <ScenarioMarkdown content={prompt} /> : <p className="muted">Loading prompt...</p>}
            </section>
          )}
        </aside>

        <main ref={sessionPaneRef} className={sessionPaneClassName} style={sessionPaneStyle}>
          {!attempt ? (
            <section className="scenario-start-card">
              <p className="eyebrow">{scenario.timeboxMinutes} minute simulation</p>
              <h2>{isOnsiteInterview ? "Start in-app interview" : "Start in-app workspace"}</h2>
              <p>
                {isOnsiteInterview
                  ? "This loads starter code and tests into the in-app Python editor. Work from the prompt, talk through your approach, and keep Codex in interviewer mode."
                  : "This loads starter code and tests into the in-app Python editor, with tests running in the same in-app Python runtime as the practice workspace."}
              </p>
              <button type="button" className="primary-button" onClick={() => void startAttempt()} disabled={Boolean(busy)}>
                Start session
              </button>
            </section>
          ) : (
            <>
              <section className="scenario-workbench scenario-code-workbench">
                <header>
                  <div>
                    <p className="eyebrow">Editor</p>
                    <code>{activeFilePath || workspacePath}</code>
                  </div>
                  <div className="scenario-action-row">
                    <span className={`scenario-save-state ${saveState}`}>{saveStateLabel(saveState)}</span>
                  </div>
                </header>

                {editableFiles.length ? (
                  <div className="scenario-file-tabs" role="tablist" aria-label="Scenario files">
                    {editableFiles.map((file) => (
                      <button
                        key={file.path}
                        type="button"
                        className={file.path === activeFilePath ? "active" : ""}
                        onClick={() => void selectEditableFile(file.path)}
                      >
                        {file.path}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="scenario-file-editor">
                  {activeFile ? (
                    <BasicCodeEditor
                      key={activeFile.path}
                      value={activeFile.content}
                      language={activeFileLanguage}
                      ariaLabel={`${activeFile.path} editor`}
                      onChange={updateActiveFile}
                      onRun={runFromEditor}
                      className="code-editor scenario-basic-editor"
                    />
                  ) : (
                    <div className="scenario-empty-diff">
                      <strong>No editable files loaded</strong>
                      <p>Start or resume a session to load the Python workspace.</p>
                    </div>
                  )}
                </div>
              </section>

              {!testsCollapsed && !debriefOpen ? (
                <div
                  className="dock-resize-handle scenario-tests-resizer"
                  role="separator"
                  aria-label="Resize tests pane"
                  aria-orientation="horizontal"
                  aria-valuemin={MIN_TEST_PANE_SHARE}
                  aria-valuemax={MAX_TEST_PANE_SHARE}
                  aria-valuenow={testPaneShare}
                  aria-controls="scenario-tests-pane"
                  tabIndex={0}
                  onPointerDown={handleTestsResizePointerDown}
                  onMouseDown={handleTestsResizeMouseDown}
                  onKeyDown={handleTestsResizerKeyDown}
                />
              ) : null}

              <section className="scenario-test-output">
                <ScenarioTestsPane
                  editableFiles={editableFiles}
                  result={latestVisible}
                  busy={busy}
                  canRun={Boolean(attempt)}
                  collapsed={testsCollapsed}
                  onCollapsedChange={setTestsCollapsed}
                  onRun={() => void runVisible()}
                  onOpenFile={(path) => void selectEditableFile(path)}
                />
              </section>

              {debriefOpen ? (
                <section className="scenario-debrief-panel">
                  <div className="section-heading">
                    <h2>Debrief Studio</h2>
                    <p>Detailed feedback is intentionally held until the session ends.</p>
                  </div>
                  <textarea
                    value={finalExplanation}
                    onChange={(event) => setFinalExplanation(event.target.value)}
                    rows={4}
                    placeholder="Explain your assumptions, invariant, tests run, tradeoffs, and where you got stuck."
                  />
                  <div className="scenario-action-row">
                    <button type="button" className="secondary-button compact-button" onClick={() => void submitHidden()} disabled={Boolean(busy)}>
                      Run hidden tests
                    </button>
                    <button type="button" className="primary-button compact-button" onClick={() => void judgeAttempt()} disabled={Boolean(busy)}>
                      Generate debrief
                    </button>
                  </div>
                  {latestHidden ? <ScenarioResultCard label="Hidden submit" result={latestHidden} /> : null}
                  {attempt.judge ? <JudgeReport report={attempt.judge} /> : null}
                  <section className="scenario-rubric">
                    <h2>Rubric</h2>
                    {scenario.rubric.map((metric) => (
                      <details key={metric.id}>
                        <summary>{metric.label} <span>{metric.weight}%</span></summary>
                        <p>{metric.excellent}</p>
                      </details>
                    ))}
                  </section>
                </section>
              ) : null}
            </>
          )}
        </main>

        <aside className="scenario-interviewer-pane">
          <header>
            <div>
              <p className="eyebrow">Codex SDK</p>
              <h2>{isOnsiteInterview ? "Interviewer" : "Scenario coach"}</h2>
            </div>
            <span>{codexStatus?.available ? codexStatus.model ?? "ready" : "offline"}</span>
          </header>

          <div className="scenario-support-tabs" role="tablist" aria-label="Scenario support tools">
            {scenarioSupportTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={supportTab === tab.id}
                className={supportTab === tab.id ? "active" : ""}
                onClick={() => setSupportTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {supportTab === "interviewer" ? (
            <section className="scenario-support-panel">
              <section className="scenario-transcript">
                <h3>Live transcript</h3>
                {latestCoachTurns.length ? (
                  latestCoachTurns.slice().reverse().map((turn) => (
                    <div key={turn.id} className="scenario-transcript-turn">
                      <p><strong>You</strong> <span className="scenario-transcript-time">{formatTime(turn.createdAt)}</span></p>
                      <p>{turn.userMessage}</p>
                      <p><strong>{isOnsiteInterview ? "Interviewer" : "Codex"}</strong></p>
                      <ScenarioMarkdown content={turn.response} />
                    </div>
                  ))
                ) : (
                  <div className="scenario-transcript-turn">
                    <p><strong>{isOnsiteInterview ? "Interviewer" : "Codex"}</strong></p>
                    <p>{isOnsiteInterview ? "Start by restating the contract and calling out the first ambiguity you would clarify." : "Ask for a review, test strategy, or scenario-specific pressure test when you are ready."}</p>
                  </div>
                )}
              </section>

              <section className="scenario-interviewer-card">
                <h3>Current question</h3>
                <p>{rightRailQuestion}</p>
              </section>

              <section className="scenario-interviewer-card quiet">
                <div className="scenario-time-check-heading">
                  <h3>Time check</h3>
                  <button
                    type="button"
                    className="secondary-button compact-button subtle-button scenario-pacing-toggle"
                    onClick={() => setPacingVisible((visible) => !visible)}
                    aria-expanded={pacingVisible}
                  >
                    {pacingVisible ? "Hide pacing" : "Show pacing"}
                  </button>
                </div>
                <p>{timeCheckCopy}</p>
                {pacingVisible ? (
                  <ol className="scenario-pacing-list" aria-label="Interview pacing timeline">
                    {phaseState.phases.map((phase, index) => (
                      <li key={phase.label} className={index < phaseState.activeIndex ? "done" : index === phaseState.activeIndex ? "active" : ""}>
                        <span>{phase.label}</span>
                        <small>{phase.minutes} min</small>
                      </li>
                    ))}
                  </ol>
                ) : null}
              </section>

              <section className="scenario-interviewer-input">
                <label htmlFor="scenario-interviewer-message">{interviewerInputLabel}</label>
                <textarea
                  id="scenario-interviewer-message"
                  value={coachInput}
                  onChange={(event) => setCoachInput(event.target.value)}
                  rows={4}
                  placeholder={interviewerInputPlaceholder}
                  disabled={!attempt || debriefOpen}
                />
                <button type="button" className="primary-button compact-button" onClick={() => void askCoach()} disabled={Boolean(busy) || !coachInput.trim() || !attempt || debriefOpen}>
                  {debriefOpen ? "Closed" : "Send"}
                </button>
              </section>

              <p className="scenario-debrief-lock">{debriefLockCopy}</p>
            </section>
          ) : null}

          {supportTab === "plan" ? (
            <section className="scenario-support-panel scenario-plan-panel">
              <div className="section-heading">
                <h2>Your plan</h2>
                <p>Candidate-authored checkpoints for the rehearsal.</p>
              </div>
              {scenario.checkpoints.map((checkpoint) => (
                <article key={checkpoint.id} className="scenario-plan-note">
                  <header>
                    <span>{checkpoint.minute} min</span>
                    <strong>{checkpoint.title}</strong>
                  </header>
                  <p>{checkpoint.prompt}</p>
                  <textarea
                    value={checkpointDrafts[checkpoint.id] ?? ""}
                    onChange={(event) => setCheckpointDrafts((drafts) => ({ ...drafts, [checkpoint.id]: event.target.value }))}
                    rows={3}
                    disabled={!attempt}
                  />
                  <button type="button" className="secondary-button compact-button" onClick={() => void saveCheckpoint(checkpoint)} disabled={Boolean(busy) || !attempt}>
                    Save note
                  </button>
                </article>
              ))}
            </section>
          ) : null}

          {supportTab === "scratchpad" ? (
            <section className="scenario-support-panel scenario-plan-panel">
              <div className="section-heading">
                <h2>Scratchpad</h2>
                <p>Assumptions, examples, and questions.</p>
              </div>
              <textarea
                className="scenario-freeform-notes"
                value={scenarioScratchpad}
                onChange={(event) => setScenarioScratchpad(event.target.value)}
                rows={16}
                placeholder="Examples, invariants, unresolved questions..."
              />
            </section>
          ) : null}

          {supportTab === "notes" ? (
            <section className="scenario-support-panel scenario-plan-panel">
              <div className="section-heading">
                <h2>Notes</h2>
                <p>Private working notes for the session.</p>
              </div>
              <textarea
                className="scenario-freeform-notes"
                value={scenarioNotes}
                onChange={(event) => setScenarioNotes(event.target.value)}
                rows={12}
                placeholder="Clarifications, follow-ups, debrief thoughts..."
              />
              <details className="scenario-dev-tools">
                <summary>Developer tools</summary>
                <details className="scenario-diff-details">
                  <summary>Workspace diff</summary>
                  <div className={`scenario-diff-editor ${diff ? "" : "empty"}`}>
                    <div className="scenario-diff-editor-tab">current diff</div>
                    {diff ? (
                      <pre><code>{diff}</code></pre>
                    ) : (
                      <div className="scenario-empty-diff">
                        <strong>No saved changes yet</strong>
                        <p>Edit in the app, then run tests to refresh the diff.</p>
                      </div>
                    )}
                  </div>
                </details>
                <details className="scenario-diff-details scenario-local-workspace-details">
                  <summary>Local folder</summary>
                  <div className="scenario-local-workspace">
                    <code>{workspacePath}</code>
                    <div className="scenario-action-row">
                      <button type="button" className="secondary-button compact-button" onClick={() => void openAttempt("finder")} disabled={!attempt}>Finder</button>
                      <button type="button" className="secondary-button compact-button" onClick={() => void openAttempt("vscode")} disabled={!attempt}>VS Code</button>
                      <button type="button" className="secondary-button compact-button" onClick={() => void openAttempt("cursor")} disabled={!attempt}>Cursor</button>
                    </div>
                  </div>
                </details>
              </details>
            </section>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

interface InterviewPhase {
  label: string;
  minutes: number;
  endMinute: number;
}

function isOnsiteScenario(scenario: Scenario, prompt: string): boolean {
  const text = `${scenario.id} ${scenario.title} ${scenario.summary} ${scenario.evidence.note} ${prompt}`.toLowerCase();
  return text.includes("onsite") || text.includes("no-ai") || text.includes("no ai");
}

function isStaleActiveScenarioAttempt(attempt: ScenarioAttemptSummary, timeboxMinutes: number, now: number): boolean {
  if (attempt.endedAt) return false;
  const startedAt = Date.parse(attempt.startedAt);
  if (!Number.isFinite(startedAt)) return false;
  const elapsedMs = now - startedAt;
  return elapsedMs > timeboxMinutes * 60 * 1000 + STALE_ACTIVE_ATTEMPT_GRACE_MS;
}

function interviewPhaseState(timeboxMinutes: number, elapsedMinutes: number): { phases: InterviewPhase[]; active: InterviewPhase; activeIndex: number } {
  const weights = [
    ["Read", 0.14],
    ["Clarify", 0.12],
    ["Design", 0.2],
    ["Build", 0.34],
    ["Test", 0.14],
    ["Review", 0.06]
  ] as const;
  let endMinute = 0;
  const phases = weights.map(([label, weight], index) => {
    const minutes = index === weights.length - 1
      ? Math.max(1, Math.round(timeboxMinutes - endMinute))
      : Math.max(1, Math.round(timeboxMinutes * weight));
    endMinute += minutes;
    return { label, minutes, endMinute };
  });
  const foundIndex = phases.findIndex((phase) => elapsedMinutes < phase.endMinute);
  const activeIndex = foundIndex === -1 ? phases.length - 1 : foundIndex;
  return { phases, active: phases[activeIndex], activeIndex };
}

function currentInterviewerQuestion(phase: string, latestTurn?: ScenarioAiTurn): string {
  if (latestTurn) return "Before you keep coding, say what changed in your plan and why.";
  if (phase === "Read") return "Restate the contract and the output shape before you design.";
  if (phase === "Clarify") return "What assumption would you ask the interviewer to confirm?";
  if (phase === "Design") return "What invariant does your data model need to preserve?";
  if (phase === "Build") return "Talk through the invariant before changing the code.";
  if (phase === "Test") return "Which edge case should prove the implementation is not just passing the happy path?";
  return "Summarize the tradeoff you would call out before handing this in.";
}

function preferredScenarioFile(files: ScenarioEditableFile[], current: string): string {
  if (current && files.some((file) => file.path === current)) return current;
  const pyFile = (file: ScenarioEditableFile) => file.path.endsWith(".py");
  const nonInitPyFile = (file: ScenarioEditableFile) => pyFile(file) && file.path.split("/").at(-1) !== "__init__.py";
  return files.find((file) => file.path === "src/reservations.py")?.path
    ?? files.find((file) => file.path === "src/sync.py")?.path
    ?? files.find((file) => file.path.startsWith("src/") && nonInitPyFile(file))?.path
    ?? files.find(nonInitPyFile)?.path
    ?? files.find(pyFile)?.path
    ?? files[0]?.path
    ?? "";
}

function languageForScenarioFile(path: string): string {
  if (path.endsWith(".py")) return "python";
  if (path.endsWith(".ts") || path.endsWith(".tsx")) return "typescript";
  if (path.endsWith(".go")) return "go";
  if (path.endsWith(".scala")) return "scala";
  return "text";
}

function saveStateLabel(state: "saved" | "saving" | "error"): string {
  if (state === "saving") return "Saving";
  if (state === "error") return "Save failed";
  return "Saved";
}

function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours) return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
  return `${minutes}:${pad2(seconds)}`;
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

type ScenarioTestStatus = "passed" | "failed" | "idle";

interface ScenarioVisibleTestCase {
  name: string;
  input: string;
  expected: string;
  actual?: string;
  status: ScenarioTestStatus;
  details?: string;
}

function ScenarioTestsPane({
  editableFiles,
  result,
  busy,
  canRun,
  collapsed,
  onCollapsedChange,
  onRun,
  onOpenFile
}: {
  editableFiles: ScenarioEditableFile[];
  result?: ScenarioRunRecord;
  busy: string;
  canRun: boolean;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onRun: () => void;
  onOpenFile: (path: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"tests" | "custom">("tests");
  const testFile = editableFiles.find((file) => file.path.startsWith("tests/") && file.path.endsWith(".py"));
  const cases = useMemo(() => visibleTestCasesFromFile(testFile?.content ?? "", result), [testFile?.content, result]);
  const passedCount = cases.filter((testCase) => testCase.status === "passed").length;
  const firstFailedIndex = cases.findIndex((testCase) => testCase.status === "failed");
  const ran = Boolean(result);
  const runFailure = runLevelFailureFromResult(result, cases);
  const statusLabel = result ? `${result.status} / ${result.durationMs} ms` : "not run";
  const countLabel = ran ? `${passedCount}/${cases.length || 1}` : `0/${cases.length || 1}`;

  if (collapsed) {
    return (
      <button
        type="button"
        className={`output-dock-restore-button scenario-tests-collapsed-bar ${result?.status ?? "idle"}`}
        onClick={() => onCollapsedChange(false)}
        aria-controls="scenario-tests-pane"
        aria-expanded="false"
      >
        <PanelOpenIcon />
        <span className="scenario-tests-collapsed-title">Tests</span>
        <strong>{`${countLabel} · ${statusLabel}`}</strong>
        {result ? <span className={result.status === "passed" ? "tab-dot" : "tab-dot error"} /> : null}
        <span className="scenario-tests-collapsed-action">Restore</span>
      </button>
    );
  }

  return (
    <div className="scenario-tests-pane" id="scenario-tests-pane">
      <header className="scenario-tests-tabs" role="tablist" aria-label="Scenario test panes">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "tests"}
          className={activeTab === "tests" ? "active" : ""}
          onClick={() => setActiveTab("tests")}
        >
          TESTS
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "custom"}
          className={activeTab === "custom" ? "active" : ""}
          onClick={() => setActiveTab("custom")}
        >
          CUSTOM TESTS
        </button>
        <div className="scenario-tests-run">
          <span>{countLabel}</span>
          <button
            type="button"
            className="primary-button compact-button"
            onClick={() => {
              setActiveTab("tests");
              onRun();
            }}
            disabled={Boolean(busy) || !canRun}
          >
            Run Tests
          </button>
          <button
            type="button"
            className="dock-collapse-button scenario-tests-collapse-button"
            onClick={() => onCollapsedChange(true)}
            aria-label="Minimize tests pane"
            aria-controls="scenario-tests-pane"
            aria-expanded="true"
            title="Minimize tests pane"
          >
            <PanelCloseIcon />
          </button>
        </div>
      </header>

      {activeTab === "tests" ? (
        <div className="scenario-tests-body">
          <div className={`scenario-tests-summary ${result?.status ?? "idle"}`}>
            <strong>{statusLabel}</strong>
            <span>{result?.command ?? "Pyodide unittest"}</span>
          </div>
          {runFailure ? (
            <details className="scenario-tests-case failed" open>
              <summary>
                <span className="scenario-tests-caret" aria-hidden="true" />
                <strong>Run error</strong>
                <span>Tests could not be imported or started</span>
                <small>FAILED</small>
              </summary>
              <dl>
                <div>
                  <dt>Error</dt>
                  <dd><pre><code>{runFailure}</code></pre></dd>
                </div>
              </dl>
            </details>
          ) : null}
          {cases.length ? (
            <div className="scenario-tests-case-list">
              {cases.map((testCase, index) => (
                <details
                  key={testCase.name}
                  className={`scenario-tests-case ${testCase.status}`}
                  open={(testCase.status === "failed" && index === firstFailedIndex) || (!ran && index === 0)}
                >
                  <summary>
                    <span className="scenario-tests-caret" aria-hidden="true" />
                    <strong>{`Test ${index + 1}`}</strong>
                    <span>{formatTestName(testCase.name)}</span>
                    <small>{testStatusLabel(testCase.status, ran)}</small>
                  </summary>
                  <dl>
                    <div>
                      <dt>Input</dt>
                      <dd><pre><code>{testCase.input || testCase.name}</code></pre></dd>
                    </div>
                    <div>
                      <dt>Expected Output</dt>
                      <dd><pre><code>{testCase.expected || "(see test assertion)"}</code></pre></dd>
                    </div>
                    {testCase.status === "failed" || testCase.actual ? (
                      <div>
                        <dt>Actual Output</dt>
                        <dd><pre><code>{testCase.actual || "(see details)"}</code></pre></dd>
                      </div>
                    ) : null}
                    {testCase.details ? (
                      <div>
                        <dt>Details</dt>
                        <dd>
                          <details className="scenario-tests-details">
                            <summary>Traceback and assertion detail</summary>
                            <pre><code>{testCase.details}</code></pre>
                          </details>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </details>
              ))}
            </div>
          ) : (
            <div className="scenario-tests-empty">
              <strong>No visible tests loaded</strong>
              <span>{testFile ? testFile.path : "tests/test_reservations.py"}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="scenario-tests-body scenario-tests-custom">
          <div>
            <strong>{testFile?.path ?? "tests/test_reservations.py"}</strong>
            <span>Custom rehearsal cases live in the editable unittest file.</span>
          </div>
          <button
            type="button"
            className="secondary-button compact-button"
            onClick={() => testFile ? onOpenFile(testFile.path) : undefined}
            disabled={!testFile}
          >
            Open Test File
          </button>
        </div>
      )}
    </div>
  );
}

function ScenarioResultCard({ label, result }: { label: string; result?: ScenarioRunRecord }) {
  return (
    <article className={`scenario-result-card ${result?.status ?? "idle"}`}>
      <header>
        <h3>{label}</h3>
        <span>{result ? `${result.status} / ${result.durationMs} ms` : "not run"}</span>
      </header>
      {result ? (
        <>
          <p className="muted">{result.command}</p>
          {result.stdout ? <pre><code>{result.stdout}</code></pre> : null}
          {result.stderr ? <pre><code>{result.stderr}</code></pre> : null}
        </>
      ) : (
        <p className="muted">Run this when you have a candidate implementation.</p>
      )}
    </article>
  );
}

function visibleTestCasesFromFile(content: string, result?: ScenarioRunRecord): ScenarioVisibleTestCase[] {
  const output = [result?.stdout, result?.stderr].filter(Boolean).join("\n");
  const statuses = parseUnittestStatuses(output);
  const failures = parseUnittestFailures(output);
  const cases: ScenarioVisibleTestCase[] = [];
  const parsedNames = new Set<string>();
  const structured = new Map<string, TestResult>();
  for (const test of result?.tests ?? []) {
    structured.set(test.name, test);
    structured.set(normalizeScenarioTestName(test.name), test);
  }
  const testPattern = /\n    def\s+(test_[A-Za-z0-9_]+)\(self\):([\s\S]*?)(?=\n    def\s+test_[A-Za-z0-9_]+\(self\):|\n\nif __name__|$)/g;
  for (const match of content.matchAll(testPattern)) {
    const name = match[1];
    parsedNames.add(name);
    const body = match[2];
    const structuredResult = structured.get(name) ?? structured.get(normalizeScenarioTestName(name));
    const failure = failures.get(name) ?? structuredResult?.error;
    cases.push({
      name,
      input: extractCallArgument(body, "run_operations"),
      expected: structuredResult?.expected !== undefined && structuredResult.expected !== null
        ? formatScenarioValue(structuredResult.expected)
        : extractExpectedAssertion(body),
      status: structuredResult ? (structuredResult.passed ? "passed" : "failed") : statuses.get(name) ?? (result?.status === "passed" ? "passed" : "idle"),
      actual: structuredResult && "actual" in structuredResult ? formatScenarioValue(structuredResult.actual) : extractActualFromFailure(failure),
      details: failure
    });
  }
  for (const test of result?.tests ?? []) {
    const normalizedName = normalizeScenarioTestName(test.name);
    if (cases.some((testCase) => testCase.name === test.name || testCase.name === normalizedName)) continue;
    if (isRunLevelScenarioFailure(test, parsedNames)) continue;
    cases.push({
      name: test.name,
      input: formatScenarioValue(test.args),
      expected: formatScenarioValue(test.expected),
      status: test.passed ? "passed" : "failed",
      actual: "actual" in test ? formatScenarioValue(test.actual) : "",
      details: test.error
    });
  }
  return cases;
}

function runLevelFailureFromResult(result: ScenarioRunRecord | undefined, cases: ScenarioVisibleTestCase[]): string {
  if (!result || result.status === "passed") return "";
  if (cases.some((testCase) => testCase.status === "failed")) return "";
  const parsedNames = new Set(cases.map((testCase) => testCase.name));
  const runLevelErrors = result.tests
    .filter((test) => isRunLevelScenarioFailure(test, parsedNames))
    .map((test) => test.error)
    .filter(Boolean);
  return [result.message, ...runLevelErrors, result.stderr, result.stdout].filter(Boolean).join("\n").trim();
}

function normalizeScenarioTestName(name: string): string {
  const withoutParens = name.split(" ")[0] ?? name;
  return withoutParens.split(".").filter(Boolean).at(-1) ?? withoutParens;
}

function isRunLevelScenarioFailure(test: TestResult, parsedNames: Set<string>): boolean {
  const normalizedName = normalizeScenarioTestName(test.name);
  if (parsedNames.has(normalizedName)) return false;
  if (!test.error) return false;
  return (
    test.error.includes("Failed to import test module") ||
    test.error.includes("unittest.loader._FailedTest") ||
    test.error.includes("SyntaxError") ||
    test.error.includes("ImportError")
  );
}

function formatScenarioValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === undefined) return "";
  return JSON.stringify(value, null, 2);
}

function parseUnittestStatuses(output: string): Map<string, ScenarioTestStatus> {
  const statuses = new Map<string, ScenarioTestStatus>();
  const pattern = /^(test_[A-Za-z0-9_]+)\s+\([^)]+\)\s+\.\.\.\s+([A-Z]+|ok)\s*$/gm;
  for (const match of output.matchAll(pattern)) {
    statuses.set(match[1], match[2] === "ok" ? "passed" : "failed");
  }
  return statuses;
}

function parseUnittestFailures(output: string): Map<string, string> {
  const failures = new Map<string, string>();
  const pattern = /={20,}\n(?:FAIL|ERROR):\s+(test_[A-Za-z0-9_]+)[^\n]*\n-{20,}\n([\s\S]*?)(?=\n={20,}|\n-{20,}\nRan\s+\d+\s+tests?|\nFAILED|\nOK|$)/g;
  for (const match of output.matchAll(pattern)) {
    failures.set(match[1], match[2].trim());
  }
  return failures;
}

function extractActualFromFailure(failure: string | undefined): string {
  if (!failure) return "";
  const assertionLine = failure.split("\n").find((line) => line.startsWith("AssertionError:"));
  if (!assertionLine) return "";
  const payload = assertionLine.replace(/^AssertionError:\s*/, "");
  const compareText = payload.includes(": ") ? payload.slice(payload.indexOf(": ") + 2) : payload;
  const marker = " != ";
  const markerIndex = compareText.indexOf(marker);
  if (markerIndex === -1) return "";
  return compareText.slice(0, markerIndex).trim();
}

function extractCallArgument(body: string, callName: string): string {
  const marker = `${callName}(`;
  const markerIndex = body.indexOf(marker);
  if (markerIndex === -1) return "";
  return scanExpression(body, markerIndex + marker.length, ")");
}

function extractExpectedAssertion(body: string): string {
  const marker = "self.assertEqual(result,";
  const markerIndex = body.indexOf(marker);
  if (markerIndex === -1) return "";
  return scanExpression(body, markerIndex + marker.length, ")");
}

function scanExpression(source: string, startIndex: number, stop: string): string {
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }
    if (char === "[" || char === "{" || char === "(") {
      depth += 1;
      continue;
    }
    if (char === "]" || char === "}" || char === ")") {
      if (depth === 0 && char === stop) return normalizePythonSnippet(source.slice(startIndex, index));
      depth = Math.max(0, depth - 1);
    }
  }
  return normalizePythonSnippet(source.slice(startIndex));
}

function normalizePythonSnippet(value: string): string {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  const nonEmpty = lines.filter((line) => line.trim());
  const indent = Math.min(...nonEmpty.map((line) => line.match(/^\s*/)?.[0].length ?? 0), Number.POSITIVE_INFINITY);
  const normalizedIndent = Number.isFinite(indent) ? indent : 0;
  return lines.map((line) => line.slice(normalizedIndent)).join("\n").trim();
}

function formatTestName(name: string): string {
  return name.replace(/^test_/, "").replaceAll("_", " ");
}

function testStatusLabel(status: ScenarioTestStatus, ran: boolean): string {
  if (!ran) return "not run";
  if (status === "passed") return "passed";
  if (status === "failed") return "failed";
  return "not run";
}

function JudgeReport({ report }: { report: ScenarioJudgeReport }) {
  return (
    <div className="scenario-judge-report">
      <p className="eyebrow">{report.overall.replaceAll("_", " ")}</p>
      <h3>{report.summary}</h3>
      <div className="scenario-score-list">
        {report.scores.map((score) => (
          <article key={score.metricId}>
            <header>
              <strong>{score.label}</strong>
              <span>{score.score}/5</span>
            </header>
            <p>{score.evidence}</p>
            <p className="muted">{score.improvement}</p>
          </article>
        ))}
      </div>
      <p><strong>Highest-risk weakness:</strong> {report.highestRiskWeakness}</p>
      <p><strong>Next drill:</strong> {report.nextDrill}</p>
    </div>
  );
}

function ScenarioMarkdown({ content }: { content: string }) {
  return <div className="scenario-markdown">{renderMarkdown(content)}</div>;
}

function renderMarkdown(content: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];
  let list: string[] = [];
  let key = 0;

  function flushParagraph() {
    if (!paragraph.length) return;
    nodes.push(<p key={`p-${key++}`}>{renderInline(paragraph.join(" "))}</p>);
    paragraph = [];
  }

  function flushList() {
    if (!list.length) return;
    nodes.push(<ul key={`ul-${key++}`}>{list.map((item) => <li key={item}>{renderInline(item)}</li>)}</ul>);
    list = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      nodes.push(<h3 key={`h3-${key++}`}>{renderInline(trimmed.slice(4))}</h3>);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      nodes.push(<h2 key={`h2-${key++}`}>{renderInline(trimmed.slice(3))}</h2>);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      nodes.push(<h1 key={`h1-${key++}`}>{renderInline(trimmed.slice(2))}</h1>);
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      list.push(trimmed.replace(/^[-*]\s+/, ""));
      continue;
    }
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return nodes;
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    return <span key={index}>{part}</span>;
  });
}

function draftsFromAttempt(attempt: ScenarioAttemptSummary): Record<string, string> {
  const drafts: Record<string, string> = {};
  for (const checkpoint of attempt.checkpoints) {
    drafts[checkpoint.checkpointId] = checkpoint.answer;
  }
  return drafts;
}

function latestAttemptsByScenario(attempts: ScenarioAttemptSummary[]): Map<string, ScenarioAttemptSummary> {
  const latest = new Map<string, ScenarioAttemptSummary>();
  for (const attempt of attempts) {
    const existing = latest.get(attempt.scenarioId);
    if (!existing || attempt.updatedAt > existing.updatedAt) latest.set(attempt.scenarioId, attempt);
  }
  return latest;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  const value = await res.json().catch(() => undefined);
  if (!res.ok) throw new Error(value?.error ?? `${res.status} ${res.statusText}`);
  return value as T;
}

async function safeGetJson<T>(path: string): Promise<T | null> {
  try {
    return await getJson<T>(path);
  } catch {
    return null;
  }
}

async function postJson<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const value = await res.json().catch(() => undefined);
  if (!res.ok) throw new Error(value?.error ?? `${res.status} ${res.statusText}`);
  return value as T;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
