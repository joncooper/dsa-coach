import { useCallback, useEffect, useMemo, useState } from "react";
import type { NoteRecord, ProgressRecord, ProgressStatus, RunResult, SettingRecord, SubmissionRecord } from "../types";
import { db, exportBackup, importBackup, itemKey, type BackupPayload } from "../storage/db";

type ProgressType = "lesson" | "problem" | "quiz";

export function useCourseStore() {
  const [progress, setProgress] = useState<Record<string, ProgressRecord>>({});
  const [notes, setNotes] = useState<Record<string, NoteRecord>>({});
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [settings, setSettings] = useState<Record<string, SettingRecord>>({});
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const [progressRows, noteRows, submissionRows, settingRows] = await Promise.all([
      db.progress.toArray(),
      db.notes.toArray(),
      db.submissions.orderBy("createdAt").reverse().toArray(),
      db.settings.toArray()
    ]);
    setProgress(Object.fromEntries(progressRows.map((record) => [record.key, record])));
    setNotes(Object.fromEntries(noteRows.map((record) => [record.key, record])));
    setSubmissions(submissionRows);
    setSettings(Object.fromEntries(settingRows.map((record) => [record.key, record])));
    setReady(true);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markProgress = useCallback(
    async (type: ProgressType, id: string, status: ProgressStatus) => {
      const key = itemKey(type, id);
      const record: ProgressRecord = {
        key,
        type,
        id,
        status,
        dueAt: status === "complete" ? nextReviewDate() : undefined,
        updatedAt: new Date().toISOString()
      };
      await db.progress.put(record);
      setProgress((current) => ({ ...current, [key]: record }));
    },
    []
  );

  const saveNote = useCallback(async (itemType: ProgressType, itemId: string, body: string) => {
    const key = itemKey(itemType, itemId);
    const record: NoteRecord = {
      key,
      itemType,
      itemId,
      body,
      updatedAt: new Date().toISOString()
    };
    await db.notes.put(record);
    setNotes((current) => ({ ...current, [key]: record }));
  }, []);

  const saveSetting = useCallback(async (key: string, value: unknown) => {
    const record: SettingRecord = { key, value };
    await db.settings.put(record);
    setSettings((current) => ({ ...current, [key]: record }));
  }, []);

  const recordSubmission = useCallback(async (problemId: string, code: string, result: RunResult) => {
    const submission: SubmissionRecord = {
      problemId,
      code,
      passed: result.status === "passed",
      result,
      createdAt: new Date().toISOString()
    };
    const id = await db.submissions.add(submission);
    setSubmissions((current) => [{ ...submission, id }, ...current]);
    await saveSetting(`code:${problemId}`, code);
  }, [saveSetting]);

  const exportJson = useCallback(async () => {
    const payload = await exportBackup();
    return JSON.stringify(payload, null, 2);
  }, []);

  const importJson = useCallback(
    async (raw: string) => {
      const payload = JSON.parse(raw) as BackupPayload;
      await importBackup(payload);
      await load();
    },
    [load]
  );

  const progressSummary = useMemo(() => {
    const rows = Object.values(progress);
    return {
      complete: rows.filter((record) => record.status === "complete").length,
      inProgress: rows.filter((record) => record.status === "in-progress").length,
      due: rows.filter((record) => record.dueAt && new Date(record.dueAt) <= new Date()).length
    };
  }, [progress]);

  return {
    ready,
    progress,
    notes,
    submissions,
    settings,
    progressSummary,
    markProgress,
    saveNote,
    saveSetting,
    recordSubmission,
    exportJson,
    importJson
  };
}

function nextReviewDate(): string {
  const days = 7;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
