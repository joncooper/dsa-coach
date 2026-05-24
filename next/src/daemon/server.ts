import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { ContentGraph, RunRequest } from "../core/types.js";
import { runtimeLanguagePacks } from "../languages/languagePacks.js";
import { LspManager } from "../lsp/manager.js";
import type { LspCompletionRequest, LspDocumentRequest, LspPositionRequest } from "../lsp/types.js";
import { LocalRunner } from "../runner/localRunner.js";
import { readProblemSource, type SourceKind } from "./source.js";

export interface RunnerDaemonOptions {
  graph: ContentGraph;
  contentRoot: string;
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
  res.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body, null, 2));
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
