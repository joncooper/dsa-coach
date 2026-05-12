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

export interface CourseData {
  chapters: Chapter[];
  lessons: Lesson[];
  problems: Problem[];
  quizzes: Quiz[];
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
