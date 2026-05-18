import Dexie, { type Table } from "dexie";
import type {
  CoachExchangeRecord,
  NoteRecord,
  ProgressRecord,
  SettingRecord,
  SubmissionRecord
} from "../types";

export interface BackupPayload {
  exportedAt: string;
  progress: ProgressRecord[];
  notes: NoteRecord[];
  submissions: SubmissionRecord[];
  settings: SettingRecord[];
  coachLogs?: CoachExchangeRecord[];
}

class DsaCoachDb extends Dexie {
  progress!: Table<ProgressRecord, string>;
  notes!: Table<NoteRecord, string>;
  submissions!: Table<SubmissionRecord, number>;
  settings!: Table<SettingRecord, string>;
  coachLogs!: Table<CoachExchangeRecord, number>;

  constructor() {
    super("dsa-coach");
    this.version(1).stores({
      progress: "&key, type, id, status, dueAt, updatedAt",
      notes: "&key, itemType, itemId, updatedAt",
      submissions: "++id, problemId, passed, createdAt",
      settings: "&key"
    });
    // v2 adds the coach eval log. Existing stores are carried forward
    // unchanged; Dexie only needs the delta.
    this.version(2).stores({
      coachLogs: "++id, conversationId, problemId, createdAt"
    });
  }
}

export const db = new DsaCoachDb();

export function itemKey(type: "lesson" | "problem" | "quiz", id: string): string {
  return `${type}:${id}`;
}

export async function exportBackup(): Promise<BackupPayload> {
  const [progress, notes, submissions, settings, coachLogs] = await Promise.all([
    db.progress.toArray(),
    db.notes.toArray(),
    db.submissions.toArray(),
    db.settings.toArray(),
    db.coachLogs.toArray()
  ]);

  return {
    exportedAt: new Date().toISOString(),
    progress,
    notes,
    submissions,
    settings,
    coachLogs
  };
}

export async function importBackup(payload: BackupPayload): Promise<void> {
  await db.transaction("rw", [db.progress, db.notes, db.submissions, db.settings, db.coachLogs], async () => {
    await Promise.all([
      db.progress.clear(),
      db.notes.clear(),
      db.submissions.clear(),
      db.settings.clear(),
      db.coachLogs.clear()
    ]);
    await db.progress.bulkPut(payload.progress ?? []);
    await db.notes.bulkPut(payload.notes ?? []);
    await db.submissions.bulkPut((payload.submissions ?? []).map(({ id: _id, ...submission }) => submission));
    await db.settings.bulkPut(payload.settings ?? []);
    await db.coachLogs.bulkPut((payload.coachLogs ?? []).map(({ id: _id, ...row }) => row));
  });
}

/**
 * Serialize the coach log as JSONL — one self-contained eval example per
 * line. This is the format an eval harness consumes directly: each line
 * carries the exact prompt, the response, the context, and any rating.
 */
export async function exportCoachJsonl(): Promise<string> {
  const rows = await db.coachLogs.orderBy("createdAt").toArray();
  return rows.map((row) => JSON.stringify(row)).join("\n");
}
