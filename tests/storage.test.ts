import { afterEach, describe, expect, it } from "vitest";
import { db, exportBackup, exportCoachJsonl, importBackup, itemKey } from "../src/storage/db";
import type { CoachExchangeRecord } from "../src/types";

function sampleExchange(overrides: Partial<CoachExchangeRecord> = {}): Omit<CoachExchangeRecord, "id"> {
  return {
    conversationId: "conv-1",
    problemId: "realized-pnl",
    model: "gemma4:latest",
    promptVersion: "test.1",
    userMessage: null,
    messages: [
      { role: "system", content: "sys" },
      { role: "user", content: "ctx" }
    ],
    response: "Try checking your loop bound.",
    context: { runState: "failed", attemptCount: 1 },
    createdAt: "2026-05-18T00:00:00.000Z",
    ...overrides
  };
}

describe("local persistence", () => {
  afterEach(async () => {
    await db.delete();
    await db.open();
  });

  it("exports and imports progress", async () => {
    await db.progress.put({
      key: itemKey("problem", "sample"),
      type: "problem",
      id: "sample",
      status: "complete",
      dueAt: "2026-05-20T00:00:00.000Z",
      updatedAt: "2026-05-11T00:00:00.000Z"
    });

    const backup = await exportBackup();
    await db.progress.clear();
    expect(await db.progress.count()).toBe(0);
    await importBackup(backup);
    expect(await db.progress.get(itemKey("problem", "sample"))).toMatchObject({ status: "complete" });
  });

  it("round-trips the coach eval log through backup export/import", async () => {
    const id = await db.coachLogs.add(sampleExchange() as CoachExchangeRecord);
    await db.coachLogs.update(id, {
      feedback: { rating: "down", comment: "redirected instead of fixing my bug", at: "2026-05-18T00:01:00.000Z" }
    });

    const backup = await exportBackup();
    expect(backup.coachLogs).toHaveLength(1);

    await db.coachLogs.clear();
    expect(await db.coachLogs.count()).toBe(0);

    await importBackup(backup);
    const rows = await db.coachLogs.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      problemId: "realized-pnl",
      feedback: { rating: "down", comment: "redirected instead of fixing my bug" }
    });
  });

  it("exports the coach log as one JSON object per line (JSONL)", async () => {
    await db.coachLogs.bulkAdd([
      sampleExchange({ createdAt: "2026-05-18T00:00:00.000Z", response: "first" }) as CoachExchangeRecord,
      sampleExchange({ createdAt: "2026-05-18T00:05:00.000Z", response: "second" }) as CoachExchangeRecord
    ]);

    const jsonl = await exportCoachJsonl();
    const lines = jsonl.split("\n");
    expect(lines).toHaveLength(2);
    const parsed = lines.map((line) => JSON.parse(line) as CoachExchangeRecord);
    expect(parsed[0].response).toBe("first");
    expect(parsed[1].response).toBe("second");
  });

  it("persists workspace settings", async () => {
    await db.settings.bulkPut([
      { key: "workspace:splitRatio", value: 38 },
      { key: "workspace:bottomDockHeight", value: 320 },
      { key: "workspace:activeMobileTab", value: "results" },
      { key: "workspace:showHiddenDiagnostics", value: true },
      { key: "workspace:promptDensity", value: "full" },
      { key: "problem:starred:sum-positive-readings", value: true }
    ]);

    await expect(db.settings.get("workspace:splitRatio")).resolves.toMatchObject({ value: 38 });
    await expect(db.settings.get("workspace:bottomDockHeight")).resolves.toMatchObject({ value: 320 });
    await expect(db.settings.get("workspace:activeMobileTab")).resolves.toMatchObject({ value: "results" });
    await expect(db.settings.get("workspace:showHiddenDiagnostics")).resolves.toMatchObject({ value: true });
    await expect(db.settings.get("workspace:promptDensity")).resolves.toMatchObject({ value: "full" });
    await expect(db.settings.get("problem:starred:sum-positive-readings")).resolves.toMatchObject({ value: true });
  });
});
