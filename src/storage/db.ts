import Dexie, { type Table } from "dexie";
import type { NoteRecord, ProgressRecord, SettingRecord, SubmissionRecord } from "../types";

export interface BackupPayload {
  exportedAt: string;
  progress: ProgressRecord[];
  notes: NoteRecord[];
  submissions: SubmissionRecord[];
  settings: SettingRecord[];
}

class DsaCoachDb extends Dexie {
  progress!: Table<ProgressRecord, string>;
  notes!: Table<NoteRecord, string>;
  submissions!: Table<SubmissionRecord, number>;
  settings!: Table<SettingRecord, string>;

  constructor() {
    super("dsa-coach");
    this.version(1).stores({
      progress: "&key, type, id, status, dueAt, updatedAt",
      notes: "&key, itemType, itemId, updatedAt",
      submissions: "++id, problemId, passed, createdAt",
      settings: "&key"
    });
  }
}

export const db = new DsaCoachDb();

export function itemKey(type: "lesson" | "problem" | "quiz", id: string): string {
  return `${type}:${id}`;
}

export async function exportBackup(): Promise<BackupPayload> {
  const [progress, notes, submissions, settings] = await Promise.all([
    db.progress.toArray(),
    db.notes.toArray(),
    db.submissions.toArray(),
    db.settings.toArray()
  ]);

  return {
    exportedAt: new Date().toISOString(),
    progress,
    notes,
    submissions,
    settings
  };
}

export async function importBackup(payload: BackupPayload): Promise<void> {
  await db.transaction("rw", db.progress, db.notes, db.submissions, db.settings, async () => {
    await Promise.all([db.progress.clear(), db.notes.clear(), db.submissions.clear(), db.settings.clear()]);
    await db.progress.bulkPut(payload.progress ?? []);
    await db.notes.bulkPut(payload.notes ?? []);
    await db.submissions.bulkPut((payload.submissions ?? []).map(({ id: _id, ...submission }) => submission));
    await db.settings.bulkPut(payload.settings ?? []);
  });
}
