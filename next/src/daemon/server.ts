import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import type { ContentGraph, RunRequest } from "../core/types.js";
import { runtimeLanguagePacks } from "../languages/languagePacks.js";
import { LspManager } from "../lsp/manager.js";
import type { LspCompletionRequest, LspDocumentRequest, LspPositionRequest } from "../lsp/types.js";
import { LocalRunner } from "../runner/localRunner.js";
import { readProblemSource, type SourceKind } from "./source.js";

export interface RunnerDaemonOptions {
  graph: ContentGraph;
  contentRoot: string;
  staticRoot?: string;
  userDataRoot?: string;
}

export function createRunnerDaemonServer(options: RunnerDaemonOptions) {
  const runner = new LocalRunner(options.graph);
  const lsp = new LspManager({ graph: options.graph });

  const server = createServer((req, res) => {
    void handleRequest(req, res, options, runner, lsp).catch((error) => {
      json(res, 500, { error: error instanceof Error ? error.message : String(error) });
    });
  });
  server.on("close", () => {
    void lsp.dispose();
  });
  return server;
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  options: RunnerDaemonOptions,
  runner: LocalRunner,
  lsp: LspManager
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
    return json(res, 200, await lsp.status());
  }
  if (req.method === "GET" && url.pathname === "/catalog") {
    return json(res, 200, options.graph);
  }
  if (req.method === "GET" && url.pathname === "/coach/status") {
    return json(res, 200, await coachStatus());
  }
  if (req.method === "POST" && url.pathname === "/coach/chat") {
    const value = JSON.parse(await readBody(req)) as { messages?: CoachChatMessage[] };
    return json(res, 200, { message: await coachChat(value.messages ?? []) });
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
    const problemId = requiredParam(url, "problemId");
    const partId = url.searchParams.get("partId") ?? undefined;
    const language = requiredParam(url, "language");
    const kind = sourceKind(requiredParam(url, "kind"));
    const { problem, code } = await readProblemSource(options.graph, options.contentRoot, {
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
    const result = await runner.run(JSON.parse(body) as RunRequest);
    return json(res, 200, result);
  }
  if (req.method === "POST" && url.pathname === "/lsp/completions") {
    const body = await readBody(req);
    const result = await lsp.complete(JSON.parse(body) as LspCompletionRequest);
    return json(res, 200, result);
  }
  if (req.method === "POST" && url.pathname === "/lsp/diagnostics") {
    const body = await readBody(req);
    const result = await lsp.diagnostics(JSON.parse(body) as LspDocumentRequest);
    return json(res, 200, result);
  }
  if (req.method === "POST" && url.pathname === "/lsp/hover") {
    const body = await readBody(req);
    const result = await lsp.hover(JSON.parse(body) as LspPositionRequest);
    return json(res, 200, result);
  }
  if (req.method === "POST" && url.pathname === "/lsp/signature-help") {
    const body = await readBody(req);
    const result = await lsp.signatureHelp(JSON.parse(body) as LspPositionRequest);
    return json(res, 200, result);
  }
  if (req.method === "POST" && url.pathname === "/lsp/format") {
    const body = await readBody(req);
    const result = await lsp.format(JSON.parse(body) as LspDocumentRequest);
    return json(res, 200, result);
  }
  if (req.method === "POST" && url.pathname === "/lsp/symbols") {
    const body = await readBody(req);
    const result = await lsp.symbols(JSON.parse(body) as LspDocumentRequest);
    return json(res, 200, result);
  }
  if (req.method === "POST" && url.pathname === "/lsp/definition") {
    const body = await readBody(req);
    const result = await lsp.definition(JSON.parse(body) as LspPositionRequest);
    return json(res, 200, result);
  }
  if (req.method === "GET" && options.staticRoot && (await serveStatic(res, url, options.staticRoot))) {
    return;
  }

  return json(res, 404, { error: "not found" });
}

function requiredParam(url: URL, name: string): string {
  const value = url.searchParams.get(name);
  if (!value) throw new Error(`Missing query parameter ${name}`);
  return value;
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

function resolveUserDataPath(options: RunnerDaemonOptions, fileName: string): string {
  return resolve(resolveUserDataRoot(options), fileName);
}

function resolveUserDataRoot(options: RunnerDaemonOptions): string {
  return resolve(options.userDataRoot ?? process.env.DSA_COACH_USER_DATA_DIR ?? ".user-data");
}

async function serveStatic(res: ServerResponse, url: URL, staticRoot: string): Promise<boolean> {
  const root = resolve(staticRoot);
  const pathname = staticPathname(url.pathname);
  const target = resolve(root, `.${pathname}`);
  if (!isInsideRoot(root, target)) return false;

  const file = await resolveStaticFile(root, target, pathname);
  if (!file) return false;

  res.writeHead(200, {
    "content-type": contentType(file),
    "cache-control": file.includes(`${sep}assets${sep}`) ? "public, max-age=31536000, immutable" : "no-cache"
  });
  res.end(await readFile(file));
  return true;
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
