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
    contentId: normalizeLegacyContentId(record.id),
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
    workspaceId: normalizeLegacyWorkspaceId(record.problemId),
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
  mergeAssessmentEditorBuffers(editorBuffers, assessmentState, migratedAt);
  normalizeAssessmentStateValues(assessmentState, migratedAt);

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
    activity: [],
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
        activity: 0,
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
    const normalizedContentId = normalizeLegacyContentId(problemCode[1]);
    const assessmentLevel = problemCode[2]?.match(/^L(\d+)$/);
    if (normalizedContentId !== problemCode[1] && assessmentLevel) {
      editorBuffers.push({
        scope: "assessment-level",
        contentId: normalizedContentId,
        level: Number(assessmentLevel[1]),
        language: "python",
        code: setting.value,
        sourceKey: setting.key
      });
      return true;
    }
    editorBuffers.push({
      scope: problemCode[2] ? "problem-part" : "problem",
      contentId: normalizedContentId,
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
      contentId: normalizeLegacyAssessmentId(assessmentCode[2]),
      level: Number(assessmentCode[3]),
      language: "python",
      code: setting.value,
      sourceKey: setting.key
    });
    return true;
  }

  const assessmentRecord = setting.key.match(/^assessment:(session|scorecard|scorecard-history):(.+)$/);
  if (assessmentRecord) {
    const assessmentId = normalizeLegacyAssessmentId(assessmentRecord[2]);
    const kind = assessmentRecord[1] as "session" | "scorecard" | "scorecard-history";
    assessmentState.push({
      assessmentId,
      kind,
      value: setting.value,
      sourceKey: setting.key
    });
    return true;
  }

  return false;
}

const legacyAssessmentIds: Record<string, string> = {
  filesystem: "asm-filesystem",
  banking: "asm-banking",
  "in-memory-db": "asm-in-memory-db"
};

function normalizeLegacyAssessmentId(id: string): string {
  return legacyAssessmentIds[id] ?? id;
}

function normalizeLegacyContentId(id: string): string {
  return normalizeLegacyAssessmentId(id);
}

function normalizeLegacyWorkspaceId(workspaceId: string): string {
  for (const [legacyId, nextId] of Object.entries(legacyAssessmentIds)) {
    if (workspaceId === legacyId) return nextId;
    if (workspaceId.startsWith(`${legacyId}:`)) return `${nextId}:${workspaceId.slice(legacyId.length + 1)}`;
  }
  return workspaceId;
}

function mergeAssessmentEditorBuffers(
  editorBuffers: EditorBufferRecord[],
  assessmentState: AssessmentStateRecord[],
  migratedAt: string
) {
  const buffersByAssessment = new Map<string, Record<number, string>>();
  for (const buffer of editorBuffers) {
    if (buffer.scope !== "assessment-level" || typeof buffer.level !== "number") continue;
    const levelBuffers = buffersByAssessment.get(buffer.contentId) ?? {};
    levelBuffers[buffer.level] = buffer.code;
    buffersByAssessment.set(buffer.contentId, levelBuffers);
  }

  for (const [assessmentId, buffers] of buffersByAssessment) {
    const sessionRecord = assessmentState.find((record) => record.assessmentId === assessmentId && record.kind === "session");
    if (sessionRecord) {
      sessionRecord.value = mergeAssessmentSessionBuffers(sessionRecord.value, assessmentId, buffers, migratedAt);
    } else {
      assessmentState.push({
        assessmentId,
        kind: "session",
        value: mergeAssessmentSessionBuffers({ status: "in-progress" }, assessmentId, buffers, migratedAt),
        sourceKey: `assessment:code:${assessmentId}`
      });
    }
  }
}

function normalizeAssessmentStateValues(assessmentState: AssessmentStateRecord[], migratedAt: string) {
  for (const record of assessmentState) {
    if (record.kind === "event-log") continue;
    record.value = normalizeLegacyAssessmentValue(record.value, record.assessmentId, migratedAt, record.kind);
  }
}

function mergeAssessmentSessionBuffers(
  value: unknown,
  assessmentId: string,
  buffers: Record<number, string>,
  migratedAt: string
): unknown {
  const originalRecord = isPlainRecord(value);
  const normalized = normalizeLegacyAssessmentValue(value, assessmentId, migratedAt, "session");
  const normalizedRecord = isPlainRecord(normalized);
  const record = normalizedRecord ? { ...normalizedRecord } : {};
  const existingBuffers = normalizeLevelBuffers(record.buffers);
  const importedLevels = Object.keys(buffers).map((level) => Number(level)).filter((level) => Number.isInteger(level) && level > 0);
  const highestImportedLevel = Math.max(1, ...importedLevels);
  const activeLevel = positiveInteger(originalRecord?.activeLevel, highestImportedLevel);
  const unlockedLevel = Math.max(positiveInteger(originalRecord?.unlockedLevel, activeLevel), highestImportedLevel);
  const defaults = normalizeLegacyAssessmentValue({ status: "in-progress" }, assessmentId, migratedAt, "session") as Record<string, unknown>;
  return {
    ...defaults,
    ...record,
    activeLevel,
    unlockedLevel,
    buffers: { ...existingBuffers, ...buffers }
  };
}

function normalizeLegacyAssessmentValue(
  value: unknown,
  assessmentId: string,
  migratedAt: string,
  kind: "session" | "scorecard" | "scorecard-history"
): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeLegacyAssessmentValue(entry, assessmentId, migratedAt, kind));
  }
  if (!value || typeof value !== "object") return value;

  const record = { ...(value as Record<string, unknown>) };
  record.assessmentId = assessmentId;
  record.problemId ??= assessmentId;

  if (kind === "session" && typeof record.status === "string") {
    const activeLevel = positiveInteger(record.activeLevel ?? record.unlockedLevel, 1);
    const unlockedLevel = Math.max(activeLevel, positiveInteger(record.unlockedLevel, activeLevel));
    const startedAt = stringValue(record.startedAt) ?? stringValue(record.createdAt) ?? migratedAt;
    record.sessionId ??= `${assessmentId}:legacy:${Number.isFinite(new Date(startedAt).getTime()) ? new Date(startedAt).getTime() : startedAt}`;
    record.language = typeof record.language === "string" ? record.language : "python";
    record.mode = record.mode === "exam" ? "exam" : "practice";
    record.status = normalizeAssessmentStatus(record.status);
    record.startedAt = startedAt;
    record.activeLevel = activeLevel;
    record.unlockedLevel = unlockedLevel;
    record.levelResults = isPlainRecord(record.levelResults) ? record.levelResults : {};
    record.buffers = normalizeLevelBuffers(record.buffers);
    record.timeByLevelMs = normalizeNumberMap(record.timeByLevelMs);
    if (record.status === "in-progress" && !record.pausedAt && !record.finishedAt && !record.activeSince) {
      record.activeSince = startedAt;
    }
  }

  return record;
}

function normalizeAssessmentStatus(status: string): "in-progress" | "submitted" | "expired" {
  if (status === "submitted" || status === "expired") return status;
  return "in-progress";
}

function normalizeLevelBuffers(value: unknown): Record<number, string> {
  const record = isPlainRecord(value);
  if (!record) return {};
  const buffers: Record<number, string> = {};
  for (const [key, item] of Object.entries(record)) {
    const level = Number(key);
    if (Number.isInteger(level) && level > 0 && typeof item === "string") {
      buffers[level] = item;
    }
  }
  return buffers;
}

function normalizeNumberMap(value: unknown): Record<number, number> {
  const record = isPlainRecord(value);
  if (!record) return {};
  const numbers: Record<number, number> = {};
  for (const [key, item] of Object.entries(record)) {
    const level = Number(key);
    if (Number.isInteger(level) && level > 0 && typeof item === "number" && Number.isFinite(item)) {
      numbers[level] = Math.max(0, item);
    }
  }
  return numbers;
}

function positiveInteger(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : fallback;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function isPlainRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}
