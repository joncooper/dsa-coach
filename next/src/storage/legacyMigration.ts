import type {
  AssessmentStateRecord,
  EditorBufferRecord,
  NextUserData,
  ScratchpadRecord,
  UserAttemptRecord,
  UserCoachLogRecord,
  UserNoteRecord,
  UserPreferenceRecord,
  UserProgressRecord
} from "./userData.js";

type LegacyProgressStatus = "not-started" | "in-progress" | "complete";

interface LegacyProgressRecord {
  key: string;
  type: "lesson" | "problem" | "quiz";
  id: string;
  status: LegacyProgressStatus;
  dueAt?: string;
  updatedAt: string;
  score?: { correct: number; total: number };
}

interface LegacyNoteRecord {
  key: string;
  itemType: "lesson" | "problem" | "quiz";
  itemId: string;
  body: string;
  updatedAt: string;
}

interface LegacySubmissionRecord {
  id?: number;
  problemId: string;
  code: string;
  passed: boolean;
  result: unknown;
  createdAt: string;
}

interface LegacySettingRecord {
  key: string;
  value: unknown;
}

interface LegacyCoachExchangeRecord {
  id?: number;
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

export interface LegacyBackupPayload {
  exportedAt?: string;
  progress?: LegacyProgressRecord[];
  notes?: LegacyNoteRecord[];
  submissions?: LegacySubmissionRecord[];
  settings?: LegacySettingRecord[];
  coachLogs?: LegacyCoachExchangeRecord[];
}

export interface LegacyMigrationOptions {
  migratedAt?: string;
  keepLegacySnapshot?: boolean;
}

export function migrateLegacyBackup(payload: LegacyBackupPayload, options: LegacyMigrationOptions = {}): NextUserData {
  const warnings: string[] = [];
  assertLegacyBackupShape(payload);
  const migratedAt = options.migratedAt ?? new Date().toISOString();

  const progress: UserProgressRecord[] = (payload.progress ?? []).map((record) => ({
    contentKind: record.type,
    contentId: record.id,
    status: record.status,
    dueAt: record.dueAt,
    updatedAt: record.updatedAt,
    score: record.score,
    sourceKey: record.key
  }));

  const notes: UserNoteRecord[] = (payload.notes ?? []).map((record) => ({
    contentKind: record.itemType,
    contentId: record.itemId,
    body: record.body,
    updatedAt: record.updatedAt,
    sourceKey: record.key
  }));

  const attempts: UserAttemptRecord[] = (payload.submissions ?? []).map((record) => ({
    workspaceId: record.problemId,
    language: "python",
    code: record.code,
    passed: record.passed,
    result: record.result,
    createdAt: record.createdAt,
    legacyId: record.id
  }));

  const editorBuffers: EditorBufferRecord[] = [];
  const scratchpads: ScratchpadRecord[] = [];
  const assessmentState: AssessmentStateRecord[] = [];
  const preferences: UserPreferenceRecord[] = [];

  for (const setting of payload.settings ?? []) {
    const mapped = mapSetting(setting, editorBuffers, scratchpads, assessmentState, warnings);
    if (!mapped) preferences.push({ key: setting.key, value: setting.value });
  }

  const coachLogs: UserCoachLogRecord[] = (payload.coachLogs ?? []).map((record) => ({
    legacyId: record.id,
    conversationId: record.conversationId,
    problemId: record.problemId,
    partTitle: record.partTitle,
    model: record.model,
    promptVersion: record.promptVersion,
    userMessage: record.userMessage,
    messages: record.messages,
    response: record.response,
    context: record.context,
    feedback: record.feedback,
    createdAt: record.createdAt
  }));

  return {
    schemaVersion: 1,
    migratedAt,
    source: {
      kind: "legacy-browser-backup",
      exportedAt: payload.exportedAt
    },
    progress,
    notes,
    attempts,
    editorBuffers,
    scratchpads,
    assessmentState,
    preferences,
    coachLogs,
    legacySnapshots:
      options.keepLegacySnapshot === false
        ? []
        : [{ importedAt: migratedAt, exportedAt: payload.exportedAt, payload }],
    migrationReport: {
      warnings,
      counts: {
        progress: progress.length,
        notes: notes.length,
        attempts: attempts.length,
        editorBuffers: editorBuffers.length,
        scratchpads: scratchpads.length,
        assessmentState: assessmentState.length,
        preferences: preferences.length,
        coachLogs: coachLogs.length
      }
    }
  };
}

function assertLegacyBackupShape(payload: LegacyBackupPayload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Legacy backup must be a JSON object");
  }
  for (const field of ["progress", "notes", "submissions", "settings", "coachLogs"] as const) {
    const value = payload[field];
    if (value !== undefined && !Array.isArray(value)) {
      throw new Error(`Legacy backup field ${field} must be an array when present`);
    }
  }
}

function mapSetting(
  setting: LegacySettingRecord,
  editorBuffers: EditorBufferRecord[],
  scratchpads: ScratchpadRecord[],
  assessmentState: AssessmentStateRecord[],
  warnings: string[]
): boolean {
  const problemCode = setting.key.match(/^code:([^#]+)(?:#(.+))?$/);
  if (problemCode) {
    if (typeof setting.value !== "string") {
      warnings.push(`Skipped non-string editor buffer ${setting.key}`);
      return true;
    }
    editorBuffers.push({
      scope: problemCode[2] ? "problem-part" : "problem",
      contentId: problemCode[1],
      partId: problemCode[2],
      language: "python",
      code: setting.value,
      sourceKey: setting.key
    });
    return true;
  }

  const scratchpad = setting.key.match(/^scratchpad:(.+)$/);
  if (scratchpad) {
    if (typeof setting.value !== "string") {
      warnings.push(`Skipped non-string scratchpad ${setting.key}`);
      return true;
    }
    scratchpads.push({
      problemId: scratchpad[1],
      language: "python",
      code: setting.value,
      sourceKey: setting.key
    });
    return true;
  }

  const assessmentCode = setting.key.match(/^assessment:(code|finish-code):(.+)#L(\d+)$/);
  if (assessmentCode) {
    if (typeof setting.value !== "string") {
      warnings.push(`Skipped non-string assessment buffer ${setting.key}`);
      return true;
    }
    editorBuffers.push({
      scope: assessmentCode[1] === "code" ? "assessment-level" : "assessment-finish-snapshot",
      contentId: assessmentCode[2],
      level: Number(assessmentCode[3]),
      language: "python",
      code: setting.value,
      sourceKey: setting.key
    });
    return true;
  }

  const assessmentRecord = setting.key.match(/^assessment:(session|scorecard|scorecard-history):(.+)$/);
  if (assessmentRecord) {
    assessmentState.push({
      assessmentId: assessmentRecord[2],
      kind: assessmentRecord[1] as "session" | "scorecard" | "scorecard-history",
      value: setting.value,
      sourceKey: setting.key
    });
    return true;
  }

  return false;
}
