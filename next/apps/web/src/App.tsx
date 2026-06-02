import { type CSSProperties, type PointerEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ContentGraph,
  FunctionSignature,
  LanguageId,
  LanguagePack,
  Problem,
  ProblemLanguageSupport,
  ProblemPart,
  ProblemTest,
  RunDiagnostic,
  RunResult
} from "../../../src/core/types";
import { migrateLegacyBackup, type LegacyBackupPayload } from "../../../src/storage/legacyMigration";
import type { NextUserData, NextWorkspaceState, WorkspaceEditorBuffer, WorkspaceSelection } from "../../../src/storage/userData";
import { API_BASE } from "./apiBase";
import { BasicCodeEditor, CodeEditor } from "./CodeEditor";
import { CoachPanel } from "./CoachPanel";
import {
  contentStats as legacyContentStats,
  course as legacyCourse,
  findLesson as legacyFindLesson,
  findProblem as legacyFindProblem,
  findQuiz as legacyFindQuiz
} from "../../../../src/content/course";
import { LESSON_COACH_SYSTEM_PROMPT, buildLessonQuestionPrompt, buildQuizCoachPrompt } from "../../../../src/coach/coachPrompts";
import { CoachAssist as LegacyCoachAssist } from "../../../../src/components/CoachAssist";
import type { Lesson as LegacyLesson, Quiz as LegacyQuiz } from "../../../../src/types";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; graph: ContentGraph; languages: LanguagePack[] }
  | { status: "error"; message: string };

interface ContentStatus {
  ok: true;
  mode: "development" | "release";
  contentRoot: string;
  reloadAvailable: boolean;
  loadedAt: string;
  generation: number;
  counts: {
    tracks: number;
    modules: number;
    problemSets: number;
    problems: number;
  };
}

type ContentReloadResponse =
  | (ContentStatus & { reloadedAt: string })
  | (Omit<ContentStatus, "ok"> & { ok: false; errors: string[] });

type SidebarScope =
  | { kind: "all" }
  | { kind: "module"; id: string }
  | { kind: "problem-set"; id: string };

type ContentContainer = { kind: "module" | "problem-set"; id: string; title: string };
type ProblemOrigin = Extract<SidebarScope, { kind: "module" | "problem-set" }>;

type AppView =
  | { kind: "dashboard" }
  | { kind: "collection"; scope: Extract<SidebarScope, { kind: "module" | "problem-set" }> }
  | { kind: "lesson"; lessonId: string }
  | { kind: "quiz"; quizId: string }
  | { kind: "assessment"; problemId: string }
  | { kind: "problem"; origin?: ProblemOrigin };

type CollectionViewModel = {
  kind: "module" | "problem-set";
  id: string;
  title: string;
  summary: string;
  eyebrow: string;
  sideTitle: string;
  sideBody: string;
  problems: Problem[];
  entries?: ContentGraph["problemSets"][number]["entries"];
};

type SidebarSearchHit =
  | { kind: "lesson"; id: string; title: string }
  | { kind: "problem"; id: string; title: string }
  | { kind: "assessment"; id: string; title: string };

type OutputPanel = "results" | "stdout" | "errors" | "scratchpad" | "notes" | "history";
const outputPanels: OutputPanel[] = ["results", "stdout", "errors", "scratchpad", "notes", "history"];
const activeTimeFlushMs = 15_000;
const activeTimeTickCapMs = 5_000;
type MobileWorkspaceTab = "prompt" | "code" | "results" | "scratchpad" | "notes";
const mobileWorkspaceTabs: MobileWorkspaceTab[] = ["prompt", "code", "results", "scratchpad", "notes"];
type AssessmentMode = "exam" | "practice";
type AssessmentStatus = "in-progress" | "submitted" | "expired";
type AssessmentPanel = "results" | "output" | "errors";
const assessmentPanels: AssessmentPanel[] = ["results", "output", "errors"];
type AssessmentEventType =
  | "session_started"
  | "level_selected"
  | "run_started"
  | "run_finished"
  | "paused"
  | "resumed"
  | "submitted"
  | "expired"
  | "review_started"
  | "review_ended";

interface AssessmentLevelResult {
  level: number;
  visiblePassed: number;
  visibleTotal: number;
  hiddenPassed: number;
  hiddenTotal: number;
  attempts: number;
  points: number;
  lastRunAt: string;
  timeMs?: number;
}

interface AssessmentSessionState {
  sessionId?: string;
  assessmentId: string;
  problemId: string;
  language?: LanguageId;
  mode: AssessmentMode;
  status: AssessmentStatus;
  startedAt: string;
  endsAt?: string;
  pausedAt?: string;
  finishedAt?: string;
  unlockedLevel: number;
  activeLevel: number;
  levelResults: Record<number, AssessmentLevelResult>;
  buffers: Record<number, string>;
  activeSince?: string;
  timeByLevelMs?: Record<number, number>;
  reviewMode?: boolean;
  preReviewStatus?: "submitted" | "expired";
}

interface AssessmentScorecard {
  assessmentId: string;
  problemId: string;
  mode: AssessmentMode;
  status: "submitted" | "expired";
  totalScore: number;
  rawPoints: number;
  maxRawPoints: number;
  perLevel: AssessmentLevelResult[];
  elapsedMs: number;
  levelTimeMs?: Record<number, number>;
  completedLevels: number;
  generatedAt: string;
}

interface AssessmentEventRecord {
  id: string;
  assessmentId: string;
  sessionId: string;
  type: AssessmentEventType;
  occurredAt: string;
  level?: number;
  fromLevel?: number;
  toLevel?: number;
  mode?: AssessmentMode;
  language?: LanguageId;
  includeHidden?: boolean;
  status?: RunResult["status"] | AssessmentStatus;
  passedCount?: number;
  totalCount?: number;
  totalScore?: number;
  rawPoints?: number;
  maxRawPoints?: number;
  durationMs?: number;
  elapsedMs?: number;
  codeLength?: number;
}

export function App() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [contentStatus, setContentStatus] = useState<ContentStatus | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState<string>("");
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageId>("python");
  const [code, setCode] = useState("");
  const sourceKind = "starter" as const;
  const [result, setResult] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [userData, setUserData] = useState<NextUserData | null>(null);
  const userDataRef = useRef<NextUserData | null>(userData);
  const [workspaceState, setWorkspaceState] = useState<NextWorkspaceState | null>(null);
  const workspaceStateRef = useRef<NextWorkspaceState | null>(workspaceState);
  const [storageStatus, setStorageStatus] = useState("Checking app data storage...");
  const [migrationError, setMigrationError] = useState("");
  const [sidebarQuery, setSidebarQuery] = useState("");
  const [sidebarScope, setSidebarScope] = useState<SidebarScope>({ kind: "all" });
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachMounted, setCoachMounted] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>({ kind: "dashboard" });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<MobileWorkspaceTab>("prompt");
  const [activeOutputPanel, setActiveOutputPanel] = useState<OutputPanel>("results");
  const [dockHeight, setDockHeight] = useState(260);
  const dockDragRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const runAbortRef = useRef<AbortController | null>(null);
  const scratchpadAbortRef = useRef<AbortController | null>(null);
  const workspaceRef = useRef<HTMLElement | null>(null);
  const mainPanelRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const legacyImportInputRef = useRef<HTMLInputElement | null>(null);
  const problemNoteLoadSkipRef = useRef("");
  const scratchpadLoadSkipRef = useRef("");
  const codeSelectionKeyRef = useRef("");
  const [recentRuns, setRecentRuns] = useState<Array<{ result: RunResult; at: string; includeHidden: boolean }>>([]);
  const [scratchpadCode, setScratchpadCode] = useState(() => defaultScratchpadCode("python"));
  const [scratchpadResult, setScratchpadResult] = useState<RunResult | null>(null);
  const [scratchpadBusy, setScratchpadBusy] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [showHiddenDiagnostics, setShowHiddenDiagnostics] = useState(false);
  const [lastRunIncludedHidden, setLastRunIncludedHidden] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [promptPaneCollapsed, setPromptPaneCollapsed] = useState(false);
  const preferencesLoadedRef = useRef(false);
  const [starred, setStarred] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [solutionCode, setSolutionCode] = useState("");
  const [splitRatio, setSplitRatio] = useState(34);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const [graph, languages, nextContentStatus] = await Promise.all([
          getJson<ContentGraph>("/catalog"),
          getJson<LanguagePack[]>("/languages"),
          safeGetJson<ContentStatus>("/content/status")
        ]);
        const [daemonUserData, daemonWorkspaceState] = await Promise.all([
          safeGetJson<{ userData: NextUserData | null }>("/user-data"),
          safeGetJson<{ workspaceState: NextWorkspaceState | null }>("/workspace-state")
        ]);
        const nextUserData = normalizeUserData(daemonUserData?.userData ?? null);
        const nextWorkspaceState =
          daemonWorkspaceState?.workspaceState ??
          (nextUserData ? workspaceStateFromUserData(nextUserData, null) : null);
        const initialSelection =
          validSelection(nextWorkspaceState?.lastSelection, graph) ??
          defaultSelection(graph, languages);
        if (!alive) return;
        setLoadState({ status: "ready", graph, languages });
        setContentStatus(nextContentStatus ?? null);
        if (nextUserData) {
          userDataRef.current = nextUserData;
          setUserData(nextUserData);
        }
        if (nextWorkspaceState) {
          workspaceStateRef.current = nextWorkspaceState;
          setWorkspaceState(nextWorkspaceState);
        }
        setStorageStatus("Saving in the app data folder.");
        if (initialSelection) {
          setSelectedProblemId(initialSelection.problemId);
          setSelectedPartId(initialSelection.partId ?? "");
          setSelectedLanguage(initialSelection.language);
        }
      } catch (error) {
        if (alive) {
          setLoadState({
            status: "error",
            message: error instanceof Error ? error.message : String(error)
          });
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    workspaceStateRef.current = workspaceState;
  }, [workspaceState]);

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    mainPanelRef.current?.scrollTo({ top: 0, left: 0 });
    setSettingsOpen(false);
  }, [currentView]);

  const graph = loadState.status === "ready" ? loadState.graph : undefined;
  const languages = loadState.status === "ready" ? loadState.languages : [];
  const selectedProblem = useMemo(
    () => graph?.problems.find((problem) => problem.id === selectedProblemId),
    [graph?.problems, selectedProblemId]
  );
  const selectedPart = selectedProblem?.parts?.find((part) => part.id === selectedPartId);
  const selectedPack = languages.find((language) => language.id === selectedLanguage);
  const activeLanguages = selectedPart?.languages ?? selectedProblem?.languages;
  const supportedLanguages = selectedProblem
    ? languages.filter((language) => activeLanguages?.[language.id])
    : languages;
  const activeTests = selectedPart?.tests ?? selectedProblem?.tests ?? [];
  const visibleTests = activeTests.filter((test) => test.visibility === "visible");
  const activeSignature = selectedPart?.signature ?? selectedProblem?.signature;
  const activeSupport = activeLanguages?.[selectedLanguage];
  const sidebarSearchResults = useMemo(
    () => graph ? searchSidebar(graph, sidebarQuery) : [],
    [graph, sidebarQuery]
  );
  const assessmentSets = graph?.problemSets.filter((set) => set.id === "assessments") ?? [];
  const librarySets = graph?.problemSets.filter((set) => set.id.startsWith("lib-")) ?? [];
  const practiceSets = graph?.problemSets.filter((set) => set.id !== "assessments" && !set.id.startsWith("lib-")) ?? [];
  const sidebarModules = graph ? legacyOrderedModules(graph) : [];
  const activeContainer = graph && selectedProblem ? containerForProblemView(graph, selectedProblem.id, currentView) : undefined;
  const selectedCollection = graph && currentView.kind === "collection" ? collectionForScope(graph, currentView.scope) : undefined;
  const sidebarActiveScope: SidebarScope = currentView.kind === "collection" ? sidebarScope : { kind: "all" };
  const siblingProblemIds = graph && selectedProblem ? problemIdsForContainer(graph, activeContainer) : [];
  const currentProblemIndex = siblingProblemIds.indexOf(selectedProblemId);
  const previousProblemId = currentProblemIndex > 0 ? siblingProblemIds[currentProblemIndex - 1] : undefined;
  const nextProblemId = currentProblemIndex >= 0 ? siblingProblemIds[currentProblemIndex + 1] : undefined;
  const runStatus = busy ? "Running" : result ? statusLabel(result.status) : "Ready";
  const promptConstraints = selectedProblem ? problemConstraints(selectedProblem, selectedPart, activeSignature) : [];
  const splitStyle = { "--prompt-width": `${splitRatio}%`, "--dock-height": `${dockHeight}px` } as CSSProperties;
  const canReloadContent = contentStatus?.reloadAvailable === true;
  const activeProblemTimeMs = selectedProblemId ? activeTimeForProblem(userData, selectedProblemId) : 0;

  useEffect(() => {
    setMobileNavOpen(false);
  }, [currentView.kind, selectedProblemId]);

  function flushCurrentWorkspaceBuffer() {
    if (currentView.kind !== "problem" || !selectedProblemId || !selectedLanguage) return;
    const selection: WorkspaceSelection = {
      problemId: selectedProblemId,
      partId: selectedPartId || undefined,
      language: selectedLanguage,
      sourceKind
    };
    const key = workspaceKey(selection);
    if (key !== codeSelectionKeyRef.current) return;
    const now = new Date().toISOString();
    const nextState = upsertWorkspaceBuffer(workspaceStateRef.current, {
      ...selection,
      code,
      updatedAt: now
    });
    workspaceStateRef.current = nextState;
    setWorkspaceState(nextState);
    void persistWorkspaceState(nextState);
  }

  const selectProblem = useCallback((problemId: string, origin?: ProblemOrigin) => {
    flushCurrentWorkspaceBuffer();
    setSelectedProblemId(problemId);
    setSelectedPartId("");
    setResult(null);
    setActiveOutputPanel("results");
    setCurrentView({ kind: "problem", origin });
  }, [code, currentView.kind, selectedLanguage, selectedPartId, selectedProblemId]);

  const openDashboard = useCallback(() => {
    flushCurrentWorkspaceBuffer();
    setSidebarScope({ kind: "all" });
    setCurrentView({ kind: "dashboard" });
  }, [code, currentView.kind, selectedLanguage, selectedPartId, selectedProblemId]);

  const openCollection = useCallback((scope: Extract<SidebarScope, { kind: "module" | "problem-set" }>) => {
    flushCurrentWorkspaceBuffer();
    setSidebarScope(scope);
    setCurrentView({ kind: "collection", scope });
  }, [code, currentView.kind, selectedLanguage, selectedPartId, selectedProblemId]);

  const openLesson = useCallback((lessonId: string) => {
    flushCurrentWorkspaceBuffer();
    setCurrentView({ kind: "lesson", lessonId });
  }, [code, currentView.kind, selectedLanguage, selectedPartId, selectedProblemId]);

  const openQuiz = useCallback((quizId: string) => {
    flushCurrentWorkspaceBuffer();
    setCurrentView({ kind: "quiz", quizId });
  }, [code, currentView.kind, selectedLanguage, selectedPartId, selectedProblemId]);

  const openAssessment = useCallback((problemId: string) => {
    flushCurrentWorkspaceBuffer();
    setSelectedProblemId(problemId);
    setSelectedPartId("");
    setCurrentView({ kind: "assessment", problemId });
  }, [code, currentView.kind, selectedLanguage, selectedPartId, selectedProblemId]);

  const updateSidebarCollapsed = useCallback((next: boolean) => {
    setSidebarCollapsed(next);
    void savePreference("workspace:sidebarCollapsed", next);
  }, []);

  const triggerLegacyImport = useCallback(() => {
    legacyImportInputRef.current?.click();
  }, []);

  const exportUserData = useCallback(() => {
    const value = userDataRef.current ?? createEmptyUserData();
    downloadText(
      JSON.stringify(value, null, 2),
      `dsa-coach-backup-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json"
    );
    setStorageStatus("Progress backup exported.");
  }, []);

  const exportCoachLog = useCallback(() => {
    const rows = userDataRef.current?.coachLogs ?? [];
    if (!rows.length) {
      setStorageStatus("No coach conversations logged yet.");
      return;
    }
    downloadText(
      rows.map((row) => JSON.stringify(row)).join("\n"),
      `dsa-coach-evals-${new Date().toISOString().slice(0, 10)}.jsonl`,
      "application/x-ndjson"
    );
    setStorageStatus("Coach eval log exported.");
  }, []);

  const focusSidebarSearch = useCallback(() => {
    if (sidebarCollapsed) updateSidebarCollapsed(false);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }, [sidebarCollapsed, updateSidebarCollapsed]);

  async function reloadContent() {
    if (!canReloadContent) {
      setStorageStatus("Content reload is only available in development builds.");
      return;
    }
    flushCurrentWorkspaceBuffer();
    setStorageStatus("Reloading problem content...");
    try {
      const res = await fetch(`${API_BASE}/content/reload`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}"
      });
      const reload = (await res.json()) as ContentReloadResponse;
      if (!res.ok || !reload.ok) {
        const errors = "errors" in reload && Array.isArray(reload.errors)
          ? reload.errors
          : [`${res.status} ${res.statusText}`];
        setStorageStatus(`Content reload failed: ${errors.slice(0, 3).join(" ")}`);
        return;
      }

      const [nextGraph, nextLanguages, nextStatus] = await Promise.all([
        getJson<ContentGraph>("/catalog"),
        getJson<LanguagePack[]>("/languages"),
        getJson<ContentStatus>("/content/status")
      ]);
      const nextSelection =
        validSelection({
          problemId: selectedProblemId,
          partId: selectedPartId || undefined,
          language: selectedLanguage,
          sourceKind
        }, nextGraph) ??
        validSelection(workspaceStateRef.current?.lastSelection, nextGraph) ??
        defaultSelection(nextGraph, nextLanguages);

      setLoadState({ status: "ready", graph: nextGraph, languages: nextLanguages });
      setContentStatus(nextStatus);
      setResult(null);
      setRecentRuns([]);
      setScratchpadResult(null);
      setSolutionOpen(false);
      setSolutionCode("");

      if (nextSelection) {
        setSelectedProblemId(nextSelection.problemId);
        setSelectedPartId(nextSelection.partId ?? "");
        setSelectedLanguage(nextSelection.language);
        if (currentView.kind === "collection" && !collectionForScope(nextGraph, currentView.scope)) {
          setCurrentView({ kind: "dashboard" });
        } else if (currentView.kind === "assessment" && !nextGraph.problems.some((problem) => problem.id === currentView.problemId)) {
          setCurrentView({ kind: "problem" });
        } else if (currentView.kind === "problem" && currentView.origin && !containerForScope(nextGraph, currentView.origin)) {
          setCurrentView({ kind: "problem" });
        }
      } else {
        setSelectedProblemId("");
        setSelectedPartId("");
        setCurrentView({ kind: "dashboard" });
      }
      setStorageStatus(`Content reloaded from ${nextStatus.contentRoot}.`);
    } catch (error) {
      setStorageStatus(`Content reload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const handleDesktopCommand = useCallback((command: string) => {
    if (command === "open-settings") {
      setSettingsOpen(true);
      return;
    }
    if (command === "import-progress") {
      triggerLegacyImport();
      return;
    }
    if (command === "export-progress") {
      exportUserData();
      return;
    }
    if (command === "export-coach-log") {
      exportCoachLog();
      return;
    }
    if (command === "open-dashboard") {
      openDashboard();
      return;
    }
    if (command === "focus-search") {
      focusSidebarSearch();
      return;
    }
    if (command === "reload-content") {
      void reloadContent();
      return;
    }
    if (command === "toggle-sidebar") {
      const next = !sidebarCollapsed;
      updateSidebarCollapsed(next);
      return;
    }
    if (command === "toggle-coach" && ((currentView.kind === "problem" && selectedProblem) || currentView.kind === "assessment")) {
      setFocusMode(false);
      setCoachMounted(true);
      setCoachOpen((value) => !value);
      return;
    }
    if (command === "toggle-focus" && currentView.kind === "problem") {
      setFocusMode((value) => {
        const next = !value;
        if (next) setCoachOpen(false);
        void savePreference("workspace:focusMode", next);
        return next;
      });
    }
  }, [
    currentView.kind,
    exportCoachLog,
    exportUserData,
    focusSidebarSearch,
    openDashboard,
    selectedProblem,
    sidebarCollapsed,
    triggerLegacyImport,
    updateSidebarCollapsed
  ]);

  useEffect(() => {
    function handleCommand(event: Event) {
      const command = (event as CustomEvent<{ command?: string }>).detail?.command;
      if (command) handleDesktopCommand(command);
    }
    const hostWindow = window as Window & { dsaCoachCommand?: (command: string) => void };
    hostWindow.dsaCoachCommand = handleDesktopCommand;
    window.addEventListener("dsa-coach-command", handleCommand);
    return () => {
      window.removeEventListener("dsa-coach-command", handleCommand);
      if (hostWindow.dsaCoachCommand === handleDesktopCommand) delete hostWindow.dsaCoachCommand;
    };
  }, [handleDesktopCommand]);

  useEffect(() => {
    if (!selectedProblem) return;
    if (selectedPartId && !selectedProblem.parts?.some((part) => part.id === selectedPartId)) {
      setSelectedPartId("");
      return;
    }
    const languagesForSelection = selectedPart?.languages ?? selectedProblem.languages;
    if (!languagesForSelection[selectedLanguage]) {
      const fallback = Object.keys(languagesForSelection)[0];
      if (fallback) setSelectedLanguage(fallback);
    }
  }, [selectedLanguage, selectedPart, selectedPartId, selectedProblem]);

  useEffect(() => {
    if (!selectedProblemId || !selectedLanguage) return;
    let alive = true;
    setResult(null);
    codeSelectionKeyRef.current = "";
    void (async () => {
      const selection: WorkspaceSelection = {
        problemId: selectedProblemId,
        partId: selectedPartId || undefined,
        language: selectedLanguage,
        sourceKind
      };
      const key = workspaceKey(selection);
      const savedBuffer = findWorkspaceBuffer(workspaceStateRef.current, selection);
      if (savedBuffer && !isGeneratedPythonStarter(savedBuffer.code, selectedLanguage)) {
        if (alive) {
          codeSelectionKeyRef.current = key;
          setCode(savedBuffer.code);
        }
        return;
      }
      const recoveredAttempt = latestAttemptForSelection(userDataRef.current, selection);
      if (recoveredAttempt && !isGeneratedPythonStarter(recoveredAttempt.code, selectedLanguage)) {
        const nextBuffer: WorkspaceEditorBuffer = {
          ...selection,
          code: recoveredAttempt.code,
          updatedAt: recoveredAttempt.createdAt
        };
        const nextState = upsertWorkspaceBuffer(workspaceStateRef.current, nextBuffer);
        workspaceStateRef.current = nextState;
        if (alive) {
          codeSelectionKeyRef.current = key;
          setWorkspaceState(nextState);
          setCode(recoveredAttempt.code);
        }
        void persistWorkspaceState(nextState);
        return;
      }
      try {
        const partParam = selectedPartId ? `&partId=${encodeURIComponent(selectedPartId)}` : "";
        const source = await getJson<{ code: string }>(
          `/source?problemId=${encodeURIComponent(selectedProblemId)}${partParam}&language=${encodeURIComponent(selectedLanguage)}&kind=${sourceKind}`
        );
        if (alive) {
          codeSelectionKeyRef.current = key;
          setCode(source.code);
        }
      } catch (error) {
        if (alive) setCode(`// Could not load ${sourceKind} source: ${error instanceof Error ? error.message : String(error)}`);
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedLanguage, selectedPartId, selectedProblemId, sourceKind]);

  useEffect(() => {
    if (!selectedProblemId || !selectedLanguage) return;
    const selection: WorkspaceSelection = {
      problemId: selectedProblemId,
      partId: selectedPartId || undefined,
      language: selectedLanguage,
      sourceKind
    };
    if (workspaceKey(selection) !== codeSelectionKeyRef.current) return;
    const timer = window.setTimeout(() => {
      const now = new Date().toISOString();
      const nextState = upsertWorkspaceBuffer(workspaceStateRef.current, {
        ...selection,
        code,
        updatedAt: now
      });
      workspaceStateRef.current = nextState;
      setWorkspaceState(nextState);
      void persistWorkspaceState(nextState);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [code, selectedLanguage, selectedPartId, selectedProblemId, sourceKind]);

  useEffect(() => {
    setHintCount(0);
    setSolutionOpen(false);
    setSolutionCode("");
    setShowHiddenDiagnostics(false);
    setLastRunIncludedHidden(false);
    setPromptPaneCollapsed(false);
    setActiveOutputPanel("results");
  }, [selectedLanguage, selectedPartId, selectedProblemId]);

  useEffect(() => {
    if (!selectedProblemId) return;
    const current = userDataRef.current;
    problemNoteLoadSkipRef.current = selectedProblemId;
    scratchpadLoadSkipRef.current = `${selectedProblemId}:${selectedLanguage}`;
    setNoteText(noteForContent(current, "problem", selectedProblemId));
    setScratchpadCode(scratchpadForProblem(current, selectedProblemId, selectedLanguage) ?? defaultScratchpadCode(selectedLanguage, selectedProblem?.title));
    setScratchpadResult(null);
    setStarred(preferenceValue<boolean>(current, `problem:starred:${selectedProblemId}`, false) === true);
  }, [selectedLanguage, selectedProblem?.title, selectedProblemId]);

  useEffect(() => {
    if (preferencesLoadedRef.current || !userData || userData.preferences.length === 0) return;
    preferencesLoadedRef.current = true;
    const current = userData;
    setDockHeight(clampDockHeight(numberPreference(current, "workspace:bottomDockHeight", 260)));
    setSplitRatio(numberPreference(current, "workspace:splitRatio", 34));
    setShowHiddenDiagnostics(preferenceValue<boolean>(current, "workspace:showHiddenDiagnostics", false) === true);
    setSidebarCollapsed(preferenceValue<boolean>(current, "workspace:sidebarCollapsed", false) === true);
    setFocusMode(preferenceValue<boolean>(current, "workspace:focusMode", false) === true);
    const storedMobileTab = preferenceValue(current, "workspace:activeMobileTab", "prompt");
    if (isMobileWorkspaceTab(storedMobileTab)) setActiveMobileTab(storedMobileTab);
  }, [userData]);

  useEffect(() => {
    if (!selectedProblemId || currentView.kind !== "problem") return;
    if (problemNoteLoadSkipRef.current === selectedProblemId) {
      problemNoteLoadSkipRef.current = "";
      return;
    }
    const timer = window.setTimeout(() => {
      void saveContentNote("problem", selectedProblemId, noteText);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [currentView.kind, noteText, selectedProblemId]);

  useEffect(() => {
    if (!selectedProblemId || currentView.kind !== "problem") return;
    const key = `${selectedProblemId}:${selectedLanguage}`;
    if (scratchpadLoadSkipRef.current === key) {
      scratchpadLoadSkipRef.current = "";
      return;
    }
    const timer = window.setTimeout(() => {
      void saveScratchpad(selectedProblemId, selectedLanguage, scratchpadCode);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [currentView.kind, scratchpadCode, selectedLanguage, selectedProblemId]);

  useEffect(() => {
    if (currentView.kind !== "problem" || !selectedProblemId) return;

    const workspaceId = problemWorkspaceId(selectedProblemId, selectedPartId || undefined);
    let active = isDocumentActive();
    let lastTick = Date.now();
    let pendingMs = 0;

    const persistDelta = (deltaMs: number) => {
      if (deltaMs < 1000) return;
      const next = addActivityTime(userDataRef.current ?? createEmptyUserData(), workspaceId, deltaMs);
      userDataRef.current = next;
      setUserData(next);
      void persistUserData(next, "Active time saved");
    };

    const flush = () => {
      const delta = pendingMs;
      pendingMs = 0;
      persistDelta(delta);
    };

    const tick = () => {
      const now = Date.now();
      if (active) pendingMs += Math.min(now - lastTick, activeTimeTickCapMs);
      lastTick = now;
      if (pendingMs >= activeTimeFlushMs) flush();
    };

    const refreshActiveState = () => {
      tick();
      active = isDocumentActive();
      lastTick = Date.now();
      if (!active) flush();
    };

    const interval = window.setInterval(tick, 1000);
    window.addEventListener("focus", refreshActiveState);
    window.addEventListener("blur", refreshActiveState);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", refreshActiveState);

    return () => {
      tick();
      flush();
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshActiveState);
      window.removeEventListener("blur", refreshActiveState);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", refreshActiveState);
    };
  }, [currentView.kind, selectedPartId, selectedProblemId]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isEditing = Boolean(target?.closest("input, textarea, [contenteditable='true'], .cm-editor"));
      if (event.defaultPrevented) return;
      if ((event.metaKey || event.ctrlKey) && event.key === ",") {
        event.preventDefault();
        setSettingsOpen(true);
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        focusSidebarSearch();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        if (isEditing) return;
        if (currentView.kind === "problem") {
          event.preventDefault();
          void run(event.shiftKey);
        }
        return;
      }
      if (isEditing) return;
      if (event.altKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        setFocusMode((value) => {
          const next = !value;
          if (next) setCoachOpen(false);
          void savePreference("workspace:focusMode", next);
          return next;
        });
        return;
      }
      if (event.altKey && (event.key === "]" || event.key === "[")) {
        event.preventDefault();
        setActiveOutputPanel((panel) => {
          const index = outputPanels.indexOf(panel);
          const offset = event.key === "]" ? 1 : -1;
          return outputPanels[(index + offset + outputPanels.length) % outputPanels.length];
        });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  async function run(includeHidden: boolean) {
    if (!selectedProblem || busy) return;
    const controller = new AbortController();
    runAbortRef.current = controller;
    setBusy(true);
    setResult(null);
    setLastRunIncludedHidden(includeHidden);
    try {
      const nextResult = await postJson<RunResult>("/run", {
        language: selectedLanguage,
        problemId: selectedProblem.id,
        partId: selectedPartId || undefined,
        code,
        includeHidden,
        timeoutMs: 1000
      }, { signal: controller.signal });
      setResult(nextResult);
      setRecentRuns((current) => [{ result: nextResult, at: new Date().toISOString(), includeHidden }, ...current].slice(0, 8));
      setActiveOutputPanel("results");
      setActiveMobileTab("results");
      await recordProblemRun(nextResult);
    } catch (error) {
      if (isAbortError(error)) {
        setResult(stoppedResult());
        setActiveOutputPanel("results");
        setActiveMobileTab("results");
        return;
      }
      setResult({
        status: "runtime-error",
        stdout: "",
        stderr: "",
        durationMs: 0,
        tests: [],
        message: error instanceof Error ? error.message : String(error)
      });
      setActiveOutputPanel("results");
      setActiveMobileTab("results");
    } finally {
      if (runAbortRef.current === controller) runAbortRef.current = null;
      setBusy(false);
    }
  }

  async function runScratchpad() {
    if (!selectedProblemId || scratchpadBusy || !selectedPack?.runner.installedByDefault) return;
    const controller = new AbortController();
    scratchpadAbortRef.current = controller;
    setScratchpadBusy(true);
    setActiveOutputPanel("scratchpad");
    setActiveMobileTab("scratchpad");
    try {
      await saveScratchpad(selectedProblemId, selectedLanguage, scratchpadCode);
      const nextResult = await postJson<RunResult>("/scratchpad", {
        language: selectedLanguage,
        code: scratchpadCode,
        timeoutMs: 3000
      }, { signal: controller.signal });
      setScratchpadResult(nextResult);
    } catch (error) {
      if (isAbortError(error)) {
        setScratchpadResult(stoppedResult());
        return;
      }
      setScratchpadResult({
        status: "runtime-error",
        stdout: "",
        stderr: "",
        durationMs: 0,
        tests: [],
        message: error instanceof Error ? error.message : String(error)
      });
    } finally {
      if (scratchpadAbortRef.current === controller) scratchpadAbortRef.current = null;
      setScratchpadBusy(false);
    }
  }

  function stopRun() {
    runAbortRef.current?.abort();
    setResult(stoppedResult());
    setActiveOutputPanel("results");
    setActiveMobileTab("results");
    setBusy(false);
  }

  function stopScratchpad() {
    scratchpadAbortRef.current?.abort();
    setScratchpadResult(stoppedResult());
    setActiveOutputPanel("scratchpad");
    setActiveMobileTab("scratchpad");
    setScratchpadBusy(false);
  }

  function setMobileTab(tab: MobileWorkspaceTab) {
    setActiveMobileTab(tab);
    if (tab === "results" || tab === "scratchpad" || tab === "notes") {
      setActiveOutputPanel(tab);
    }
    void savePreference("workspace:activeMobileTab", tab);
  }

  async function resetToStarter() {
    if (!selectedProblemId || !selectedLanguage) return;
    const partParam = selectedPartId ? `&partId=${encodeURIComponent(selectedPartId)}` : "";
    const source = await getJson<{ code: string }>(
      `/source?problemId=${encodeURIComponent(selectedProblemId)}${partParam}&language=${encodeURIComponent(selectedLanguage)}&kind=starter`
    );
    codeSelectionKeyRef.current = workspaceKey({
      problemId: selectedProblemId,
      partId: selectedPartId || undefined,
      language: selectedLanguage,
      sourceKind
    });
    setCode(source.code);
    setResult(null);
  }

  async function showReferenceSolution() {
    if (!selectedProblemId || !selectedLanguage) return;
    if (solutionOpen) {
      setSolutionOpen(false);
      return;
    }
    setSolutionOpen(true);
    if (solutionCode) return;
    const legacyPythonReference = selectedLanguage === "python" ? legacyReferenceSource(selectedProblemId, selectedPartId) : undefined;
    if (legacyPythonReference) {
      setSolutionCode(legacyPythonReference);
      return;
    }
    try {
      const partParam = selectedPartId ? `&partId=${encodeURIComponent(selectedPartId)}` : "";
      const source = await getJson<{ code: string }>(
        `/source?problemId=${encodeURIComponent(selectedProblemId)}${partParam}&language=${encodeURIComponent(selectedLanguage)}&kind=reference`
      );
      setSolutionCode(source.code);
    } catch (error) {
      setSolutionCode(`Could not load reference solution: ${error instanceof Error ? error.message : String(error)}`);
    }
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
    void savePreference("workspace:splitRatio", splitRatio);
  }

  function clampDockHeight(value: number): number {
    const min = 150;
    const workspaceHeight = workspaceRef.current?.clientHeight ?? 0;
    const max = workspaceHeight > 0 ? Math.max(min, workspaceHeight - 300) : 360;
    return Math.min(max, Math.max(min, Math.round(value)));
  }

  function handleDockPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dockDragRef.current = { startY: event.clientY, startHeight: dockHeight };
  }

  function handleDockPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dockDragRef.current;
    if (!drag) return;
    setDockHeight(clampDockHeight(drag.startHeight + (drag.startY - event.clientY)));
  }

  function handleDockPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const drag = dockDragRef.current;
    dockDragRef.current = null;
    if (!drag) return;
    const next = clampDockHeight(drag.startHeight + (drag.startY - event.clientY));
    setDockHeight(next);
    void savePreference("workspace:bottomDockHeight", next);
  }

  async function persistImportedUserData(value: NextUserData) {
    await persistUserData(value, "Imported data saved");
  }

  async function persistUserData(value: NextUserData, label = "User data saved") {
    try {
      await postJson("/user-data", value);
      setStorageStatus(`${label} in the app data folder.`);
    } catch (error) {
      setStorageStatus(`${label} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function updateUserData(mutator: (current: NextUserData) => NextUserData, label?: string) {
    const next = mutator(userDataRef.current ?? createEmptyUserData());
    userDataRef.current = next;
    setUserData(next);
    await persistUserData(next, label);
  }

  async function saveContentNote(contentKind: "lesson" | "problem" | "quiz", contentId: string, body: string) {
    const existing = userDataRef.current?.notes.some((record) => record.contentKind === contentKind && record.contentId === contentId);
    if (!existing && body.length === 0) return;
    await updateUserData((current) => upsertNote(current, contentKind, contentId, body), "Notes saved");
  }

  async function markContentProgress(
    contentKind: "lesson" | "problem" | "quiz",
    contentId: string,
    status: "in-progress" | "complete",
    score?: { correct: number; total: number }
  ) {
    await updateUserData((current) => upsertProgress(current, contentKind, contentId, status, score), "Progress saved");
  }

  async function recordProblemRun(nextResult: RunResult) {
    if (!selectedProblem) return;
    const workspaceId = problemWorkspaceId(selectedProblem.id, selectedPartId || undefined);
    await updateUserData((current) => {
      const now = new Date().toISOString();
      const attempt = {
        workspaceId,
        language: selectedLanguage,
        code,
        passed: nextResult.status === "passed",
        result: nextResult,
        createdAt: now
      };
      const withAttempt: NextUserData = { ...current, attempts: [attempt, ...current.attempts] };
      return upsertProgress(withAttempt, "problem", selectedProblem.id, nextResult.status === "passed" ? "complete" : "in-progress");
    }, "Run history saved");
  }

  async function savePreference(key: string, value: unknown) {
    await updateUserData((current) => upsertPreference(current, key, value), "Preference saved");
  }

  async function saveScratchpad(problemId: string, language: LanguageId, nextCode: string) {
    await updateUserData((current) => upsertScratchpad(current, problemId, language, nextCode), "Scratchpad saved");
  }

  async function saveAssessmentState(assessmentId: string, kind: "session" | "scorecard" | "scorecard-history", value: unknown) {
    await updateUserData((current) => upsertAssessmentState(current, assessmentId, kind, value), "Assessment saved");
  }

  async function logAssessmentEvent(assessmentId: string, event: AssessmentEventRecord) {
    await updateUserData((current) => appendAssessmentEvent(current, assessmentId, event), "Assessment event saved");
  }

  async function recordAssessmentRun(problemId: string, partId: string | undefined, language: LanguageId, runCode: string, nextResult: RunResult) {
    const workspaceId = problemWorkspaceId(problemId, partId);
    await updateUserData((current) => {
      const attempt = {
        workspaceId,
        language,
        code: runCode,
        passed: nextResult.status === "passed",
        result: nextResult,
        createdAt: new Date().toISOString()
      };
      return { ...current, attempts: [attempt, ...current.attempts] };
    }, "Assessment run saved");
  }

  async function toggleStarredProblem() {
    if (!selectedProblemId) return;
    const next = !starred;
    setStarred(next);
    await savePreference(`problem:starred:${selectedProblemId}`, next);
  }

  async function logCoachExchange(record: NextUserData["coachLogs"][number]) {
    await updateUserData((current) => {
      const coachLogs = [record, ...current.coachLogs];
      return {
        ...current,
        coachLogs,
        migrationReport: {
          ...current.migrationReport,
          counts: { ...current.migrationReport.counts, coachLogs: coachLogs.length }
        }
      };
    }, "Coach log saved");
  }

  async function rateCoachExchange(createdAt: string, feedback: unknown) {
    await updateUserData((current) => ({
      ...current,
      coachLogs: current.coachLogs.map((record) => record.createdAt === createdAt ? { ...record, feedback } : record)
    }), "Coach feedback saved");
  }

  async function persistWorkspaceState(value: NextWorkspaceState) {
    try {
      await postJson("/workspace-state", value);
      setStorageStatus("Workspace saved in the app data folder.");
    } catch (error) {
      setStorageStatus(`Workspace save failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function importLegacyBackup(file: File | undefined) {
    if (!file) return;
    setMigrationError("");
    try {
      const payload = JSON.parse(await file.text()) as LegacyBackupPayload;
      const migrated = migrateLegacyBackup(payload);
      userDataRef.current = migrated;
      preferencesLoadedRef.current = false;
      setUserData(migrated);
      await persistImportedUserData(migrated);
      const nextWorkspaceState = workspaceStateFromUserData(migrated, workspaceStateRef.current);
      if (nextWorkspaceState) {
        workspaceStateRef.current = nextWorkspaceState;
        setWorkspaceState(nextWorkspaceState);
        await persistWorkspaceState(nextWorkspaceState);
        const activeBuffer = findWorkspaceBuffer(nextWorkspaceState, {
          problemId: selectedProblemId,
          partId: selectedPartId || undefined,
          language: selectedLanguage,
          sourceKind
        });
        if (activeBuffer) {
          codeSelectionKeyRef.current = workspaceKey(activeBuffer);
          setCode(activeBuffer.code);
        }
      }
    } catch (error) {
      setMigrationError(error instanceof Error ? error.message : String(error));
    }
  }

  if (loadState.status === "loading") {
    return <div className="boot-screen">Connecting to local runner...</div>;
  }

  if (loadState.status === "error") {
    return (
      <main className="error-screen">
        <h1>Local app service unavailable</h1>
        <p>{loadState.message}</p>
        <pre>Quit and reopen DSA Coach Next.{"\n"}For web development: cd next && bun run daemon</pre>
      </main>
    );
  }

  const workspaceViewActive = currentView.kind === "problem" || currentView.kind === "assessment";
  const problemFocusActive = currentView.kind === "problem" && focusMode;
  const workspaceSidebarCollapsed = workspaceViewActive && sidebarCollapsed && !mobileNavOpen;
  const coachVisible = currentView.kind === "problem" && coachOpen && !focusMode;
  const activeSolutionDetails = selectedProblem ? problemSolutionDetails(selectedProblem, selectedPart) : undefined;

  return (
    <div className={`app-shell ${workspaceSidebarCollapsed ? "sidebar-collapsed" : ""} ${problemFocusActive ? "problem-focus-mode" : ""}`}>
      {workspaceViewActive ? (
        <button
          type="button"
          className={`sidebar-scrim ${mobileNavOpen ? "is-open" : ""}`}
          aria-label="Close navigation menu"
          tabIndex={mobileNavOpen ? 0 : -1}
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}
      <aside
        className={`sidebar ${workspaceViewActive ? "sidebar-drawer" : ""} ${mobileNavOpen ? "is-open" : ""} ${workspaceSidebarCollapsed ? "is-collapsed" : ""}`}
        aria-hidden={workspaceSidebarCollapsed}
      >
        <div className="sidebar-scroll">
          <div className="sidebar-brand-row">
            <button type="button" className="brand" onClick={openDashboard} aria-label="Dashboard">
              <span className="brand-mark" aria-hidden="true">
                <BookMarkIcon />
              </span>
              <span>DSA Coach</span>
            </button>
            {workspaceViewActive ? (
              <button
                type="button"
              className="sidebar-collapse-toggle"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              onClick={() => {
                updateSidebarCollapsed(true);
              }}
            >
              <PanelCloseIcon />
            </button>
            ) : null}
          </div>

          <label className="search-box">
            <span aria-hidden="true"><SearchIcon /></span>
            <input ref={searchInputRef} value={sidebarQuery} onChange={(event) => setSidebarQuery(event.target.value)} placeholder="Search" />
          </label>

          {sidebarSearchResults.length ? (
            <div className="search-results">
              {sidebarSearchResults.map((result) => (
                <button
                  type="button"
                  key={`${result.kind}-${result.id}`}
                  onClick={() => {
                    if (result.kind === "lesson") openLesson(result.id);
                    if (result.kind === "problem") selectProblem(result.id);
                    if (result.kind === "assessment") openAssessment(result.id);
                  }}
                >
                  <span>{titleCase(result.kind)}</span>
                  {result.title}
                </button>
              ))}
            </div>
          ) : null}

          {assessmentSets.length ? (
            <>
              <p className="sidebar-eyebrow">Assessments</p>
              <nav className="chapter-nav" aria-label="Assessments">
                {assessmentSets.map((set) => (
                  <button
                    type="button"
                    key={set.id}
                    className={sidebarActiveScope.kind === "problem-set" && sidebarActiveScope.id === set.id ? "active" : ""}
                    onClick={() => openCollection({ kind: "problem-set", id: set.id })}
                  >
                    <span aria-hidden="true"><ClockIcon /></span>
                    {set.title}
                  </button>
                ))}
              </nav>
            </>
          ) : null}

          {practiceSets.length ? (
            <>
              <p className="sidebar-eyebrow">Problem sets</p>
              <nav className="chapter-nav" aria-label="Problem sets">
                {practiceSets.map((set) => (
                  <button
                    type="button"
                    key={set.id}
                    className={sidebarActiveScope.kind === "problem-set" && sidebarActiveScope.id === set.id ? "active" : ""}
                    onClick={() => openCollection({ kind: "problem-set", id: set.id })}
                  >
                    <span aria-hidden="true"><SparkleIcon /></span>
                    {set.title}
                  </button>
                ))}
              </nav>
            </>
          ) : null}

          <p className="sidebar-eyebrow">Modules</p>
          <nav className="chapter-nav" aria-label="Modules">
            {sidebarModules.map((module, index) => (
              <button
                type="button"
                key={module.id}
                className={sidebarActiveScope.kind === "module" && sidebarActiveScope.id === module.id ? "active" : ""}
                onClick={() => openCollection({ kind: "module", id: module.id })}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {legacyModuleMeta(module.id)?.title ?? module.title}
              </button>
            ))}
          </nav>

          {librarySets.length ? (
            <>
              <p className="sidebar-eyebrow">Libraries</p>
              <nav className="chapter-nav" aria-label="Libraries">
                {librarySets.map((set) => (
                  <button
                    type="button"
                    key={set.id}
                    className={sidebarActiveScope.kind === "problem-set" && sidebarActiveScope.id === set.id ? "active" : ""}
                    onClick={() => openCollection({ kind: "problem-set", id: set.id })}
                  >
                    <span aria-hidden="true"><LibraryIcon /></span>
                    {set.title}
                  </button>
                ))}
              </nav>
            </>
          ) : null}
        </div>

        <div className="sidebar-settings">
          <button type="button" className="sidebar-settings-button" aria-label="Settings" title="Settings" onClick={() => setSettingsOpen(true)}>
            <GearIcon />
          </button>
        </div>
      </aside>

      <SettingsDialog
        open={settingsOpen}
        supportedLanguages={languages}
        selectedLanguage={selectedLanguage}
        contentStatus={contentStatus}
        storageStatus={storageStatus}
        migrationError={migrationError}
        userData={userData}
        onClose={() => setSettingsOpen(false)}
        onLanguageChange={(language) => {
          flushCurrentWorkspaceBuffer();
          setSelectedLanguage(language);
        }}
        onImportProgress={triggerLegacyImport}
        onExportProgress={exportUserData}
        onExportCoachLog={exportCoachLog}
        onReloadContent={() => void reloadContent()}
      />
      <input
        ref={legacyImportInputRef}
        className="hidden-input"
        type="file"
        accept="application/json"
        onChange={(event) => {
          void importLegacyBackup(event.target.files?.[0]);
          event.currentTarget.value = "";
        }}
      />

      <main
        ref={mainPanelRef}
        className={`main-panel ${
          currentView.kind === "problem" ? "problem-page" : currentView.kind === "assessment" ? "assessment-main" : "content-page"
        }`}
      >
        {currentView.kind === "dashboard" && graph ? (
          <DashboardScreen
            graph={graph}
            userData={userData}
            sidebarCollapsed={workspaceSidebarCollapsed}
            onShowSidebar={() => updateSidebarCollapsed(false)}
            onImportLegacyBackup={(file) => void importLegacyBackup(file)}
            onExportProgress={exportUserData}
            onExportCoachLog={exportCoachLog}
            onOpenCollection={openCollection}
            onOpenProblem={selectProblem}
            onOpenAssessment={openAssessment}
          />
        ) : null}

        {currentView.kind === "collection" && graph && selectedCollection ? (
          <CollectionScreen
            collection={selectedCollection}
            graph={graph}
            userData={userData}
            sidebarCollapsed={workspaceSidebarCollapsed}
            onShowSidebar={() => updateSidebarCollapsed(false)}
            onOpenProblem={(problemId) => selectProblem(problemId, currentView.scope)}
            onOpenAssessment={openAssessment}
            onOpenLesson={openLesson}
            onOpenQuiz={openQuiz}
          />
        ) : null}

        {currentView.kind === "assessment" && graph ? (
          <AssessmentFlowScreen
            graph={graph}
            languages={languages}
            problemId={currentView.problemId}
            selectedLanguage={selectedLanguage}
            userData={userData}
            sidebarCollapsed={workspaceSidebarCollapsed}
            onShowSidebar={() => updateSidebarCollapsed(false)}
            onOpenMobileNav={() => {
              updateSidebarCollapsed(false);
              setMobileNavOpen(true);
            }}
            onOpenCollection={openCollection}
            onSaveAssessmentState={saveAssessmentState}
            onLogAssessmentEvent={logAssessmentEvent}
            onSavePreference={savePreference}
            onRecordRun={recordAssessmentRun}
            onMarkProgress={markContentProgress}
            coachOpen={coachOpen}
            coachMounted={coachMounted}
            onToggleCoach={() => {
              setCoachMounted(true);
              setCoachOpen((value) => !value);
            }}
            onCloseCoach={() => setCoachOpen(false)}
            onLogCoachExchange={(record) => void logCoachExchange(record)}
            onRateCoachExchange={(createdAt, feedback) => void rateCoachExchange(createdAt, feedback)}
          />
        ) : null}

        {currentView.kind === "lesson" ? (
          <LessonScreen
            lessonId={currentView.lessonId}
            userData={userData}
            sidebarCollapsed={workspaceSidebarCollapsed}
            onShowSidebar={() => updateSidebarCollapsed(false)}
            onOpenProblem={selectProblem}
            onSaveNote={saveContentNote}
            onMarkProgress={markContentProgress}
          />
        ) : null}

        {currentView.kind === "quiz" ? (
          <QuizScreen
            quizId={currentView.quizId}
            userData={userData}
            sidebarCollapsed={workspaceSidebarCollapsed}
            onShowSidebar={() => updateSidebarCollapsed(false)}
            onSaveNote={saveContentNote}
            onMarkProgress={markContentProgress}
          />
        ) : null}

        {currentView.kind === "problem" ? (
          <>
          <header className="problem-context-bar">
          <button
            type="button"
            className="problem-nav-toggle"
            aria-label="Open navigation menu"
            onClick={() => {
              updateSidebarCollapsed(false);
              setMobileNavOpen(true);
            }}
          >
            <MenuIcon />
          </button>
          {workspaceSidebarCollapsed ? (
            <button
              type="button"
              className="sidebar-show-toggle inline"
            aria-label="Show sidebar"
            title="Show sidebar"
            onClick={() => {
              updateSidebarCollapsed(false);
            }}
          >
            <PanelOpenIcon />
          </button>
          ) : null}
          <div className="problem-context-main">
            <p className="problem-breadcrumb">
              <span>{activeContainer?.title ?? selectedProblem?.concepts[0] ?? "Local course"}</span>
              <span>/</span>
              <span>{activeContainer?.kind === "problem-set" ? "Problem set" : "Guided problem"}</span>
            </p>
            <div className="problem-title-row">
              <h1>{selectedProblem ? [selectedProblem.title, selectedPart?.title].filter(Boolean).join(" · ") : "No problem selected"}</h1>
              {selectedProblem ? (
                <div className="tag-row compact-tags">
                  <span>{selectedProblem.difficulty}</span>
                  {!selectedPart ? <span>default</span> : null}
                  {selectedProblem.concepts.slice(0, 3).map((concept) => <span key={concept}>{concept}</span>)}
                </div>
              ) : null}
            </div>
          </div>
          <div className="problem-context-actions">
            {activeContainer ? (
              <button
                type="button"
                className="secondary-button compact-button"
                onClick={() => openCollection(activeContainer.kind === "module" ? { kind: "module", id: activeContainer.id } : { kind: "problem-set", id: activeContainer.id })}
              >
                {activeContainer.kind === "module" ? "Back to chapter" : `Back to ${activeContainer.title}`}
              </button>
            ) : null}
            {previousProblemId ? (
              <button type="button" className="secondary-button compact-button problem-nav-link" onClick={() => selectProblem(previousProblemId, activeContainer ? { kind: activeContainer.kind, id: activeContainer.id } : undefined)}>
                Previous
              </button>
            ) : null}
            {nextProblemId ? (
              <button type="button" className="secondary-button compact-button problem-nav-link" onClick={() => selectProblem(nextProblemId, activeContainer ? { kind: activeContainer.kind, id: activeContainer.id } : undefined)}>
                Next
              </button>
            ) : null}
            <button
              className={`secondary-button compact-button star-problem-button ${starred ? "active" : ""}`}
              type="button"
              aria-pressed={starred}
              onClick={() => void toggleStarredProblem()}
            >
              <StarIcon filled={starred} />
              {starred ? "Starred" : "Star problem"}
            </button>
            <button
              type="button"
              className={`secondary-button compact-button ${coachOpen ? "active" : ""}`}
              aria-pressed={coachOpen}
              onClick={() => {
                setCoachMounted(true);
                setCoachOpen((value) => !value);
              }}
              disabled={!selectedProblem}
            >
              <CoachIcon />
              Coach
            </button>
            <button
              className="secondary-button compact-button icon-only-button problem-focus-toggle"
              type="button"
              aria-label={focusMode ? "Exit focus" : "Focus"}
              title={focusMode ? "Exit focus" : "Focus"}
              onClick={() => {
                setFocusMode((value) => {
                  const next = !value;
                  if (next) setCoachOpen(false);
                  void savePreference("workspace:focusMode", next);
                  return next;
                });
              }}
            >
              {focusMode ? <FocusExitIcon /> : <FocusIcon />}
            </button>
          </div>
        </header>

        <nav className="mobile-workspace-tabs" aria-label="Problem workspace sections">
          {mobileWorkspaceTabs.map((tab) => (
            <button key={tab} type="button" className={activeMobileTab === tab ? "active" : ""} onClick={() => setMobileTab(tab)}>
              {tab === "scratchpad" ? "scratch" : tab}
            </button>
          ))}
        </nav>

        {selectedProblem ? (
          <div className={`problem-layout beta-workspace ${activeMobileTab === "prompt" ? "show-brief" : "show-workspace"} ${coachVisible ? "coach-open" : ""} ${promptPaneCollapsed ? "prompt-collapsed" : ""}`} style={splitStyle}>
            <aside className={`prompt-pane problem-brief mobile-pane ${activeMobileTab === "prompt" ? "active" : ""}`}>
              <div className="prompt-scroll">
              {selectedProblem.parts?.length ? (
                <nav className="part-tabs" aria-label="Problem parts">
                  <button
                    type="button"
                    className={!selectedPartId ? "part-tab active" : "part-tab"}
                    onClick={() => {
                      flushCurrentWorkspaceBuffer();
                      setSelectedPartId("");
                    }}
                  >
                    Base
                  </button>
                  {selectedProblem.parts.map((part) => (
                    <button
                      type="button"
                      key={part.id}
                      className={selectedPartId === part.id ? "part-tab active" : "part-tab"}
                      onClick={() => {
                        flushCurrentWorkspaceBuffer();
                        setSelectedPartId(part.id);
                      }}
                    >
                      {part.title}
                    </button>
                  ))}
                </nav>
              ) : null}
              <section className="prompt-primary">
                <div className="prompt-primary-heading">
                  <h2>Prompt</h2>
                  <button
                    className="pane-toggle"
                    type="button"
                    aria-label="Collapse prompt"
                    title="Collapse prompt"
                    onClick={() => setPromptPaneCollapsed(true)}
                  >
                    <PanelCloseIcon />
                  </button>
                </div>
                <PromptMarkdown content={selectedPart?.prompt ?? selectedProblem.prompt} />
              </section>
              {promptConstraints.length ? (
                <details className="prompt-detail" open>
                  <summary>Constraints <small className="prompt-detail-count">{promptConstraints.length}</small></summary>
                  <ul className="constraint-chips">
                    {promptConstraints.map((constraint) => (
                      <li key={constraint}>{constraint}</li>
                    ))}
                  </ul>
                </details>
              ) : null}
              <details className="prompt-detail" open>
                <summary>Visible examples</summary>
                <div className="test-preview compact-tests">
                  {visibleTests.length ? visibleTests.map((test) => (
                    <pre key={test.name}>
                      <code>{renderExample(activeSignature, test)}</code>
                    </pre>
                  )) : <p className="muted">No visible examples for this part.</p>}
                </div>
              </details>
              {hintCount || solutionOpen ? (
                <div className="prompt-reveal">
                  {problemHints(selectedProblem, selectedPart).slice(0, hintCount).map((hint, index) => (
                    <p key={hint}>
                      <strong>Hint {index + 1}:</strong> {hint}
                    </p>
                  ))}
                  {solutionOpen ? (
                    <div className="solution-box">
                      <h2>Solution</h2>
                      {activeSolutionDetails?.solution ? <p>{activeSolutionDetails.solution}</p> : null}
                      {activeSolutionDetails?.walkthrough ? <p>{activeSolutionDetails.walkthrough}</p> : null}
                      {solutionCode ? (
                        <pre>
                          <code>{solutionCode}</code>
                        </pre>
                      ) : (
                        <p className="muted">Loading reference solution...</p>
                      )}
                      {activeSolutionDetails?.complexity ? (
                        <p>
                          <strong>Time:</strong> {activeSolutionDetails.complexity.time}{" "}
                          <strong>Space:</strong> {activeSolutionDetails.complexity.space}
                        </p>
                      ) : null}
                      {activeSolutionDetails?.followUps?.length ? (
                        <>
                          <h3>Follow-ups</h3>
                          <ul>
                            {activeSolutionDetails.followUps.map((followUp) => (
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
                <button
                  className="tertiary-button"
                  type="button"
                  onClick={() => setHintCount((count) => Math.min(count + 1, problemHints(selectedProblem, selectedPart).length))}
                >
                  <LightbulbIcon />
                  Reveal hint
                </button>
                <button className="tertiary-button" type="button" onClick={() => void showReferenceSolution()}>
                  <EyeIcon />
                  {solutionOpen ? "Hide solution" : "Show solution"}
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
                setSplitRatio((value) => {
                  const next = Math.min(48, Math.max(26, value + (event.key === "ArrowRight" ? 2 : -2)));
                  void savePreference("workspace:splitRatio", next);
                  return next;
                });
              }}
            >
              ⋮
            </div>

            {promptPaneCollapsed ? (
              <button
                className="prompt-restore-tab"
                type="button"
                aria-label="Restore prompt pane"
                title="Restore prompt pane"
                onClick={() => setPromptPaneCollapsed(false)}
              >
                <PanelOpenIcon />
                <span>Prompt</span>
              </button>
            ) : null}

            <section className={`workspace editor-pane ${!selectedPack?.runner.installedByDefault ? "has-notice" : ""}`} ref={workspaceRef}>
              <div className={`workspace-toolbar mobile-pane ${activeMobileTab === "code" || activeMobileTab === "results" ? "active" : ""}`}>
                <div className="toolbar-status-group">
                  <span className={`run-status ${busy ? "loading" : result?.status ?? "idle"}`}>{runStatus}</span>
                  <small>
                    {activeProblemTimeMs ? `Active ${formatActiveTime(activeProblemTimeMs)} · ` : ""}
                    {result?.durationMs ? `${result.durationMs} ms` : selectedPack ? `Local ${selectedPack.label}` : "Local runner"}
                  </small>
                </div>
                <div className="toolbar-actions">
                  <details className="toolbar-menu">
                    <summary className="secondary-button compact-button" aria-label="More workspace actions">
                      <MoreIcon />
                      More
                    </summary>
                    <div className="toolbar-menu-panel">
                      <button type="button" onClick={() => void resetToStarter()}>
                        <ResetIcon />
                        Reset to starter
                      </button>
                      {canReloadContent ? (
                        <button type="button" onClick={() => void reloadContent()}>
                          <ResetIcon />
                          Reload content
                        </button>
                      ) : null}
                      <div className="shortcut-list" aria-label="Keyboard shortcuts">
                        <strong>
                          <KeyboardIcon />
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
                          <span className="shortcut-desc">Free {languageName(selectedLanguage)} experiments</span>
                        </div>
                      </div>
                    </div>
                  </details>
                  {busy ? (
                    <button className="primary-button stop-button" type="button" aria-label="Stop this run" onClick={stopRun}>
                      <SquareIcon />
                      <span className="button-copy">
                        <strong>Stop</strong>
                        <small>end this run</small>
                      </span>
                    </button>
                  ) : (
                    <>
                      <button className="primary-button run-button" type="button" aria-label="Run visible tests" onClick={() => void run(false)} disabled={!selectedPack?.runner.installedByDefault}>
                        <PlayIcon />
                        <span className="button-copy">
                          <strong>Run</strong>
                          <small>visible tests</small>
                        </span>
                        <kbd>⌘↵</kbd>
                      </button>
                      <button className="primary-button submit-button" type="button" aria-label="Submit all tests" onClick={() => void run(true)} disabled={!selectedPack?.runner.installedByDefault}>
                        <CheckCircleIcon />
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

              {!selectedPack?.runner.installedByDefault ? (
                <p className="notice">
                  {selectedPack?.label ?? selectedLanguage} is represented in the content graph, but its local runner pack is not installed in this prototype.
                </p>
              ) : null}

              <div className={`workspace-editor mobile-pane ${activeMobileTab === "code" ? "active" : ""}`}>
                <CodeEditor
                  value={code}
                  language={selectedLanguage}
                  problemId={selectedProblem.id}
                  partId={selectedPartId || undefined}
                  signature={activeSignature}
                  support={activeSupport}
                  onChange={setCode}
                  onRun={(includeHidden) => void run(includeHidden)}
                />
              </div>

              <OutputDock
                activePanel={activeOutputPanel}
                mobileVisible={activeMobileTab === "results" || activeMobileTab === "scratchpad" || activeMobileTab === "notes"}
                busy={busy}
                noteText={noteText}
                recentRuns={recentRuns}
                activeProblemTimeMs={activeProblemTimeMs}
                result={result}
                scratchpadCode={scratchpadCode}
                scratchpadBusy={scratchpadBusy}
                scratchpadLanguage={selectedLanguage}
                scratchpadProblemId={selectedProblem.id}
                scratchpadResult={scratchpadResult}
                scratchpadSupport={activeSupport}
                showHiddenDiagnostics={showHiddenDiagnostics}
                lastRunIncludedHidden={lastRunIncludedHidden}
                nextProblemId={nextProblemId}
                dockHeight={dockHeight}
                onNoteChange={setNoteText}
                onPanelChange={(panel) => {
                  setActiveOutputPanel(panel);
                }}
                onScratchpadChange={setScratchpadCode}
                onToggleHiddenDiagnostics={(value) => {
                  setShowHiddenDiagnostics(value);
                  void savePreference("workspace:showHiddenDiagnostics", value);
                }}
                onDockPointerDown={handleDockPointerDown}
                onDockPointerMove={handleDockPointerMove}
                onDockPointerUp={handleDockPointerUp}
                onRunHidden={() => void run(true)}
                onNextProblem={() => {
                  if (nextProblemId) selectProblem(nextProblemId);
                }}
                onScratchpadRun={() => void runScratchpad()}
                onStopScratchpad={stopScratchpad}
              />
            </section>
            {coachMounted ? (
              <CoachPanel
                problem={selectedProblem}
                part={selectedPart}
                language={selectedLanguage}
                code={code}
                result={result}
                coachLogs={userData?.coachLogs ?? []}
                visible={coachVisible}
                onClose={() => setCoachOpen(false)}
                onLogExchange={(record) => void logCoachExchange(record)}
                onRateExchange={(createdAt, feedback) => void rateCoachExchange(createdAt, feedback)}
              />
            ) : null}
          </div>
        ) : (
          <p>No problems are available in the content graph.</p>
        )}
          </>
        ) : null}
      </main>
    </div>
  );
}

function MigrationSummary({ userData }: { userData: NextUserData }) {
  const counts = userData.migrationReport.counts;
  return (
    <div className="migration-summary">
      <strong>Legacy data imported</strong>
      <dl>
        <div>
          <dt>Progress</dt>
          <dd>{counts.progress}</dd>
        </div>
        <div>
          <dt>Notes</dt>
          <dd>{counts.notes}</dd>
        </div>
        <div>
          <dt>Attempts</dt>
          <dd>{counts.attempts}</dd>
        </div>
        <div>
          <dt>Buffers</dt>
          <dd>{counts.editorBuffers}</dd>
        </div>
        <div>
          <dt>Coach</dt>
          <dd>{counts.coachLogs}</dd>
        </div>
      </dl>
      {userData.migrationReport.warnings.length ? (
        <p className="migration-warning">{userData.migrationReport.warnings.length} warning(s)</p>
      ) : null}
    </div>
  );
}

function SettingsDialog({
  open,
  supportedLanguages,
  selectedLanguage,
  contentStatus,
  storageStatus,
  migrationError,
  userData,
  onClose,
  onLanguageChange,
  onImportProgress,
  onExportProgress,
  onExportCoachLog,
  onReloadContent
}: {
  open: boolean;
  supportedLanguages: LanguagePack[];
  selectedLanguage: LanguageId;
  contentStatus: ContentStatus | null;
  storageStatus: string;
  migrationError: string;
  userData: NextUserData | null;
  onClose: () => void;
  onLanguageChange: (language: LanguageId) => void;
  onImportProgress: () => void;
  onExportProgress: () => void;
  onExportCoachLog: () => void;
  onReloadContent: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="settings-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header className="settings-dialog-header">
          <div>
            <p className="eyebrow">Preferences</p>
            <h1 id="settings-title">Settings</h1>
          </div>
          <button type="button" className="icon-button compact-button" onClick={onClose} aria-label="Close settings">
            <CloseIcon />
          </button>
        </header>

        <div className="settings-dialog-grid">
          <section className="settings-section settings-card" aria-label="Language">
            <h2>Language</h2>
            <p className="muted">Default language for problem workspaces and scratchpads.</p>
            <select value={selectedLanguage} onChange={(event) => onLanguageChange(event.target.value as LanguageId)}>
              {supportedLanguages.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.label}{language.runner.installedByDefault ? "" : " (not installed)"}
                </option>
              ))}
            </select>
          </section>

          <section className="settings-section settings-card" aria-label="Data">
            <h2>Data</h2>
            <p className="storage-status">{storageStatus}</p>
            <div className="settings-actions">
              <button type="button" className="secondary-button compact-button" onClick={onImportProgress}>
                <UploadIcon />
                Import progress
              </button>
              <button type="button" className="secondary-button compact-button" onClick={onExportProgress}>
                <DownloadIcon />
                Export progress
              </button>
              <button type="button" className="secondary-button compact-button" onClick={onExportCoachLog}>
                <FlaskIcon />
                Export coach log
              </button>
              {contentStatus?.reloadAvailable ? (
                <button type="button" className="secondary-button compact-button" onClick={onReloadContent}>
                  <ResetIcon />
                  Reload content
                </button>
              ) : null}
            </div>
            {contentStatus?.reloadAvailable ? (
              <p className="muted">Content root: {contentStatus.contentRoot}</p>
            ) : null}
            {migrationError ? <p className="migration-error">{migrationError}</p> : null}
            {userData ? <MigrationSummary userData={userData} /> : <p className="muted">No migrated user data loaded.</p>}
          </section>
        </div>
      </section>
    </div>
  );
}

function DashboardScreen({
  graph,
  userData,
  sidebarCollapsed,
  onShowSidebar,
  onImportLegacyBackup,
  onExportProgress,
  onExportCoachLog,
  onOpenCollection,
  onOpenProblem,
  onOpenAssessment
}: {
  graph: ContentGraph;
  userData: NextUserData | null;
  sidebarCollapsed: boolean;
  onShowSidebar: () => void;
  onImportLegacyBackup: (file: File | undefined) => void;
  onExportProgress: () => void;
  onExportCoachLog: () => void;
  onOpenCollection: (scope: Extract<SidebarScope, { kind: "module" | "problem-set" }>) => void;
  onOpenProblem: (problemId: string) => void;
  onOpenAssessment: (problemId: string) => void;
}) {
  const completed = userData?.progress.filter((record) => record.status === "complete").length ?? 0;
  const legacyTrackableTotal = legacyContentStats.lessonCount + legacyContentStats.totalProblemCount + legacyContentStats.quizCount;
  const completePercent = legacyTrackableTotal ? Math.round((completed / legacyTrackableTotal) * 100) : 0;
  const dueReviews = dueReviewCount(userData);
  const recentProblem = recentAttemptProblem(graph, userData);
  const assessmentProblems = assessmentProblemsForGraph(graph);
  const practiceSets = graph.problemSets.filter((set) => set.id !== "assessments" && !set.id.startsWith("lib-"));
  const modules = legacyOrderedModules(graph);
  return (
    <section className="page stack">
      <div className="page-header">
        {sidebarCollapsed ? <ShowSidebarButton onClick={onShowSidebar} /> : null}
        <div className="page-header-main">
          <p className="eyebrow">Local course</p>
          <h1>DSA Coach</h1>
        </div>
        <DashboardActions
          onImportProgress={onImportLegacyBackup}
          onExportProgress={onExportProgress}
          onExportCoachLog={onExportCoachLog}
        />
      </div>

      <div className="dashboard-summary">
        <div className="dashboard-stat-strip" aria-label="Course overview">
          <span><strong>{completePercent}%</strong> complete</span>
          <span aria-hidden="true">·</span>
          <span><strong>{legacyContentStats.totalProblemCount}</strong> runnable problems</span>
          <span aria-hidden="true">·</span>
          <span><strong>{dueReviews}</strong> reviews due</span>
        </div>
        {recentProblem ? (
          <button className="resume-card" type="button" onClick={() => onOpenProblem(recentProblem.problem.id)}>
            <div>
              <p className="eyebrow">Continue working</p>
              <h2>{recentProblem.problem.title}</h2>
              <p className="muted">Last run {recentProblem.passed ? "passed" : "did not pass"} · {recentProblem.problem.difficulty}</p>
            </div>
            <span className="resume-card-cta" aria-hidden="true">
              <TerminalSquareIcon />
              Resume <ArrowRightIcon />
            </span>
          </button>
        ) : null}
      </div>

      {assessmentProblems.length ? (
        <section className="assessment-promo" aria-labelledby="assessment-promo-heading">
          <div className="section-heading">
            <h2 id="assessment-promo-heading">CodeSignal ICF Practice</h2>
            <p>Timed, four-level evolving problems — train the format, not just the algorithm</p>
          </div>
          <div className="assessment-promo-cards">
            {assessmentProblems.map((problem) => (
              <button key={problem.id} className="assessment-promo-card" type="button" onClick={() => onOpenAssessment(problem.id)}>
                <span className="eyebrow">
                  <ClockIcon />
                  90 min · 4 levels
                </span>
                <h3>{problem.title}</h3>
                <p className="muted inline-markdown"><InlineMarkdown text={assessmentBlurb(problem)} /></p>
                <footer>
                  <span>{isProblemComplete(userData, problem.id) ? "Completed" : "Not attempted"}</span>
                  <ArrowRightIcon />
                </footer>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {practiceSets.length ? (
        <section aria-labelledby="problem-sets-heading" className="problem-set-grid">
          <div className="section-heading">
            <h2 id="problem-sets-heading">Problem Sets</h2>
            <p>Focused, interview-calibrated practice outside the core modules</p>
          </div>
          <div className="problem-set-cards">
            {practiceSets.map((set) => (
              <ProblemSetCard key={set.id} graph={graph} set={set} userData={userData} onOpen={() => onOpenCollection({ kind: "problem-set", id: set.id })} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="section-heading">
        <h2>Modules</h2>
        <p>{legacyContentStats.chapterCount} chapters, {legacyContentStats.guidedProblemCount} guided problems, {legacyContentStats.bonusProblemCount} bonus drills, {legacyContentStats.quizCount} quizzes</p>
      </div>
      <div className="chapter-grid">
        {modules.map((module, index) => {
          const meta = legacyModuleMeta(module.id);
          const ids = module.sequence.filter((entry) => entry.kind === "problem").map((entry) => entry.id);
          const done = completedCount(userData, ids);
          const percent = ids.length ? Math.round((done / ids.length) * 100) : 0;
          return (
            <button className="chapter-card" key={module.id} type="button" onClick={() => onOpenCollection({ kind: "module", id: module.id })}>
              <div>
                <span className="chapter-number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{meta?.title ?? module.title}</h3>
                <p>{meta?.summary ?? module.summary}</p>
              </div>
              <div className="progress-line" aria-label={`${percent}% complete`}>
                <span style={{ width: `${percent}%` }} />
              </div>
              <footer>
                <span>{percent}% complete</span>
                <ArrowRightIcon />
              </footer>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DashboardActions({
  onImportProgress,
  onExportProgress,
  onExportCoachLog
}: {
  onImportProgress: () => void;
  onExportProgress: () => void;
  onExportCoachLog: () => void;
}) {
  return (
    <div className="export-row dashboard-actions">
      <button className="icon-button" type="button" onClick={onExportProgress} aria-label="Export progress">
        <DownloadIcon />
        Export
      </button>
      <button className="icon-button" type="button" onClick={onImportProgress} aria-label="Import progress">
        <UploadIcon />
        Import
      </button>
      <button className="icon-button" type="button" onClick={onExportCoachLog} aria-label="Export coach eval log" title="Export logged coach conversations as JSONL for evals">
        <FlaskIcon />
        Coach log
      </button>
    </div>
  );
}

function downloadText(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ProblemSetCard({
  graph,
  set,
  userData,
  onOpen
}: {
  graph: ContentGraph;
  set: ContentGraph["problemSets"][number];
  userData: NextUserData | null;
  onOpen: () => void;
}) {
  const ids = set.entries.map((entry) => entry.problem);
  const done = completedCount(userData, ids);
  const percent = ids.length ? Math.round((done / ids.length) * 100) : 0;
  return (
    <button className="problem-set-card" type="button" onClick={onOpen}>
      <p className="eyebrow problem-set-eyebrow">
        <SparkleIcon />
        Featured set
      </p>
      <h3>{set.title}</h3>
      <p className="muted">{set.summary}</p>
      <div className="progress-line" aria-label={`${percent}% complete`}>
        <span style={{ width: `${percent}%` }} />
      </div>
      <footer>
        <span>{done}/{set.entries.filter((entry) => graph.problems.some((problem) => problem.id === entry.problem)).length} done · {percent}%</span>
        <ArrowRightIcon />
      </footer>
    </button>
  );
}

function CollectionScreen({
  collection,
  graph,
  userData,
  sidebarCollapsed,
  onShowSidebar,
  onOpenProblem,
  onOpenAssessment,
  onOpenLesson,
  onOpenQuiz
}: {
  collection: CollectionViewModel;
  graph: ContentGraph;
  userData: NextUserData | null;
  sidebarCollapsed: boolean;
  onShowSidebar: () => void;
  onOpenProblem: (problemId: string) => void;
  onOpenAssessment: (problemId: string) => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenQuiz: (quizId: string) => void;
}) {
  const completed = completedCount(userData, collection.problems.map((problem) => problem.id));
  const percent = collection.problems.length ? Math.round((completed / collection.problems.length) * 100) : 0;
  const groups = collectionGroups(collection);
  const [activeSetCategory, setActiveSetCategory] = useState("all");
  const isAssessmentSet = collection.kind === "problem-set" && collection.id === "assessments";
  const legacyChapter = collection.kind === "module" ? legacyCourse.chapters.find((chapter) => chapter.id === collection.id) : undefined;
  const lessons = legacyChapter?.lessons.map((lessonId) => legacyFindLesson(lessonId)).filter((lesson): lesson is LegacyLesson => Boolean(lesson)) ?? [];
  const quizzes = legacyChapter?.quizzes.map((quizId) => legacyFindQuiz(quizId)).filter((quiz): quiz is LegacyQuiz => Boolean(quiz)) ?? [];
  const hasSetFilters = collection.kind === "problem-set" && !isAssessmentSet && groups.length > 1;
  const visibleGroups = hasSetFilters && activeSetCategory !== "all" ? groups.filter((group) => group.id === activeSetCategory) : groups;
  const sideBody = collection.id === "interview-prep"
    ? "These prompts mirror the generalist coding-interview style: each is solvable cleanly in 30–45 minutes in Python (or any language) and rewards decomposition, careful state handling, explicit edge cases, and a fully-tested implementation — not clever tricks. Treat each problem like a small system: name the state, validate inputs at the boundary, and pick the simplest data structure that fits. Several problems extend into a Part 2 that builds on your Part 1 solution."
    : collection.sideBody;
  const sideFooter = collection.id === "interview-prep"
    ? "Each problem keeps a separate workspace, notes, and history just like the modules. Run visible tests as you iterate, then submit hidden tests to verify the edge cases."
    : "Each problem keeps a separate workspace, notes, run history, and language-specific starter code.";
  useEffect(() => {
    setActiveSetCategory("all");
  }, [collection.id]);
  if (isAssessmentSet) {
    return (
      <AssessmentIndexScreen
        collection={collection}
        userData={userData}
        sidebarCollapsed={sidebarCollapsed}
        onShowSidebar={onShowSidebar}
        onOpenAssessment={onOpenAssessment}
      />
    );
  }
  if (collection.kind === "module") {
    return (
      <section className="page stack">
        <div className="page-header">
          {sidebarCollapsed ? <ShowSidebarButton onClick={onShowSidebar} /> : null}
          <div className="page-header-main">
            <p className="eyebrow">{collection.eyebrow}</p>
            <h1>{collection.title}</h1>
            <p className="lead">{collection.summary}</p>
          </div>
        </div>

        {lessons.length ? (
          <section className="chapter-group" aria-label="Lessons">
            <div className="section-heading">
              <h2>Lessons</h2>
            </div>
            <div className="chapter-rows">
              {lessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  done={isContentComplete(userData, "lesson", lesson.id)}
                  onOpen={() => onOpenLesson(lesson.id)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {groups.map((group) => {
          const done = completedCount(userData, group.problems.map((problem) => problem.id));
          return (
            <section className="chapter-group" aria-label={group.label} key={group.id}>
              <div className="section-heading">
                <h2>{group.label}</h2>
                <p>{group.id === "guided" ? `${group.problems.length} core problems that build the module` : `${group.problems.length} extra problems — same patterns, more reps`}</p>
              </div>
              <div className="chapter-rows">
                {group.problems.map((problem) => (
                  <ProblemRow key={problem.id} problem={problem} done={isProblemComplete(userData, problem.id)} variant="module" onOpen={() => onOpenProblem(problem.id)} />
                ))}
              </div>
              {done ? <p className="muted">{done}/{group.problems.length} complete</p> : null}
            </section>
          );
        })}

        {quizzes.length ? (
          <section className="chapter-group" aria-label="Quiz">
            <div className="section-heading">
              <h2>Quiz</h2>
            </div>
            <div className="chapter-rows">
              {quizzes.map((quiz) => (
                <QuizRow
                  key={quiz.id}
                  quiz={quiz}
                  done={isContentComplete(userData, "quiz", quiz.id)}
                  onOpen={() => onOpenQuiz(quiz.id)}
                />
              ))}
            </div>
          </section>
        ) : null}
      </section>
    );
  }
  return (
    <section className={`page stack ${collection.kind === "problem-set" ? "set-page" : ""}`}>
      <div className="page-header">
        {sidebarCollapsed ? <ShowSidebarButton onClick={onShowSidebar} /> : null}
        <div className="page-header-main">
          <p className="eyebrow">{collection.eyebrow}</p>
          <h1>{collection.title}</h1>
          <p className="lead">{collection.summary}</p>
        </div>
      </div>

      <div className="content-columns">
        <div className="stack">
          <div className="section-heading">
            <h2>Problems</h2>
            <p>{completed}/{collection.problems.length} complete · {percent}%</p>
          </div>

          {hasSetFilters ? (
            <>
              <div className="set-filter-bar" role="tablist" aria-label="Filter by category">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeSetCategory === "all"}
                  className={activeSetCategory === "all" ? "set-filter is-active" : "set-filter"}
                  onClick={() => setActiveSetCategory("all")}
                >
                  All <span>{collection.problems.length}</span>
                </button>
                {groups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    role="tab"
                    aria-selected={activeSetCategory === group.id}
                    className={activeSetCategory === group.id ? "set-filter is-active" : "set-filter"}
                    onClick={() => setActiveSetCategory(group.id)}
                  >
                    {group.label} <span>{group.problems.length}</span>
                  </button>
                ))}
              </div>
              {visibleGroups.map((group) => {
                const groupDone = completedCount(userData, group.problems.map((problem) => problem.id));
                return (
                  <div className="set-group stack" key={group.id}>
                    <div className="set-group-heading">
                      <h3>{group.label}</h3>
                      <p>{group.blurb ? `${group.blurb} · ${groupDone}/${group.problems.length}` : `${groupDone}/${group.problems.length}`}</p>
                    </div>
                    {group.problems.map((problem) => (
                      <ProblemRow key={problem.id} problem={problem} done={isProblemComplete(userData, problem.id)} onOpen={() => onOpenProblem(problem.id)} />
                    ))}
                  </div>
                );
              })}
            </>
          ) : groups.length > 1 ? (
            visibleGroups.map((group) => (
              <div className="set-group stack" key={group.id}>
                <div className="set-group-heading">
                  <h3>{group.label}</h3>
                  <p>{group.problems.length} problems</p>
                </div>
                {group.problems.map((problem) => (
                  <ProblemRow key={problem.id} problem={problem} done={isProblemComplete(userData, problem.id)} onOpen={() => isAssessmentSet ? onOpenAssessment(problem.id) : onOpenProblem(problem.id)} />
                ))}
              </div>
            ))
          ) : (
            collection.problems.map((problem) => (
              <ProblemRow key={problem.id} problem={problem} done={isProblemComplete(userData, problem.id)} onOpen={() => isAssessmentSet ? onOpenAssessment(problem.id) : onOpenProblem(problem.id)} />
            ))
          )}
        </div>

        <aside className="bonus-panel set-aside">
          <h2><SparkleIcon />{collection.sideTitle}</h2>
          <p>{sideBody}</p>
          <p className="muted">{sideFooter}</p>
        </aside>
      </div>
    </section>
  );
}

function AssessmentIndexScreen({
  collection,
  userData,
  sidebarCollapsed,
  onShowSidebar,
  onOpenAssessment
}: {
  collection: CollectionViewModel;
  userData: NextUserData | null;
  sidebarCollapsed: boolean;
  onShowSidebar: () => void;
  onOpenAssessment: (problemId: string) => void;
}) {
  return (
    <section className="page assessment-index-page">
      <header className="page-header">
        {sidebarCollapsed ? <ShowSidebarButton onClick={onShowSidebar} /> : null}
        <h1>{collection.title}</h1>
        <p className="page-intro">
          One evolving problem, four progressive levels, ninety minutes. Your code from each level carries forward into the next — this
          mode trains the format itself, not just the algorithms. Pick an assessment to start.
        </p>
      </header>

      <ul className="assessment-card-grid" aria-label="Available assessments">
        {collection.problems.map((problem) => {
          const levels = assessmentLevelsForProblem(problem);
          const scorecard = assessmentScorecardFor(userData, problem.id);
          return (
            <li key={problem.id} className="assessment-card">
              <header className="assessment-card-header">
                <div>
                  <h2>
                    <button type="button" className="link-button" onClick={() => onOpenAssessment(problem.id)}>
                      {problem.title}
                    </button>
                  </h2>
                  <p className="assessment-card-blurb inline-markdown"><InlineMarkdown text={assessmentBlurb(problem)} /></p>
                </div>
                <span className="assessment-card-archetype">{assessmentArchetype(problem)}</span>
              </header>

              <dl className="assessment-card-meta">
                <div>
                  <dt><ClockIcon /> Time</dt>
                  <dd>90 min</dd>
                </div>
                <div>
                  <dt><LayersIcon /> Levels</dt>
                  <dd>{levels.length} progressive</dd>
                </div>
                <div>
                  <dt><TrophyIcon /> Last score</dt>
                  <dd>{scorecard ? `${scorecard.totalScore} (${scorecard.mode === "exam" ? "timed" : "practice"})` : "—"}</dd>
                </div>
              </dl>

              <div className="assessment-card-actions">
                <button className="primary-button" type="button" onClick={() => onOpenAssessment(problem.id)}>
                  {scorecard ? "Resume or replay" : "Start"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function AssessmentFlowScreen({
  graph,
  languages,
  problemId,
  selectedLanguage,
  userData,
  sidebarCollapsed,
  onShowSidebar,
  onOpenMobileNav,
  onOpenCollection,
  onSaveAssessmentState,
  onLogAssessmentEvent,
  onSavePreference,
  onRecordRun,
  onMarkProgress,
  coachOpen,
  coachMounted,
  onToggleCoach,
  onCloseCoach,
  onLogCoachExchange,
  onRateCoachExchange
}: {
  graph: ContentGraph;
  languages: LanguagePack[];
  problemId: string;
  selectedLanguage: LanguageId;
  userData: NextUserData | null;
  sidebarCollapsed: boolean;
  onShowSidebar: () => void;
  onOpenMobileNav: () => void;
  onOpenCollection: (scope: Extract<SidebarScope, { kind: "module" | "problem-set" }>) => void;
  onSaveAssessmentState: (assessmentId: string, kind: "session" | "scorecard" | "scorecard-history", value: unknown) => Promise<void>;
  onLogAssessmentEvent: (assessmentId: string, event: AssessmentEventRecord) => Promise<void>;
  onSavePreference: (key: string, value: unknown) => Promise<void>;
  onRecordRun: (problemId: string, partId: string | undefined, language: LanguageId, code: string, result: RunResult) => Promise<void>;
  onMarkProgress: (
    contentKind: "lesson" | "problem" | "quiz",
    contentId: string,
    status: "in-progress" | "complete",
    score?: { correct: number; total: number }
  ) => Promise<void>;
  coachOpen: boolean;
  coachMounted: boolean;
  onToggleCoach: () => void;
  onCloseCoach: () => void;
  onLogCoachExchange: (record: NextUserData["coachLogs"][number]) => void;
  onRateCoachExchange: (createdAt: string, feedback: unknown) => void;
}) {
  const problemOrMissing = graph.problems.find((candidate) => candidate.id === problemId);
  if (!problemOrMissing) {
    return (
      <section className="page stack">
        {sidebarCollapsed ? <ShowSidebarButton onClick={onShowSidebar} /> : null}
        <h1>Assessment unavailable</h1>
        <p className="lead">This assessment is not present in the local curriculum.</p>
      </section>
    );
  }
  const problem: Problem = problemOrMissing;
  const levels = assessmentLevelsForProblem(problem);
  const restoredRawSession = assessmentSessionFor(userData, problem.id);
  const restoredSession = repairAssessmentSessionBuffers(
    restoredRawSession,
    userData,
    problem,
    assessmentLanguage(problem, restoredRawSession?.language ?? selectedLanguage)
  );
  const [session, setSession] = useState<AssessmentSessionState | undefined>(() => restoredSession);
  const [level, setLevel] = useState(() => restoredSession?.activeLevel ?? 1);
  const language = assessmentLanguage(problem, session?.language ?? selectedLanguage);
  const pack = languages.find((candidate) => candidate.id === language);
  const runs = assessmentRuns(userData, problem.id);
  const scoreHistory = assessmentScorecardHistory(userData, problem.id);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [activePanel, setActivePanel] = useState<AssessmentPanel>("results");
  const [showHiddenDiagnostics, setShowHiddenDiagnostics] = useState(() => preferenceValue<boolean>(userData, "workspace:showHiddenDiagnostics", false) === true);
  const [lastRunIncludedHidden, setLastRunIncludedHidden] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");
  const [dockHeight, setDockHeight] = useState(() => numberPreference(userData, "workspace:bottomDockHeight", 260));
  const [splitRatio, setSplitRatio] = useState(() => numberPreference(userData, "workspace:splitRatio", 38));
  const [promptPaneCollapsed, setPromptPaneCollapsed] = useState(false);
  const assessmentWorkspaceRef = useRef<HTMLElement | null>(null);
  const assessmentDockDragRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const assessmentSessionRef = useRef<AssessmentSessionState | undefined>(session);
  const assessmentCodeKeyRef = useRef("");

  useEffect(() => {
    const rawRestored = assessmentSessionFor(userData, problem.id);
    const restored = repairAssessmentSessionBuffers(
      rawRestored,
      userData,
      problem,
      assessmentLanguage(problem, rawRestored?.language ?? selectedLanguage)
    );
    setSession(restored);
    setLevel(restored?.activeLevel ?? 1);
    setResult(null);
    setHintCount(0);
    setSolutionOpen(false);
    setSaveState("saved");
    if (restored && restored !== rawRestored) {
      void onSaveAssessmentState(problem.id, "session", restored);
    }
  }, [problem, problem.id, selectedLanguage, userData?.migratedAt]);

  useEffect(() => {
    assessmentSessionRef.current = session;
  }, [session]);

  useEffect(() => {
    setDockHeight(clampAssessmentDockHeight(numberPreference(userData, "workspace:bottomDockHeight", 260)));
    setSplitRatio(numberPreference(userData, "workspace:splitRatio", 38));
    setShowHiddenDiagnostics(preferenceValue<boolean>(userData, "workspace:showHiddenDiagnostics", false) === true);
  }, [userData]);

  useEffect(() => {
    if (!session || session.status !== "in-progress" || session.pausedAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [session]);

  const effectiveNow = session?.pausedAt ? new Date(session.pausedAt).getTime() : now;
  const remainingMs = session?.endsAt ? new Date(session.endsAt).getTime() - effectiveNow : Number.POSITIVE_INFINITY;
  const isExam = session?.mode === "exam" && !session.reviewMode;
  const isPaused = Boolean(session?.pausedAt);

  useEffect(() => {
    if (!session || session.status !== "in-progress" || session.mode !== "exam" || session.reviewMode || session.pausedAt) return;
    if (!session.endsAt || remainingMs > 0) return;
    void finishAssessment("expired");
  }, [remainingMs, session]);

  useEffect(() => {
    if (!session || session.status !== "in-progress") return;
    let alive = true;
    const key = assessmentCodeKey(problem.id, session.sessionId, language, level);
    assessmentCodeKeyRef.current = "";
    const load = async () => {
      const cached = session.buffers[level] ?? (level > 1 ? session.buffers[level - 1] : undefined);
      if (typeof cached === "string") {
        if (alive) {
          assessmentCodeKeyRef.current = key;
          setCode(cached);
        }
        return;
      }
      try {
        const source = await loadAssessmentStarter(level);
        if (alive) {
          assessmentCodeKeyRef.current = key;
          setCode(source.code);
        }
      } catch (error) {
        if (alive) setCode(`// Could not load starter source: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    void load();
    setResult(null);
    setHintCount(0);
    setSolutionOpen(false);
    setPromptPaneCollapsed(false);
    setSaveState("saved");
    return () => {
      alive = false;
    };
  }, [language, level, problem, session?.assessmentId, session?.sessionId, session?.status]);

  useEffect(() => {
    const activeSession = assessmentSessionRef.current;
    if (!activeSession || activeSession.status !== "in-progress") return;
    const key = assessmentCodeKey(problem.id, activeSession.sessionId, language, level);
    if (key !== assessmentCodeKeyRef.current) return;
    const timer = window.setTimeout(() => {
      const latestSession = assessmentSessionRef.current;
      if (!latestSession || latestSession.status !== "in-progress") return;
      if (assessmentCodeKey(problem.id, latestSession.sessionId, language, level) !== key) return;
      const next = {
        ...latestSession,
        activeLevel: level,
        buffers: { ...latestSession.buffers, [level]: code }
      };
      setSession(next);
      void onSaveAssessmentState(problem.id, "session", next).then(() => setSaveState("saved"));
    }, 650);
    return () => window.clearTimeout(timer);
  }, [code, language, level, problem.id]);

  useEffect(() => {
    function handleAssessmentKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key !== "Enter") return;
      event.preventDefault();
      void runAssessment(event.shiftKey);
    }
    window.addEventListener("keydown", handleAssessmentKeyDown);
    return () => window.removeEventListener("keydown", handleAssessmentKeyDown);
  });

  async function loadAssessmentStarter(targetLevel: number): Promise<{ code: string }> {
    const partId = assessmentPartId(problem, targetLevel);
    const partParam = partId ? `&partId=${encodeURIComponent(partId)}` : "";
    return getJson<{ code: string }>(
      `/source?problemId=${encodeURIComponent(problem.id)}${partParam}&language=${encodeURIComponent(language)}&kind=starter`
    );
  }

  async function resetAssessmentStarter() {
    const source = await loadAssessmentStarter(level);
    assessmentCodeKeyRef.current = assessmentCodeKey(problem.id, session?.sessionId, language, level);
    setCode(source.code);
    setSaveState("saving");
  }

  function clampAssessmentDockHeight(value: number): number {
    const min = 150;
    const workspaceHeight = assessmentWorkspaceRef.current?.clientHeight ?? 0;
    const max = workspaceHeight > 0 ? Math.max(min, workspaceHeight - 300) : 360;
    return Math.min(max, Math.max(min, Math.round(value)));
  }

  function handleAssessmentSeparatorPointerDown(event: PointerEvent<HTMLDivElement>) {
    const container = event.currentTarget.parentElement;
    if (!container) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = container.getBoundingClientRect();
    const next = Math.round(((event.clientX - rect.left) / rect.width) * 100);
    setSplitRatio(Math.min(48, Math.max(26, next)));
  }

  function handleAssessmentSeparatorPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const container = event.currentTarget.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const next = Math.round(((event.clientX - rect.left) / rect.width) * 100);
    setSplitRatio(Math.min(48, Math.max(26, next)));
  }

  function handleAssessmentSeparatorPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    void onSavePreference("workspace:splitRatio", splitRatio);
  }

  function handleAssessmentDockPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    assessmentDockDragRef.current = { startY: event.clientY, startHeight: dockHeight };
  }

  function handleAssessmentDockPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = assessmentDockDragRef.current;
    if (!drag) return;
    setDockHeight(clampAssessmentDockHeight(drag.startHeight + (drag.startY - event.clientY)));
  }

  function handleAssessmentDockPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const drag = assessmentDockDragRef.current;
    assessmentDockDragRef.current = null;
    if (!drag) return;
    const next = clampAssessmentDockHeight(drag.startHeight + (drag.startY - event.clientY));
    setDockHeight(next);
    void onSavePreference("workspace:bottomDockHeight", next);
  }

  function updateAssessmentHiddenDiagnostics(next: boolean) {
    setShowHiddenDiagnostics(next);
    void onSavePreference("workspace:showHiddenDiagnostics", next);
  }

  async function persistSession(next: AssessmentSessionState | undefined) {
    setSession(next);
    await onSaveAssessmentState(problem.id, "session", next);
  }

  async function logEvent(
    activeSession: AssessmentSessionState,
    type: AssessmentEventType,
    details: Partial<Omit<AssessmentEventRecord, "id" | "assessmentId" | "sessionId" | "type" | "occurredAt">> = {},
    occurredAt = new Date().toISOString()
  ) {
    await onLogAssessmentEvent(problem.id, {
      id: assessmentEventId(type, occurredAt),
      assessmentId: problem.id,
      sessionId: assessmentSessionId(activeSession, problem.id),
      type,
      occurredAt,
      ...details
    });
  }

  async function startSession(mode: AssessmentMode) {
    const startedAt = new Date().toISOString();
    const sessionId = createAssessmentSessionId(problem.id, startedAt);
    const next: AssessmentSessionState = {
      sessionId,
      assessmentId: problem.id,
      problemId: problem.id,
      language,
      mode,
      status: "in-progress",
      startedAt,
      endsAt: mode === "exam" ? new Date(Date.now() + 90 * 60_000).toISOString() : undefined,
      unlockedLevel: 1,
      activeLevel: 1,
      levelResults: {},
      buffers: {},
      activeSince: startedAt,
      timeByLevelMs: {}
    };
    setLevel(1);
    setResult(null);
    setNow(Date.now());
    await persistSession(next);
    await logEvent(next, "session_started", { level: 1, mode, language }, startedAt);
  }

  async function pauseSession() {
    if (!session || session.status !== "in-progress" || session.pausedAt) return;
    const pausedAt = new Date().toISOString();
    const timed = rollupAssessmentActiveTime(session, level, pausedAt);
    const next = {
      ...timed,
      activeLevel: level,
      buffers: { ...session.buffers, [level]: code },
      pausedAt,
      activeSince: undefined
    };
    await persistSession(next);
    await logEvent(next, "paused", { level, elapsedMs: assessmentElapsedMs(next) }, pausedAt);
  }

  async function resumeSession() {
    if (!session?.pausedAt) return;
    const resumedAt = new Date().toISOString();
    const pauseMs = Math.max(0, Date.now() - new Date(session.pausedAt).getTime());
    const next = {
      ...session,
      startedAt: shiftIso(session.startedAt, pauseMs),
      endsAt: session.endsAt ? shiftIso(session.endsAt, pauseMs) : undefined,
      pausedAt: undefined,
      activeSince: resumedAt
    };
    await persistSession(next);
    await logEvent(next, "resumed", { level: next.activeLevel, elapsedMs: assessmentElapsedMs(next) }, resumedAt);
    setNow(Date.now());
  }

  async function selectLevel(nextLevel: number) {
    if (!session || nextLevel === level || nextLevel > session.unlockedLevel) return;
    const selectedAt = new Date().toISOString();
    const timed = rollupAssessmentActiveTime(session, level, selectedAt);
    const next = {
      ...timed,
      activeLevel: nextLevel,
      buffers: { ...session.buffers, [level]: code },
      activeSince: session.pausedAt || session.reviewMode ? timed.activeSince : selectedAt
    };
    setLevel(nextLevel);
    await persistSession(next);
    await logEvent(next, "level_selected", { fromLevel: level, toLevel: nextLevel }, selectedAt);
  }

  async function runAssessment(includeHidden: boolean) {
    if (!session || busy || isPaused || !pack?.runner.installedByDefault) return;
    setBusy(true);
    setLastRunIncludedHidden(includeHidden);
    setActivePanel("results");
    const runStartedAt = new Date().toISOString();
    await logEvent(session, "run_started", {
      level,
      language,
      includeHidden,
      codeLength: code.length
    }, runStartedAt);
    try {
      const partId = assessmentPartId(problem, level);
      const nextResult = await postJson<RunResult>("/run", {
        language,
        problemId: problem.id,
        partId,
        code,
        includeHidden,
        timeoutMs: 2500
      });
      setResult(nextResult);
      await onRecordRun(problem.id, partId, language, code, nextResult);
      const nextSession = mergeAssessmentRun(session, problem, level, code, nextResult, includeHidden);
      await persistSession(nextSession);
      const tests = nextResult.tests;
      await logEvent(nextSession, "run_finished", {
        level,
        language,
        includeHidden,
        status: nextResult.status,
        passedCount: tests.filter((test) => test.passed).length,
        totalCount: tests.length,
        durationMs: nextResult.durationMs,
        codeLength: code.length
      });
      if (nextResult.message || nextResult.stderr || nextResult.tests.some((test) => test.error)) {
        setActivePanel("errors");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResult({
        status: "runtime-error",
        stdout: "",
        stderr: "",
        durationMs: 0,
        tests: [],
        message
      });
      await logEvent(session, "run_finished", {
        level,
        language,
        includeHidden,
        status: "runtime-error",
        passedCount: 0,
        totalCount: 0,
        durationMs: 0,
        codeLength: code.length
      });
      setActivePanel("errors");
    } finally {
      setBusy(false);
    }
  }

  async function finishAssessment(status: "submitted" | "expired") {
    if (!session) return;
    const finishedAt = new Date().toISOString();
    const timed = session.pausedAt ? session : rollupAssessmentActiveTime(session, level, finishedAt);
    const finalSession: AssessmentSessionState = {
      ...timed,
      status,
      finishedAt,
      activeLevel: level,
      buffers: { ...session.buffers, [level]: code },
      pausedAt: undefined,
      activeSince: undefined,
      reviewMode: false,
      preReviewStatus: undefined
    };
    const card = summarizeAssessmentScorecard(problem, finalSession);
    await persistSession(finalSession);
    await onSaveAssessmentState(problem.id, "scorecard", card);
    await onSaveAssessmentState(problem.id, "scorecard-history", [card, ...scoreHistory].slice(0, 20));
    await onMarkProgress("problem", problem.id, card.completedLevels === 4 ? "complete" : "in-progress");
    await logEvent(finalSession, status, {
      level,
      status,
      elapsedMs: card.elapsedMs,
      totalScore: card.totalScore,
      rawPoints: card.rawPoints,
      maxRawPoints: card.maxRawPoints
    }, finishedAt);
  }

  async function enterReview(targetLevel?: number) {
    if (!session || session.status === "in-progress") return;
    const nextLevel = targetLevel ?? level;
    setLevel(nextLevel);
    await persistSession({
      ...session,
      status: "in-progress",
      reviewMode: true,
      preReviewStatus: session.status,
      activeLevel: nextLevel
    });
    await logEvent(session, "review_started", { fromLevel: level, toLevel: nextLevel });
  }

  async function exitReview() {
    if (!session?.reviewMode) return;
    const next = {
      ...session,
      status: session.preReviewStatus ?? "submitted",
      reviewMode: false,
      preReviewStatus: undefined,
      activeLevel: level,
      buffers: { ...session.buffers, [level]: code }
    };
    await persistSession(next);
    await logEvent(next, "review_ended", { level });
  }

  async function replay() {
    setLevel(1);
    setResult(null);
    await persistSession(undefined);
  }

  const scorecard = assessmentScorecardFor(userData, problem.id) ?? (session && session.status !== "in-progress" ? summarizeAssessmentScorecard(problem, session) : undefined);
  if (!session) {
    return (
      <AssessmentRulesScreen
        problem={problem}
        levels={levels}
        runs={runs}
        scoreHistory={scoreHistory}
        sidebarCollapsed={sidebarCollapsed}
        onShowSidebar={onShowSidebar}
        onOpenCollection={onOpenCollection}
        onStart={(mode) => void startSession(mode)}
      />
    );
  }

  if (session.status !== "in-progress" && scorecard) {
    return (
      <AssessmentReportScreen
        problem={problem}
        scorecard={scorecard}
        scoreHistory={scoreHistory}
        session={session}
        userData={userData}
        language={language}
        onReplay={() => void replay()}
        onContinue={(targetLevel) => void enterReview(targetLevel)}
        onBack={() => onOpenCollection({ kind: "problem-set", id: "assessments" })}
      />
    );
  }

  const part = assessmentPart(problem, level);
  const activeTests = part?.tests ?? problem.tests;
  const visibleTests = activeTests.filter((test) => test.visibility === "visible");
  const hiddenTests = activeTests.filter((test) => test.visibility === "hidden");
  const activeSignature = part?.signature ?? problem.signature;
  const activeSupport = (part?.languages ?? problem.languages)[language];
  const activeHints = problemHints(problem, part);
  const levelMeta = levels[level - 1];
  const hasErrors = Boolean(result?.message || result?.stderr || result?.diagnostics?.length || result?.tests.some((test) => test.error || test.diagnostics?.length));
  const coachAllowed = session.mode === "practice" && !session.reviewMode;
  const coachVisible = coachAllowed && coachOpen && !isPaused;
  return (
    <section className="assessment-page">
      <header className="assessment-context-bar">
        <button
          type="button"
          className="problem-nav-toggle assessment-nav-toggle"
          aria-label="Open navigation menu"
          onClick={onOpenMobileNav}
        >
          <MenuIcon />
        </button>
        {sidebarCollapsed ? <ShowSidebarButton onClick={onShowSidebar} /> : null}
        <div className="assessment-context-main">
          <p className="assessment-breadcrumb">
            <button type="button" className="breadcrumb-button" onClick={() => onOpenCollection({ kind: "problem-set", id: "assessments" })}>
              CodeSignal ICF Practice
            </button>
            <span>/</span>
            <span>{problem.title}</span>
          </p>
          <div className="assessment-title-row">
            <h1>{problem.title}</h1>
            <span className={`assessment-mode-pill ${session.reviewMode ? "review" : session.mode}`}>
              {session.reviewMode ? "Review mode" : session.mode === "exam" ? "Timed exam" : "Practice"}
            </span>
          </div>
        </div>
        <div className="assessment-context-actions">
          {session.reviewMode ? (
            <span className="assessment-elapsed review">Score locked</span>
          ) : session.mode === "exam" ? (
            <span className={`assessment-countdown ${remainingMs < 5 * 60_000 ? "danger" : remainingMs < 15 * 60_000 ? "warning" : ""} ${isPaused ? "paused" : ""}`}>
              <ClockIcon />
              <strong>{formatRemaining(remainingMs)}</strong>
              {isPaused ? <span className="assessment-paused-tag">paused</span> : null}
            </span>
          ) : (
            <span className={`assessment-elapsed ${isPaused ? "paused" : ""}`}>
              <ClockIcon />
              {formatElapsed(session.startedAt, effectiveNow)} elapsed
              {isPaused ? <span className="assessment-paused-tag">paused</span> : null}
            </span>
          )}
          {isPaused ? (
            <button className="primary-button compact-button" type="button" onClick={() => void resumeSession()}>
              <PlayIcon />
              Resume
            </button>
          ) : session.reviewMode ? (
            <button className="primary-button compact-button" type="button" onClick={() => void exitReview()}>
              Back to report
            </button>
          ) : (
            <button className="secondary-button compact-button" type="button" onClick={() => void pauseSession()}>
              <PauseIcon />
              Pause
            </button>
          )}
          {coachAllowed ? (
            <button
              type="button"
              className={`secondary-button compact-button ${coachVisible ? "active" : ""}`}
              aria-pressed={coachVisible}
              disabled={isPaused}
              onClick={onToggleCoach}
            >
              <CoachIcon />
              Coach
            </button>
          ) : null}
          {!session.reviewMode ? (
            <button className="primary-button compact-button" type="button" disabled={isPaused} onClick={() => void finishAssessment("submitted")}>
              <FlagIcon />
              Finish
            </button>
          ) : null}
        </div>
      </header>

      <nav className="assessment-level-pills" aria-label="Assessment levels">
        {levels.map((candidate) => {
          const locked = candidate.level > session.unlockedLevel;
          return (
            <button
              key={candidate.level}
              type="button"
              className={`assessment-level-pill ${candidate.level === level ? "active" : ""} ${locked ? "locked" : ""}`}
              disabled={locked}
              onClick={() => void selectLevel(candidate.level)}
            >
              {locked ? <LockIcon /> : null}
              L{candidate.level}
            </button>
          );
        })}
      </nav>

      <div className={`problem-layout beta-workspace ${isPaused ? "is-paused" : ""} ${coachVisible ? "coach-open" : ""} ${promptPaneCollapsed ? "prompt-collapsed" : ""}`} style={{ "--prompt-width": `${splitRatio}%`, "--dock-height": `${dockHeight}px` } as CSSProperties}>
        {isPaused ? (
          <div className="assessment-pause-overlay" role="dialog" aria-modal="true" aria-label="Session paused">
            <div className="assessment-pause-card">
              <PauseIcon />
              <h2>Paused</h2>
              <p>
                The clock is frozen. {session.mode === "exam"
                  ? "Your remaining exam time is held until you resume."
                  : "Your elapsed time is held until you resume."}
              </p>
              <button className="primary-button" type="button" autoFocus onClick={() => void resumeSession()}>
                <PlayIcon />
                Resume
              </button>
            </div>
          </div>
        ) : null}
        <aside className="prompt-pane problem-brief">
          <div className="prompt-scroll">
            <section className="prompt-primary">
              <div className="prompt-primary-heading">
                <h2>Level {level}: {levelMeta?.title ?? problem.title}</h2>
                <button
                  className="pane-toggle"
                  type="button"
                  aria-label="Collapse prompt"
                  title="Collapse prompt"
                  onClick={() => setPromptPaneCollapsed(true)}
                >
                  <PanelCloseIcon />
                </button>
              </div>
              <p className="muted assessment-level-hint">
                Suggested time: ~{levelMeta?.recommendedMinutes ?? 20} min · weight {levelMeta?.maxPoints ?? 100} pts
              </p>
              <PromptMarkdown content={part?.prompt ?? problem.prompt} />
            </section>
            <details className="prompt-detail" open>
              <summary>Visible examples</summary>
              <div className="test-preview compact-tests">
                {visibleTests.slice(0, 3).map((test) => (
                  <pre key={test.name}>
                    <code>{renderAssessmentExample(activeSignature, test)}</code>
                  </pre>
                ))}
              </div>
            </details>
            {!isExam && (hintCount > 0 || solutionOpen) ? (
              <div className="prompt-reveal">
                {activeHints.slice(0, hintCount).map((hint, index) => (
                  <p key={hint}><strong>Hint {index + 1}:</strong> {hint}</p>
                ))}
                {solutionOpen ? (
                  <div className="solution-box">
                    <h2>Reference solution</h2>
                    <p className="inline-markdown"><InlineMarkdown text={assessmentBlurb(problem)} /></p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          {!isExam ? (
            <div className="prompt-actions">
              <button className="tertiary-button" type="button" onClick={() => setHintCount((count) => Math.min(count + 1, activeHints.length))}>
                <LightbulbIcon />
                Reveal hint
              </button>
              <button className="tertiary-button" type="button" onClick={() => setSolutionOpen((value) => !value)}>
                <EyeIcon />
                {solutionOpen ? "Hide solution" : "Show solution"}
              </button>
            </div>
        ) : (
          <p className="prompt-actions muted assessment-exam-note">Hints and the solution are locked during a timed exam.</p>
        )}
        </aside>

        <div
          className="split-handle"
          role="separator"
          aria-label="Resize prompt and editor panes"
          aria-orientation="vertical"
          aria-valuemin={26}
          aria-valuemax={48}
          aria-valuenow={splitRatio}
          tabIndex={0}
          onPointerDown={handleAssessmentSeparatorPointerDown}
          onPointerMove={handleAssessmentSeparatorPointerMove}
          onPointerUp={handleAssessmentSeparatorPointerUp}
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            setSplitRatio((value) => {
              const next = Math.min(48, Math.max(26, value + (event.key === "ArrowRight" ? 2 : -2)));
              void onSavePreference("workspace:splitRatio", next);
              return next;
            });
          }}
        >
          ⋮
        </div>

        {promptPaneCollapsed ? (
          <button
            className="prompt-restore-tab"
            type="button"
            aria-label="Restore prompt pane"
            title="Restore prompt pane"
            onClick={() => setPromptPaneCollapsed(false)}
          >
            <PanelOpenIcon />
            <span>Prompt</span>
          </button>
        ) : null}

        <section className="workspace assessment-workspace" ref={assessmentWorkspaceRef}>
          <div className="workspace-toolbar">
            <div className="toolbar-status-group">
              <span className={`run-status ${busy ? "loading" : result?.status ?? "idle"}`}>{busy ? "Running" : result ? statusLabel(result.status) : "Ready"}</span>
              <small>{result?.durationMs ? `${result.durationMs} ms` : pack ? `Local ${pack.label}` : "Local runner"}</small>
              <span className={`autosave-indicator ${saveState}`} title="Your work is saved automatically.">
                <span className="autosave-dot" aria-hidden />
                {saveState === "saving" ? "Saving..." : "Saved"}
              </span>
            </div>
            <div className="toolbar-actions">
              <button className="secondary-button compact-button" type="button" onClick={() => void resetAssessmentStarter()}>
                <ResetIcon />
                Reset starter
              </button>
              <button className="primary-button run-button" type="button" disabled={busy || isPaused || !pack?.runner.installedByDefault} onClick={() => void runAssessment(false)}>
                <PlayIcon />
                <span className="button-copy"><strong>Run</strong><small>visible tests</small></span>
                <kbd>⌘↵</kbd>
              </button>
              <button className="primary-button submit-button" type="button" disabled={busy || isPaused || !pack?.runner.installedByDefault} onClick={() => void runAssessment(true)}>
                <CheckCircleIcon />
                <span className="button-copy"><strong>Submit</strong><small>all tests</small></span>
                <kbd>⇧⌘↵</kbd>
              </button>
            </div>
          </div>
          <div className="workspace-editor">
            <CodeEditor
              value={code}
              language={language}
              problemId={problem.id}
              partId={assessmentPartId(problem, level)}
              signature={activeSignature}
              support={activeSupport}
              onChange={(value) => {
                setCode(value);
                setSaveState("saving");
              }}
            />
          </div>
          <div className="workspace-bottom assessment-bottom">
            <div className="desktop-workspace-tabs" role="tablist" aria-label="Assessment output panels">
              {assessmentPanels.map((panel) => (
                <button key={panel} type="button" role="tab" aria-selected={activePanel === panel} className={activePanel === panel ? "active" : ""} onClick={() => setActivePanel(panel)}>
                  {panel}
                  {panel === "output" && result?.stdout.trim() ? <span className="tab-dot" /> : null}
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
              onPointerDown={handleAssessmentDockPointerDown}
              onPointerMove={handleAssessmentDockPointerMove}
              onPointerUp={handleAssessmentDockPointerUp}
              onKeyDown={(event) => {
                if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                event.preventDefault();
                setDockHeight((height) => {
                  const next = clampAssessmentDockHeight(height + (event.key === "ArrowUp" ? 24 : -24));
                  void onSavePreference("workspace:bottomDockHeight", next);
                  return next;
                });
              }}
            />
            <>
              {activePanel === "results" ? (
                <section className="workspace-panel result-panel active">
                  <h2>Results</h2>
                  {busy ? <p className="muted">Running locally...</p> : null}
                  {!busy && !result ? <p className="muted">No run results yet.</p> : null}
                  {!busy && result ? (
                    <>
                      <AssessmentResultsSummary
                        result={result}
                        visibleTotal={visibleTests.length}
                        hiddenTotal={hiddenTests.length}
                        includeHidden={lastRunIncludedHidden}
                        onJumpToErrors={hasErrors ? () => setActivePanel("errors") : undefined}
                      />
                        <TestResultsList
                          visible={result.tests.filter((test) => test.visibility === "visible")}
                          hidden={result.tests.filter((test) => test.visibility === "hidden")}
                          showHiddenDiagnostics={showHiddenDiagnostics}
                          onToggleHiddenDiagnostics={updateAssessmentHiddenDiagnostics}
                          lockHidden={isExam}
                        />
                    </>
                  ) : null}
                  {result?.status === "passed" && lastRunIncludedHidden ? (
                    <div className="completion-banner">
                      <span className="completion-mark" aria-hidden="true">✓</span>
                      <div>
                        <strong>Level {level} cleared on all tests</strong>
                        <p>{level < 4 ? "Continue to the next level. Your code carries forward." : "Final level cleared. Finish the assessment to see your score."}</p>
                      </div>
                      <div className="completion-actions">
                        {level < 4 ? (
                          <button className="primary-button compact-button" type="button" onClick={() => void selectLevel(level + 1)}>Level {level + 1}</button>
                        ) : (
                          <button className="primary-button compact-button" type="button" onClick={() => void finishAssessment("submitted")}>Finish</button>
                        )}
                      </div>
                    </div>
                  ) : null}
                </section>
              ) : null}
              {activePanel === "output" ? (
                <section className="workspace-panel result-panel active">
                  <h2>Output</h2>
                  {result?.stdout.trim() ? <pre>{result.stdout}</pre> : <p className="muted">Nothing printed yet. Use <code>print(...)</code> to inspect values.</p>}
                </section>
              ) : null}
              {activePanel === "errors" ? (
                <ErrorsPanel result={result} isExam={isExam} />
              ) : null}
            </>
          </div>
        </section>
        {coachAllowed && coachMounted ? (
          <CoachPanel
            problem={problem}
            part={part}
            language={language}
            code={code}
            result={result}
            coachLogs={userData?.coachLogs ?? []}
            visible={coachVisible}
            onClose={onCloseCoach}
            onLogExchange={onLogCoachExchange}
            onRateExchange={onRateCoachExchange}
          />
        ) : null}
      </div>
    </section>
  );
}

function AssessmentRulesScreen({
  problem,
  levels,
  runs,
  scoreHistory,
  sidebarCollapsed,
  onShowSidebar,
  onOpenCollection,
  onStart
}: {
  problem: Problem;
  levels: AssessmentLevelSummary[];
  runs: AssessmentRunSummary[];
  scoreHistory: AssessmentScorecard[];
  sidebarCollapsed: boolean;
  onShowSidebar: () => void;
  onOpenCollection: (scope: Extract<SidebarScope, { kind: "module" | "problem-set" }>) => void;
  onStart: (mode: AssessmentMode) => void;
}) {
  const bestRun = runs.reduce<typeof runs[number] | undefined>(
    (best, run) => (!best || run.passedCount > best.passedCount ? run : best),
    undefined
  );
  return (
    <section className="page assessment-rules-page">
      <header className="page-header">
        <p className="page-breadcrumb">
          {sidebarCollapsed ? <ShowSidebarButton onClick={onShowSidebar} /> : null}
          <button type="button" className="breadcrumb-button" onClick={() => onOpenCollection({ kind: "problem-set", id: "assessments" })}>
            CodeSignal ICF Practice
          </button>
          <span>/</span>
          <span>{problem.title}</span>
        </p>
        <h1>{problem.title}</h1>
        <p className="page-intro inline-markdown"><InlineMarkdown text={assessmentRulesIntro(problem)} /></p>
      </header>

      <section className="rules-block">
        <h2>How it works</h2>
        <ul>
          <li>
            One evolving problem, <strong>four progressive levels</strong>. Your code from each level carries forward into the next —
            extend the same <code>{problem.languages.python?.entrypoint ?? problem.signature.name}(queries)</code> function.
          </li>
          <li>
            <strong>90 minutes total</strong> in timed exam mode. The clock keeps running even if you leave the tab.
          </li>
          <li>
            Each level has visible example tests and additional hidden tests. Hidden test diagnostics stay hidden during the exam; you see
            only pass/fail counts.
          </li>
          <li>
            You can re-run and re-submit a level as many times as you like — your best result counts. You can revisit any level you have
            unlocked.
          </li>
          <li>
            <strong>Read all four levels before you code</strong>; design a data model in Level 1 that survives to Level 4.
          </li>
        </ul>
      </section>

      <section className="rules-block">
        <h2>Level plan</h2>
        <ol className="rules-level-plan">
          {levels.map((level) => (
            <li key={level.level}>
              <strong>Level {level.level}</strong> · ~{level.recommendedMinutes} min · weight {level.maxPoints} pts
            </li>
          ))}
        </ol>
      </section>

      {runs.length ? (
        <section className="rules-block">
          <h2>Your runs</h2>
          <p className="rules-history-summary">
            <strong>{runs.length}</strong> run{runs.length === 1 ? "" : "s"} · best{" "}
            <strong>{bestRun ? `${bestRun.passedCount}/${bestRun.totalCount}` : "0/0"}</strong>
          </p>
          <ol className="rules-history-list">
            {runs.slice(0, 8).map((run) => (
              <li key={`${run.createdAt}-${run.workspaceId}`}>
                <span className="rules-history-score">{run.passedCount}/{run.totalCount}</span>
                <span className="rules-history-meta">
                  {run.language} · {run.passed ? "passed" : "needs work"} · {formatRunWhen(run.createdAt)}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <div className="assessment-rules-actions">
        <button className="primary-button" type="button" onClick={() => onStart("exam")}>
          Begin timed exam (90:00)
        </button>
        <button className="secondary-button" type="button" onClick={() => onStart("practice")}>
          Practice (untimed, hints unlocked)
        </button>
      </div>
      {scoreHistory.length ? (
        <p className="muted rules-history-hint">
          Last score {scoreHistory[0].totalScore}; best {scoreHistory.reduce((best, card) => Math.max(best, card.totalScore), 0)}.
        </p>
      ) : null}
    </section>
  );
}

function AssessmentReportScreen({
  problem,
  scorecard,
  scoreHistory,
  session,
  userData,
  language,
  onReplay,
  onContinue,
  onBack
}: {
  problem: Problem;
  scorecard: AssessmentScorecard;
  scoreHistory: AssessmentScorecard[];
  session: AssessmentSessionState | undefined;
  userData: NextUserData | null;
  language: LanguageId;
  onReplay: () => void;
  onContinue: (targetLevel?: number) => void;
  onBack: () => void;
}) {
  const levels = assessmentLevelsForProblem(problem);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const range = ASSESSMENT_SCORE_BAND.max - ASSESSMENT_SCORE_BAND.min;
  const scorePct = range > 0 ? Math.max(0, Math.min(100, ((scorecard.totalScore - ASSESSMENT_SCORE_BAND.min) / range) * 100)) : 0;
  const totalVisiblePassed = scorecard.perLevel.reduce((sum, level) => sum + level.visiblePassed, 0);
  const totalVisible = scorecard.perLevel.reduce((sum, level) => sum + level.visibleTotal, 0);
  const totalHiddenPassed = scorecard.perLevel.reduce((sum, level) => sum + level.hiddenPassed, 0);
  const totalHidden = scorecard.perLevel.reduce((sum, level) => sum + level.hiddenTotal, 0);
  const totalAttempts = scorecard.perLevel.reduce((sum, level) => sum + level.attempts, 0);
  const levelTimeRows = scorecard.perLevel.map((row) => ({
    row,
    meta: levels[row.level - 1],
    ms: assessmentLevelTimeMs(scorecard, row.level)
  }));
  const trackedLevelTimeMs = levelTimeRows.reduce((sum, row) => sum + row.ms, 0);
  const suggestion = pickAssessmentPracticeSuggestion(scorecard, levels);
  return (
    <section className="page assessment-report-page wide-report">
      <header className="page-header">
        <p className="page-breadcrumb">CodeSignal ICF Practice / {problem.title}</p>
        <h1>{scorecard.status === "expired" ? "Time expired" : "Assessment complete"}</h1>
        <p className="page-intro">{assessmentCoachingSummary(scorecard)}</p>
      </header>
      <section className="report-hero">
        <div className="report-hero-score">
          <p className="scorecard-total-label">Final score</p>
          <strong className="scorecard-total">{scorecard.totalScore}</strong>
          <div className="scorecard-track" role="meter" aria-valuemin={ASSESSMENT_SCORE_BAND.min} aria-valuemax={ASSESSMENT_SCORE_BAND.max} aria-valuenow={scorecard.totalScore}>
            <div className="scorecard-fill" style={{ width: `${scorePct}%` }} />
          </div>
          <div className="scorecard-band-row" aria-hidden="true">
            <span>{ASSESSMENT_SCORE_BAND.min}</span>
            <span>{ASSESSMENT_SCORE_BAND.max}</span>
          </div>
          {scorecard.totalScore < ASSESSMENT_SCORE_BAND.max ? (
            <p className="report-hero-headroom">
              <strong>+{ASSESSMENT_SCORE_BAND.max - scorecard.totalScore}</strong> points on the table if you clean up the remaining tests in review.
            </p>
          ) : (
            <p className="report-hero-headroom strong">Top of the band — clean sweep.</p>
          )}
        </div>
        <dl className="report-stats">
          <Stat label="Raw points" value={`${scorecard.rawPoints} / ${scorecard.maxRawPoints}`} sub={pctLabel(scorecard.rawPoints, scorecard.maxRawPoints)} />
          <Stat label="Levels cleared" value={`${scorecard.completedLevels} of 4`} sub={scorecard.completedLevels === 4 ? "Every level perfect" : `${4 - scorecard.completedLevels} partial`} />
          <Stat
            label="Hidden tests"
            value={totalHidden ? `${totalHiddenPassed} / ${totalHidden}` : "-"}
            sub={totalHidden ? pctLabel(totalHiddenPassed, totalHidden) : ""}
            tone={totalHidden && totalHiddenPassed < totalHidden ? "fail" : "pass"}
          />
          <Stat
            label="Visible tests"
            value={totalVisible ? `${totalVisiblePassed} / ${totalVisible}` : "-"}
            sub={totalVisible ? pctLabel(totalVisiblePassed, totalVisible) : ""}
            tone={totalVisible && totalVisiblePassed < totalVisible ? "fail" : "pass"}
          />
          <Stat label="Time used" value={formatDuration(scorecard.elapsedMs)} sub={scorecard.mode === "exam" ? "of 90m 00s budget" : "untimed practice"} />
          <Stat label="Total attempts" value={String(totalAttempts)} sub={attemptsHint(totalAttempts, scorecard.maxRawPoints)} />
        </dl>
      </section>
      {trackedLevelTimeMs > 0 ? (
        <section className="report-section assessment-time-breakdown">
          <header className="report-section-header">
            <h2>Time by level</h2>
            <p className="muted">Tracked from the assessment clock: level switches, pauses, resumes, and finish events.</p>
          </header>
          <div className="assessment-time-rows">
            {levelTimeRows.map(({ row, meta, ms }) => (
              <div key={row.level} className="assessment-time-row">
                <div className="assessment-time-label">
                  <strong>L{row.level}</strong>
                  <span>{meta?.title ?? "Level"}</span>
                </div>
                <div className="assessment-time-bar" aria-hidden="true">
                  <span style={{ width: `${ms > 0 ? Math.max(4, (ms / trackedLevelTimeMs) * 100) : 0}%` }} />
                </div>
                <span className="assessment-time-value">{formatDuration(ms)}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {suggestion ? (
        <section className="report-suggestion">
          <div className="report-suggestion-body">
            <p className="report-suggestion-eyebrow">Suggested practice</p>
            <p className="report-suggestion-headline">{suggestion.headline}</p>
            <p className="muted">{suggestion.detail}</p>
          </div>
          <button type="button" className="primary-button" onClick={() => onContinue(suggestion.level)}>
            <PlayIcon />
            Practice Level {suggestion.level}
          </button>
        </section>
      ) : null}
      {scoreHistory.length > 1 ? (
        <section className="rules-block">
          <h2>Run history</h2>
          <ol className="rules-history-list">
            {scoreHistory.slice(0, 8).map((card) => (
              <li key={card.generatedAt}>
                <span className="rules-history-score">{card.totalScore}</span>
                <span className="rules-history-meta">{card.completedLevels}/4 cleared · {card.mode} · {formatRunWhen(card.generatedAt)}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      <section className="report-section">
        <header className="report-section-header">
          <h2>Level breakdown</h2>
          <p className="muted">Each level is weighted; later levels are worth more. Click Review to see your code at the moment time stopped versus the reference approach.</p>
        </header>
        <ul className="report-level-list">
          {scorecard.perLevel.map((row) => {
            const level = levels[row.level - 1];
            const cleared = row.visibleTotal + row.hiddenTotal > 0 && row.visiblePassed + row.hiddenPassed === row.visibleTotal + row.hiddenTotal;
            const partial = row.attempts > 0 && !cleared;
            const status = cleared ? "cleared" : partial ? "partial" : "untouched";
            const expanded = expandedLevel === row.level;
            const attempt = latestAssessmentAttemptForLevel(userData, problem, row.level, language);
            const snapshotCode = session?.buffers[row.level] ?? attempt?.code ?? "";
            return (
              <li key={row.level} className={`report-level-card ${status}`}>
                <div className="report-level-card-head">
                  <div>
                    <p className="report-level-eyebrow">Level {row.level} · {level?.title}</p>
                    <p className="report-level-status">{statusLabelFor(status)}</p>
                  </div>
                  <div className="report-level-points">
                    <strong>{row.points}</strong>
                    <span className="muted"> / {level?.maxPoints ?? 0} pts</span>
                  </div>
                </div>
                <div className="report-level-bars">
                  <ProgressRow label="Visible" passed={row.visiblePassed} total={row.visibleTotal} />
                  <ProgressRow label="Hidden" passed={row.hiddenPassed} total={row.hiddenTotal} />
                </div>
                <div className="report-level-meta">
                  <span>{row.attempts || 0} attempt{row.attempts === 1 ? "" : "s"}</span>
                  {assessmentLevelTimeMs(scorecard, row.level) > 0 ? <span>Active {formatDuration(assessmentLevelTimeMs(scorecard, row.level))}</span> : null}
                  {row.lastRunAt ? <span>Last run {formatShortTime(row.lastRunAt)}</span> : null}
                </div>
                <div className="report-level-actions">
                  <button
                    type="button"
                    className="tertiary-button"
                    aria-expanded={expanded}
                    onClick={() => setExpandedLevel(expanded ? null : row.level)}
                  >
                    {expanded ? "Hide review" : "Review code"}
                  </button>
                  <button type="button" className="secondary-button compact-button" onClick={() => onContinue(row.level)}>
                    <PlayIcon />
                    Practice this level
                  </button>
                </div>
                {expanded ? (
                  <AssessmentLevelReview
                    problem={problem}
                    level={row.level}
                    language={language}
                    status={status}
                    snapshotCode={snapshotCode}
                    attempt={attempt}
                    onPracticeLevel={() => onContinue(row.level)}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
        <p className="muted scorecard-band-note">
          Score band {ASSESSMENT_SCORE_BAND.min}-{ASSESSMENT_SCORE_BAND.max}; raw points map linearly into the band.
        </p>
      </section>
      <div className="assessment-report-actions">
        <button className="primary-button" type="button" onClick={() => onContinue()}>Continue practicing</button>
        <button className="secondary-button" type="button" onClick={onReplay}>Replay assessment</button>
        <button className="secondary-button" type="button" onClick={onBack}>Back to assessments</button>
      </div>
      <p className="muted assessment-report-note">
        Continue practicing re-opens the workspace with the timer disabled and your final score locked at <strong>{scorecard.totalScore}</strong>.
        Edit, run, and submit any level to keep learning without overwriting the result above.
      </p>
    </section>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "pass" | "fail" }) {
  return (
    <div className={`report-stat ${tone ?? ""}`}>
      <dt>{label}</dt>
      <dd>
        <strong>{value}</strong>
        {sub ? <span className="muted">{sub}</span> : null}
      </dd>
    </div>
  );
}

function ProgressRow({ label, passed, total }: { label: string; passed: number; total: number }) {
  const pct = total ? Math.round((passed / total) * 100) : 0;
  const tone = total === 0 ? "empty" : passed === total ? "pass" : passed === 0 ? "empty" : "partial";
  return (
    <div className={`progress-row ${tone}`}>
      <span className="progress-row-label">{label}</span>
      <div className="progress-row-bar" aria-hidden="true">
        <div className="progress-row-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-row-count">{total ? `${passed}/${total}` : "-"}</span>
    </div>
  );
}

function AssessmentLevelReview({
  problem,
  level,
  language,
  status,
  snapshotCode,
  attempt,
  onPracticeLevel
}: {
  problem: Problem;
  level: number;
  language: LanguageId;
  status: "cleared" | "partial" | "untouched";
  snapshotCode: string;
  attempt: NextUserData["attempts"][number] | undefined;
  onPracticeLevel: () => void;
}) {
  const [referenceCode, setReferenceCode] = useState("");
  const [referenceState, setReferenceState] = useState<"loading" | "ready" | "error">("loading");
  const part = assessmentPart(problem, level);
  const details = problemSolutionDetails(problem, part);
  const reviewTitle = level === 1 ? `Level ${level}: ${problem.title}` : part?.title ?? `Level ${level}`;
  const snapshot = snapshotCode || attempt?.code || "";

  useEffect(() => {
    let alive = true;
    const partParam = part?.id ? `&partId=${encodeURIComponent(part.id)}` : "";
    setReferenceState("loading");
    void getJson<{ code: string }>(
      `/source?problemId=${encodeURIComponent(problem.id)}${partParam}&language=${encodeURIComponent(language)}&kind=reference`
    )
      .then((source) => {
        if (!alive) return;
        setReferenceCode(source.code);
        setReferenceState("ready");
      })
      .catch(() => {
        if (!alive) return;
        setReferenceCode("");
        setReferenceState("error");
      });
    return () => {
      alive = false;
    };
  }, [language, part?.id, problem.id]);

  return (
    <div className="level-review">
      <header className="level-review-header">
        <div>
          <h3>{reviewTitle}</h3>
          <p className="muted inline-markdown"><InlineMarkdown text={details.solution ?? assessmentBlurb(problem)} /></p>
        </div>
        {details.complexity ? (
          <span className="level-review-complexity">
            Time {details.complexity.time} · Space {details.complexity.space}
          </span>
        ) : null}
        <button type="button" className="secondary-button compact-button" onClick={onPracticeLevel}>
          <PlayIcon />
          Practice this level
        </button>
      </header>
      <section className="level-review-yours">
        <h4>Code at time of finish</h4>
        {snapshot ? (
          <pre className="level-review-code"><code>{snapshot}</code></pre>
        ) : (
          <p className="muted">No code was captured for this level.</p>
        )}
      </section>
      {details.walkthrough ? (
        <section className="level-review-walkthrough-block">
          <h4>Design rationale</h4>
          <p className="level-review-walkthrough">{details.walkthrough}</p>
        </section>
      ) : null}
      <details className="level-review-reference">
        <summary>
          Show reference solution
          {status === "cleared" ? <span className="muted"> — compare your approach</span> : null}
          {status === "partial" || status === "untouched" ? <span className="muted"> — when you're ready</span> : null}
        </summary>
        {referenceState === "loading" ? <p className="muted">Loading reference solution...</p> : null}
        {referenceState === "error" ? <p className="muted">Reference source is not available for this language.</p> : null}
        {referenceCode ? <pre className="level-review-code"><code>{referenceCode}</code></pre> : null}
      </details>
    </div>
  );
}

function pctLabel(passed: number, total: number): string {
  if (!total) return "";
  return `${Math.round((passed / total) * 100)}%`;
}

function attemptsHint(attempts: number, maxRaw: number): string {
  if (!attempts) return "no runs";
  if (!maxRaw) return "";
  if (attempts < 10) return "lean — confident edits";
  if (attempts < 25) return "steady iteration";
  return "lots of trial and error";
}

interface PracticeSuggestion {
  level: number;
  headline: string;
  detail: string;
}

function pickAssessmentPracticeSuggestion(card: AssessmentScorecard, levels: AssessmentLevelSummary[]): PracticeSuggestion | undefined {
  const candidates = card.perLevel.map((row) => {
    const maxPoints = levels[row.level - 1]?.maxPoints ?? 0;
    return { row, maxPoints, lost: Math.max(0, maxPoints - row.points) };
  });
  const [top] = candidates
    .filter((candidate) => candidate.lost > 0)
    .sort((a, b) => b.lost - a.lost || b.row.level - a.row.level);
  if (!top) return undefined;

  const row = top.row;
  const missedVisible = Math.max(0, row.visibleTotal - row.visiblePassed);
  const missedHidden = Math.max(0, row.hiddenTotal - row.hiddenPassed);
  let detail: string;
  if (!row.attempts) {
    detail = `You never ran Level ${row.level}. Even partial credit there is worth ${top.lost} points.`;
  } else if (missedVisible > 0 && missedHidden > 0) {
    detail = `${missedVisible} visible and ${missedHidden} hidden tests still fail — the approach needs work.`;
  } else if (missedVisible > 0) {
    detail = `${missedVisible} visible test${missedVisible === 1 ? "" : "s"} still fail — likely a logic gap in the main path.`;
  } else {
    detail = `${missedHidden} hidden edge case${missedHidden === 1 ? "" : "s"} slipped — common patterns are empty inputs, ordering, or off-by-one.`;
  }

  return {
    level: row.level,
    headline: `Level ${row.level} has ${top.lost} points on the table.`,
    detail
  };
}

function latestAssessmentAttemptForLevel(
  userData: NextUserData | null,
  problem: Problem,
  level: number,
  language: LanguageId
): NextUserData["attempts"][number] | undefined {
  const partId = assessmentPartId(problem, level);
  const workspaceId = partId ? `${problem.id}:${partId}` : problem.id;
  return latestAttemptForWorkspace(userData, workspaceId, language);
}

function AssessmentResultsSummary({
  result,
  visibleTotal,
  hiddenTotal,
  includeHidden,
  onJumpToErrors
}: {
  result: RunResult | null;
  visibleTotal: number;
  hiddenTotal: number;
  includeHidden: boolean;
  onJumpToErrors?: () => void;
}) {
  if (!result) return null;
  const visible = result.tests.filter((test) => test.visibility === "visible");
  const hidden = result.tests.filter((test) => test.visibility === "hidden");
  const visiblePassed = visible.filter((test) => test.passed).length;
  const hiddenPassed = hidden.filter((test) => test.passed).length;
  const errored = result.tests.filter((test) => test.error).length;
  const failing = result.tests.filter((test) => !test.passed).length;
  return (
    <div className={`results-summary ${failing ? "has-failures" : "all-pass"}`}>
      <span className={`results-summary-chip ${visible.length && visiblePassed === visible.length ? "pass" : "fail"}`}>
        Visible <strong>{visiblePassed}/{visible.length || visibleTotal}</strong>
      </span>
      {hidden.length ? (
        <span className={`results-summary-chip ${hiddenPassed === hidden.length ? "pass" : "fail"}`}>
          Hidden <strong>{hiddenPassed}/{hidden.length}</strong>
        </span>
      ) : (
        <span className="results-summary-note">
          {includeHidden && hiddenTotal === 0 ? "No hidden tests for this level." : "Submit to include hidden tests."}
        </span>
      )}
      {failing ? <span className="results-summary-chip strong fail">{failing} failing</span> : null}
      {errored ? (
        onJumpToErrors ? (
          <button type="button" className="results-summary-chip error link" onClick={onJumpToErrors}>
            {errored} errored — view
          </button>
        ) : (
          <span className="results-summary-chip error">{errored} errored</span>
        )
      ) : null}
    </div>
  );
}

function ProblemRow({
  problem,
  done,
  onOpen,
  variant = "set"
}: {
  problem: Problem;
  done: boolean;
  onOpen: () => void;
  variant?: "module" | "set";
}) {
  return (
    <button className={`row-link ${variant === "module" ? "module-row" : ""}`} type="button" onClick={onOpen}>
      {variant === "module" && problem.id.includes("-bonus-") ? <SparkleIcon /> : <TerminalSquareIcon />}
      <span className="row-title">{problem.title}</span>
      <span className={`difficulty-badge is-${problem.difficulty}`}>{problem.difficulty}</span>
      <span className={done ? "status-dot complete" : "status-dot"}>{done ? "✓" : ""}</span>
    </button>
  );
}

function LessonRow({ lesson, done, onOpen }: { lesson: LegacyLesson; done: boolean; onOpen: () => void }) {
  return (
    <button className="row-link lesson-row" type="button" onClick={onOpen}>
      <FileTextIcon />
      <span className="row-title">{lesson.title}</span>
      <span className={done ? "status-dot complete" : "status-dot"}>{done ? "✓" : ""}</span>
    </button>
  );
}

function QuizRow({ quiz, done, onOpen }: { quiz: LegacyQuiz; done: boolean; onOpen: () => void }) {
  return (
    <button className="row-link quiz-row" type="button" onClick={onOpen}>
      <FileQuestionIcon />
      <span className="row-title">{quiz.title}</span>
      <span className={done ? "status-dot complete" : "status-dot"}>{done ? "✓" : ""}</span>
    </button>
  );
}

function LessonScreen({
  lessonId,
  userData,
  sidebarCollapsed,
  onShowSidebar,
  onOpenProblem,
  onSaveNote,
  onMarkProgress
}: {
  lessonId: string;
  userData: NextUserData | null;
  sidebarCollapsed: boolean;
  onShowSidebar: () => void;
  onOpenProblem: (problemId: string) => void;
  onSaveNote: (contentKind: "lesson" | "problem" | "quiz", contentId: string, body: string) => Promise<void>;
  onMarkProgress: (
    contentKind: "lesson" | "problem" | "quiz",
    contentId: string,
    status: "in-progress" | "complete",
    score?: { correct: number; total: number }
  ) => Promise<void>;
}) {
  const lesson = legacyFindLesson(lessonId);
  const [complete, setComplete] = useState(() => isContentComplete(userData, "lesson", lessonId));
  const [note, setNote] = useState(() => noteForContent(userData, "lesson", lessonId));
  const [checkpoints, setCheckpoints] = useState({ correct: 0, total: 0 });
  const noteLoadSkipRef = useRef(lessonId);
  const onCheckpoint = useCallback((correct: boolean) => {
    setCheckpoints((current) => ({
      correct: current.correct + (correct ? 1 : 0),
      total: current.total + 1
    }));
  }, []);
  useEffect(() => {
    noteLoadSkipRef.current = lessonId;
    setComplete(isContentComplete(userData, "lesson", lessonId));
    setNote(noteForContent(userData, "lesson", lessonId));
    setCheckpoints({ correct: 0, total: 0 });
  }, [lessonId]);
  useEffect(() => {
    if (noteLoadSkipRef.current === lessonId) {
      noteLoadSkipRef.current = "";
      return;
    }
    const timer = window.setTimeout(() => {
      void onSaveNote("lesson", lessonId, note);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [lessonId, note]);
  if (!lesson) {
    return (
      <section className="page stack">
        {sidebarCollapsed ? <ShowSidebarButton onClick={onShowSidebar} /> : null}
        <h1>Lesson unavailable</h1>
        <p className="lead">This lesson is not present in the local curriculum.</p>
      </section>
    );
  }
  const linkedProblems = lesson.linkedProblemIds
    .map((problemId) => legacyFindProblem(problemId))
    .filter((problem): problem is NonNullable<ReturnType<typeof legacyFindProblem>> => Boolean(problem));
  return (
    <section className="page reading-page">
      <article className="reading">
        {sidebarCollapsed ? <ShowSidebarButton onClick={onShowSidebar} /> : null}
        <p className="eyebrow">{lesson.minutes} min</p>
        <LessonBody content={lesson.body} lessonTitle={lesson.title} onCheckpoint={onCheckpoint} />
        <div className="lesson-ask">
          <p className="lesson-ask-copy">Something here not clicking? Ask the coach to explain it another way.</p>
          <LegacyCoachAssist
            label="Ask the coach about this lesson"
            mode="ask"
            systemPrompt={LESSON_COACH_SYSTEM_PROMPT}
            buildPrompt={(question) => buildLessonQuestionPrompt(lesson.title, lesson.body, question)}
            placeholder="e.g. Can you explain the Mental Model section a different way?"
          />
        </div>
        <div className="concept-row">
          {lesson.concepts.map((concept) => (
            <span key={concept}>{concept}</span>
          ))}
        </div>
        <div className="lesson-complete-row">
          <button className="primary-button" type="button" onClick={() => {
            setComplete(true);
            void onMarkProgress("lesson", lesson.id, "complete", checkpoints.total > 0 ? checkpoints : undefined);
          }}>
            <CheckCircleIcon />
            Mark complete
          </button>
          {checkpoints.total > 0 ? (
            <span className="lesson-checkpoint-tally">
              Checkpoints: {checkpoints.correct}/{checkpoints.total} right first try
            </span>
          ) : complete ? (
            <span className="lesson-checkpoint-tally">Marked complete</span>
          ) : null}
        </div>
      </article>
      <aside className="lesson-side stack">
        <section className="notes-panel">
          <span>Learning Goals</span>
          <ul>
            {lesson.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </section>
        <section className="notes-panel">
          <span>Practice Links</span>
          <div className="lesson-links">
            {linkedProblems.map((problem) => (
              <button key={problem.id} type="button" onClick={() => onOpenProblem(problem.id)}>
                {problem.title}
              </button>
            ))}
          </div>
        </section>
        <section className="notes-panel">
          <span>Notes</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} />
        </section>
      </aside>
    </section>
  );
}

function QuizScreen({
  quizId,
  userData,
  sidebarCollapsed,
  onShowSidebar,
  onSaveNote,
  onMarkProgress
}: {
  quizId: string;
  userData: NextUserData | null;
  sidebarCollapsed: boolean;
  onShowSidebar: () => void;
  onSaveNote: (contentKind: "lesson" | "problem" | "quiz", contentId: string, body: string) => Promise<void>;
  onMarkProgress: (
    contentKind: "lesson" | "problem" | "quiz",
    contentId: string,
    status: "in-progress" | "complete",
    score?: { correct: number; total: number }
  ) => Promise<void>;
}) {
  const quiz = legacyFindQuiz(quizId);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [note, setNote] = useState(() => noteForContent(userData, "quiz", quizId));
  const noteLoadSkipRef = useRef(quizId);
  useEffect(() => {
    noteLoadSkipRef.current = quizId;
    setAnswers({});
    setSubmitted(false);
    setNote(noteForContent(userData, "quiz", quizId));
  }, [quizId]);
  useEffect(() => {
    if (noteLoadSkipRef.current === quizId) {
      noteLoadSkipRef.current = "";
      return;
    }
    const timer = window.setTimeout(() => {
      void onSaveNote("quiz", quizId, note);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [note, quizId]);
  if (!quiz) {
    return (
      <section className="page stack">
        {sidebarCollapsed ? <ShowSidebarButton onClick={onShowSidebar} /> : null}
        <h1>Quiz unavailable</h1>
        <p className="lead">This quiz is not present in the local curriculum.</p>
      </section>
    );
  }
  const score = quiz.questions.filter((question) => answers[question.id] === question.answer).length;
  const complete = submitted && score === quiz.questions.length;
  return (
    <section className="page reading-page">
      <article className="reading stack">
        {sidebarCollapsed ? <ShowSidebarButton onClick={onShowSidebar} /> : null}
        <div>
          <p className="eyebrow">{quiz.questions.length} questions</p>
          <h1>{quiz.title}</h1>
        </div>
        {quiz.questions.map((question, questionIndex) => (
          <fieldset className="quiz-question" key={question.id}>
            <legend>{questionIndex + 1}. {question.prompt}</legend>
            {question.choices.map((choice, choiceIndex) => (
              <label key={choice}>
                <input
                  type="radio"
                  name={question.id}
                  checked={answers[question.id] === choiceIndex}
                  onChange={() => setAnswers((current) => ({ ...current, [question.id]: choiceIndex }))}
                />
                {choice}
              </label>
            ))}
            {submitted ? (
              <p className={answers[question.id] === question.answer ? "quiz-correct" : "quiz-wrong"}>{question.explanation}</p>
            ) : null}
          </fieldset>
        ))}
        <div className="quiz-actions">
          <button className="primary-button" type="button" onClick={() => {
            setSubmitted(true);
            void onMarkProgress("quiz", quiz.id, score === quiz.questions.length ? "complete" : "in-progress", {
              correct: score,
              total: quiz.questions.length
            });
          }}>
            <CheckCircleIcon />
            Grade quiz
          </button>
          {submitted ? (
            <strong>Score: {score}/{quiz.questions.length} {complete ? "complete" : ""}</strong>
          ) : null}
        </div>
      </article>
      <section className="notes-panel">
        <span>Notes</span>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} />
      </section>
    </section>
  );
}

function LessonBody({
  content,
  lessonTitle,
  onCheckpoint
}: {
  content: string;
  lessonTitle: string;
  onCheckpoint?: (correct: boolean) => void;
}) {
  return <div className="lesson-content">{renderLessonContent(content, lessonTitle, onCheckpoint)}</div>;
}

function PromptMarkdown({ content }: { content: string }) {
  return <div className="prompt-markdown">{renderLessonContent(content, "", undefined)}</div>;
}

function renderLessonContent(content: string, lessonTitle: string, onCheckpoint: ((correct: boolean) => void) | undefined): ReactNode[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let paragraph: string[] = [];
  let key = 0;
  const flushParagraph = () => {
    if (!paragraph.length) return;
    nodes.push(<p key={`p-${key++}`}>{renderInline(paragraph.join(" "))}</p>);
    paragraph = [];
  };
  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index];
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      continue;
    }
    if (line.startsWith("```")) {
      flushParagraph();
      const lang = line.slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      if (lang === "python-run") {
        nodes.push(<LessonRunnableCode key={`code-${key++}`} initialCode={code.join("\n")} />);
      } else {
        nodes.push(<pre key={`code-${key++}`} data-lang={lang || undefined}><code>{code.join("\n")}</code></pre>);
      }
      continue;
    }
    if (line.startsWith(":::")) {
      flushParagraph();
      const header = line.slice(3).trim();
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith(":::")) {
        body.push(lines[index]);
        index += 1;
      }
      nodes.push(<LessonSpecialBlock key={`special-${key++}`} header={header} body={body} lessonTitle={lessonTitle} onCheckpoint={onCheckpoint} />);
      continue;
    }
    if (/^#{1,4} /.test(line)) {
      flushParagraph();
      const level = line.match(/^(#{1,4}) /)?.[1].length ?? 2;
      const text = line.slice(level + 1).trim();
      if (level === 1) nodes.push(<h1 key={`h-${key++}`}>{renderInline(text)}</h1>);
      else if (level === 2) nodes.push(<h2 key={`h-${key++}`}>{renderInline(text)}</h2>);
      else if (level === 3) nodes.push(<h3 key={`h-${key++}`}>{renderInline(text)}</h3>);
      else nodes.push(<h4 key={`h-${key++}`}>{renderInline(text)}</h4>);
      continue;
    }
    if (line.startsWith("- ")) {
      flushParagraph();
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      index -= 1;
      nodes.push(<ul key={`ul-${key++}`}>{items.map((item) => <li key={item}>{renderInline(item)}</li>)}</ul>);
      continue;
    }
    if (/^\d+\. /.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (index < lines.length && /^\d+\. /.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\. /, ""));
        index += 1;
      }
      index -= 1;
      nodes.push(<ol key={`ol-${key++}`}>{items.map((item) => <li key={item}>{renderInline(item)}</li>)}</ol>);
      continue;
    }
    if (line.startsWith("|") && index + 1 < lines.length && /^\|[\s\-:|]+\|$/.test(lines[index + 1].trim())) {
      flushParagraph();
      const header = splitLessonTableRow(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(splitLessonTableRow(lines[index].trim()));
        index += 1;
      }
      index -= 1;
      nodes.push(
        <div className="lesson-table-wrap" key={`table-${key++}`}>
          <table className="lesson-table">
            <thead><tr>{header.map((cell) => <th key={cell}>{renderInline(cell)}</th>)}</tr></thead>
            <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{renderInline(cell)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
      continue;
    }
    if (/^-{3,}$/.test(line)) {
      flushParagraph();
      nodes.push(<hr key={`hr-${key++}`} />);
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  return nodes;
}

function LessonSpecialBlock({
  header,
  body,
  lessonTitle,
  onCheckpoint
}: {
  header: string;
  body: string[];
  lessonTitle: string;
  onCheckpoint?: (correct: boolean) => void;
}) {
  const [kind = "note", toneArg = "note"] = header.split(/\s+/);
  if (kind === "callout") {
    const tone = ["tip", "warning", "key", "note"].includes(toneArg) ? toneArg : "note";
    const label = tone === "warning" ? "Watch out" : tone === "tip" ? "Tip" : tone === "key" ? "Key idea" : "Note";
    return (
      <aside className={`lesson-callout tone-${tone}`}>
        <div className="lesson-callout-head">
          {tone === "warning" ? <WarningIcon /> : tone === "tip" ? <LightbulbIcon /> : tone === "key" ? <KeyIcon /> : <InfoIcon />}
          <span>{label}</span>
        </div>
        <div className="lesson-callout-body">
          {body.filter((line) => line.trim()).map((line, index) => (
            <p key={`${index}-${line}`}>{renderInline(line.replace(/^>\s?/, "").replace(/^[*+-]\s?/, ""))}</p>
          ))}
        </div>
      </aside>
    );
  }
  if (kind === "quiz") {
    const quiz = parseLessonQuizBlock(body);
    return <LessonQuizCard quiz={quiz} lessonTitle={lessonTitle} onCheckpoint={onCheckpoint} />;
  }
  if (kind === "fill") {
    const fill = parseLessonFillBlock(body);
    return <LessonFillCard fill={fill} onCheckpoint={onCheckpoint} />;
  }
  if (kind === "steps") {
    const steps = parseLessonStepsBlock(body);
    return <LessonStepsCard steps={steps} />;
  }
  const tag = kind === "quiz" ? "Check yourself" : kind === "fill" ? "Fill in" : kind === "steps" ? "Trace it" : kind === "callout" ? "Note" : kind;
  return (
    <div className={`lesson-card lesson-special lesson-special-${kind}`}>
      <div className="lesson-card-head">
        <span className="lesson-card-tag">{tag}</span>
      </div>
      <div className="lesson-card-body">
        {body.filter((line) => line.trim()).map((line, index) => (
          <p key={`${index}-${line}`}>{renderInline(line.replace(/^>\s?/, "").replace(/^[*+-]\s?/, ""))}</p>
        ))}
      </div>
    </div>
  );
}

interface LessonQuizBlock {
  question: string;
  choices: Array<{ text: string; correct: boolean }>;
  explanation: string;
}

interface LessonFillBlock {
  segments: Array<{ kind: "text"; text: string } | { kind: "blank"; answer: string }>;
  explanation: string;
}

interface LessonStepsBlock {
  intro: string[];
  header: string[];
  rows: string[][];
}

function parseLessonQuizBlock(lines: string[]): LessonQuizBlock {
  let question = "";
  const choices: LessonQuizBlock["choices"] = [];
  const explanation: string[] = [];
  let inExplanation = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("> ")) {
      inExplanation = true;
      explanation.push(line.slice(2));
    } else if (line.startsWith("* ")) {
      choices.push({ text: line.slice(2), correct: true });
    } else if (line.startsWith("- ")) {
      choices.push({ text: line.slice(2), correct: false });
    } else if (inExplanation) {
      explanation.push(line);
    } else {
      question = question ? `${question} ${line}` : line;
    }
  }
  return { question, choices, explanation: explanation.join(" ") };
}

function parseLessonFillBlock(lines: string[]): LessonFillBlock {
  let prompt = "";
  const explanation: string[] = [];
  let inExplanation = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("> ")) {
      inExplanation = true;
      explanation.push(line.slice(2));
    } else if (inExplanation) {
      explanation.push(line);
    } else {
      prompt = prompt ? `${prompt} ${line}` : line;
    }
  }
  const segments: LessonFillBlock["segments"] = [];
  const cleaned = prompt.replace(/\*\*(\{\{[^}]+\}\})\*\*/g, "$1");
  const pattern = /\{\{([^}]+)\}\}/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(cleaned)) !== null) {
    if (match.index > last) segments.push({ kind: "text", text: cleaned.slice(last, match.index) });
    segments.push({ kind: "blank", answer: match[1].trim() });
    last = match.index + match[0].length;
  }
  if (last < cleaned.length) segments.push({ kind: "text", text: cleaned.slice(last) });
  return { segments, explanation: explanation.join(" ") };
}

function parseLessonStepsBlock(lines: string[]): LessonStepsBlock {
  const intro: string[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (line.startsWith("|") && index + 1 < lines.length && /^\|[\s\-:|]+\|$/.test(lines[index + 1].trim())) break;
    if (line) intro.push(line);
    index += 1;
  }
  if (index >= lines.length) return { intro, header: [], rows: [] };
  const header = splitLessonTableRow(lines[index].trim());
  index += 2;
  const rows: string[][] = [];
  while (index < lines.length && lines[index].trim().startsWith("|")) {
    rows.push(splitLessonTableRow(lines[index].trim()));
    index += 1;
  }
  return { intro, header, rows };
}

function LessonQuizCard({
  quiz,
  lessonTitle,
  onCheckpoint
}: {
  quiz: LessonQuizBlock;
  lessonTitle: string;
  onCheckpoint?: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const reportedRef = useRef(false);
  const correctIndex = quiz.choices.findIndex((choice) => choice.correct);
  const isCorrect = selected !== null && quiz.choices[selected]?.correct;
  return (
    <div className={`lesson-card quiz-card${revealed ? (isCorrect ? " is-correct" : " is-wrong") : ""}`}>
      <div className="lesson-card-head">
        <span className="lesson-card-tag">Check yourself</span>
      </div>
      <p className="lesson-card-q">{renderInline(quiz.question)}</p>
      <div className="lesson-card-choices">
        {quiz.choices.map((choice, index) => {
          const showCorrect = revealed && choice.correct;
          const showWrong = revealed && selected === index && !choice.correct;
          return (
            <button
              key={`${index}-${choice.text}`}
              type="button"
              className={`lesson-card-choice${selected === index ? " is-selected" : ""}${showCorrect ? " is-correct" : ""}${showWrong ? " is-wrong" : ""}`}
              onClick={() => {
                if (!reportedRef.current) {
                  reportedRef.current = true;
                  onCheckpoint?.(choice.correct);
                }
                setSelected(index);
                setRevealed(true);
              }}
              disabled={revealed && selected === index}
            >
              <span className="lesson-card-bullet">{String.fromCharCode(65 + index)}</span>
              <span>{renderInline(choice.text)}</span>
            </button>
          );
        })}
      </div>
      {revealed ? (
        <div className="lesson-card-explain">
          <strong>{isCorrect ? "Correct." : "Not quite."}</strong>{" "}
          {!isCorrect && correctIndex >= 0 ? (
            <span>
              The answer is <strong>{String.fromCharCode(65 + correctIndex)}</strong>.{" "}
            </span>
          ) : null}
          {quiz.explanation ? <span>{renderInline(quiz.explanation)}</span> : null}
        </div>
      ) : null}
      {revealed && !isCorrect && selected !== null && correctIndex >= 0 ? (
        <div className="lesson-card-coach">
          <LegacyCoachAssist
            label="Ask the coach why"
            mode="auto"
            systemPrompt={LESSON_COACH_SYSTEM_PROMPT}
            seedPrompt={buildQuizCoachPrompt({
              lessonTitle,
              question: quiz.question,
              choices: quiz.choices.map((choice) => choice.text),
              pickedIndex: selected,
              correctIndex,
              explanation: quiz.explanation
            })}
          />
        </div>
      ) : null}
    </div>
  );
}

function LessonFillCard({
  fill,
  onCheckpoint
}: {
  fill: LessonFillBlock;
  onCheckpoint?: (correct: boolean) => void;
}) {
  const blanks = fill.segments.filter((segment): segment is { kind: "blank"; answer: string } => segment.kind === "blank");
  const [values, setValues] = useState(() => blanks.map(() => ""));
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const reportedRef = useRef(false);
  const normalized = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
  const matches = (input: string, answer: string) => {
    const value = normalized(input);
    if (!value) return false;
    return answer.split("|").map(normalized).includes(value);
  };
  const allCorrect = blanks.every((blank, index) => matches(values[index], blank.answer));
  let blankIndex = 0;
  return (
    <div className={`lesson-card fill-card${checked ? (allCorrect ? " is-correct" : " is-wrong") : ""}`}>
      <div className="lesson-card-head">
        <span className="lesson-card-tag">Fill in</span>
      </div>
      <p className="fill-card-prompt">
        {fill.segments.map((segment, index) => {
          if (segment.kind === "text") return <span key={index}>{renderInline(segment.text)}</span>;
          const current = blankIndex++;
          const ok = checked && matches(values[current], segment.answer);
          const bad = checked && !ok;
          return (
            <input
              key={index}
              type="text"
              aria-label={`Fill in blank ${current + 1}`}
              className={`fill-card-blank${ok ? " is-correct" : ""}${bad ? " is-wrong" : ""}`}
              value={revealed ? segment.answer : values[current]}
              onChange={(event) => {
                const next = [...values];
                next[current] = event.target.value;
                setValues(next);
              }}
              size={Math.max(segment.answer.length + 2, 6)}
              autoComplete="off"
              spellCheck={false}
            />
          );
        })}
      </p>
      <div className="lesson-card-actions">
        <button
          type="button"
          className="lesson-card-btn primary"
          onClick={() => {
            if (!reportedRef.current) {
              reportedRef.current = true;
              onCheckpoint?.(allCorrect);
            }
            setRevealed(false);
            setChecked(true);
          }}
        >
          Check
        </button>
        <button
          type="button"
          className="lesson-card-btn"
          onClick={() => {
            if (!reportedRef.current) {
              reportedRef.current = true;
              onCheckpoint?.(false);
            }
            setChecked(true);
            setRevealed(true);
          }}
        >
          Reveal
        </button>
      </div>
      {checked ? (
        <div className="lesson-card-explain">
          <strong>{allCorrect ? "Correct." : "Not quite."}</strong> {fill.explanation ? renderInline(fill.explanation) : null}
        </div>
      ) : null}
    </div>
  );
}

function LessonRunnableCode({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const failed = Boolean(result && !["passed", "stopped"].includes(result.status));
  const stopped = result?.status === "stopped";
  const dirty = code !== initialCode;

  async function run() {
    if (abortRef.current) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setResult(null);
    try {
      setResult(await postJson<RunResult>("/scratchpad", {
        language: "python",
        code,
        timeoutMs: 3000
      }, { signal: controller.signal }));
    } catch (error) {
      setResult(isAbortError(error) ? stoppedResult() : {
        status: "runtime-error",
        stdout: "",
        stderr: "",
        durationMs: 0,
        tests: [],
        message: error instanceof Error ? error.message : String(error)
      });
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setRunning(false);
    }
  }

  return (
    <div className="runnable-code">
      <div className="runnable-code-editor">
        <BasicCodeEditor
          value={code}
          language="python"
          ariaLabel="Editable lesson code"
          onChange={setCode}
        />
      </div>
      <div className="runnable-code-bar">
        {running ? (
          <button type="button" className="runnable-run stop-button" onClick={() => abortRef.current?.abort()}>
            <SquareIcon />
            Stop
          </button>
        ) : (
          <button type="button" className="runnable-run" onClick={() => void run()}>
            <PlayIcon />
            Run
          </button>
        )}
        {dirty ? (
          <button
            type="button"
            className="runnable-reset"
            onClick={() => {
              setCode(initialCode);
              setResult(null);
            }}
          >
            <ResetIcon />
            Reset
          </button>
        ) : null}
        <span className="runnable-hint">Editable — change the inputs and run.</span>
        {result && !running ? <span className="runnable-time">{result.durationMs} ms</span> : null}
      </div>
      {result && !running ? (
        <div className={`runnable-output${failed ? " is-error" : ""}`}>
          {result.stdout ? <pre className="runnable-stream">{result.stdout.replace(/\n+$/, "")}</pre> : null}
          {result.stderr ? <pre className="runnable-stream is-error">{result.stderr.replace(/\n+$/, "")}</pre> : null}
          {failed && result.message ? <pre className="runnable-stream is-error">{result.message.replace(/\n+$/, "")}</pre> : null}
          {stopped ? <p className="runnable-empty">Run stopped before it finished.</p> : null}
          {!failed && !stopped && !result.stdout ? (
            <p className="runnable-empty">
              Ran cleanly with no output. Add a <code>print(...)</code> line to see a value.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function LessonStepsCard({ steps }: { steps: LessonStepsBlock }) {
  const [shown, setShown] = useState(1);
  const total = steps.rows.length;
  const done = shown >= total;
  return (
    <div className="lesson-card steps-card">
      <div className="lesson-card-head">
        <span className="lesson-card-tag">Trace it</span>
        <span className="steps-card-count">step {Math.min(shown, total)} of {total}</span>
      </div>
      {steps.intro.length ? (
        <div className="steps-card-intro">
          {steps.intro.map((line) => <p key={line}>{renderInline(line.replace(/^[-*]\s?/, ""))}</p>)}
        </div>
      ) : null}
      {steps.header.length ? (
        <div className="lesson-table-wrap">
          <table className="lesson-table">
            <thead>
              <tr>{steps.header.map((cell) => <th key={cell}>{renderInline(cell)}</th>)}</tr>
            </thead>
            <tbody>
              {steps.rows.slice(0, shown).map((row, rowIndex) => (
                <tr key={rowIndex} className={shown > 1 && rowIndex === shown - 1 ? "steps-row-new" : ""}>
                  {row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{renderInline(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {done ? (
        <p className="steps-card-done">Trace complete — every step is shown.</p>
      ) : (
        <div className="steps-card-foot">
          <span className="steps-card-hint">Predict the next row in your head, then reveal it.</span>
          <div className="steps-card-actions">
            <button className="lesson-card-btn primary" type="button" onClick={() => setShown((value) => Math.min(value + 1, total))}>
              Reveal next step
            </button>
            <button className="lesson-card-btn" type="button" onClick={() => setShown(total)}>
              Show all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function splitLessonTableRow(line: string): string[] {
  return line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function renderInline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={index}>{part.slice(1, -1)}</em>;
    return <span key={index}>{part}</span>;
  });
}

function InlineMarkdown({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}

function ShowSidebarButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="sidebar-show-toggle inline" aria-label="Show sidebar" title="Show sidebar" onClick={onClick}>
      <PanelOpenIcon />
    </button>
  );
}

function BookMarkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path d="M12 6.5C10.8 5.55 9.15 5 7.2 5H4v14h3.2c1.95 0 3.6.55 4.8 1.5V6.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 6.5C13.2 5.55 14.85 5 16.8 5H20v14h-3.2c-1.95 0-3.6.55-4.8 1.5V6.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function PanelCloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9 4v16" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m15 9-3 3 3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PanelOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9 4v16" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m12 9 3 3-3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.5l-1.8-5.9-5.7-1.8L10.2 9 12 3.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m18 3 0.8 2.2L21 6l-2.2 0.8L18 9l-0.8-2.2L15 6l2.2-0.8L18 3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M4 19.5V5a2 2 0 0 1 2-2h2v18H6a2 2 0 0 1-2-1.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8M12 7h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 3v6h6M8 13h8M8 17h8M8 9h2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FileQuestionIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 3v6h6M10 10.5a2 2 0 1 1 3.2 1.6c-.75.5-1.2.9-1.2 1.9M12 17h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TerminalSquareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m8 9 3 3-3 3M13 15h3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M12 4v10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m8 10 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 18h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M12 20V10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m8 14 4-4 4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 6h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M9 3h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 3v5l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 17l-5-9V3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 15h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m16.5 16.5 4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M5 12h.01M12 12h.01M19 12h.01" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M12 8.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M19.4 15a8.5 8.5 0 0 0 .1-1.2 8.5 8.5 0 0 0-.1-1.2l2-1.5-2-3.5-2.4 1a7.7 7.7 0 0 0-2-1.1L14.7 5h-5.4L9 7.5a7.7 7.7 0 0 0-2 1.1l-2.4-1-2 3.5 2 1.5a8.5 8.5 0 0 0-.1 1.2 8.5 8.5 0 0 0 .1 1.2l-2 1.5 2 3.5 2.4-1a7.7 7.7 0 0 0 2 1.1l.3 2.5h5.4l.3-2.5a7.7 7.7 0 0 0 2-1.1l2.4 1 2-3.5-2-1.5Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <path d="m12 3.5 2.65 5.35 5.9.86-4.27 4.16 1 5.87L12 16.96l-5.28 2.78 1-5.87L3.45 9.71l5.9-.86L12 3.5Z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function CoachIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <rect x="5" y="8" width="14" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 4v4M9 13h.01M15 13h.01M10 17h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FocusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FocusExitIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <path d="M9 4v6H3M3 10l7-7M15 20v-6h6M21 14l-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <path d="M7 4.5v15l12-7.5-12-7.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <path d="M8 5v14M16 5v14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <path d="M6 21V4M6 4h11l-1.8 4L17 12H6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <path d="M4 7v5h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.6 15A7 7 0 1 0 6 7.7L4 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KeyboardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">
      <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M7 9h.01M11 9h.01M15 9h.01M17 13h.01M13 13h.01M9 13h.01M7 17h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 12v5M9 21h6M8 17h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m8 12 2.5 2.5L16 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SquareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <path d="M9 18h6M10 22h4M8 14.5a6 6 0 1 1 8 0c-.75.62-1 1.25-1 2H9c0-.75-.25-1.38-1-2Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <path d="M10.7 5.2c.42-.08.85-.12 1.3-.12 6 0 9.5 6 9.5 6a17.8 17.8 0 0 1-3.12 3.78M14.12 14.2A3 3 0 0 1 9.8 9.88M5.64 7.13A17.9 17.9 0 0 0 2.5 11.08s3.5 6 9.5 6c1.72 0 3.24-.5 4.52-1.21M3 3l18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 10v6M12 7h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M12 3 2.5 20h19L12 3Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 9v5M12 17h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <circle cx="7.5" cy="14.5" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M10 12 21 1M15 7l3 3M18 4l3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
      <rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function OutputDock({
  activePanel,
  mobileVisible,
  busy,
  lastRunIncludedHidden,
  nextProblemId,
  dockHeight,
  noteText,
  recentRuns,
  activeProblemTimeMs,
  result,
  scratchpadCode,
  scratchpadBusy,
  scratchpadLanguage,
  scratchpadProblemId,
  scratchpadResult,
  scratchpadSupport,
  showHiddenDiagnostics,
  onNoteChange,
  onPanelChange,
  onScratchpadChange,
  onToggleHiddenDiagnostics,
  onDockPointerDown,
  onDockPointerMove,
  onDockPointerUp,
  onRunHidden,
  onNextProblem,
  onScratchpadRun,
  onStopScratchpad
}: {
  activePanel: OutputPanel;
  mobileVisible: boolean;
  busy: boolean;
  lastRunIncludedHidden: boolean;
  nextProblemId: string | undefined;
  dockHeight: number;
  noteText: string;
  recentRuns: Array<{ result: RunResult; at: string; includeHidden: boolean }>;
  activeProblemTimeMs: number;
  result: RunResult | null;
  scratchpadCode: string;
  scratchpadBusy: boolean;
  scratchpadLanguage: LanguageId;
  scratchpadProblemId: string;
  scratchpadResult: RunResult | null;
  scratchpadSupport: ProblemLanguageSupport | undefined;
  showHiddenDiagnostics: boolean;
  onNoteChange: (value: string) => void;
  onPanelChange: (panel: OutputPanel) => void;
  onScratchpadChange: (value: string) => void;
  onToggleHiddenDiagnostics: (value: boolean) => void;
  onDockPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onDockPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onDockPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onRunHidden: () => void;
  onNextProblem: () => void;
  onScratchpadRun: () => void;
  onStopScratchpad: () => void;
}) {
  const hasStdout = Boolean(result?.stdout.trim());
  const hasErrors = Boolean(result?.message || result?.stderr || result?.diagnostics?.length || result?.tests.some((test) => test.error || test.diagnostics?.length));
  const hasScratchpadOutput = Boolean(scratchpadResult?.stdout.trim() || scratchpadResult?.stderr.trim() || scratchpadResult?.message || scratchpadResult?.diagnostics?.length);
  return (
    <section className={`workspace-bottom mobile-pane ${mobileVisible ? "active" : ""}`} aria-label="Workspace output panels">
      <div className="desktop-workspace-tabs" role="tablist" aria-label="Workspace output panels">
        {outputPanels.map((panel) => (
          <button
            key={panel}
            type="button"
            role="tab"
            aria-selected={activePanel === panel}
            className={activePanel === panel ? "active" : ""}
            onClick={() => onPanelChange(panel)}
          >
            {panel}
            {panel === "stdout" && hasStdout ? <span className="tab-dot" /> : null}
            {panel === "errors" && hasErrors ? <span className="tab-dot error" /> : null}
            {panel === "scratchpad" && hasScratchpadOutput ? <span className={scratchpadResult?.status === "passed" ? "tab-dot" : "tab-dot error"} /> : null}
            {panel === "history" && recentRuns.length ? <span className="tab-dot" /> : null}
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
        onPointerDown={onDockPointerDown}
        onPointerMove={onDockPointerMove}
        onPointerUp={onDockPointerUp}
      />
      <>
        {activePanel === "results" ? (
          <ResultsPanel
            result={result}
            busy={busy}
            lastRunIncludedHidden={lastRunIncludedHidden}
            nextProblemId={nextProblemId}
            showHiddenDiagnostics={showHiddenDiagnostics}
            onToggleHiddenDiagnostics={onToggleHiddenDiagnostics}
            onRunHidden={onRunHidden}
            onNextProblem={onNextProblem}
          />
        ) : null}
        {activePanel === "stdout" ? (
          <section className="workspace-panel result-panel active">
            <h2>Stdout</h2>
            {hasStdout ? <pre>{result?.stdout}</pre> : <p className="muted">Nothing printed yet.</p>}
          </section>
        ) : null}
        {activePanel === "errors" ? (
          <ErrorsPanel result={result} />
        ) : null}
        {activePanel === "scratchpad" ? (
          <section className="workspace-panel result-panel scratchpad-panel active">
            <div className="scratchpad-header">
              <div>
                <h2>{languageName(scratchpadLanguage)} scratchpad</h2>
                <p className="muted">Run quick experiments without changing your submitted solution.</p>
              </div>
              {scratchpadBusy ? (
                <button type="button" className="secondary-button compact-button stop-button" onClick={onStopScratchpad}>
                  <SquareIcon />
                  Stop
                </button>
              ) : (
                <button type="button" className="secondary-button compact-button" onClick={onScratchpadRun}>
                  <PlayIcon />
                  Run scratchpad
                </button>
              )}
            </div>
            <div className="scratchpad-editor">
              <CodeEditor
                value={scratchpadCode}
                language={scratchpadLanguage}
                problemId={scratchpadProblemId}
                support={scratchpadSupport}
                onChange={onScratchpadChange}
                onRun={() => onScratchpadRun()}
              />
            </div>
            <ScratchpadOutput result={scratchpadResult} busy={scratchpadBusy} />
          </section>
        ) : null}
        {activePanel === "notes" ? (
          <section className="workspace-panel result-panel active">
            <h2>Notes</h2>
            <textarea value={noteText} onChange={(event) => onNoteChange(event.target.value)} rows={8} />
          </section>
        ) : null}
        {activePanel === "history" ? (
          <section className="workspace-panel result-panel active">
            <h2>Run history</h2>
            {activeProblemTimeMs ? (
              <p className="muted">Active time on this problem: {formatActiveTime(activeProblemTimeMs)}.</p>
            ) : null}
            {!recentRuns.length ? <p className="muted">No runs yet. Visible and submitted runs appear here.</p> : null}
            <div className="history-list">
              {recentRuns.map((run, index) => {
                const tests = run.result.tests;
                const passed = tests.filter((test) => test.passed).length;
                const hidden = tests.filter((test) => test.visibility === "hidden").length;
                const passedRun = run.result.status === "passed";
                return (
                  <article key={`${run.at}-${index}`} className={`history-item ${passedRun ? "passed" : "failed"}`}>
                    <div>
                      <strong>{passedRun ? "Passed" : historyStatusLabel(run.result.status)}</strong>
                      <span>{formatProblemHistoryTime(run.at)}</span>
                    </div>
                    <p>
                      {passed}/{tests.length || 0} tests passed
                      {hidden ? `, ${hidden} hidden included` : ", visible only"}
                      {run.result.durationMs ? `, ${formatProblemRunDuration(run.result.durationMs)}` : ""}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </>
    </section>
  );
}

function ScratchpadOutput({ result, busy }: { result: RunResult | null; busy: boolean }) {
  const hasOutput = Boolean(result?.stdout.trim() || result?.stderr.trim() || result?.message || result?.diagnostics?.length);
  return (
    <div className="scratchpad-output" aria-live="polite">
      <h3>Output</h3>
      {busy ? <p className="muted">Running scratchpad...</p> : null}
      {!busy && !result ? <p className="muted">No scratchpad run yet.</p> : null}
      {!busy && result ? (
        <p className={`run-status ${result.status}`}>
          {statusLabel(result.status)}
          {result.durationMs ? ` · ${result.durationMs} ms` : ""}
        </p>
      ) : null}
      {result?.stdout ? <pre>{result.stdout}</pre> : null}
      {result?.diagnostics?.length ? <DiagnosticList diagnostics={result.diagnostics} compact /> : null}
      {result?.stderr ? <pre className="error-output">{result.stderr}</pre> : null}
      {result?.message ? <pre className="error-output">{result.message}</pre> : null}
      {!busy && result?.status === "passed" && !hasOutput ? <p className="muted">Ran successfully with no printed output.</p> : null}
    </div>
  );
}

function ErrorsPanel({ result, isExam = false }: { result: RunResult | null; isExam?: boolean }) {
  const diagnostics = result?.diagnostics ?? [];
  const testErrors = result?.tests.filter((test) => test.error) ?? [];
  const testDiagnostics = testErrors.flatMap((test) => test.diagnostics ?? []);
  const rawText = uniqueErrorBlocks(result?.message, result?.stderr).join("\n\n");
  const hasStructuredDiagnostics = diagnostics.length > 0 || testDiagnostics.length > 0;
  const hasErrors = Boolean(rawText || diagnostics.length || testErrors.length);

  return (
    <section className="workspace-panel result-panel active">
      <h2>Errors</h2>
      {diagnostics.length ? <DiagnosticList diagnostics={diagnostics} /> : null}
      {testErrors.length ? (
        <div className="per-test-errors">
          {testErrors.map((test) => (
            <article key={test.name} className={test.passed ? "test-pass" : "test-fail"}>
              <strong>{test.visibility === "hidden" && isExam ? "Hidden test" : test.name}</strong>
              {test.visibility === "hidden" && isExam ? (
                <p className="muted">Diagnostics hidden during the timed exam.</p>
              ) : (
                <>
                  {test.error ? <pre className="error-output stack-trace">{trimErrorText(test.error)}</pre> : null}
                  {test.diagnostics?.length ? <DiagnosticList diagnostics={test.diagnostics} compact /> : null}
                </>
              )}
            </article>
          ))}
        </div>
      ) : null}
      {rawText ? (
        hasStructuredDiagnostics ? (
          <details className="raw-error-output">
            <summary>Raw output</summary>
            <pre className="error-output stack-trace">{rawText}</pre>
          </details>
        ) : (
          <pre className="error-output stack-trace">{rawText}</pre>
        )
      ) : null}
      {!hasErrors ? <p className="muted">No runtime or syntax errors.</p> : null}
    </section>
  );
}

function DiagnosticList({ diagnostics, compact = false }: { diagnostics: RunDiagnostic[]; compact?: boolean }) {
  return (
    <div className={`diagnostic-list${compact ? " compact" : ""}`}>
      {diagnostics.map((diagnostic, index) => (
        <article className={`diagnostic-card severity-${diagnostic.severity}`} key={`${diagnostic.file ?? "diagnostic"}:${diagnostic.line ?? index}:${diagnostic.message}`}>
          <div className="diagnostic-header">
            <strong>{diagnostic.message}</strong>
            <span>{diagnosticLocation(diagnostic)}</span>
          </div>
          {diagnostic.snippet?.length ? (
            <details className="diagnostic-snippet-details">
              <summary>Source excerpt</summary>
              <DiagnosticSnippet diagnostic={diagnostic} />
            </details>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function uniqueErrorBlocks(...values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const blocks: string[] = [];
  for (const value of values) {
    const trimmed = trimErrorText(value);
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    blocks.push(trimmed);
  }
  return blocks;
}

function trimErrorText(value: string | undefined): string {
  return (value ?? "").replace(/\s+$/g, "");
}

function DiagnosticSnippet({ diagnostic }: { diagnostic: RunDiagnostic }) {
  return (
    <pre className="diagnostic-snippet">
      {diagnostic.snippet?.map((line) => (
        <span className="diagnostic-snippet-row" key={line.line}>
          <span className="diagnostic-line-number">{line.line}</span>
          <span className="diagnostic-line-text">{line.text || " "}</span>
          {line.markerStart ? (
            <span className="diagnostic-marker">
              {" ".repeat(Math.max(0, line.markerStart - 1))}
              {"^".repeat(Math.max(1, line.markerLength ?? 1))}
            </span>
          ) : null}
        </span>
      ))}
    </pre>
  );
}

function diagnosticLocation(diagnostic: RunDiagnostic): string {
  const source = diagnostic.source ? `${diagnostic.source} · ` : "";
  const file = diagnostic.file ?? "source";
  if (!diagnostic.line) return `${source}${file}`;
  return `${source}${file}:${diagnostic.line}${diagnostic.column ? `:${diagnostic.column}` : ""}${diagnostic.code ? ` · ${diagnostic.code}` : ""}`;
}

function ResultsPanel({
  result,
  busy,
  lastRunIncludedHidden,
  nextProblemId,
  showHiddenDiagnostics,
  onToggleHiddenDiagnostics,
  onRunHidden,
  onNextProblem
}: {
  result: RunResult | null;
  busy: boolean;
  lastRunIncludedHidden: boolean;
  nextProblemId: string | undefined;
  showHiddenDiagnostics: boolean;
  onToggleHiddenDiagnostics: (value: boolean) => void;
  onRunHidden: () => void;
  onNextProblem: () => void;
}) {
  if (busy) {
    return (
      <section className="workspace-panel result-panel active">
        <h2>Results</h2>
        <p className="muted">Running locally...</p>
      </section>
    );
  }
  if (!result) {
    return (
      <section className="workspace-panel result-panel active">
        <h2>Results</h2>
        <p className="muted">No run results yet.</p>
      </section>
    );
  }
  const visible = result.tests.filter((test) => test.visibility === "visible");
  const hidden = result.tests.filter((test) => test.visibility === "hidden");
  const hiddenPassed = hidden.filter((test) => test.passed).length;
  const hasErrors = Boolean(result.message || result.stderr);
  return (
    <section className={`workspace-panel result-panel active status-${result.status}`}>
      <h2>Results</h2>
      {result.status === "passed" ? (
        <div className="completion-banner">
          <span className="completion-mark" aria-hidden="true">✓</span>
          <div>
            <strong>{lastRunIncludedHidden ? "All tests passed" : "Visible tests passed"}</strong>
            <p>
              {lastRunIncludedHidden
                ? "Progress is ready to save. Keep momentum with the next problem."
                : "Submit hidden tests when the visible behavior looks solid."}
            </p>
          </div>
          <div className="completion-actions">
            {!lastRunIncludedHidden ? (
              <button className="primary-button compact-button" type="button" onClick={onRunHidden}>
                Submit hidden tests
              </button>
            ) : nextProblemId ? (
              <button className="primary-button compact-button" type="button" onClick={onNextProblem}>
                Next problem
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      {hidden.length ? <p className="muted">{hiddenPassed}/{hidden.length} hidden tests passed</p> : null}
      {result.status === "stopped" ? <p className="muted">Run stopped before it finished.</p> : null}
      {hasErrors ? <p className="muted desktop-errors-hint">Errors are available in the Errors tab.</p> : null}
      {result.stdout.trim() ? (
        <details className="stdout-preview" open>
          <summary>
            Printed output ({result.stdout.trim().split("\n").length} {result.stdout.trim().split("\n").length === 1 ? "line" : "lines"})
          </summary>
          <pre>{result.stdout}</pre>
        </details>
      ) : null}
      <TestResultsList
        visible={visible}
        hidden={hidden}
        showHiddenDiagnostics={showHiddenDiagnostics}
        onToggleHiddenDiagnostics={onToggleHiddenDiagnostics}
      />
    </section>
  );
}

function TestResultsList({
  visible,
  hidden,
  showHiddenDiagnostics,
  onToggleHiddenDiagnostics,
  lockHidden = false
}: {
  visible: RunResult["tests"];
  hidden: RunResult["tests"];
  showHiddenDiagnostics: boolean;
  onToggleHiddenDiagnostics: (value: boolean) => void;
  lockHidden?: boolean;
}) {
  if (!visible.length && !hidden.length) return <p className="muted">No run results yet.</p>;
  const failedVisibleCount = visible.filter((test) => !test.passed).length;
  const passedVisibleCount = visible.filter((test) => test.passed).length;
  const failedHiddenCount = hidden.filter((test) => !test.passed).length;
  const failedHidden = hidden.filter((test) => !test.passed);
  const hiddenResults = showHiddenDiagnostics && !lockHidden ? failedHidden : hidden;
  return (
    <div className="result-groups">
      <div className="result-group-header">
        <h3>Visible Tests</h3>
        <span>{failedVisibleCount ? `${failedVisibleCount} failing` : `${passedVisibleCount}/${visible.length} passing`}</span>
      </div>
      <ResultGroup tests={visible} reveal />
      {hidden.length ? (
        <section className="result-group">
          <div className="result-group-header">
            <h3>Hidden Tests</h3>
            <span>{failedHiddenCount ? `${failedHiddenCount} failing` : "All passing"}</span>
          </div>
          {!lockHidden ? (
            <button
              className="secondary-button hidden-diagnostics-toggle"
              type="button"
              onClick={() => onToggleHiddenDiagnostics(!showHiddenDiagnostics)}
              disabled={!failedHiddenCount}
            >
              {showHiddenDiagnostics ? <EyeOffIcon /> : <EyeIcon />}
              {showHiddenDiagnostics ? "Hide hidden failing cases" : "Show hidden failing cases"}
            </button>
          ) : null}
          {showHiddenDiagnostics && failedHiddenCount ? (
            <p className="muted hidden-diagnostics-note">
              Showing the {failedHiddenCount} hidden case{failedHiddenCount === 1 ? "" : "s"} that failed on submit.
            </p>
          ) : null}
          <ResultGroup tests={hiddenResults} reveal={!lockHidden && showHiddenDiagnostics} hidden locked={lockHidden} />
        </section>
      ) : null}
    </div>
  );
}

function ResultGroup({ tests, reveal, hidden = false, locked = false }: { tests: RunResult["tests"]; reveal: boolean; hidden?: boolean; locked?: boolean }) {
  if (!tests.length) return null;
  return (
    <section className="result-group">
      <div className="test-results">
        {tests.map((test) => (
          <article className={test.passed ? "test-pass" : "test-fail"} key={`${test.name}-${hidden ? "hidden" : "visible"}`}>
            <strong>{test.passed ? "Pass" : "Fail"}: {hidden && !reveal ? "Hidden" : test.name}</strong>
            {reveal ? (
              <div className="result-diff">
                <div>
                  <span>Args</span>
                  <code>{JSON.stringify(test.args, null, 2)}</code>
                </div>
                <div>
                  <span>Expected</span>
                  <code>{JSON.stringify(test.expected, null, 2)}</code>
                </div>
                <div>
                  <span>Actual</span>
                  <code>{JSON.stringify(test.actual, null, 2)}</code>
                </div>
                {test.error ? (
                  <div className="result-error-detail">
                    <span>Error</span>
                    {test.diagnostics?.length ? <DiagnosticList diagnostics={test.diagnostics} compact /> : <code>{test.error}</code>}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="muted">
                {hidden
                  ? locked
                    ? "Diagnostics hidden during the timed exam."
                    : test.passed
                      ? "Passed hidden case."
                      : "Use the toggle above to reveal failing hidden cases after submit."
                  : "Diagnostics hidden."}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function renderExample(signature: FunctionSignature | undefined, test: ProblemTest): string {
  const names = signature?.inputs.map((input) => input.name) ?? [];
  const args = test.args.map((arg, index) => `${names[index] ?? `arg${index + 1}`} = ${formatExampleValue(arg, 60)}`);
  return [`# ${test.name}`, ...args, `returns ${formatExampleValue(test.expected, 60)}`].join("\n");
}

function renderAssessmentExample(signature: FunctionSignature | undefined, test: ProblemTest): string {
  const names = signature?.inputs.map((input) => input.name) ?? [];
  const args = test.args.map((arg, index) => `${names[index] ?? `arg${index + 1}`} = ${formatExampleValue(arg, 70)}`);
  return [`# ${test.name}`, ...args, `returns ${formatExampleValue(test.expected, 70)}`].join("\n");
}

function problemConstraints(_problem: Problem, _part: ProblemPart | undefined, _signature: FunctionSignature | undefined): string[] {
  return [
    "Handle empty inputs when the prompt permits them.",
    "Return the exact type shown in the examples.",
    "Keep the stated asymptotic complexity."
  ];
}

function formatExampleValue(value: unknown, multilineThreshold: number): string {
  const compact = JSON.stringify(value);
  if (compact === undefined) return "undefined";
  if (compact.length <= multilineThreshold) return compact;
  return JSON.stringify(value, null, 2) ?? String(value);
}

function problemHints(problem: Problem, part: ProblemPart | undefined): string[] {
  const legacy = legacyFindProblem(problem.id);
  const legacyPart = part ? legacy?.parts?.find((candidate) => candidate.id === part.id) : undefined;
  if (legacyPart?.hints.length) return legacyPart.hints;
  if (legacy?.hints.length) return legacy.hints;
  const signature = part?.signature ?? problem.signature;
  const firstInput = signature.inputs[0]?.name ?? "the input";
  return [
    `Start by naming the state you need while scanning ${firstInput}.`,
    `Work through the first visible example by hand before changing the code.`,
    `Keep the return shape exactly aligned with the signature: ${signature.name}.`
  ];
}

function problemSolutionDetails(problem: Problem, part: ProblemPart | undefined) {
  const legacy = legacyFindProblem(problem.id);
  const legacyPart = part ? legacy?.parts?.find((candidate) => candidate.id === part.id) : undefined;
  return {
    solution: legacyPart?.solution ?? legacy?.solution,
    walkthrough: legacyPart?.walkthrough ?? legacy?.walkthrough,
    complexity: legacyPart?.complexity ?? legacy?.complexity,
    followUps: part ? undefined : legacy?.followUps
  };
}

function legacyReferenceSource(problemId: string, partId: string): string | undefined {
  const legacy = legacyFindProblem(problemId);
  if (!legacy) return undefined;
  if (partId) {
    return legacy.parts?.find((part) => part.id === partId)?.solutionCode;
  }
  return legacy.solutionCode;
}

function isGeneratedPythonStarter(source: string, language: LanguageId): boolean {
  return language === "python" && /^def\s+\w+\s*\([^)]*\)\s*(?:->\s*[^:]+)?\s*:\s*\n\s+raise\s+NotImplementedError\s*$/m.test(source.trim());
}

function searchSidebar(graph: ContentGraph, query: string): SidebarSearchHit[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  const assessmentIds = new Set(assessmentProblemsForGraph(graph).map((problem) => problem.id));
  const graphProblemIds = new Set(graph.problems.map((problem) => problem.id));
  const lessons = legacyCourse.lessons
    .filter((lesson) => `${lesson.title} ${lesson.concepts.join(" ")}`.toLowerCase().includes(normalized))
    .slice(0, 4)
    .map((lesson) => ({ kind: "lesson" as const, id: lesson.id, title: lesson.title }));
  const legacyProblems = [
    ...legacyCourse.problems,
    ...legacyCourse.problemSets.flatMap((set) => set.problems)
  ];
  const seenProblems = new Set<string>();
  const problems = legacyProblems
    .filter((problem) => {
      if (seenProblems.has(problem.id) || !graphProblemIds.has(problem.id) || assessmentIds.has(problem.id)) return false;
      seenProblems.add(problem.id);
      return `${problem.title} ${problem.patterns.join(" ")}`.toLowerCase().includes(normalized);
    })
    .slice(0, 6)
    .map((problem) => ({ kind: "problem" as const, id: problem.id, title: problem.title }));
  const assessments = assessmentProblemsForGraph(graph)
    .filter((problem) => `${problem.title} ${problem.concepts.join(" ")} ${assessmentArchetype(problem)}`.toLowerCase().includes(normalized))
    .slice(0, 3)
    .map((problem) => ({ kind: "assessment" as const, id: problem.id, title: problem.title }));
  return [...lessons, ...problems, ...assessments];
}

function containerForProblemView(graph: ContentGraph, problemId: string, view: AppView): ContentContainer | undefined {
  if (view.kind === "problem" && view.origin) {
    const origin = containerForScope(graph, view.origin);
    if (origin && problemIdsForContainer(graph, origin).includes(problemId)) return origin;
  }
  return containerForProblem(graph, problemId);
}

function containerForScope(graph: ContentGraph, scope: ProblemOrigin): ContentContainer | undefined {
  if (scope.kind === "module") {
    const module = graph.modules.find((candidate) => candidate.id === scope.id);
    return module ? { kind: "module", id: module.id, title: module.title } : undefined;
  }
  const set = graph.problemSets.find((candidate) => candidate.id === scope.id);
  return set ? { kind: "problem-set", id: set.id, title: set.title } : undefined;
}

function containerForProblem(graph: ContentGraph, problemId: string): ContentContainer | undefined {
  const module = graph.modules.find((candidate) => candidate.sequence.some((entry) => entry.kind === "problem" && entry.id === problemId));
  if (module) return { kind: "module", id: module.id, title: module.title };
  const set = graph.problemSets.find((candidate) => candidate.entries.some((entry) => entry.problem === problemId));
  return set ? { kind: "problem-set", id: set.id, title: set.title } : undefined;
}

function problemIdsForContainer(graph: ContentGraph, container: ContentContainer | undefined): string[] {
  if (!container) return graph.problems.map((problem) => problem.id);
  if (container.kind === "module") {
    return graph.modules
      .find((module) => module.id === container.id)
      ?.sequence.filter((entry) => entry.kind === "problem")
      .map((entry) => entry.id) ?? [];
  }
  return graph.problemSets.find((set) => set.id === container.id)?.entries.map((entry) => entry.problem) ?? [];
}

function collectionForScope(graph: ContentGraph, scope: Extract<SidebarScope, { kind: "module" | "problem-set" }>): CollectionViewModel | undefined {
  if (scope.kind === "module") {
    const module = graph.modules.find((candidate) => candidate.id === scope.id);
    if (!module) return undefined;
    const meta = legacyModuleMeta(module.id);
    const problemIds = module.sequence.filter((entry) => entry.kind === "problem").map((entry) => entry.id);
    return {
      kind: "module",
      id: module.id,
      title: meta?.title ?? module.title,
      summary: meta?.summary ?? module.summary,
      eyebrow: `Module ${String(legacyOrderedModules(graph).findIndex((candidate) => candidate.id === module.id) + 1).padStart(2, "0")}`,
      sideTitle: "How to use this module",
      sideBody: "Work the guided problems in order first, then use the bonus drills for additional repetitions on the same concepts.",
      problems: problemIds.map((id) => graph.problems.find((problem) => problem.id === id)).filter((problem): problem is Problem => Boolean(problem))
    };
  }
  const set = graph.problemSets.find((candidate) => candidate.id === scope.id);
  if (!set) return undefined;
  const problems = set.entries
    .map((entry) => graph.problems.find((problem) => problem.id === entry.problem))
    .filter((problem): problem is Problem => Boolean(problem));
  const isAssessment = set.id === "assessments";
  const isLibrary = set.id.startsWith("lib-");
  return {
    kind: "problem-set",
    id: set.id,
    title: set.title,
    summary: set.summary,
    eyebrow: isAssessment ? "Assessment set" : isLibrary ? "Library" : "Problem set",
    sideTitle: isAssessment ? "Practice mode" : "How to use this set",
    sideBody: isAssessment
      ? "Pick an assessment to review the rules, choose timed exam or untimed practice, and work through the four progressive levels."
      : "Use these as focused practice outside the core module sequence. Run visible tests as you iterate, then submit all tests for hidden cases.",
    problems,
    entries: set.entries
  };
}

function collectionGroups(collection: CollectionViewModel): Array<{ id: string; label: string; blurb?: string; problems: Problem[] }> {
  if (collection.kind === "module") {
    const guided = collection.problems.filter((problem) => !problem.id.includes("-bonus-"));
    const bonus = collection.problems.filter((problem) => problem.id.includes("-bonus-"));
    return [
      guided.length ? { id: "guided", label: "Guided Problems", problems: guided } : undefined,
      bonus.length ? { id: "bonus", label: "Bonus Problems", problems: bonus } : undefined
    ].filter((group): group is { id: string; label: string; problems: Problem[] } => Boolean(group));
  }
  const entries = collection.entries ?? [];
  const categoryOrder = Array.from(new Set(entries.map((entry) => entry.category ?? "problems")));
  if (categoryOrder.length <= 1) return [{ id: "all", label: "Problems", problems: collection.problems }];
  return categoryOrder.map((category) => {
    const ids = new Set(entries.filter((entry) => (entry.category ?? "problems") === category).map((entry) => entry.problem));
    const meta = problemSetCategoryMeta(category);
    return {
      id: category,
      label: meta.label,
      blurb: meta.blurb,
      problems: collection.problems.filter((problem) => ids.has(problem.id))
    };
  }).filter((group) => group.problems.length);
}

function problemSetCategoryMeta(category: string): { label: string; blurb?: string } {
  const known: Record<string, { label: string; blurb: string }> = {
    streams: { label: "Stream & event processing", blurb: "Fold state over a sequence of events" },
    parsing: { label: "Parsing & evaluation", blurb: "State machines, tokenizers, evaluators" },
    intervals: { label: "Intervals & scheduling", blurb: "Overlap, sweep, resource counting" },
    aggregation: { label: "Grouping, joins & aggregation", blurb: "Group-by, joins, rollups, ranking" },
    recursion: { label: "Recursion over nested data", blurb: "Walk and rebuild tree-shaped data" },
    "system-design": { label: "Small-system design", blurb: "Model state from a command stream" },
    dependencies: { label: "Dependency & ordering", blurb: "Topological order, cycle detection" },
    grid: { label: "Grid & matrix", blurb: "2D traversal and region operations" }
  };
  return known[category] ?? { label: titleCase(category) };
}

function assessmentProblemsForGraph(graph: ContentGraph): Problem[] {
  const set = graph.problemSets.find((candidate) => candidate.id === "assessments");
  if (!set) return [];
  return set.entries
    .map((entry) => graph.problems.find((problem) => problem.id === entry.problem))
    .filter((problem): problem is Problem => Boolean(problem));
}

function assessmentBlurb(problem: Problem): string {
  if (problem.id === "asm-filesystem") return "An in-memory file store that grows from basic CRUD to search, quotas, and compression.";
  if (problem.id === "asm-banking") return "An accounts ledger that grows from CRUD to spender ranking, scheduled payments, and account merges.";
  if (problem.id === "asm-in-memory-db") return "A two-level key-field store that grows from CRUD to scans, TTL, and time-aware snapshots.";
  return problem.prompt.split("\n")[0] ?? problem.title;
}

function assessmentArchetype(problem: Problem): string {
  if (problem.id === "asm-filesystem") return "File system";
  if (problem.id === "asm-banking") return "Banking / ledger";
  if (problem.id === "asm-in-memory-db") return "In-memory DB";
  return titleCase(problem.concepts[0] ?? "assessment");
}

function assessmentIntro(problem: Problem): string {
  return `${assessmentBlurb(problem)} Each level extends the same entrypoint, so read the whole assessment first and build state that can survive the later operations.`;
}

function assessmentRulesIntro(problem: Problem): string {
  if (problem.id === "asm-filesystem") {
    return "A four-level evolving problem: a simple file store that gains search, then multi-user quotas with eviction, then compression. Your code carries forward — each level extends the same solution(queries) function. Read all four levels before you start so your Level 1 data model survives to Level 4.";
  }
  if (problem.id === "asm-banking") {
    return "A four-level evolving ledger: integer-cent balances and transfers, then top-N spender tracking, then scheduled payments that fire on a timeline, then account merges that consolidate balance, history, and pending payments. Every query carries a timestamp from Level 1, even when it isn't used yet — design for it. Read all four levels before you code so your Level 1 state can survive to Level 4.";
  }
  if (problem.id === "asm-in-memory-db") {
    return "A four-level evolving database: nested-key CRUD, then sorted field scans, then per-field TTL, then time-aware backups and restores that respect absolute expirations. Every query carries a timestamp from Level 1, even when it isn't used yet. Design your Level 1 state so Level 3's TTL and Level 4's snapshots slot in cleanly — read all four levels before you start.";
  }
  return assessmentIntro(problem);
}

const ASSESSMENT_LEVEL_POINTS = [60, 90, 120, 130] as const;
const ASSESSMENT_RECOMMENDED_MINUTES = [12, 20, 30, 28] as const;

interface AssessmentLevelSummary {
  level: number;
  title: string;
  maxPoints: number;
  recommendedMinutes: number;
  visibleTests: number;
  hiddenTests: number;
  totalTests: number;
}

function assessmentLevelsForProblem(problem: Problem): AssessmentLevelSummary[] {
  const sources: Array<{ title: string; tests: ProblemTest[] }> = [
    { title: problem.title, tests: problem.tests },
    ...(problem.parts ?? []).map((part) => ({ title: part.title.replace(/^Level \d+:\s*/i, ""), tests: part.tests }))
  ];
  return sources.slice(0, 4).map((source, index) => {
    const visibleTests = source.tests.filter((test) => test.visibility === "visible").length;
    const hiddenTests = source.tests.filter((test) => test.visibility === "hidden").length;
    return {
      level: index + 1,
      title: source.title,
      maxPoints: ASSESSMENT_LEVEL_POINTS[index] ?? 100,
      recommendedMinutes: ASSESSMENT_RECOMMENDED_MINUTES[index] ?? 20,
      visibleTests,
      hiddenTests,
      totalTests: source.tests.length
    };
  });
}

interface AssessmentRunSummary {
  workspaceId: string;
  language: LanguageId;
  passed: boolean;
  passedCount: number;
  totalCount: number;
  createdAt: string;
}

function assessmentRuns(userData: NextUserData | null, problemId: string): AssessmentRunSummary[] {
  return (userData?.attempts ?? [])
    .filter((attempt) => attempt.workspaceId === problemId || attempt.workspaceId.startsWith(`${problemId}:`))
    .map((attempt) => {
      const tests = runResultTests(attempt.result);
      return {
        workspaceId: attempt.workspaceId,
        language: attempt.language,
        passed: attempt.passed,
        passedCount: tests.filter((test) => test.passed).length,
        totalCount: tests.length,
        createdAt: attempt.createdAt
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function runResultTests(result: RunResult | unknown): RunResult["tests"] {
  if (!result || typeof result !== "object" || !Array.isArray((result as RunResult).tests)) return [];
  return (result as RunResult).tests;
}

function assessmentPart(problem: Problem, level: number): ProblemPart | undefined {
  if (level <= 1) return undefined;
  return problem.parts?.[level - 2];
}

function assessmentPartId(problem: Problem, level: number): string | undefined {
  return assessmentPart(problem, level)?.id;
}

function assessmentLanguage(problem: Problem, selectedLanguage: LanguageId): LanguageId {
  if (problem.languages[selectedLanguage]) return selectedLanguage;
  return Object.keys(problem.languages)[0] ?? selectedLanguage;
}

function assessmentSessionFor(userData: NextUserData | null, assessmentId: string): AssessmentSessionState | undefined {
  const value = userData?.assessmentState.find((record) => record.assessmentId === assessmentId && record.kind === "session")?.value;
  if (!value || typeof value !== "object") return undefined;
  const session = value as AssessmentSessionState;
  return session.assessmentId === assessmentId && session.status ? session : undefined;
}

function repairAssessmentSessionBuffers(
  session: AssessmentSessionState | undefined,
  userData: NextUserData | null,
  problem: Problem,
  language: LanguageId
): AssessmentSessionState | undefined {
  if (!session) return undefined;
  const buffers = { ...(session.buffers ?? {}) };
  let changed = false;
  for (const level of assessmentLevelsForProblem(problem)) {
    if (typeof buffers[level.level] === "string") continue;
    const attempt = latestAssessmentAttemptForLevel(userData, problem, level.level, language);
    if (!attempt?.code) continue;
    buffers[level.level] = attempt.code;
    changed = true;
  }
  return changed ? { ...session, buffers } : session;
}

function assessmentScorecardFor(userData: NextUserData | null, assessmentId: string): AssessmentScorecard | undefined {
  const value = userData?.assessmentState.find((record) => record.assessmentId === assessmentId && record.kind === "scorecard")?.value;
  if (!value || typeof value !== "object") return undefined;
  const card = value as AssessmentScorecard;
  return card.assessmentId === assessmentId && typeof card.totalScore === "number" ? card : undefined;
}

function assessmentScorecardHistory(userData: NextUserData | null, assessmentId: string): AssessmentScorecard[] {
  const value = userData?.assessmentState.find((record) => record.assessmentId === assessmentId && record.kind === "scorecard-history")?.value;
  return Array.isArray(value) ? value.filter((card): card is AssessmentScorecard => Boolean(card && typeof card === "object" && typeof (card as AssessmentScorecard).totalScore === "number")) : [];
}

function assessmentEventsFor(userData: NextUserData | null, assessmentId: string, sessionId?: string): AssessmentEventRecord[] {
  const value = userData?.assessmentState.find((record) => record.assessmentId === assessmentId && record.kind === "event-log")?.value;
  if (!Array.isArray(value)) return [];
  return value
    .filter(isAssessmentEventRecord)
    .filter((event) => !sessionId || event.sessionId === sessionId)
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
}

function isAssessmentEventRecord(value: unknown): value is AssessmentEventRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as AssessmentEventRecord;
  return typeof record.id === "string" &&
    typeof record.assessmentId === "string" &&
    typeof record.sessionId === "string" &&
    typeof record.type === "string" &&
    typeof record.occurredAt === "string";
}

function createAssessmentSessionId(assessmentId: string, startedAt: string): string {
  const suffix = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${assessmentId}:${new Date(startedAt).getTime()}:${suffix}`;
}

function assessmentSessionId(session: AssessmentSessionState, assessmentId: string): string {
  return session.sessionId ?? `${assessmentId}:${new Date(session.startedAt).getTime() || session.startedAt}`;
}

function assessmentCodeKey(problemId: string, sessionId: string | undefined, language: LanguageId, level: number): string {
  return [problemId, sessionId ?? "", language, String(level)].join("\u0000");
}

function assessmentEventId(type: AssessmentEventType, occurredAt: string): string {
  const suffix = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${new Date(occurredAt).getTime()}:${type}:${suffix}`;
}

function rollupAssessmentActiveTime(session: AssessmentSessionState, level: number, atIso: string): AssessmentSessionState {
  if (session.status !== "in-progress" || session.pausedAt || session.reviewMode) return session;
  const start = new Date(session.activeSince ?? session.startedAt).getTime();
  const end = new Date(atIso).getTime();
  const delta = Number.isFinite(start) && Number.isFinite(end) ? Math.max(0, end - start) : 0;
  if (delta <= 0) return { ...session, activeSince: atIso };
  const previous = session.timeByLevelMs?.[level] ?? 0;
  return {
    ...session,
    activeSince: atIso,
    timeByLevelMs: {
      ...(session.timeByLevelMs ?? {}),
      [level]: previous + delta
    }
  };
}

function assessmentLevelTimeMs(scorecard: AssessmentScorecard, level: number): number {
  const row = scorecard.perLevel.find((candidate) => candidate.level === level);
  return Math.max(0, row?.timeMs ?? scorecard.levelTimeMs?.[level] ?? 0);
}

function shiftIso(iso: string, ms: number): string {
  return new Date(new Date(iso).getTime() + ms).toISOString();
}

function mergeAssessmentRun(
  session: AssessmentSessionState,
  problem: Problem,
  level: number,
  code: string,
  result: RunResult,
  includeHidden: boolean
): AssessmentSessionState {
  const tests = assessmentPart(problem, level)?.tests ?? problem.tests;
  const meta = assessmentLevelsForProblem(problem)[level - 1];
  const visibleTotal = tests.filter((test) => test.visibility === "visible").length;
  const hiddenTotal = tests.filter((test) => test.visibility === "hidden").length;
  const visiblePassed = result.tests.filter((test) => test.visibility === "visible" && test.passed).length;
  const hiddenPassed = includeHidden ? result.tests.filter((test) => test.visibility === "hidden" && test.passed).length : 0;
  const previous = session.levelResults[level];
  const fresh: AssessmentLevelResult = {
    level,
    visiblePassed,
    visibleTotal,
    hiddenPassed,
    hiddenTotal,
    attempts: 1,
    points: 0,
    lastRunAt: new Date().toISOString()
  };
  const merged = mergeAssessmentBest(previous, fresh, meta?.maxPoints ?? 100);
  return {
    ...session,
    activeLevel: level,
    buffers: { ...session.buffers, [level]: code },
    unlockedLevel: Math.min(4, Math.max(session.unlockedLevel, level + 1)),
    levelResults: {
      ...session.levelResults,
      [level]: {
        ...merged,
        attempts: (previous?.attempts ?? 0) + 1,
        lastRunAt: fresh.lastRunAt
      }
    }
  };
}

function mergeAssessmentBest(previous: AssessmentLevelResult | undefined, fresh: AssessmentLevelResult, maxPoints: number): AssessmentLevelResult {
  if (!previous) return { ...fresh, points: assessmentLevelPoints(fresh, maxPoints) };
  const previousPassed = previous.visiblePassed + previous.hiddenPassed;
  const freshPassed = fresh.visiblePassed + fresh.hiddenPassed;
  const best = freshPassed >= previousPassed ? fresh : previous;
  return {
    ...best,
    points: assessmentLevelPoints(best, maxPoints)
  };
}

function assessmentLevelPoints(result: AssessmentLevelResult, maxPoints: number): number {
  const total = result.visibleTotal + result.hiddenTotal;
  if (total <= 0) return 0;
  return Math.round((maxPoints * (result.visiblePassed + result.hiddenPassed)) / total);
}

const ASSESSMENT_SCORE_BAND = { min: 200, max: 600 } as const;

function summarizeAssessmentScorecard(problem: Problem, session: AssessmentSessionState): AssessmentScorecard {
  const levels = assessmentLevelsForProblem(problem);
  let rawPoints = 0;
  let maxRawPoints = 0;
  let completedLevels = 0;
  const perLevel = levels.map((level) => {
    maxRawPoints += level.maxPoints;
    const result = session.levelResults[level.level] ?? {
      level: level.level,
      visiblePassed: 0,
      visibleTotal: 0,
      hiddenPassed: 0,
      hiddenTotal: 0,
      attempts: 0,
      points: 0,
      lastRunAt: ""
    };
    const points = assessmentLevelPoints(result, level.maxPoints);
    const timeMs = Math.max(0, session.timeByLevelMs?.[level.level] ?? result.timeMs ?? 0);
    rawPoints += points;
    const total = result.visibleTotal + result.hiddenTotal;
    if (total > 0 && result.visiblePassed + result.hiddenPassed === total) completedLevels += 1;
    return { ...result, points, timeMs };
  });
  return {
    assessmentId: problem.id,
    problemId: problem.id,
    mode: session.mode,
    status: session.status === "expired" ? "expired" : "submitted",
    totalScore: assessmentBandScore(rawPoints, maxRawPoints),
    rawPoints,
    maxRawPoints,
    perLevel,
    elapsedMs: assessmentElapsedMs(session),
    levelTimeMs: { ...(session.timeByLevelMs ?? {}) },
    completedLevels,
    generatedAt: new Date().toISOString()
  };
}

function assessmentBandScore(rawPoints: number, maxRawPoints: number): number {
  if (maxRawPoints <= 0) return ASSESSMENT_SCORE_BAND.min;
  const clamped = Math.max(0, Math.min(rawPoints, maxRawPoints));
  return Math.round(ASSESSMENT_SCORE_BAND.min + (ASSESSMENT_SCORE_BAND.max - ASSESSMENT_SCORE_BAND.min) * (clamped / maxRawPoints));
}

function assessmentElapsedMs(session: AssessmentSessionState): number {
  const end = session.finishedAt ? new Date(session.finishedAt).getTime() : Date.now();
  return Math.max(0, end - new Date(session.startedAt).getTime());
}

function assessmentCoachingSummary(card: AssessmentScorecard): string {
  const solved = card.completedLevels;
  const reached = card.perLevel.filter((level) => level.attempts > 0).length;
  const lastFull = [...card.perLevel].reverse().find((level) => {
    const total = level.visibleTotal + level.hiddenTotal;
    return total > 0 && level.visiblePassed + level.hiddenPassed === total;
  });
  if (solved === 4) return "All four levels cleared — focus next on doing it faster and on the first submission.";
  if (solved === 0 && reached <= 1) return "Stalled on Level 1 — practice translating an operation list into a clean dispatcher before optimising.";
  if (reached > solved + 1) return `Reached Level ${reached} but only fully cleared ${solved} — slow down on edge cases; the hidden tests are where points leak.`;
  if (lastFull && lastFull.level >= 2 && reached === lastFull.level) return `Solid through Level ${lastFull.level}, then time ran out — time-box the early levels tighter to bank the harder ones.`;
  return `Cleared ${solved} of 4 levels — review the unsolved level's reference, then replay under the clock.`;
}

function statusLabelFor(status: "cleared" | "partial" | "untouched"): string {
  if (status === "cleared") return "Fully cleared";
  if (status === "partial") return "Partial — points on the table";
  return "Not attempted";
}

function formatRemaining(ms: number): string {
  if (!Number.isFinite(ms)) return "∞";
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatElapsed(startedAt: string | undefined, now: number): string {
  if (!startedAt) return "0:00";
  return formatRemaining(Math.max(0, now - new Date(startedAt).getTime()));
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function formatRunWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 24 * 60 * 60_000) return `${Math.floor(diff / (60 * 60_000))}h ago`;
  if (diff < 7 * 24 * 60 * 60_000) return `${Math.floor(diff / (24 * 60 * 60_000))}d ago`;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function formatShortTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

function formatProblemHistoryTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function formatProblemRunDuration(value: number): string {
  if (value < 1000) return `${value} ms`;
  return `${(value / 1000).toFixed(1)} s`;
}

function formatActiveTime(value: number): string {
  const totalMinutes = Math.max(0, Math.round(value / 60_000));
  if (totalMinutes < 1) return "<1m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes}m`;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

function historyStatusLabel(status: RunResult["status"]): string {
  if (status === "failed") return "Failed";
  return statusLabel(status);
}

function completedCount(userData: NextUserData | null, problemIds: string[]): number {
  return problemIds.filter((id) => isProblemComplete(userData, id)).length;
}

function isProblemComplete(userData: NextUserData | null, problemId: string): boolean {
  return userData?.progress.some((record) => record.contentKind === "problem" && record.contentId === problemId && record.status === "complete") ?? false;
}

function isContentComplete(userData: NextUserData | null, contentKind: "lesson" | "quiz", contentId: string): boolean {
  return userData?.progress.some((record) => record.contentKind === contentKind && record.contentId === contentId && record.status === "complete") ?? false;
}

function noteForContent(userData: NextUserData | null, contentKind: "lesson" | "problem" | "quiz", contentId: string): string {
  return userData?.notes.find((record) => record.contentKind === contentKind && record.contentId === contentId)?.body ?? "";
}

function problemWorkspaceId(problemId: string, partId?: string): string {
  return partId ? `${problemId}:${partId}` : problemId;
}

function activeTimeForProblem(userData: NextUserData | null, problemId: string): number {
  return (userData?.activity ?? [])
    .filter((record) => record.workspaceId === problemId || record.workspaceId.startsWith(`${problemId}:`))
    .reduce((sum, record) => sum + record.activeMs, 0);
}

function isDocumentActive(): boolean {
  return document.visibilityState === "visible" && document.hasFocus();
}

function createEmptyUserData(): NextUserData {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    migratedAt: now,
    source: { kind: "legacy-browser-backup" },
    progress: [],
    notes: [],
    attempts: [],
    editorBuffers: [],
    scratchpads: [],
    assessmentState: [],
    preferences: [],
    activity: [],
    coachLogs: [],
    legacySnapshots: [],
    migrationReport: {
      warnings: [],
      counts: {
        progress: 0,
        notes: 0,
        attempts: 0,
        editorBuffers: 0,
        scratchpads: 0,
        assessmentState: 0,
        preferences: 0,
        activity: 0,
        coachLogs: 0
      }
    }
  };
}

function normalizeUserData(value: NextUserData | null): NextUserData | null {
  if (!value) return null;
  const empty = createEmptyUserData();
  const maybeActivity = (value as Partial<NextUserData>).activity;
  return {
    ...empty,
    ...value,
    activity: Array.isArray(maybeActivity) ? maybeActivity : [],
    migrationReport: {
      ...empty.migrationReport,
      ...value.migrationReport,
      counts: {
        ...empty.migrationReport.counts,
        ...value.migrationReport?.counts,
        activity: Array.isArray(maybeActivity) ? maybeActivity.length : 0
      }
    }
  };
}

function upsertNote(
  userData: NextUserData,
  contentKind: "lesson" | "problem" | "quiz",
  contentId: string,
  body: string
): NextUserData {
  const now = new Date().toISOString();
  const sourceKey = `${contentKind}:${contentId}`;
  const notes = userData.notes.filter((record) => !(record.contentKind === contentKind && record.contentId === contentId));
  return {
    ...userData,
    notes: [...notes, { contentKind, contentId, body, updatedAt: now, sourceKey }]
  };
}

function upsertProgress(
  userData: NextUserData,
  contentKind: "lesson" | "problem" | "quiz",
  contentId: string,
  status: "in-progress" | "complete",
  score?: { correct: number; total: number }
): NextUserData {
  const now = new Date().toISOString();
  const sourceKey = `${contentKind}:${contentId}`;
  const missed = score ? score.correct < score.total : false;
  const dueAt = status === "complete" ? (missed ? now : nextReviewDate()) : undefined;
  const progress = userData.progress.filter((record) => !(record.contentKind === contentKind && record.contentId === contentId));
  return {
    ...userData,
    progress: [
      ...progress,
      {
        contentKind,
        contentId,
        status,
        dueAt,
        updatedAt: now,
        score,
        sourceKey
      }
    ]
  };
}

function upsertPreference(userData: NextUserData, key: string, value: unknown): NextUserData {
  return {
    ...userData,
    preferences: [...userData.preferences.filter((record) => record.key !== key), { key, value }]
  };
}

function addActivityTime(userData: NextUserData, workspaceId: string, deltaMs: number): NextUserData {
  const activeMs = Math.max(0, Math.round(deltaMs));
  if (!workspaceId || activeMs < 1000) return userData;
  const now = new Date().toISOString();
  const activity = userData.activity ?? [];
  const existing = activity.find((record) => record.workspaceId === workspaceId);
  const nextRecord = {
    workspaceId,
    contentKind: "problem" as const,
    activeMs: (existing?.activeMs ?? 0) + activeMs,
    firstActiveAt: existing?.firstActiveAt ?? now,
    lastActiveAt: now,
    updatedAt: now,
    sourceKey: `activity:problem:${workspaceId}`
  };
  const nextActivity = [...activity.filter((record) => record.workspaceId !== workspaceId), nextRecord];
  return {
    ...userData,
    activity: nextActivity,
    migrationReport: {
      ...userData.migrationReport,
      counts: {
        ...userData.migrationReport.counts,
        activity: nextActivity.length
      }
    }
  };
}

function upsertScratchpad(userData: NextUserData, problemId: string, language: LanguageId, code: string): NextUserData {
  const sourceKey = language === "python" ? `scratchpad:${problemId}` : `scratchpad:${problemId}:${language}`;
  return {
    ...userData,
    scratchpads: [
      ...userData.scratchpads.filter((record) => !(record.problemId === problemId && record.language === language)),
      { problemId, language, code, sourceKey }
    ]
  };
}

function upsertAssessmentState(
  userData: NextUserData,
  assessmentId: string,
  kind: "session" | "scorecard" | "scorecard-history" | "event-log",
  value: unknown
): NextUserData {
  const assessmentState = userData.assessmentState.filter((record) => !(record.assessmentId === assessmentId && record.kind === kind));
  if (value === undefined) return { ...userData, assessmentState };
  return {
    ...userData,
    assessmentState: [
      ...assessmentState,
      {
        assessmentId,
        kind,
        value,
        sourceKey: `assessment:${kind}:${assessmentId}`
      }
    ]
  };
}

function appendAssessmentEvent(userData: NextUserData, assessmentId: string, event: AssessmentEventRecord): NextUserData {
  const current = userData.assessmentState.find((record) => record.assessmentId === assessmentId && record.kind === "event-log")?.value;
  const events = Array.isArray(current) ? current.filter(isAssessmentEventRecord) : [];
  return upsertAssessmentState(userData, assessmentId, "event-log", [...events, event]);
}

function scratchpadForProblem(userData: NextUserData | null, problemId: string, language: LanguageId): string | undefined {
  return userData?.scratchpads.find((record) => record.problemId === problemId && record.language === language)?.code;
}

function preferenceValue<T>(userData: NextUserData | null, key: string, fallback: T): T {
  const value = userData?.preferences.find((record) => record.key === key)?.value;
  return value === undefined ? fallback : value as T;
}

function numberPreference(userData: NextUserData | null, key: string, fallback: number): number {
  const value = preferenceValue<unknown>(userData, key, fallback);
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isMobileWorkspaceTab(value: unknown): value is MobileWorkspaceTab {
  return typeof value === "string" && mobileWorkspaceTabs.includes(value as MobileWorkspaceTab);
}

function defaultScratchpadCode(language: LanguageId, title?: string): string {
  const label = title ? ` - ${title}` : "";
  if (language === "python") {
    const pythonLabel = title ? ` for ${title}` : "";
    return `# Python scratchpad${pythonLabel}\n# Use print(...) to inspect quick examples.\n\nprint("ready")\n`;
  }
  if (language === "go") {
    return `// Go scratchpad${label}\npackage main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("ready")\n}\n`;
  }
  if (language === "scala") {
    return `// Scala scratchpad${label}\nobject Scratchpad:\n  def main(args: Array[String]): Unit =\n    println("ready")\n`;
  }
  return `// TypeScript scratchpad${label}\n// Use console.log(...) to inspect quick examples.\n\nconsole.log("ready");\n`;
}

function nextReviewDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString();
}

function dueReviewCount(userData: NextUserData | null): number {
  if (!userData) return 0;
  const now = Date.now();
  return userData.progress.filter((record) => record.dueAt && new Date(record.dueAt).getTime() <= now).length;
}

function recentAttemptProblem(graph: ContentGraph, userData: NextUserData | null): { problem: Problem; passed: boolean } | undefined {
  const attempt = userData?.attempts
    .filter((candidate) => graph.problems.some((problem) => problem.id === candidate.workspaceId || candidate.workspaceId.startsWith(`${problem.id}:`)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (!attempt) return undefined;
  const problem = graph.problems.find((candidate) => attempt.workspaceId === candidate.id || attempt.workspaceId.startsWith(`${candidate.id}:`));
  return problem ? { problem, passed: attempt.passed } : undefined;
}

function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function legacyOrderedModules(graph: ContentGraph): ContentGraph["modules"] {
  const legacyOrder = [
    "foundations",
    "arrays-strings",
    "two-pointers-sliding-window",
    "hashing",
    "linked-lists",
    "stacks-queues",
    "trees-graphs",
    "heaps",
    "greedy",
    "binary-search",
    "backtracking",
    "dynamic-programming",
    "interview-tools"
  ];
  const order = new Map(legacyOrder.map((id, index) => [id, index]));
  return [...graph.modules].sort((a, b) => (order.get(a.id) ?? a.order) - (order.get(b.id) ?? b.order));
}

function legacyModuleMeta(moduleId: string) {
  return legacyCourse.chapters.find((chapter) => chapter.id === moduleId);
}

function signatureLabel(problem: Problem, part: ProblemPart | undefined, language: LanguageId): string {
  const signature = part?.signature ?? problem.signature;
  const support = (part?.languages ?? problem.languages)[language];
  const name = support?.entrypoint ?? signature.name;
  const args = signature.inputs.map((input) => `${input.name}: ${typeLabel(input.type, language)}`).join(", ");
  if (language === "python") return `def ${name}(${args}) -> ${typeLabel(signature.output, language)}`;
  if (language === "go") return `func ${name}(${args}) ${typeLabel(signature.output, language)}`;
  if (language === "scala") return `def ${name}(${args}): ${typeLabel(signature.output, language)}`;
  return `${name}(${args}) -> ${typeLabel(signature.output, language)}`;
}

function typeLabel(type: Problem["signature"]["output"], language: LanguageId): string {
  if (type.type === "array") {
    const item = typeLabel(type.items ?? { type: "any" }, language);
    if (language === "python") return `list[${item}]`;
    if (language === "go") return `[]${item}`;
    if (language === "scala") return `List[${item}]`;
    return `${item}[]`;
  }
  const base = primitiveTypeLabel(type.type, language);
  return type.nullable ? `${base} | null` : base;
}

function primitiveTypeLabel(type: string, language: LanguageId): string {
  if (language === "python") {
    if (type === "number") return "int";
    if (type === "boolean") return "bool";
    if (type === "object") return "dict";
  }
  if (language === "go") {
    if (type === "number") return "int";
    if (type === "boolean") return "bool";
    if (type === "string") return "string";
    if (type === "object" || type === "any") return "any";
  }
  if (language === "scala") {
    if (type === "number") return "Int";
    if (type === "boolean") return "Boolean";
    if (type === "string") return "String";
    if (type === "object" || type === "any") return "Any";
  }
  return type;
}

function statusLabel(status: RunResult["status"]): string {
  if (status === "passed") return "Passed";
  if (status === "failed") return "Failed tests";
  if (status === "compile-error") return "Compile error";
  if (status === "runtime-error") return "Runtime error";
  if (status === "timeout") return "Timed out";
  if (status === "stopped") return "Stopped";
  return "Unsupported";
}

function languageName(language: LanguageId): string {
  if (language === "typescript") return "TypeScript";
  if (language === "python") return "Python";
  if (language === "go") return "Go";
  if (language === "scala") return "Scala";
  return titleCase(language);
}

function scopedProblems(graph: ContentGraph, scope: SidebarScope, query: string): Problem[] {
  const normalized = query.trim().toLowerCase();
  const ids = problemIdsForScope(graph, scope);
  return graph.problems.filter((problem) => {
    if (ids && !ids.has(problem.id)) return false;
    if (!normalized) return true;
    return `${problem.title} ${problem.difficulty} ${problem.concepts.join(" ")}`.toLowerCase().includes(normalized);
  });
}

function problemIdsForScope(graph: ContentGraph, scope: SidebarScope): Set<string> | undefined {
  if (scope.kind === "all") return undefined;
  if (scope.kind === "module") {
    const module = graph.modules.find((candidate) => candidate.id === scope.id);
    return new Set(module?.sequence.filter((entry) => entry.kind === "problem").map((entry) => entry.id) ?? []);
  }
  const set = graph.problemSets.find((candidate) => candidate.id === scope.id);
  return new Set(set?.entries.map((entry) => entry.problem) ?? []);
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

function stoppedResult(): RunResult {
  return {
    status: "stopped",
    stdout: "",
    stderr: "",
    durationMs: 0,
    tests: []
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function postJson<T>(path: string, body: unknown, options: { signal?: AbortSignal } = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: options.signal,
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function safeGetJson<T>(path: string): Promise<T | undefined> {
  try {
    return await getJson<T>(path);
  } catch {
    return undefined;
  }
}

function defaultSelection(graph: ContentGraph, languages: LanguagePack[]): WorkspaceSelection | undefined {
  const problem = graph.problems[0];
  if (!problem) return undefined;
  const language = problem.languages.python ? "python" : Object.keys(problem.languages)[0] ?? languages[0]?.id ?? "python";
  return {
    problemId: problem.id,
    language,
    sourceKind: "starter"
  };
}

function validSelection(selection: WorkspaceSelection | undefined, graph: ContentGraph): WorkspaceSelection | undefined {
  if (!selection) return undefined;
  const problem = graph.problems.find((candidate) => candidate.id === selection.problemId);
  if (!problem) return undefined;
  const part = selection.partId ? problem.parts?.find((candidate) => candidate.id === selection.partId) : undefined;
  const partId = selection.partId && part ? selection.partId : undefined;
  const languageMap = part?.languages ?? problem.languages;
  const language = languageMap[selection.language] ? selection.language : Object.keys(languageMap)[0];
  if (!language) return undefined;
  return {
    problemId: problem.id,
    partId,
    language,
    sourceKind: selection.sourceKind === "reference" ? "reference" : "starter"
  };
}

function findWorkspaceBuffer(
  state: NextWorkspaceState | null,
  selection: WorkspaceSelection
): WorkspaceEditorBuffer | undefined {
  const key = workspaceKey(selection);
  return state?.editorBuffers.find((buffer) => workspaceKey(buffer) === key);
}

function latestAttemptForSelection(
  userData: NextUserData | null,
  selection: WorkspaceSelection
): NextUserData["attempts"][number] | undefined {
  return latestAttemptForWorkspace(userData, workspaceIdForSelection(selection), selection.language);
}

function latestAttemptForWorkspace(
  userData: NextUserData | null,
  workspaceId: string,
  language: LanguageId
): NextUserData["attempts"][number] | undefined {
  return userData?.attempts
    .filter((attempt) => attempt.workspaceId === workspaceId && attempt.language === language && typeof attempt.code === "string")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

function workspaceIdForSelection(selection: Pick<WorkspaceSelection, "problemId" | "partId">): string {
  return selection.partId ? `${selection.problemId}:${selection.partId}` : selection.problemId;
}

function upsertWorkspaceBuffer(
  state: NextWorkspaceState | null,
  buffer: WorkspaceEditorBuffer
): NextWorkspaceState {
  const key = workspaceKey(buffer);
  const updatedAt = buffer.updatedAt;
  return {
    schemaVersion: 1,
    updatedAt,
    lastSelection: selectionFromBuffer(buffer),
    editorBuffers: [
      ...(state?.editorBuffers.filter((candidate) => workspaceKey(candidate) !== key) ?? []),
      buffer
    ]
  };
}

function workspaceStateFromUserData(
  userData: NextUserData,
  existing: NextWorkspaceState | null
): NextWorkspaceState | null {
  const imported = userData.editorBuffers.flatMap((record): WorkspaceEditorBuffer[] => {
    if (record.scope !== "problem" && record.scope !== "problem-part") return [];
    return [{
      problemId: record.contentId,
      partId: record.partId,
      language: record.language,
      sourceKind: "starter",
      code: record.code,
      updatedAt: userData.migratedAt
    }];
  });
  if (!imported.length) return existing;

  const merged = new Map<string, WorkspaceEditorBuffer>();
  for (const buffer of existing?.editorBuffers ?? []) {
    merged.set(workspaceKey(buffer), buffer);
  }
  for (const buffer of imported) {
    merged.set(workspaceKey(buffer), buffer);
  }
  const updatedAt = new Date().toISOString();
  return {
    schemaVersion: 1,
    updatedAt,
    lastSelection: existing?.lastSelection ?? selectionFromBuffer(imported[0]),
    editorBuffers: [...merged.values()]
  };
}

function selectionFromBuffer(buffer: WorkspaceEditorBuffer): WorkspaceSelection {
  return {
    problemId: buffer.problemId,
    partId: buffer.partId,
    language: buffer.language,
    sourceKind: buffer.sourceKind
  };
}

function workspaceKey(selection: WorkspaceSelection): string {
  return [
    selection.problemId,
    selection.partId ?? "",
    selection.language,
    selection.sourceKind
  ].join("\u0000");
}
