import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, test } from "bun:test";
import { defaultContentRoot, loadContentGraph } from "../src/content/loadContentGraph.js";
import { createRunnerDaemonServer } from "../src/daemon/server.js";
import type { NextUserData, NextWorkspaceState } from "../src/storage/userData.js";

describe("runner daemon API", () => {
  test("serves catalog, source, and run endpoints", async () => {
    const graph = await loadContentGraph();
    const server = createRunnerDaemonServer({ graph, contentRoot: defaultContentRoot });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("missing test server address");
    const base = `http://127.0.0.1:${address.port}`;

    try {
      const catalog = await fetch(`${base}/catalog`).then((res) => res.json() as Promise<{ problems: unknown[] }>);
      expect(catalog.problems).toHaveLength(graph.problems.length);

      const lspStatus = await fetch(`${base}/lsp/status`).then((res) => res.json() as Promise<{ language: string; configured: boolean }[]>);
      expect(lspStatus.find((status) => status.language === "typescript")?.configured).toBe(true);

      const source = await fetch(
        `${base}/source?problemId=sum-positive-readings&language=typescript&kind=reference`
      ).then((res) => res.json() as Promise<{ code: string }>);
      expect(source.code).toContain("sumPositiveReadings");

      const result = await fetch(`${base}/run`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          language: "typescript",
          problemId: "sum-positive-readings",
          code: source.code,
          includeHidden: true
        })
      }).then((res) => res.json() as Promise<{ status: string; tests: unknown[] }>);
      expect(result.status).toBe("passed");
      expect(result.tests).toHaveLength(graph.problems[0].tests.length);

      const partSource = await fetch(
        `${base}/source?problemId=aoc-y1-d1-elevation-pairs&partId=part-2-triples&language=typescript&kind=reference`
      ).then((res) => res.json() as Promise<{ code: string }>);
      expect(partSource.code).toContain("elevation_triples");

      const partResult = await fetch(`${base}/run`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          language: "typescript",
          problemId: "aoc-y1-d1-elevation-pairs",
          partId: "part-2-triples",
          code: partSource.code,
          includeHidden: true
        })
      }).then((res) => res.json() as Promise<{ status: string }>);
      expect(partResult.status).toBe("passed");
    } finally {
      server.close();
    }
  });

  test("persists user data and workspace state in the configured data root", async () => {
    const userDataRoot = await mkdtemp(join(tmpdir(), "dsa-coach-next-data-"));
    const graph = await loadContentGraph();
    const server = createRunnerDaemonServer({ graph, contentRoot: defaultContentRoot, userDataRoot });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("missing test server address");
    const base = `http://127.0.0.1:${address.port}`;

    const userData: NextUserData = {
      schemaVersion: 1,
      migratedAt: "2026-05-24T00:00:00.000Z",
      source: { kind: "legacy-browser-backup", exportedAt: "2026-05-23T00:00:00.000Z" },
      progress: [],
      notes: [],
      attempts: [],
      editorBuffers: [],
      scratchpads: [],
      assessmentState: [],
      preferences: [],
      coachLogs: [],
      legacySnapshots: [],
      migrationReport: {
        warnings: [],
        counts: {
          progress: 0,
          notes: 0,
          attempts: 0,
          editorBuffers: 0,
          scratchpads: 0,
          assessmentState: 0,
          preferences: 0,
          coachLogs: 0
        }
      }
    };
    const workspaceState: NextWorkspaceState = {
      schemaVersion: 1,
      updatedAt: "2026-05-24T00:00:01.000Z",
      lastSelection: {
        problemId: "sum-positive-readings",
        language: "typescript",
        sourceKind: "starter"
      },
      editorBuffers: [{
        problemId: "sum-positive-readings",
        language: "typescript",
        sourceKind: "starter",
        code: "export function sumPositiveReadings(values: number[]) { return 42; }",
        updatedAt: "2026-05-24T00:00:01.000Z"
      }]
    };

    try {
      const emptyUserData = await fetch(`${base}/user-data`).then((res) => res.json() as Promise<{ userData: unknown }>);
      expect(emptyUserData.userData).toBeNull();

      const userDataWrite = await fetch(`${base}/user-data`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(userData)
      });
      expect(userDataWrite.ok).toBe(true);
      const storedUserData = await fetch(`${base}/user-data`).then((res) => res.json() as Promise<{ userData: NextUserData }>);
      expect(storedUserData.userData.migratedAt).toBe(userData.migratedAt);

      const exported = await fetch(`${base}/user-data/export`);
      expect(exported.ok).toBe(true);
      expect(exported.headers.get("content-disposition")).toContain("dsa-coach-next-user-data.json");

      const workspaceWrite = await fetch(`${base}/workspace-state`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(workspaceState)
      });
      expect(workspaceWrite.ok).toBe(true);
      const storedWorkspace = await fetch(`${base}/workspace-state`).then((res) => res.json() as Promise<{ workspaceState: NextWorkspaceState }>);
      expect(storedWorkspace.workspaceState.editorBuffers[0].code).toContain("return 42");
    } finally {
      server.close();
      await rm(userDataRoot, { recursive: true, force: true });
    }
  });
});
