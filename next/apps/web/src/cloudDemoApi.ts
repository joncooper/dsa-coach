import type { ContentGraph, LanguagePack, RunResult, Scenario, TestVisibility } from "../../../src/core/types";
import { IS_CLOUD_DEMO } from "./apiBase";

interface ScenarioCheckpointResponse {
  checkpointId: string;
  answer: string;
  createdAt: string;
}

interface ScenarioAiTurn {
  id: string;
  kind: "coach" | "judge";
  userMessage: string;
  response: string;
  createdAt: string;
}

interface ScenarioRunRecord extends RunResult {
  runId: string;
  visibility: TestVisibility;
  command: string;
  exitCode: number | null;
  ranAt: string;
}

interface ScenarioJudgeReport {
  overall: "strong_hire" | "hire" | "mixed" | "no_hire";
  summary: string;
  scores: Array<{
    metricId: string;
    label: string;
    score: number;
    evidence: string;
    improvement: string;
  }>;
  highestRiskWeakness: string;
  nextDrill: string;
  raw?: unknown;
  createdAt: string;
}

interface ScenarioEditableFile {
  path: string;
  content: string;
}

interface ScenarioHiddenTestFile extends ScenarioEditableFile {
  visibility: "hidden";
}

interface StoredScenarioAttempt {
  attemptId: string;
  scenarioId: string;
  scenarioTitle: string;
  workspacePath: string;
  startedAt: string;
  updatedAt: string;
  endedAt?: string;
  checkpoints: ScenarioCheckpointResponse[];
  aiTurns: ScenarioAiTurn[];
  visibleRuns: ScenarioRunRecord[];
  hiddenRuns: ScenarioRunRecord[];
  judge?: ScenarioJudgeReport;
  files: ScenarioEditableFile[];
  baselineFiles: ScenarioEditableFile[];
}

interface CloudScenarioAssets {
  prompts: Record<string, string>;
  templates: Record<string, ScenarioEditableFile[]>;
  hiddenTests: Record<string, ScenarioHiddenTestFile[]>;
}

type CloudResponse = Response | undefined;

const USER_DATA_KEY = "dsa-coach-cloud:user-data";
const WORKSPACE_STATE_KEY = "dsa-coach-cloud:workspace-state";
const SCENARIO_ATTEMPTS_KEY = "dsa-coach-cloud:scenario-attempts";
const CLOUD_LANGUAGE_ID = "python";

let installed = false;

export function installCloudDemoApi() {
  if (!IS_CLOUD_DEMO || installed || typeof window === "undefined") return;
  installed = true;
  const nativeFetch = window.fetch.bind(window);
  const assetCache = new Map<string, Promise<unknown>>();

  async function cloudAsset<T>(name: string): Promise<T> {
    const cached = assetCache.get(name);
    if (cached) return cached as Promise<T>;
    const promise = nativeFetch(`/cloud-data/${name}`, { headers: { accept: "application/json" } }).then(async (response) => {
      if (!response.ok) throw new Error(`Missing cloud asset ${name}: ${response.status}`);
      return response.json();
    });
    assetCache.set(name, promise);
    return promise as Promise<T>;
  }

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = input instanceof Request ? input : undefined;
    const url = new URL(request?.url ?? String(input), window.location.href);
    if (url.origin !== window.location.origin || shouldPassThrough(url.pathname)) {
      return nativeFetch(input, init);
    }

    const method = (init?.method ?? request?.method ?? "GET").toUpperCase();
    const body = method === "GET" || method === "HEAD" ? undefined : await readJsonBody(input, init);
    try {
      const handled = await handleCloudRequest(url, method, body, cloudAsset, nativeFetch);
      return handled ?? nativeFetch(input, init);
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : String(error) }, 500);
    }
  };
}

function shouldPassThrough(pathname: string): boolean {
  return pathname.startsWith("/assets/")
    || pathname.startsWith("/pyodide/")
    || pathname.startsWith("/cloud-data/")
    || pathname.startsWith("/api/")
    || pathname === "/login"
    || pathname === "/favicon.ico"
    || pathname === "/app-icon.svg";
}

async function readJsonBody(input: RequestInfo | URL, init?: RequestInit): Promise<unknown> {
  if (typeof init?.body === "string") return JSON.parse(init.body || "null");
  if (init?.body instanceof Blob) return JSON.parse(await init.body.text());
  if (input instanceof Request) return JSON.parse(await input.clone().text() || "null");
  return undefined;
}

async function handleCloudRequest(
  url: URL,
  method: string,
  body: unknown,
  cloudAsset: <T>(name: string) => Promise<T>,
  nativeFetch: typeof fetch
): Promise<CloudResponse> {
  if (method === "GET" && url.pathname === "/health") return json({ ok: true, mode: "cloud-demo" });
  if (method === "GET" && url.pathname === "/catalog") return json(await cloudAsset<ContentGraph>("catalog.json"));
  if (method === "GET" && url.pathname === "/languages") return json(cloudLanguages(await cloudAsset<LanguagePack[]>("languages.json")));
  if (method === "GET" && url.pathname === "/content/status") return json(contentStatus(await cloudAsset<ContentGraph>("catalog.json")));
  if (method === "POST" && url.pathname === "/content/reload") return json({ ...contentStatus(await cloudAsset<ContentGraph>("catalog.json")), ok: false, errors: ["Content reload is unavailable in Cloudflare demo mode."] }, 403);
  if (method === "GET" && url.pathname === "/coach/evals") return json({ reports: [] });
  if (method === "GET" && url.pathname === "/coach/status") return modelStatus(nativeFetch);
  if (method === "GET" && url.pathname === "/codex/status") return codexStatus(nativeFetch);
  if (method === "POST" && url.pathname === "/coach/chat") return coachChat(body, nativeFetch);
  if (method === "GET" && url.pathname === "/user-data") return json({ userData: readStoredJson(USER_DATA_KEY) });
  if ((method === "POST" || method === "PUT") && url.pathname === "/user-data") return storeJson(USER_DATA_KEY, "userData", body);
  if (method === "GET" && url.pathname === "/user-data/export") return exportJson("dsa-coach-cloud-user-data.json", readStoredJson(USER_DATA_KEY));
  if (method === "GET" && url.pathname === "/workspace-state") return json({ workspaceState: readStoredJson(WORKSPACE_STATE_KEY) });
  if ((method === "POST" || method === "PUT") && url.pathname === "/workspace-state") return storeJson(WORKSPACE_STATE_KEY, "workspaceState", body);
  if (method === "GET" && url.pathname === "/source") return sourceResponse(url, cloudAsset);
  if (method === "POST" && url.pathname === "/run") return json(unsupportedRun("Cloud demo mode runs Python in the browser through Pyodide."));
  if (method === "POST" && url.pathname === "/scratchpad") return json(unsupportedRun("Cloud demo mode runs Python scratchpads in the browser through Pyodide."));
  if (url.pathname.startsWith("/lsp/")) return lspResponse(url.pathname, body);
  if (url.pathname.startsWith("/scenarios/")) return scenarioResponse(url, method, body, cloudAsset, nativeFetch);
  return undefined;
}

function cloudLanguages(packs: LanguagePack[]): LanguagePack[] {
  return packs.filter((pack) => pack.id === CLOUD_LANGUAGE_ID).map((pack) => {
    const { formatter, lsp, ...publicPack } = pack;
    void formatter;
    void lsp;
    return {
      ...publicPack,
      runner: {
        ...pack.runner,
        strategy: "browser-worker",
        installedByDefault: true
      }
    };
  });
}

function contentStatus(graph: ContentGraph) {
  return {
    ok: true,
    mode: "cloud-demo",
    contentRoot: "cloud-data",
    reloadAvailable: false,
    loadedAt: new Date(0).toISOString(),
    generation: 1,
    counts: {
      tracks: graph.tracks.length,
      modules: graph.modules.length,
      problemSets: graph.problemSets.length,
      scenarioSets: graph.scenarioSets.length,
      problems: graph.problems.length,
      scenarios: graph.scenarios.length
    }
  };
}

async function sourceResponse(url: URL, cloudAsset: <T>(name: string) => Promise<T>): Promise<Response> {
  const problemId = requiredParam(url, "problemId");
  const partId = url.searchParams.get("partId") || "";
  const language = requiredParam(url, "language");
  const kind = requiredParam(url, "kind");
  if (language !== CLOUD_LANGUAGE_ID) {
    return json({ error: "Cloud demo mode only serves Python source." }, 404);
  }
  const sources = await cloudAsset<Record<string, string>>("sources.json");
  const key = [problemId, partId, language, kind].join("::");
  const code = sources[key];
  if (code === undefined) return json({ error: `No ${kind} source for ${problemId}${partId ? `#${partId}` : ""}/${language}` }, 404);
  return json({ problemId, language, kind, code });
}

async function modelStatus(nativeFetch: typeof fetch): Promise<Response> {
  try {
    const response = await nativeFetch("/api/llm/status", { headers: { accept: "application/json" } });
    if (!response.ok) return json({ available: false, model: null, reason: "unreachable" });
    return json(await response.json());
  } catch {
    return json({ available: false, model: null, reason: "unreachable" });
  }
}

async function codexStatus(nativeFetch: typeof fetch): Promise<Response> {
  const response = await modelStatus(nativeFetch);
  const status = await response.clone().json().catch(() => ({ available: false, model: null }));
  return json({
    available: Boolean(status.available),
    provider: "openrouter",
    model: status.model ?? null,
    reason: status.reason
  });
}

async function coachChat(body: unknown, nativeFetch: typeof fetch): Promise<Response> {
  const messages = isRecord(body) && Array.isArray(body.messages) ? body.messages : [];
  const response = await callCloudModel(nativeFetch, messages);
  return json({ message: response });
}

async function scenarioResponse(
  url: URL,
  method: string,
  body: unknown,
  cloudAsset: <T>(name: string) => Promise<T>,
  nativeFetch: typeof fetch
): Promise<Response> {
  const graph = await cloudAsset<ContentGraph>("catalog.json");
  const scenarioAssets = await cloudAsset<CloudScenarioAssets>("scenarios.json");
  if (method === "GET" && url.pathname === "/scenarios/attempts") return json({ attempts: readAttempts().map(stripAttempt).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) });
  if (method === "GET" && url.pathname === "/scenarios/prompt") {
    const scenarioId = requiredParam(url, "scenarioId");
    return json({ prompt: scenarioAssets.prompts[scenarioId] ?? "" });
  }
  if (method === "GET" && url.pathname === "/scenarios/attempt") return json({ attempt: stripAttempt(requireAttempt(requiredParam(url, "attemptId"))) });
  if (method === "GET" && url.pathname === "/scenarios/files") return json({ files: requireAttempt(requiredParam(url, "attemptId")).files });
  if (method === "POST" && url.pathname === "/scenarios/start") return startScenario(body, graph, scenarioAssets);
  if (method === "POST" && url.pathname === "/scenarios/file") return saveScenarioFile(body);
  if (method === "POST" && url.pathname === "/scenarios/end-session") return endScenario(body);
  if (method === "GET" && url.pathname === "/scenarios/hidden-tests") return hiddenScenarioTests(url, scenarioAssets);
  if (method === "POST" && url.pathname === "/scenarios/runs") return recordScenarioRun(body);
  if (method === "GET" && url.pathname === "/scenarios/diff") return json({ diff: diffForAttempt(requireAttempt(requiredParam(url, "attemptId"))) });
  if (method === "POST" && url.pathname === "/scenarios/checkpoint") return saveScenarioCheckpoint(body);
  if (method === "POST" && url.pathname === "/scenarios/coach") return scenarioCoach(body, graph, scenarioAssets, nativeFetch);
  if (method === "POST" && url.pathname === "/scenarios/judge") return scenarioJudge(body, graph, scenarioAssets, nativeFetch);
  if (method === "POST" && url.pathname === "/scenarios/open") return json({ ok: true, command: ["cloud-demo"] });
  return json({ error: "not found" }, 404);
}

function startScenario(body: unknown, graph: ContentGraph, assets: CloudScenarioAssets): Response {
  const scenarioId = requiredBodyString(body, "scenarioId");
  const scenario = scenarioById(graph, scenarioId);
  const now = new Date().toISOString();
  const files = cloneFiles(assets.templates[scenarioId] ?? []);
  const attempt: StoredScenarioAttempt = {
    attemptId: `${scenarioId}-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`,
    scenarioId,
    scenarioTitle: scenario.title,
    workspacePath: `cloud://${scenarioId}`,
    startedAt: now,
    updatedAt: now,
    checkpoints: [],
    aiTurns: [],
    visibleRuns: [],
    hiddenRuns: [],
    files,
    baselineFiles: cloneFiles(files)
  };
  saveAttempt(attempt);
  return json({ attempt: stripAttempt(attempt) });
}

function saveScenarioFile(body: unknown): Response {
  const attempt = requireAttempt(requiredBodyString(body, "attemptId"));
  const path = requiredBodyString(body, "path");
  const content = isRecord(body) && typeof body.content === "string" ? body.content : "";
  attempt.files = attempt.files.map((file) => file.path === path ? { ...file, content } : file);
  attempt.updatedAt = new Date().toISOString();
  saveAttempt(attempt);
  return json({ attempt: stripAttempt(attempt) });
}

function endScenario(body: unknown): Response {
  const attempt = requireAttempt(requiredBodyString(body, "attemptId"));
  if (!attempt.endedAt) attempt.endedAt = new Date().toISOString();
  attempt.updatedAt = attempt.endedAt;
  saveAttempt(attempt);
  return json({ attempt: stripAttempt(attempt) });
}

function hiddenScenarioTests(url: URL, assets: CloudScenarioAssets): Response {
  const attempt = requireAttempt(requiredParam(url, "attemptId"));
  if (!attempt.endedAt) return json({ error: "Hidden tests unlock after ending the session." }, 403);
  return json({ files: cloneFiles(assets.hiddenTests[attempt.scenarioId] ?? []) });
}

function recordScenarioRun(body: unknown): Response {
  const attempt = requireAttempt(requiredBodyString(body, "attemptId"));
  const visibility = isRecord(body) && body.visibility === "hidden" ? "hidden" : "visible";
  if (visibility === "hidden" && !attempt.endedAt) return json({ error: "Hidden tests unlock after ending the session." }, 403);
  if (!isRecord(body) || !isRecord(body.result)) return json({ error: "Missing field result" }, 400);
  const result = body.result as unknown as RunResult;
  const ranAt = new Date().toISOString();
  const run: ScenarioRunRecord = {
    ...result,
    runId: crypto.randomUUID(),
    visibility,
    command: "Pyodide unittest",
    exitCode: result.status === "passed" ? 0 : 1,
    ranAt
  };
  if (visibility === "hidden") attempt.hiddenRuns = [run, ...attempt.hiddenRuns].slice(0, 20);
  else attempt.visibleRuns = [run, ...attempt.visibleRuns].slice(0, 20);
  attempt.updatedAt = ranAt;
  saveAttempt(attempt);
  return json({ attempt: stripAttempt(attempt), run });
}

function saveScenarioCheckpoint(body: unknown): Response {
  const attempt = requireAttempt(requiredBodyString(body, "attemptId"));
  const checkpointId = requiredBodyString(body, "checkpointId");
  const answer = isRecord(body) && typeof body.answer === "string" ? body.answer : "";
  const response = { checkpointId, answer, createdAt: new Date().toISOString() };
  attempt.checkpoints = [response, ...attempt.checkpoints.filter((checkpoint) => checkpoint.checkpointId !== checkpointId)];
  attempt.updatedAt = response.createdAt;
  saveAttempt(attempt);
  return json({ attempt: stripAttempt(attempt) });
}

async function scenarioCoach(body: unknown, graph: ContentGraph, assets: CloudScenarioAssets, nativeFetch: typeof fetch): Promise<Response> {
  const attempt = requireAttempt(requiredBodyString(body, "attemptId"));
  const message = requiredBodyString(body, "message");
  const scenario = scenarioById(graph, attempt.scenarioId);
  const response = await callCloudModel(nativeFetch, [
    { role: "system", content: "You are a Ramp-style senior interviewer and coach inside DSA Coach. Be specific, concise, and do not rewrite the solution unless explicitly asked. Keep responses under 160 words unless the candidate asks for depth." },
    {
      role: "user",
      content: [
        `Scenario: ${scenario.title}`,
        assets.prompts[scenario.id] ?? "",
        "",
        `Recent test state:\n${summarizeRuns(attempt)}`,
        "",
        `Current diff:\n${diffForAttempt(attempt) || "(no diff)"}`,
        "",
        `Candidate request:\n${message}`
      ].join("\n")
    }
  ]);
  const turn = { id: crypto.randomUUID(), kind: "coach" as const, userMessage: message, response, createdAt: new Date().toISOString() };
  attempt.aiTurns = [turn, ...attempt.aiTurns].slice(0, 50);
  attempt.updatedAt = turn.createdAt;
  saveAttempt(attempt);
  return json({ attempt: stripAttempt(attempt), response });
}

async function scenarioJudge(body: unknown, graph: ContentGraph, assets: CloudScenarioAssets, nativeFetch: typeof fetch): Promise<Response> {
  const attempt = requireAttempt(requiredBodyString(body, "attemptId"));
  const finalExplanation = isRecord(body) && typeof body.finalExplanation === "string" ? body.finalExplanation : "";
  const scenario = scenarioById(graph, attempt.scenarioId);
  const rawText = await callCloudModel(nativeFetch, [
    { role: "system", content: "You are judging a Ramp-style live coding attempt. Return strict JSON only." },
    {
      role: "user",
      content: [
        "Return JSON with keys: overall, summary, scores, highestRiskWeakness, nextDrill.",
        "overall must be one of: strong_hire, hire, mixed, no_hire.",
        "scores must use metricId, label, score, evidence, improvement. Score is 1-5.",
        "",
        `Scenario: ${scenario.title}`,
        assets.prompts[scenario.id] ?? "",
        "",
        `Rubric:\n${JSON.stringify(scenario.rubric, null, 2)}`,
        "",
        `Checkpoint answers:\n${JSON.stringify(attempt.checkpoints, null, 2)}`,
        "",
        `AI worklog:\n${JSON.stringify(attempt.aiTurns, null, 2)}`,
        "",
        `Test history:\n${summarizeRuns(attempt)}`,
        "",
        `Diff:\n${diffForAttempt(attempt) || "(no diff)"}`,
        "",
        `Candidate final explanation:\n${finalExplanation || "(none provided)"}`
      ].join("\n")
    }
  ], true);
  const parsed = parseJudge(rawText, scenario);
  const report: ScenarioJudgeReport = { ...parsed, raw: parsed, createdAt: new Date().toISOString() };
  attempt.judge = report;
  attempt.aiTurns = [{
    id: crypto.randomUUID(),
    kind: "judge",
    userMessage: finalExplanation,
    response: JSON.stringify(report, null, 2),
    createdAt: report.createdAt
  }, ...attempt.aiTurns].slice(0, 50);
  attempt.updatedAt = report.createdAt;
  saveAttempt(attempt);
  return json({ attempt: stripAttempt(attempt), report });
}

async function callCloudModel(nativeFetch: typeof fetch, messages: unknown[], jsonMode = false): Promise<string> {
  try {
    const response = await nativeFetch("/api/llm/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages, responseFormat: jsonMode ? { type: "json_object" } : undefined })
    });
    const value = await response.json().catch(() => undefined);
    if (!response.ok) return `OpenRouter unavailable: ${value?.error ?? response.statusText}`;
    return typeof value?.message === "string" ? value.message : "(no response)";
  } catch (error) {
    return `OpenRouter unavailable: ${error instanceof Error ? error.message : String(error)}`;
  }
}

function parseJudge(text: string, scenario: Scenario): Omit<ScenarioJudgeReport, "createdAt" | "raw"> {
  try {
    const value = JSON.parse(text) as Omit<ScenarioJudgeReport, "createdAt" | "raw">;
    if (typeof value.summary === "string" && Array.isArray(value.scores)) return value;
  } catch {
    // Fall through to a safe report.
  }
  return {
    overall: "mixed",
    summary: text,
    scores: scenario.rubric.map((metric) => ({
      metricId: metric.id,
      label: metric.label,
      score: 3,
      evidence: "Cloud judge response was not parseable as structured JSON.",
      improvement: "Review the transcript and rerun debrief after checking model settings."
    })),
    highestRiskWeakness: "Structured debrief parsing failed.",
    nextDrill: "Repeat the scenario and ask for a shorter JSON-only debrief."
  };
}

function lspResponse(pathname: string, body: unknown): Response {
  const language = isRecord(body) && typeof body.language === "string" ? body.language : "python";
  if (pathname.endsWith("/completions")) return json({ language, status: "unavailable", items: [], message: "LSP is disabled in Cloudflare demo mode." });
  if (pathname.endsWith("/diagnostics")) return json({ language, status: "unavailable", diagnostics: [], message: "LSP is disabled in Cloudflare demo mode." });
  if (pathname.endsWith("/format")) return json({ language, status: "unavailable", code: isRecord(body) && typeof body.code === "string" ? body.code : "", edits: [], message: "LSP is disabled in Cloudflare demo mode." });
  if (pathname.endsWith("/symbols")) return json({ language, status: "unavailable", symbols: [], message: "LSP is disabled in Cloudflare demo mode." });
  if (pathname.endsWith("/definition")) return json({ language, status: "unavailable", definitions: [], message: "LSP is disabled in Cloudflare demo mode." });
  if (pathname.endsWith("/hover")) return json({ language, status: "unavailable", message: "LSP is disabled in Cloudflare demo mode." });
  if (pathname.endsWith("/signature-help")) return json({ language, status: "unavailable", message: "LSP is disabled in Cloudflare demo mode." });
  return json({ error: "not found" }, 404);
}

function readAttempts(): StoredScenarioAttempt[] {
  const value = readStoredJson(SCENARIO_ATTEMPTS_KEY);
  return Array.isArray(value) ? value.filter(isStoredAttempt) : [];
}

function saveAttempts(attempts: StoredScenarioAttempt[]) {
  window.localStorage.setItem(SCENARIO_ATTEMPTS_KEY, JSON.stringify(attempts));
}

function saveAttempt(attempt: StoredScenarioAttempt) {
  saveAttempts([attempt, ...readAttempts().filter((candidate) => candidate.attemptId !== attempt.attemptId)].slice(0, 25));
}

function requireAttempt(attemptId: string): StoredScenarioAttempt {
  const attempt = readAttempts().find((candidate) => candidate.attemptId === attemptId);
  if (!attempt) throw new Error(`Unknown attempt ${attemptId}`);
  return attempt;
}

function isStoredAttempt(value: unknown): value is StoredScenarioAttempt {
  return isRecord(value)
    && typeof value.attemptId === "string"
    && typeof value.scenarioId === "string"
    && Array.isArray(value.files)
    && Array.isArray(value.baselineFiles);
}

function stripAttempt(attempt: StoredScenarioAttempt) {
  const { files, baselineFiles, ...summary } = attempt;
  void files;
  void baselineFiles;
  return summary;
}

function scenarioById(graph: ContentGraph, scenarioId: string): Scenario {
  const scenario = graph.scenarios.find((candidate) => candidate.id === scenarioId);
  if (!scenario) throw new Error(`Unknown scenario ${scenarioId}`);
  return scenario;
}

function cloneFiles<T extends ScenarioEditableFile>(files: T[]): T[] {
  return files.map((file) => ({ ...file }));
}

function diffForAttempt(attempt: StoredScenarioAttempt): string {
  const baseline = new Map(attempt.baselineFiles.map((file) => [file.path, file.content]));
  const sections: string[] = [];
  for (const file of attempt.files) {
    const before = baseline.get(file.path) ?? "";
    if (before === file.content) continue;
    sections.push([
      `--- a/${file.path}`,
      `+++ b/${file.path}`,
      "@@",
      ...before.split("\n").slice(0, 80).map((line) => `-${line}`),
      ...file.content.split("\n").slice(0, 160).map((line) => `+${line}`)
    ].join("\n"));
  }
  return sections.join("\n\n");
}

function summarizeRuns(attempt: StoredScenarioAttempt): string {
  const visible = attempt.visibleRuns[0];
  const hidden = attempt.hiddenRuns[0];
  return [
    `Visible: ${visible ? `${visible.status} (${visible.durationMs} ms)` : "not run"}`,
    `Hidden: ${hidden ? `${hidden.status} (${hidden.durationMs} ms)` : "not submitted"}`,
    visible?.stdout ? `Visible stdout:\n${visible.stdout.slice(-4000)}` : "",
    visible?.stderr ? `Visible stderr:\n${visible.stderr.slice(-4000)}` : "",
    hidden?.stdout ? `Hidden stdout:\n${hidden.stdout.slice(-4000)}` : "",
    hidden?.stderr ? `Hidden stderr:\n${hidden.stderr.slice(-4000)}` : ""
  ].filter(Boolean).join("\n\n");
}

function readStoredJson(key: string): unknown | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function storeJson(key: string, label: string, value: unknown): Response {
  window.localStorage.setItem(key, JSON.stringify(value));
  return json({ ok: true, [label]: value });
}

function exportJson(fileName: string, value: unknown): Response {
  if (!value) return json({ error: "No cloud demo user data is available." }, 404);
  return new Response(JSON.stringify(value, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${fileName}"`
    }
  });
}

function unsupportedRun(message: string): RunResult {
  return { status: "unsupported", stdout: "", stderr: "", durationMs: 0, tests: [], message };
}

function requiredParam(url: URL, name: string): string {
  const value = url.searchParams.get(name);
  if (!value) throw new Error(`Missing query parameter ${name}`);
  return value;
}

function requiredBodyString(value: unknown, key: string): string {
  if (!isRecord(value) || typeof value[key] !== "string" || !value[key].trim()) throw new Error(`Missing field ${key}`);
  return value[key];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
