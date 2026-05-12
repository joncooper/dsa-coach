import { afterEach, describe, expect, it } from "vitest";
import { db, exportBackup, importBackup, itemKey } from "../src/storage/db";

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
