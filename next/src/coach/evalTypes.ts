export type CoachEvalMode = "hint" | "debug" | "explain" | "review";
export type CoachEvalProvider = "deterministic" | "ollama";

export interface CoachEvalSuiteReport {
  schemaVersion: 1;
  generatedAt: string;
  promptVersion: string;
  provider: CoachEvalProvider;
  model: string;
  iteration?: string;
  summary: CoachEvalSummary;
  cases: CoachEvalCaseResult[];
}

export interface CoachEvalSummary {
  totalCases: number;
  passedCases: number;
  totalChecks: number;
  passedChecks: number;
  byMode: Record<CoachEvalMode, CoachEvalModeSummary>;
}

export interface CoachEvalModeSummary {
  totalCases: number;
  passedCases: number;
  totalChecks: number;
  passedChecks: number;
}

export interface CoachEvalCaseResult {
  id: string;
  title: string;
  mode: CoachEvalMode;
  tags: string[];
  userQuestion: string;
  promptContext: {
    includesReference: boolean;
    includesLearnerCode: boolean;
    includesRunState: boolean;
    charCount: number;
  };
  response: string;
  checks: CoachEvalCheckResult[];
  passed: boolean;
}

export interface CoachEvalCheckResult {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
}

export interface CoachEvalHistoryResponse {
  reports: CoachEvalSuiteReport[];
}
