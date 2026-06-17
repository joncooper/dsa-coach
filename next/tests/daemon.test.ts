import { once } from "node:events";
import { spawn } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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

      const scratchpad = await fetch(`${base}/scratchpad`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          language: "typescript",
          code: "console.log('scratch')",
          timeoutMs: 1000
        })
      }).then((res) => res.json() as Promise<{ status: string; stdout: string }>);
      expect(scratchpad.status).toBe("passed");
      expect(scratchpad.stdout.trim()).toBe("scratch");

      const partSource = await fetch(
        `${base}/source?problemId=aoc-y1-d1-elevation-pairs&partId=part-2-triples&language=python&kind=reference`
      ).then((res) => res.json() as Promise<{ code: string }>);
      expect(partSource.code).toContain("elevation_triples");

      const partResult = await fetch(`${base}/run`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          language: "python",
          problemId: "aoc-y1-d1-elevation-pairs",
          partId: "part-2-triples",
          code: partSource.code,
          includeHidden: true
        })
      }).then((res) => res.json() as Promise<{ status: string; message?: string }>);
      expect(partResult.status).toBe("unsupported");
      expect(partResult.message).toContain("Pyodide");

      const pythonScratchpad = await fetch(`${base}/scratchpad`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          language: "python",
          code: "print('scratch')",
          timeoutMs: 1000
        })
      }).then((res) => res.json() as Promise<{ status: string; message?: string }>);
      expect(pythonScratchpad.status).toBe("unsupported");
      expect(pythonScratchpad.message).toContain("Pyodide");
    } finally {
      server.close();
    }
  });

  test("serves static app files for GET and HEAD", async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), "dsa-coach-static-"));
    const staticRoot = join(tempRoot, "web");
    await mkdir(join(staticRoot, "assets"), { recursive: true });
    await writeFile(join(staticRoot, "index.html"), "<main>DSA Coach</main>\n", "utf8");
    await writeFile(join(staticRoot, "assets/app.js"), "console.log('ok');\n", "utf8");
    const graph = await loadContentGraph();
    const server = createRunnerDaemonServer({
      graph,
      contentRoot: defaultContentRoot,
      staticRoot,
      buildMode: "release"
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("missing test server address");
    const base = `http://127.0.0.1:${address.port}`;

    try {
      const index = await fetch(`${base}/`);
      expect(index.status).toBe(200);
      expect(await index.text()).toContain("DSA Coach");

      const asset = await fetch(`${base}/assets/app.js`);
      expect(asset.status).toBe(200);
      expect(await asset.text()).toContain("console.log");
      expect(asset.headers.get("cache-control")).toContain("immutable");

      const head = await fetch(`${base}/assets/app.js`, { method: "HEAD" });
      expect(head.status).toBe(200);
      expect(head.headers.get("cache-control")).toContain("immutable");
      expect(await head.text()).toBe("");
    } finally {
      server.close();
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  test("serves and saves scenario editable files", async () => {
    const userDataRoot = await mkdtemp(join(tmpdir(), "dsa-coach-next-scenarios-"));
    const graph = await loadContentGraph();
    const server = createRunnerDaemonServer({ graph, contentRoot: defaultContentRoot, userDataRoot });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("missing test server address");
    const base = `http://127.0.0.1:${address.port}`;

    try {
      const started = await fetch(`${base}/scenarios/start`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenarioId: "ramp-hotel-reservations" })
      }).then((res) => res.json() as Promise<{ attempt: { attemptId: string } }>);
      const attemptId = started.attempt.attemptId;

      const listed = await fetch(`${base}/scenarios/files?attemptId=${encodeURIComponent(attemptId)}`)
        .then((res) => res.json() as Promise<{ files: Array<{ path: string; content: string }> }>);
      const source = listed.files.find((file) => file.path === "src/reservations.py");
      expect(source?.content).toContain("class HotelReservationService");
      expect(listed.files.map((file) => file.path)).toContain("tests/test_reservations.py");

      const changed = `${source?.content ?? ""}\n# candidate note\n`;
      const saved = await fetch(`${base}/scenarios/file`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attemptId, path: "src/reservations.py", content: changed })
      });
      expect(saved.ok).toBe(true);

      const reread = await fetch(`${base}/scenarios/files?attemptId=${encodeURIComponent(attemptId)}`)
        .then((res) => res.json() as Promise<{ files: Array<{ path: string; content: string }> }>);
      expect(reread.files.find((file) => file.path === "src/reservations.py")?.content).toContain("candidate note");

      const diff = await fetch(`${base}/scenarios/diff?attemptId=${encodeURIComponent(attemptId)}`)
        .then((res) => res.json() as Promise<{ diff: string }>);
      expect(diff.diff).toContain("candidate note");

      const rejected = await fetch(`${base}/scenarios/file`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attemptId, path: "attempt.json", content: "{}" })
      });
      expect(rejected.ok).toBe(false);

      const restarted = await fetch(`${base}/scenarios/start`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenarioId: "ramp-hotel-reservations" })
      }).then((res) => res.json() as Promise<{ attempt: { attemptId: string; visibleRuns: unknown[]; hiddenRuns: unknown[]; aiTurns: unknown[] } }>);
      expect(restarted.attempt.attemptId).not.toBe(attemptId);
      expect(restarted.attempt.visibleRuns).toHaveLength(0);
      expect(restarted.attempt.hiddenRuns).toHaveLength(0);
      expect(restarted.attempt.aiTurns).toHaveLength(0);

      const freshFiles = await fetch(`${base}/scenarios/files?attemptId=${encodeURIComponent(restarted.attempt.attemptId)}`)
        .then((res) => res.json() as Promise<{ files: Array<{ path: string; content: string }> }>);
      expect(freshFiles.files.find((file) => file.path === "src/reservations.py")?.content).not.toContain("candidate note");
    } finally {
      server.close();
      await rm(userDataRoot, { recursive: true, force: true });
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
      activity: [],
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
          activity: 0,
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

  test("reloads development content from disk and keeps old graph on invalid content", async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), "dsa-coach-content-"));
    const contentRoot = join(tempRoot, "content");
    await cp(defaultContentRoot, contentRoot, { recursive: true });
    const graph = await loadContentGraph(contentRoot);
    const server = createRunnerDaemonServer({ graph, contentRoot, buildMode: "development" });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("missing test server address");
    const base = `http://127.0.0.1:${address.port}`;

    const problemPath = join(contentRoot, "problems/sum-positive-readings/problem.json");
    const problem = JSON.parse(await readFile(problemPath, "utf8")) as { title: string; languages: Record<string, { referencePath: string }> };
    problem.title = "Reloaded Sum Positive Readings";
    await writeFile(problemPath, `${JSON.stringify(problem, null, 2)}\n`, "utf8");

    try {
      const status = await fetch(`${base}/content/status`).then((res) => res.json() as Promise<{ reloadAvailable: boolean; generation: number }>);
      expect(status.reloadAvailable).toBe(true);
      expect(status.generation).toBe(1);

      const reload = await fetch(`${base}/content/reload`, { method: "POST" })
        .then((res) => res.json() as Promise<{ ok: boolean; generation: number; counts: { problems: number } }>);
      expect(reload.ok).toBe(true);
      expect(reload.generation).toBe(2);
      expect(reload.counts.problems).toBe(graph.problems.length);

      const catalog = await fetch(`${base}/catalog`).then((res) => res.json() as Promise<{ problems: Array<{ id: string; title: string }> }>);
      expect(catalog.problems.find((candidate) => candidate.id === "sum-positive-readings")?.title).toBe("Reloaded Sum Positive Readings");

      const source = await fetch(
        `${base}/source?problemId=sum-positive-readings&language=typescript&kind=reference`
      ).then((res) => res.json() as Promise<{ code: string }>);
      const result = await fetch(`${base}/run`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          language: "typescript",
          problemId: "sum-positive-readings",
          code: source.code,
          includeHidden: true
        })
      }).then((res) => res.json() as Promise<{ status: string }>);
      expect(result.status).toBe("passed");

      const runtimePath = join(tempRoot, "runtime.json");
      await writeFile(runtimePath, `${JSON.stringify({ baseUrl: base, pid: process.pid, mode: "development", contentRoot })}\n`, "utf8");
      const script = await runReloadScript(runtimePath);
      expect(script.code).toBe(0);
      expect(script.stdout).toContain("Content reloaded");

      problem.languages.typescript.referencePath = "missing-reference.ts";
      await writeFile(problemPath, `${JSON.stringify(problem, null, 2)}\n`, "utf8");
      const failed = await fetch(`${base}/content/reload`, { method: "POST" });
      expect(failed.status).toBe(400);
      const failedPayload = await failed.json() as { ok: boolean; generation: number; errors: string[] };
      expect(failedPayload.ok).toBe(false);
      expect(failedPayload.generation).toBe(3);
      expect(failedPayload.errors.join("\n")).toContain("missing-reference.ts");

      const preserved = await fetch(`${base}/catalog`).then((res) => res.json() as Promise<{ problems: Array<{ id: string; title: string }> }>);
      expect(preserved.problems.find((candidate) => candidate.id === "sum-positive-readings")?.title).toBe("Reloaded Sum Positive Readings");
    } finally {
      server.close();
      await rm(tempRoot, { recursive: true, force: true });
    }
  });

  test("disables content reload in release mode", async () => {
    const graph = await loadContentGraph();
    const server = createRunnerDaemonServer({ graph, contentRoot: defaultContentRoot, buildMode: "release" });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("missing test server address");
    const base = `http://127.0.0.1:${address.port}`;

    try {
      const status = await fetch(`${base}/content/status`).then((res) => res.json() as Promise<{ mode: string; reloadAvailable: boolean }>);
      expect(status.mode).toBe("release");
      expect(status.reloadAvailable).toBe(false);

      const reload = await fetch(`${base}/content/reload`, { method: "POST" });
      expect(reload.status).toBe(403);
      const payload = await reload.json() as { ok: boolean; errors: string[] };
      expect(payload.ok).toBe(false);
      expect(payload.errors[0]).toContain("development builds");
    } finally {
      server.close();
    }
  });
});

function runReloadScript(runtimePath: string): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["run", "scripts/reload-content.ts", "--runtime", runtimePath], {
      cwd: new URL("..", import.meta.url).pathname,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("reload script timed out"));
    }, 3000);
    child.stdout?.setEncoding("utf8");
    child.stderr?.setEncoding("utf8");
    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
  });
}
