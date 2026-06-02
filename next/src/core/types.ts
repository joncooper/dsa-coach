export type ContentKind =
  | "track"
  | "module"
  | "lesson"
  | "problem"
  | "problem-set"
  | "quiz"
  | "assessment";

export type LanguageId = string;

export interface ContentRef {
  kind: ContentKind;
  id: string;
}

export interface Track {
  id: string;
  kind: "track";
  title: string;
  entries: ContentRef[];
}

export interface Module {
  id: string;
  kind: "module";
  title: string;
  order: number;
  summary: string;
  concepts: string[];
  sequence: ContentRef[];
  bonus?: string[];
}

export interface ProblemSetEntry {
  problem: string;
  category?: string;
  note?: string;
}

export interface ProblemSet {
  id: string;
  kind: "problem-set";
  title: string;
  summary: string;
  entries: ProblemSetEntry[];
}

export type Difficulty = "warmup" | "easy" | "medium" | "hard";
export type TestVisibility = "visible" | "hidden";

export interface ValueType {
  type: "string" | "number" | "boolean" | "array" | "object" | "any";
  items?: ValueType;
  nullable?: boolean;
}

export interface FunctionParameter {
  name: string;
  type: ValueType;
}

export interface FunctionSignature {
  name: string;
  inputs: FunctionParameter[];
  output: ValueType;
}

export interface ProblemTest {
  name: string;
  args: unknown[];
  expected: unknown;
  visibility: TestVisibility;
  fixture?: unknown;
  validator?: string;
}

export interface ProblemLanguageSupport {
  entrypoint: string;
  starterPath: string;
  referencePath: string;
  solutionPath?: string;
}

export interface ProblemPart {
  id: string;
  title: string;
  prompt: string;
  signature?: FunctionSignature;
  tests: ProblemTest[];
  languages?: Record<LanguageId, ProblemLanguageSupport>;
}

export interface Problem {
  id: string;
  kind: "problem";
  title: string;
  difficulty: Difficulty;
  concepts: string[];
  prompt: string;
  signature: FunctionSignature;
  tests: ProblemTest[];
  parts?: ProblemPart[];
  languages: Record<LanguageId, ProblemLanguageSupport>;
}

export interface ContentGraph {
  version: number;
  tracks: Track[];
  modules: Module[];
  problemSets: ProblemSet[];
  problems: Problem[];
}

export type RunnerStrategy =
  | "container"
  | "host-process"
  | "browser-worker"
  | "prototype-vm";

export interface LanguagePack {
  id: LanguageId;
  label: string;
  extensions: string[];
  runner: {
    strategy: RunnerStrategy;
    installedByDefault: boolean;
    offlineCapable: boolean;
    sandboxed: boolean;
  };
  formatter?: {
    command: string;
  };
  lsp?: LanguageServerSpec;
}

export interface LanguageServerSpec {
  command: string;
  args?: string[];
  documentLanguageId?: string;
  initializeTimeoutMs?: number;
  shutdownTimeoutMs?: number;
  initializationOptions?: unknown;
  workspaceSourceRoot?: string;
  workspaceFiles?: Record<string, string>;
  install?: {
    kind: "npm" | "go" | "coursier" | "manual";
    packageName?: string;
    command?: string;
    args?: string[];
    notes?: string;
  };
}

export type RunStatus =
  | "passed"
  | "failed"
  | "compile-error"
  | "runtime-error"
  | "timeout"
  | "stopped"
  | "unsupported";

export interface TestResult {
  name: string;
  passed: boolean;
  visibility: TestVisibility;
  args: unknown[];
  expected: unknown;
  actual?: unknown;
  error?: string;
  diagnostics?: RunDiagnostic[];
}

export interface RunDiagnosticSnippetLine {
  line: number;
  text: string;
  markerStart?: number;
  markerLength?: number;
}

export interface RunDiagnostic {
  message: string;
  severity: "error" | "warning" | "info";
  source?: string;
  file?: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  code?: string | number;
  snippet?: RunDiagnosticSnippetLine[];
}

export interface RunResult {
  status: RunStatus;
  stdout: string;
  stderr: string;
  durationMs: number;
  tests: TestResult[];
  message?: string;
  diagnostics?: RunDiagnostic[];
}

export interface RunRequest {
  language: LanguageId;
  problemId: string;
  partId?: string;
  code: string;
  includeHidden: boolean;
  timeoutMs?: number;
}

export interface ScratchpadRequest {
  language: LanguageId;
  code: string;
  timeoutMs?: number;
}
