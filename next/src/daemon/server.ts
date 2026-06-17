import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import type { ContentGraph, RunRequest, RunResult, ScratchpadRequest, TestVisibility } from "../core/types.js";
import { validateContentFiles, validateContentGraph } from "../core/validation.js";
import { languagePacks, runtimeLanguagePacks } from "../languages/languagePacks.js";
import { LspManager } from "../lsp/manager.js";
import type { LspCompletionRequest, LspDocumentRequest, LspPositionRequest } from "../lsp/types.js";
import { LocalRunner } from "../runner/localRunner.js";
import { ScratchpadRunner } from "../runner/scratchpadRunner.js";
import { codexStatus } from "../ai/codexProvider.js";
import { loadContentGraph } from "../content/loadContentGraph.js";
import { readProblemSource, type SourceKind } from "./source.js";
import { ScenarioRunner } from "../scenarios/scenarioRunner.js";
import type { CoachEvalSuiteReport } from "../coach/evalTypes.js";

export type BuildMode = "development" | "release";

export interface RunnerDaemonOptions {
  graph: ContentGraph;
  contentRoot: string;
  buildMode?: BuildMode;
  staticRoot?: string;
  userDataRoot?: string;
}

interface ContentRuntimeState {
  graph: ContentGraph;
  contentRoot: string;
  runner: LocalRunner;
  lsp: LspManager;
  loadedAt: string;
  generation: number;
}

export interface ContentStatus {
  ok: true;
  mode: BuildMode;
  contentRoot: string;
  reloadAvailable: boolean;
  loadedAt: string;
  generation: number;
  counts: {
    tracks: number;
    modules: number;
    problemSets: number;
    scenarioSets: number;
    problems: number;
    scenarios: number;
  };
}

export type ContentReloadResult =
  | (ContentStatus & { reloadedAt: string })
  | (Omit<ContentStatus, "ok"> & { ok: false; errors: string[] });

interface ContentRuntime {
  current(): ContentRuntimeState;
  status(): ContentStatus;
  reload(): Promise<ContentReloadResult>;
  dispose(): Promise<void>;
}

type ValidatedContentLoad =
  | { ok: true; graph: ContentGraph; reloadedAt: string }
  | { ok: false; errors: string[] };

export function createRunnerDaemonServer(options: RunnerDaemonOptions) {
  const content = createContentRuntime(options);
  const scratchpad = new ScratchpadRunner();

  const server = createServer((req, res) => {
    void handleRequest(req, res, options, content, scratchpad).catch((error) => {
      json(res, 500, { error: error instanceof Error ? error.message : String(error) });
    });
  });
  server.on("close", () => {
    void content.dispose();
  });
  return server;
}

function createContentRuntime(options: RunnerDaemonOptions): ContentRuntime {
  const mode = options.buildMode ?? "development";
  let state = createContentState(options.graph, options.contentRoot, 1);
  let reloadInFlight: Promise<ContentReloadResult> | undefined;

  return {
    current() {
      return state;
    },
    status() {
      return statusForState(state, mode);
    },
    async reload() {
      if (mode !== "development") {
        return failedReload(statusForState(state, mode), ["Content reload is only available in development builds."]);
      }
      if (reloadInFlight) return reloadInFlight;
      reloadInFlight = (async () => {
        const loaded = await loadValidatedContent(state.contentRoot);
        if (!loaded.ok) return failedReload(statusForState(state, mode), loaded.errors);
        const previous = state;
        state = createContentState(loaded.graph, state.contentRoot, state.generation + 1);
        setTimeout(() => {
          void previous.lsp.dispose();
        }, 1000).unref();
        return {
          ...statusForState(state, mode),
          reloadedAt: loaded.reloadedAt
        };
      })().finally(() => {
        reloadInFlight = undefined;
      });
      return reloadInFlight;
    },
    async dispose() {
      await state.lsp.dispose();
    }
  };
}

function createContentState(graph: ContentGraph, contentRoot: string, generation: number): ContentRuntimeState {
  return {
    graph,
    contentRoot,
    runner: new LocalRunner(graph),
    lsp: new LspManager({ graph }),
    loadedAt: new Date().toISOString(),
    generation
  };
}

async function loadValidatedContent(contentRoot: string): Promise<ValidatedContentLoad> {
  try {
    const graph = await loadContentGraph(contentRoot);
    const graphResult = validateContentGraph(graph, languagePacks);
    const fileResult = await validateContentFiles(graph, contentRoot);
    const errors = [...graphResult.errors, ...fileResult.errors];
    if (errors.length) return { ok: false, errors };
    return {
      ok: true,
      graph,
      reloadedAt: new Date().toISOString()
    };
  } catch (error) {
    return { ok: false, errors: [error instanceof Error ? error.message : String(error)] };
  }
}

function statusForState(state: ContentRuntimeState, mode: BuildMode, reloadedAt?: string): ContentStatus & { reloadedAt?: string } {
  return statusForGraph(state.graph, state.contentRoot, mode, state.loadedAt, state.generation, reloadedAt);
}

function statusForGraph(
  graph: ContentGraph,
  contentRoot: string,
  mode: BuildMode,
  loadedAt: string,
  generation: number,
  reloadedAt?: string
): ContentStatus & { reloadedAt?: string } {
  return {
    ok: true,
    mode,
    contentRoot,
    reloadAvailable: mode === "development",
    loadedAt,
    generation,
    counts: {
      tracks: graph.tracks.length,
      modules: graph.modules.length,
      problemSets: graph.problemSets.length,
      scenarioSets: graph.scenarioSets.length,
      problems: graph.problems.length,
      scenarios: graph.scenarios.length
    },
    ...(reloadedAt ? { reloadedAt } : {})
  };
}

function failedReload(status: ContentStatus, errors: string[]): ContentReloadResult {
  return {
    ok: false,
    mode: status.mode,
    contentRoot: status.contentRoot,
    reloadAvailable: status.reloadAvailable,
    loadedAt: status.loadedAt,
    generation: status.generation,
    counts: status.counts,
    errors
  };
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  options: RunnerDaemonOptions,
  content: ContentRuntime,
  scratchpad: ScratchpadRunner
) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", "http://127.0.0.1");

  if (req.method === "GET" && url.pathname === "/health") {
    return json(res, 200, { ok: true });
  }
  if (req.method === "GET" && url.pathname === "/languages") {
    return json(res, 200, await runtimeLanguagePacks());
  }
  if (req.method === "GET" && url.pathname === "/lsp/status") {
    return json(res, 200, await content.current().lsp.status());
  }
  if (req.method === "GET" && url.pathname === "/catalog") {
    return json(res, 200, publicContentGraph(content.current().graph));
  }
  if (req.method === "GET" && url.pathname === "/content/status") {
    return json(res, 200, content.status());
  }
  if (req.method === "POST" && url.pathname === "/content/reload") {
    const result = await content.reload();
    return json(res, result.ok ? 200 : result.reloadAvailable ? 400 : 403, result);
  }
  if (req.method === "GET" && url.pathname === "/coach/status") {
    return json(res, 200, await coachStatus());
  }
  if (req.method === "GET" && url.pathname === "/coach/evals") {
    return json(res, 200, { reports: await readCoachEvalReports(options) });
  }
  if (req.method === "GET" && url.pathname === "/codex/status") {
    return json(res, 200, await codexStatus());
  }
  if (req.method === "POST" && url.pathname === "/coach/chat") {
    const value = JSON.parse(await readBody(req)) as { messages?: CoachChatMessage[] };
    return json(res, 200, { message: await coachChat(value.messages ?? []) });
  }
  if (req.method === "GET" && url.pathname === "/scenarios/attempts") {
    const runner = scenarioRunnerFor(content.current(), options);
    return json(res, 200, { attempts: await runner.listAttempts() });
  }
  if (req.method === "GET" && url.pathname === "/scenarios/prompt") {
    const runner = scenarioRunnerFor(content.current(), options);
    return json(res, 200, { prompt: await runner.prompt(requiredParam(url, "scenarioId")) });
  }
  if (req.method === "GET" && url.pathname === "/scenarios/attempt") {
    const runner = scenarioRunnerFor(content.current(), options);
    return json(res, 200, { attempt: await runner.readAttempt(requiredParam(url, "attemptId")) });
  }
  if (req.method === "GET" && url.pathname === "/scenarios/files") {
    const runner = scenarioRunnerFor(content.current(), options);
    return json(res, 200, { files: await runner.editableFiles(requiredParam(url, "attemptId")) });
  }
  if (req.method === "POST" && url.pathname === "/scenarios/start") {
    const value = JSON.parse(await readBody(req)) as { scenarioId?: string };
    const runner = scenarioRunnerFor(content.current(), options);
    return json(res, 200, { attempt: await runner.start(requiredString(value.scenarioId, "scenarioId")) });
  }
  if (req.method === "POST" && url.pathname === "/scenarios/file") {
    const value = JSON.parse(await readBody(req)) as { attemptId?: string; path?: string; content?: string };
    const runner = scenarioRunnerFor(content.current(), options);
    return json(res, 200, {
      attempt: await runner.saveEditableFile(
        requiredString(value.attemptId, "attemptId"),
        requiredString(value.path, "path"),
        value.content ?? ""
      )
    });
  }
  if (req.method === "POST" && url.pathname === "/scenarios/end-session") {
    const value = JSON.parse(await readBody(req)) as { attemptId?: string };
    const runner = scenarioRunnerFor(content.current(), options);
    return json(res, 200, { attempt: await runner.endSession(requiredString(value.attemptId, "attemptId")) });
  }
  if (req.method === "GET" && url.pathname === "/scenarios/hidden-tests") {
    const runner = scenarioRunnerFor(content.current(), options);
    return json(res, 200, await runner.hiddenTestFiles(requiredParam(url, "attemptId")));
  }
  if (req.method === "POST" && url.pathname === "/scenarios/runs") {
    const value = JSON.parse(await readBody(req)) as { attemptId?: string; visibility?: TestVisibility; result?: RunResult };
    const visibility = value.visibility === "hidden" ? "hidden" : "visible";
    if (!value.result) throw new Error("Missing field result");
    const runner = scenarioRunnerFor(content.current(), options);
    return json(res, 200, await runner.recordRun(requiredString(value.attemptId, "attemptId"), visibility, value.result));
  }
  if (req.method === "POST" && url.pathname === "/scenarios/run-visible") {
    return json(res, 410, {
      error: "Scenario tests run in the browser Pyodide worker. Use /scenarios/runs to persist browser-run results."
    });
  }
  if (req.method === "POST" && url.pathname === "/scenarios/submit-hidden") {
    return json(res, 410, {
      error: "Hidden scenario tests run in the browser Pyodide worker after /scenarios/end-session unlocks them."
    });
  }
  if (req.method === "GET" && url.pathname === "/scenarios/diff") {
    const runner = scenarioRunnerFor(content.current(), options);
    return json(res, 200, { diff: await runner.diff(requiredParam(url, "attemptId")) });
  }
  if (req.method === "POST" && url.pathname === "/scenarios/checkpoint") {
    const value = JSON.parse(await readBody(req)) as { attemptId?: string; checkpointId?: string; answer?: string };
    const runner = scenarioRunnerFor(content.current(), options);
    return json(res, 200, {
      attempt: await runner.saveCheckpoint(
        requiredString(value.attemptId, "attemptId"),
        requiredString(value.checkpointId, "checkpointId"),
        value.answer ?? ""
      )
    });
  }
  if (req.method === "POST" && url.pathname === "/scenarios/coach") {
    const value = JSON.parse(await readBody(req)) as { attemptId?: string; message?: string };
    const runner = scenarioRunnerFor(content.current(), options);
    return json(res, 200, await runner.coach(requiredString(value.attemptId, "attemptId"), requiredString(value.message, "message")));
  }
  if (req.method === "POST" && url.pathname === "/scenarios/judge") {
    const value = JSON.parse(await readBody(req)) as { attemptId?: string; finalExplanation?: string };
    const runner = scenarioRunnerFor(content.current(), options);
    return json(res, 200, await runner.judge(requiredString(value.attemptId, "attemptId"), value.finalExplanation ?? ""));
  }
  if (req.method === "POST" && url.pathname === "/scenarios/open") {
    const value = JSON.parse(await readBody(req)) as { attemptId?: string; target?: "cursor" | "vscode" | "finder" };
    const runner = scenarioRunnerFor(content.current(), options);
    return json(res, 200, await runner.openAttempt(requiredString(value.attemptId, "attemptId"), value.target ?? "finder"));
  }
  if (req.method === "GET" && url.pathname === "/user-data") {
    return json(res, 200, { userData: await readStoredJson(options, "user-data.json") });
  }
  if ((req.method === "POST" || req.method === "PUT") && url.pathname === "/user-data") {
    const value = JSON.parse(await readBody(req));
    await writeStoredJson(options, "user-data.json", value);
    return json(res, 200, { ok: true, userData: value });
  }
  if (req.method === "GET" && url.pathname === "/user-data/export") {
    const value = await readStoredJson(options, "user-data.json");
    if (!value) return json(res, 404, { error: "No user data has been imported yet." });
    res.writeHead(200, {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="dsa-coach-next-user-data.json"`
    });
    res.end(JSON.stringify(value, null, 2));
    return;
  }
  if (req.method === "GET" && url.pathname === "/workspace-state") {
    return json(res, 200, { workspaceState: await readStoredJson(options, "workspace-state.json") });
  }
  if ((req.method === "POST" || req.method === "PUT") && url.pathname === "/workspace-state") {
    const value = JSON.parse(await readBody(req));
    await writeStoredJson(options, "workspace-state.json", value);
    return json(res, 200, { ok: true, workspaceState: value });
  }
  if (req.method === "GET" && url.pathname === "/source") {
    const state = content.current();
    const problemId = requiredParam(url, "problemId");
    const partId = url.searchParams.get("partId") ?? undefined;
    const language = requiredParam(url, "language");
    const kind = sourceKind(requiredParam(url, "kind"));
    const { problem, code } = await readProblemSource(state.graph, state.contentRoot, {
      problemId,
      partId,
      language,
      kind
    });
    return json(res, 200, {
      problemId: problem.id,
      language,
      kind,
      code
    });
  }
  if (req.method === "POST" && url.pathname === "/run") {
    const body = await readBody(req);
    const result = await content.current().runner.run(JSON.parse(body) as RunRequest);
    return json(res, 200, result);
  }
  if (req.method === "POST" && url.pathname === "/scratchpad") {
    const body = await readBody(req);
    const result = await scratchpad.run(JSON.parse(body) as ScratchpadRequest);
    return json(res, 200, result);
  }
  if (req.method === "POST" && url.pathname === "/lsp/completions") {
    const body = await readBody(req);
    const result = await content.current().lsp.complete(JSON.parse(body) as LspCompletionRequest);
    return json(res, 200, result);
  }
  if (req.method === "POST" && url.pathname === "/lsp/diagnostics") {
    const body = await readBody(req);
    const result = await content.current().lsp.diagnostics(JSON.parse(body) as LspDocumentRequest);
    return json(res, 200, result);
  }
  if (req.method === "POST" && url.pathname === "/lsp/hover") {
    const body = await readBody(req);
    const result = await content.current().lsp.hover(JSON.parse(body) as LspPositionRequest);
    return json(res, 200, result);
  }
  if (req.method === "POST" && url.pathname === "/lsp/signature-help") {
    const body = await readBody(req);
    const result = await content.current().lsp.signatureHelp(JSON.parse(body) as LspPositionRequest);
    return json(res, 200, result);
  }
  if (req.method === "POST" && url.pathname === "/lsp/format") {
    const body = await readBody(req);
    const result = await content.current().lsp.format(JSON.parse(body) as LspDocumentRequest);
    return json(res, 200, result);
  }
  if (req.method === "POST" && url.pathname === "/lsp/symbols") {
    const body = await readBody(req);
    const result = await content.current().lsp.symbols(JSON.parse(body) as LspDocumentRequest);
    return json(res, 200, result);
  }
  if (req.method === "POST" && url.pathname === "/lsp/definition") {
    const body = await readBody(req);
    const result = await content.current().lsp.definition(JSON.parse(body) as LspPositionRequest);
    return json(res, 200, result);
  }
  if (req.method === "GET" && options.staticRoot && (await serveStatic(res, url, options))) {
    return;
  }

  return json(res, 404, { error: "not found" });
}

function requiredParam(url: URL, name: string): string {
  const value = url.searchParams.get(name);
  if (!value) throw new Error(`Missing query parameter ${name}`);
  return value;
}

function requiredString(value: string | undefined, name: string): string {
  if (!value?.trim()) throw new Error(`Missing field ${name}`);
  return value;
}

function scenarioRunnerFor(state: ContentRuntimeState, options: RunnerDaemonOptions): ScenarioRunner {
  return new ScenarioRunner(state.graph, state.contentRoot, resolveUserDataRoot(options));
}

function publicContentGraph(graph: ContentGraph): ContentGraph {
  return {
    ...graph,
    scenarios: graph.scenarios.map((scenario) => ({
      ...scenario,
      hiddenTestsPath: "",
      hiddenTestCommand: { command: "", args: [] }
    }))
  };
}

function sourceKind(value: string): SourceKind {
  if (value === "starter" || value === "reference" || value === "solution") return value;
  throw new Error(`Invalid source kind ${value}`);
}

function setCorsHeaders(res: ServerResponse) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body, null, 2));
}

async function readStoredJson(options: RunnerDaemonOptions, fileName: string): Promise<unknown | null> {
  try {
    return JSON.parse(await readFile(resolveUserDataPath(options, fileName), "utf8")) as unknown;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}

async function writeStoredJson(options: RunnerDaemonOptions, fileName: string, value: unknown) {
  const target = resolveUserDataPath(options, fileName);
  await mkdir(resolveUserDataRoot(options), { recursive: true });
  const temp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temp, target);
}

async function readCoachEvalReports(options: RunnerDaemonOptions): Promise<CoachEvalSuiteReport[]> {
  const root = resolveUserDataPath(options, "coach-evals");
  let names: string[];
  try {
    names = await readdir(root);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
  const reports = await Promise.all(names
    .filter((name) => name.endsWith(".json"))
    .map(async (name) => {
      try {
        const value = JSON.parse(await readFile(resolve(root, name), "utf8")) as CoachEvalSuiteReport;
        if (value?.schemaVersion !== 1 || !value.generatedAt || !Array.isArray(value.cases)) return null;
        return value;
      } catch {
        return null;
      }
    }));
  return reports
    .filter((report): report is CoachEvalSuiteReport => Boolean(report))
    .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))
    .slice(0, 50);
}

function resolveUserDataPath(options: RunnerDaemonOptions, fileName: string): string {
  return resolve(resolveUserDataRoot(options), fileName);
}

function resolveUserDataRoot(options: RunnerDaemonOptions): string {
  return resolve(options.userDataRoot ?? process.env.DSA_COACH_USER_DATA_DIR ?? ".user-data");
}

async function serveStatic(res: ServerResponse, url: URL, options: RunnerDaemonOptions): Promise<boolean> {
  if (!options.staticRoot) return false;
  const root = resolve(options.staticRoot);
  const pathname = staticPathname(url.pathname);
  const target = resolve(root, `.${pathname}`);
  if (!isInsideRoot(root, target)) return false;

  const file = await resolveStaticFile(root, target, pathname);
  if (!file) return false;

  res.writeHead(200, {
    "content-type": contentType(file),
    "cache-control": staticCacheControl(options, file)
  });
  res.end(await readFile(file));
  return true;
}

function staticCacheControl(options: RunnerDaemonOptions, file: string): string {
  if (options.buildMode !== "release") return "no-store";
  return file.includes(`${sep}assets${sep}`) ? "public, max-age=31536000, immutable" : "no-cache";
}

function staticPathname(pathname: string): string {
  try {
    const decoded = decodeURIComponent(pathname);
    return decoded === "/" ? "/index.html" : decoded;
  } catch {
    return "/index.html";
  }
}

async function resolveStaticFile(root: string, target: string, pathname: string): Promise<string | undefined> {
  try {
    const info = await stat(target);
    if (info.isFile()) return target;
    if (info.isDirectory()) {
      const index = resolve(target, "index.html");
      return isInsideRoot(root, index) && (await stat(index)).isFile() ? index : undefined;
    }
  } catch {
    if (!extname(pathname)) {
      const index = resolve(root, "index.html");
      try {
        return (await stat(index)).isFile() ? index : undefined;
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

function isInsideRoot(root: string, target: string): boolean {
  return target === root || target.startsWith(`${root}${sep}`);
}

function contentType(file: string): string {
  switch (extname(file)) {
    case ".css":
      return "text/css; charset=utf-8";
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".map":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".wasm":
      return "application/wasm";
    default:
      return "application/octet-stream";
  }
}

const COACH_MODEL = "gemma4:latest";
const OLLAMA_URL = "http://127.0.0.1:11434";

interface CoachChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function coachStatus(): Promise<{ available: boolean; model: string | null; reason?: "unreachable" | "model-missing" }> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(2500)
    });
    if (!res.ok) return { available: false, model: null, reason: "unreachable" };
    const data = (await res.json()) as { models?: Array<{ name: string }> };
    const names = (data.models ?? []).map((model) => model.name);
    const base = COACH_MODEL.split(":")[0];
    const found = names.some((name) => name === COACH_MODEL || name === base || name.startsWith(`${base}:`));
    return found
      ? { available: true, model: COACH_MODEL }
      : { available: false, model: null, reason: "model-missing" };
  } catch {
    return { available: false, model: null, reason: "unreachable" };
  }
}

async function coachChat(messages: CoachChatMessage[]): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: COACH_MODEL, messages, stream: false }),
    signal: AbortSignal.timeout(60000)
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Ollama ${res.status}${detail ? `: ${detail}` : ""}`);
  }
  const data = (await res.json()) as { message?: { content?: string } };
  return data.message?.content?.trim() || "(no response)";
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}
