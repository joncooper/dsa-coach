export type Difficulty = "warmup" | "easy" | "medium" | "hard";

export type AdapterKind =
  | "default"
  | "array"
  | "linked-list"
  | "binary-tree"
  | "graph"
  | "heap"
  | "grid";

export type ProgressStatus = "not-started" | "in-progress" | "complete";

export interface Chapter {
  id: string;
  title: string;
  order: number;
  summary: string;
  lessons: string[];
  quizzes: string[];
  problems: string[];
  bonusProblems: BonusProblem[];
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  concepts: string[];
  minutes: number;
  objectives: string[];
  workedExamples: string[];
  pitfalls: string[];
  linkedProblemIds: string[];
  body: string;
}

export interface ProblemTest {
  name: string;
  args: unknown[];
  expected: unknown;
  /**
   * Optional named checker (see VALIDATORS in the Python harnesses). When set,
   * the output is accepted if the validator returns true, instead of requiring
   * exact equality with `expected`. Used for problems with many valid answers
   * (e.g. any topological order). `expected` stays as an illustrative answer.
   */
  validator?: string;
}

export interface ProblemPart {
  id: string;
  title: string;
  prompt: string;
  entrypoint: string;
  starterCode: string;
  referenceCode: string;
  solutionCode?: string;
  visibleTests: ProblemTest[];
  hiddenTests: ProblemTest[];
  hints: string[];
  solution: string;
  walkthrough?: string;
  complexity?: {
    time: string;
    space: string;
  };
}

export interface Problem {
  id: string;
  chapterId: string;
  title: string;
  difficulty: Difficulty;
  source: "guided" | "bonus";
  patterns: string[];
  prompt: string;
  constraints?: string[];
  examples?: ProblemTest[];
  starterCode: string;
  referenceCode: string;
  solutionCode?: string;
  entrypoint: string;
  adapter: AdapterKind;
  visibleTests: ProblemTest[];
  hiddenTests: ProblemTest[];
  hints: string[];
  solution: string;
  walkthrough?: string;
  followUps?: string[];
  parts?: ProblemPart[];
  /** Set-only grouping tag (e.g. "streams", "grid"); stamped at set assembly. */
  subcategory?: string;
  complexity: {
    time: string;
    space: string;
  };
}

export type BonusProblem = Problem & {
  source: "bonus";
  sourceProblemId?: string;
};

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  chapterId: string;
  title: string;
  questions: QuizQuestion[];
}

export interface ProblemSet {
  id: string;
  title: string;
  summary: string;
  intro: string;
  problems: Problem[];
}

export interface CourseData {
  chapters: Chapter[];
  lessons: Lesson[];
  problems: Problem[];
  quizzes: Quiz[];
  problemSets: ProblemSet[];
}

/**
 * CodeSignal Industry Coding Framework (ICF) practice mode.
 *
 * Each assessment is ONE evolving problem with four progressive levels. The
 * underlying content is a single `Problem` whose `parts[]` are levels 2-4
 * (the base problem is level 1); every level shares one entrypoint
 * (`solution(queries)`) so the candidate's code carries forward level→level,
 * mirroring the real ICF. `Assessment` holds the exam-only metadata (timing,
 * scoring weights, level→part mapping) and is NOT part of `CourseData`.
 */
export interface AssessmentLevel {
  /** 1..4 */
  level: number;
  /** Which Problem part this maps to. "base" = the Problem itself; else ProblemPart.id. */
  partId: string;
  /** Raw point weight for this level (later levels are weighted heavier). */
  maxPoints: number;
  /** Advisory time-box shown in the UI (minutes). */
  recommendedMinutes: number;
}

export interface Assessment {
  id: string;
  title: string;
  archetype: "filesystem" | "banking" | "in-memory-db";
  /** One-line description for the index card. */
  blurb: string;
  /** Rules-screen body (markdown). */
  intro: string;
  /** Total exam budget in minutes (e.g. 90). */
  totalMinutes: number;
  /** The Problem that holds all four levels in base + parts[]. */
  problemId: string;
  levels: AssessmentLevel[];
  /** Banded score range; CodeSignal is 200–600. */
  scoreBand: { min: number; max: number };
}

export interface AssessmentLevelResult {
  level: number;
  visiblePassed: number;
  visibleTotal: number;
  hiddenPassed: number;
  hiddenTotal: number;
  attempts: number;
  /** Best-of-submissions raw points earned at this level. */
  points: number;
  lastRunAt: string;
}

export interface AssessmentSessionState {
  assessmentId: string;
  mode: "exam" | "practice";
  /**
   * ISO timer anchor. Shifted forward by the pause duration on each resume so
   * elapsed = now - startedAt stays correct without bookkeeping a pause total.
   */
  startedAt: string;
  /**
   * Exam only: startedAt + totalMinutes. Absent in practice mode. Shifted
   * forward alongside `startedAt` on resume so remaining = endsAt - now stays
   * consistent across pauses.
   */
  endsAt?: string;
  /**
   * Set when the candidate paused the session; cleared on resume. While set,
   * the clock is frozen and Run/Submit/Finish are gated by the UI.
   */
  pausedAt?: string;
  /** Highest level the user may open (1..4). */
  unlockedLevel: number;
  /** Best result per level, keyed by level number. */
  levelResults: Record<number, AssessmentLevelResult>;
  status: "in-progress" | "submitted" | "expired";
  finishedAt?: string;
}

export interface AssessmentScorecard {
  assessmentId: string;
  mode: "exam" | "practice";
  /** Mapped into scoreBand (e.g. 200–600). */
  totalScore: number;
  rawPoints: number;
  maxRawPoints: number;
  perLevel: AssessmentLevelResult[];
  elapsedMs: number;
  completedLevels: number;
  generatedAt: string;
}

export interface ProgressRecord {
  key: string;
  type: "lesson" | "problem" | "quiz";
  id: string;
  status: ProgressStatus;
  dueAt?: string;
  updatedAt: string;
}

export interface NoteRecord {
  key: string;
  itemType: "lesson" | "problem" | "quiz";
  itemId: string;
  body: string;
  updatedAt: string;
}

export interface SubmissionRecord {
  id?: number;
  problemId: string;
  code: string;
  passed: boolean;
  result: RunResult;
  createdAt: string;
}

export interface SettingRecord {
  key: string;
  value: unknown;
}

/** A single chat message exactly as sent to / received from the model. */
export interface CoachChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CoachFeedback {
  rating: "up" | "down";
  /** Optional free-text, typically captured on a thumbs-down. */
  comment?: string;
  at: string;
}

/**
 * One coach reply, captured as a replayable eval record: the exact prompt
 * sent to the model, the raw response, and the structured context snapshot
 * that produced it. `conversationId` regroups exchanges from one panel
 * session; `promptVersion`/`model` make runs comparable across tuning.
 */
export interface CoachExchangeRecord {
  id?: number;
  conversationId: string;
  problemId: string;
  partTitle?: string;
  model: string;
  promptVersion: string;
  /** The user turn that triggered this reply; null for the opening message. */
  userMessage: string | null;
  messages: CoachChatMessage[];
  response: string;
  /** Structured snapshot of the editor/run state at generation time. */
  context: unknown;
  feedback?: CoachFeedback;
  createdAt: string;
}

export interface TestResult {
  name: string;
  passed: boolean;
  args: unknown[];
  expected: unknown;
  actual: unknown;
  error?: string;
  hidden: boolean;
}

export interface RunResult {
  status: "idle" | "loading" | "passed" | "failed" | "error" | "timeout";
  stdout: string;
  stderr: string;
  durationMs: number;
  tests: TestResult[];
  message?: string;
}

export interface RunRequest {
  problem: Problem;
  code: string;
  includeHidden: boolean;
}

export interface ScratchpadRunRequest {
  code: string;
  scratchpad: true;
}
