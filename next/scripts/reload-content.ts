import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

interface RuntimeStatus {
  baseUrl?: string;
  pid?: number;
  mode?: "development" | "release";
  contentRoot?: string;
  startedAt?: string;
}

interface ReloadPayload {
  ok?: boolean;
  error?: unknown;
  errors?: unknown;
  contentRoot?: unknown;
  counts?: {
    problems?: unknown;
    modules?: unknown;
    problemSets?: unknown;
  };
}

const runtimePath = optionValue("--runtime")
  ?? process.env.DSA_COACH_RUNTIME_STATUS_PATH
  ?? join(homedir(), "Library/Application Support/DSA Coach Next/runtime.json");
const explicitUrl = optionValue("--url");
const runtime = explicitUrl ? undefined : await readRuntimeStatus(runtimePath);
const baseUrl = explicitUrl ?? runtime?.baseUrl;

if (!baseUrl) {
  console.error(`No running DSA Coach host found. Checked ${resolve(runtimePath)}.`);
  process.exit(1);
}

const endpoint = new URL("/content/reload", baseUrl);
const res = await fetch(endpoint, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: "{}"
});
const payload = await readResponse(res);

if (!res.ok || payload?.ok === false) {
  const errors = stringList(payload?.errors) ?? [`${res.status} ${res.statusText}`];
  console.error("Content reload failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const countText = countSummary(payload?.counts);
const contentRoot = typeof payload?.contentRoot === "string" ? payload.contentRoot : runtime?.contentRoot;
console.log(`Content reloaded from ${contentRoot ?? "(unknown root)"} (${countText}).`);
process.exit(0);

function optionValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}

async function readRuntimeStatus(path: string): Promise<RuntimeStatus | undefined> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as RuntimeStatus;
  } catch {
    return undefined;
  }
}

async function readResponse(res: Response): Promise<ReloadPayload | undefined> {
  const text = await res.text();
  if (!text.trim()) return undefined;
  try {
    return JSON.parse(text) as ReloadPayload;
  } catch {
    return { error: text };
  }
}

function stringList(value: unknown): string[] | undefined {
  return Array.isArray(value) ? value.map((entry) => String(entry)) : undefined;
}

function countSummary(counts: ReloadPayload["counts"]): string {
  if (!counts) return "content";
  return `${String(counts.problems)} problems, ${String(counts.modules)} modules, ${String(counts.problemSets)} problem sets`;
}
