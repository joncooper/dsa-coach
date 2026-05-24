import type { LanguageId, RunResult } from "../core/types.js";

export interface NextUserData {
  schemaVersion: 1;
  migratedAt: string;
  source: {
    kind: "legacy-browser-backup";
    exportedAt?: string;
  };
  progress: UserProgressRecord[];
  notes: UserNoteRecord[];
  attempts: UserAttemptRecord[];
  editorBuffers: EditorBufferRecord[];
  scratchpads: ScratchpadRecord[];
  assessmentState: AssessmentStateRecord[];
  preferences: UserPreferenceRecord[];
  coachLogs: UserCoachLogRecord[];
  legacySnapshots: LegacySnapshotRecord[];
  migrationReport: MigrationReport;
}

export interface UserProgressRecord {
  contentKind: "lesson" | "problem" | "quiz";
  contentId: string;
  status: "not-started" | "in-progress" | "complete";
  dueAt?: string;
  updatedAt: string;
  score?: { correct: number; total: number };
  sourceKey: string;
}

export interface UserNoteRecord {
  contentKind: "lesson" | "problem" | "quiz";
  contentId: string;
  body: string;
  updatedAt: string;
  sourceKey: string;
}

export interface UserAttemptRecord {
  workspaceId: string;
  language: LanguageId;
  code: string;
  passed: boolean;
  result: RunResult | unknown;
  createdAt: string;
  legacyId?: number;
}

export interface EditorBufferRecord {
  scope: "problem" | "problem-part" | "assessment-level" | "assessment-finish-snapshot";
  contentId: string;
  partId?: string;
  level?: number;
  language: LanguageId;
  code: string;
  sourceKey: string;
}

export interface ScratchpadRecord {
  problemId: string;
  language: LanguageId;
  code: string;
  sourceKey: string;
}

export interface AssessmentStateRecord {
  assessmentId: string;
  kind: "session" | "scorecard" | "scorecard-history";
  value: unknown;
  sourceKey: string;
}

export interface UserPreferenceRecord {
  key: string;
  value: unknown;
}

export interface UserCoachLogRecord {
  legacyId?: number;
  conversationId: string;
  problemId: string;
  partTitle?: string;
  model: string;
  promptVersion: string;
  userMessage: string | null;
  messages: unknown[];
  response: string;
  context: unknown;
  feedback?: unknown;
  createdAt: string;
}

export interface LegacySnapshotRecord {
  importedAt: string;
  exportedAt?: string;
  payload: unknown;
}

export interface MigrationReport {
  warnings: string[];
  counts: {
    progress: number;
    notes: number;
    attempts: number;
    editorBuffers: number;
    scratchpads: number;
    assessmentState: number;
    preferences: number;
    coachLogs: number;
  };
}
