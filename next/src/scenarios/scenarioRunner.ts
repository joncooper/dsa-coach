import { cp, mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";
import type { ContentGraph, RunResult, Scenario, ScenarioCheckpoint, TestVisibility } from "../core/types.js";
import { runCodexText } from "../ai/codexProvider.js";
import { runSandboxedProcess } from "../runner/processSandbox.js";
import { COACH_MARKDOWN_FORMATTING_RULES } from "../../../shared/coachFormatting.js";

const JUDGE_TIMEOUT_MS = 45_000;

export interface ScenarioAttempt {
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
}

export interface ScenarioCheckpointResponse {
  checkpointId: string;
  answer: string;
  createdAt: string;
}

export interface ScenarioAiTurn {
  id: string;
  kind: "coach" | "judge";
  userMessage: string;
  response: string;
  createdAt: string;
}

export interface ScenarioCommandResult {
  status: "passed" | "failed" | "timeout";
  command: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  ranAt: string;
}

export interface ScenarioRunRecord extends RunResult {
  runId: string;
  visibility: TestVisibility;
  command: string;
  exitCode: number | null;
  ranAt: string;
}

export interface ScenarioEditableFile {
  path: string;
  content: string;
}

export interface ScenarioJudgeReport {
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
  raw: unknown;
  createdAt: string;
}

export interface ScenarioHiddenTestFile {
  path: string;
  content: string;
  visibility: "hidden";
}

export class ScenarioRunner {
  constructor(
    private readonly graph: ContentGraph,
    private readonly contentRoot: string,
    private readonly userDataRoot: string
  ) {}

  async listAttempts(): Promise<ScenarioAttempt[]> {
    await mkdir(this.attemptRoot(), { recursive: true });
    const ids = await readdirSafe(this.attemptRoot());
    const attempts = await Promise.all(ids.map((id) => this.readAttempt(id).catch(() => undefined)));
    return attempts.filter((attempt): attempt is ScenarioAttempt => Boolean(attempt))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async start(scenarioId: string): Promise<ScenarioAttempt> {
    const scenario = this.scenario(scenarioId);
    const attemptId = `${scenarioId}-${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`;
    const workspacePath = resolve(this.attemptRoot(), attemptId, "workspace");
    await mkdir(workspacePath, { recursive: true });
    await cp(this.contentPath(scenario.templatePath), workspacePath, { recursive: true });
    await mkdir(join(workspacePath, "home"), { recursive: true });
    await mkdir(join(workspacePath, "tmp"), { recursive: true });
    await initializeGit(workspacePath);
    const now = new Date().toISOString();
    const attempt: ScenarioAttempt = {
      attemptId,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      workspacePath,
      startedAt: now,
      updatedAt: now,
      checkpoints: [],
      aiTurns: [],
      visibleRuns: [],
      hiddenRuns: []
    };
    await this.writeAttempt(attempt);
    return attempt;
  }

  async readAttempt(attemptId: string): Promise<ScenarioAttempt> {
    const attempt = normalizeAttempt(JSON.parse(await readFile(this.attemptPath(attemptId), "utf8")) as ScenarioAttempt);
    if (!this.isAttemptWorkspace(attempt.workspacePath)) throw new Error("Attempt workspace path is outside scenario attempts root");
    return attempt;
  }

  async prompt(scenarioId: string): Promise<string> {
    const scenario = this.scenario(scenarioId);
    return readFile(this.contentPath(scenario.promptPath), "utf8");
  }

  async editableFiles(attemptId: string): Promise<ScenarioEditableFile[]> {
    const attempt = await this.readAttempt(attemptId);
    const scenario = this.scenario(attempt.scenarioId);
    const files: ScenarioEditableFile[] = [];
    for (const editablePath of scenario.editablePaths) {
      const root = this.editablePath(attempt, scenario, editablePath);
      await collectEditableFiles(root, editablePath, files);
    }
    return files.sort((left, right) => left.path.localeCompare(right.path));
  }

  async saveEditableFile(attemptId: string, filePath: string, content: string): Promise<ScenarioAttempt> {
    const attempt = await this.readAttempt(attemptId);
    const scenario = this.scenario(attempt.scenarioId);
    const target = this.editablePath(attempt, scenario, filePath);
    const parent = dirname(target);
    await mkdir(parent, { recursive: true });
    await writeFile(target, content, "utf8");
    attempt.updatedAt = new Date().toISOString();
    await this.writeAttempt(attempt);
    return attempt;
  }

  async saveCheckpoint(attemptId: string, checkpointId: string, answer: string): Promise<ScenarioAttempt> {
    const attempt = await this.readAttempt(attemptId);
    const response: ScenarioCheckpointResponse = {
      checkpointId,
      answer,
      createdAt: new Date().toISOString()
    };
    attempt.checkpoints = [
      response,
      ...attempt.checkpoints.filter((checkpoint) => checkpoint.checkpointId !== checkpointId)
    ];
    attempt.updatedAt = response.createdAt;
    await this.writeAttempt(attempt);
    return attempt;
  }

  async endSession(attemptId: string): Promise<ScenarioAttempt> {
    const attempt = await this.readAttempt(attemptId);
    if (!attempt.endedAt) attempt.endedAt = new Date().toISOString();
    attempt.updatedAt = attempt.endedAt;
    await this.writeAttempt(attempt);
    return attempt;
  }

  async hiddenTestFiles(attemptId: string): Promise<{ files: ScenarioHiddenTestFile[] }> {
    const attempt = await this.readAttempt(attemptId);
    if (!attempt.endedAt) throw new Error("Hidden tests unlock after ending the session.");
    const scenario = this.scenario(attempt.scenarioId);
    const root = this.contentPath(scenario.hiddenTestsPath);
    const files: ScenarioHiddenTestFile[] = [];
    await collectHiddenTestFiles(root, "tests", files);
    return { files };
  }

  async recordRun(attemptId: string, visibility: TestVisibility, result: RunResult): Promise<{ attempt: ScenarioAttempt; run: ScenarioRunRecord }> {
    const attempt = await this.readAttempt(attemptId);
    if (visibility === "hidden" && !attempt.endedAt) throw new Error("Hidden tests unlock after ending the session.");
    const ranAt = new Date().toISOString();
    const run: ScenarioRunRecord = {
      ...result,
      runId: randomUUID(),
      visibility,
      command: "Pyodide unittest",
      exitCode: result.status === "passed" ? 0 : 1,
      ranAt
    };
    if (visibility === "hidden") {
      attempt.hiddenRuns = [run, ...attempt.hiddenRuns].slice(0, 20);
    } else {
      attempt.visibleRuns = [run, ...attempt.visibleRuns].slice(0, 20);
    }
    attempt.updatedAt = ranAt;
    await this.writeAttempt(attempt);
    return { attempt, run };
  }

  async diff(attemptId: string): Promise<string> {
    const attempt = await this.readAttempt(attemptId);
    const result = await runSandboxedProcess({
      command: "git",
      args: ["diff", "--", "."],
      cwd: attempt.workspacePath,
      timeoutMs: 5000,
      maxOutputBytes: 2 * 1024 * 1024,
      sandbox: false
    });
    return result.stdout || result.stderr;
  }

  async coach(attemptId: string, userMessage: string): Promise<{ attempt: ScenarioAttempt; response: string }> {
    const attempt = await this.readAttempt(attemptId);
    const scenario = this.scenario(attempt.scenarioId);
    const prompt = await this.prompt(scenario.id);
    const diff = await this.diff(attemptId);
    const resultSummary = summarizeRuns(attempt);
    const response = await runCodexText({
      workingDirectory: attempt.workspacePath,
      effort: "xhigh",
      timeoutMs: 180000,
      prompt: [
        "You are a Ramp-style senior interview coach inside DSA Coach.",
        "Use the candidate's current workspace and the provided scenario context.",
        "Default to interviewer-style coaching: one pointed question, one precise next step, or one small debugging observation.",
        "Do not rewrite the solution unless explicitly asked. Prefer guiding questions, edge cases, invariant checks, and review comments.",
        "If the scenario says it is a no-AI onsite rehearsal, behave as an observer/interviewer, not as an implementation copilot.",
        "If the scenario says AI use is expected, evaluate whether the candidate remains in command while using AI.",
        "Focus on codebase comprehension, command of solution, MVP judgment, testing, debugging, and communication.",
        COACH_MARKDOWN_FORMATTING_RULES,
        "",
        `Scenario: ${scenario.title}`,
        prompt,
        "",
        `Recent test state:\n${resultSummary}`,
        "",
        `Current diff:\n${diff || "(no diff)"}`,
        "",
        `Candidate request:\n${userMessage}`
      ].join("\n")
    });
    const text = response.ok ? response.text : `Codex coach unavailable: ${response.error}`;
    const turn: ScenarioAiTurn = {
      id: randomUUID(),
      kind: "coach",
      userMessage,
      response: text,
      createdAt: new Date().toISOString()
    };
    attempt.aiTurns = [turn, ...attempt.aiTurns].slice(0, 50);
    attempt.updatedAt = new Date().toISOString();
    await this.writeAttempt(attempt);
    return { attempt, response: text };
  }

  async judge(attemptId: string, finalExplanation: string): Promise<{ attempt: ScenarioAttempt; report: ScenarioJudgeReport }> {
    const attempt = await this.readAttempt(attemptId);
    const scenario = this.scenario(attempt.scenarioId);
    const prompt = await this.prompt(scenario.id);
    const diff = await this.diff(attemptId);
    const schema = judgeSchema(scenario);
    const response = await runCodexText({
      workingDirectory: attempt.workspacePath,
      outputSchema: schema,
      effort: "high",
      timeoutMs: JUDGE_TIMEOUT_MS,
      prompt: [
        "You are judging a Ramp-style AI backend live coding attempt.",
        "Score observable evidence only. Be direct, specific, and interview-calibrated.",
        "Rubric scores are 1-5: 1 means weak or missing evidence, 3 means acceptable but mixed, and 5 means excellent. Keep numeric scores consistent with the overall decision.",
        "The candidate is expected to use AI, but must remain in command of the solution.",
        "",
        `Scenario: ${scenario.title}`,
        prompt,
        "",
        `Rubric:\n${JSON.stringify(scenario.rubric, null, 2)}`,
        "",
        `Checkpoint answers:\n${JSON.stringify(attempt.checkpoints, null, 2)}`,
        "",
        `AI worklog:\n${JSON.stringify(attempt.aiTurns, null, 2)}`,
        "",
        `Test history:\n${summarizeRuns(attempt)}`,
        "",
        `Final hidden status: ${attempt.hiddenRuns[0]?.status ?? "not submitted"}`,
        "",
        `Diff:\n${diff || "(no diff)"}`,
        "",
        `Candidate final explanation:\n${finalExplanation || "(none provided)"}`
      ].join("\n")
    });
    const raw = parseJudgeResponse(response);
    const report: ScenarioJudgeReport = {
      overall: raw.overall,
      summary: raw.summary,
      scores: raw.scores,
      highestRiskWeakness: raw.highestRiskWeakness,
      nextDrill: raw.nextDrill,
      raw,
      createdAt: new Date().toISOString()
    };
    attempt.judge = report;
    const turn: ScenarioAiTurn = {
      id: randomUUID(),
      kind: "judge",
      userMessage: finalExplanation,
      response: JSON.stringify(report, null, 2),
      createdAt: report.createdAt
    };
    attempt.aiTurns = [turn, ...attempt.aiTurns].slice(0, 50);
    attempt.updatedAt = report.createdAt;
    await this.writeAttempt(attempt);
    return { attempt, report };
  }

  async openAttempt(attemptId: string, target: "cursor" | "vscode" | "finder"): Promise<{ ok: true; command: string[] }> {
    const attempt = await this.readAttempt(attemptId);
    const command = target === "cursor"
      ? ["open", "-a", "Cursor", attempt.workspacePath]
      : target === "vscode"
        ? ["open", "-a", "Visual Studio Code", attempt.workspacePath]
        : ["open", attempt.workspacePath];
    const result = await runSandboxedProcess({
      command: command[0],
      args: command.slice(1),
      cwd: attempt.workspacePath,
      timeoutMs: 5000,
      sandbox: false
    });
    if (result.exitCode !== 0) throw new Error(result.stderr || result.stdout || `Failed to open ${target}`);
    return { ok: true, command };
  }

  private scenario(scenarioId: string): Scenario {
    const scenario = this.graph.scenarios.find((candidate) => candidate.id === scenarioId);
    if (!scenario) throw new Error(`Unknown scenario ${scenarioId}`);
    return scenario;
  }

  private contentPath(relativePath: string): string {
    const target = resolve(this.contentRoot, relativePath);
    if (!isInside(this.contentRoot, target)) throw new Error(`Scenario path escapes content root: ${relativePath}`);
    return target;
  }

  private editablePath(attempt: ScenarioAttempt, scenario: Scenario, relativePath: string): string {
    if (!relativePath.trim() || relativePath.startsWith("/") || relativePath.split(/[\\/]/).includes("..")) {
      throw new Error(`Invalid scenario file path: ${relativePath}`);
    }
    const target = resolve(attempt.workspacePath, relativePath);
    if (!isInside(attempt.workspacePath, target)) throw new Error(`Scenario file path escapes workspace: ${relativePath}`);
    const editableRoots = scenario.editablePaths.map((editablePath) => resolve(attempt.workspacePath, editablePath));
    if (!editableRoots.some((root) => isInside(root, target))) {
      throw new Error(`Scenario file is not editable: ${relativePath}`);
    }
    return target;
  }

  private attemptRoot(): string {
    return resolve(this.userDataRoot, "scenario-attempts");
  }

  private attemptPath(attemptId: string): string {
    if (!/^[a-z0-9_.-]+$/i.test(attemptId)) throw new Error("Invalid attempt id");
    return resolve(this.attemptRoot(), attemptId, "attempt.json");
  }

  private isAttemptWorkspace(path: string): boolean {
    return isInside(this.attemptRoot(), resolve(path));
  }

  private async writeAttempt(attempt: ScenarioAttempt) {
    const target = this.attemptPath(attempt.attemptId);
    await mkdir(dirname(target), { recursive: true });
    const temp = `${target}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temp, `${JSON.stringify(attempt, null, 2)}\n`, "utf8");
    await rename(temp, target);
  }
}

async function initializeGit(cwd: string) {
  await runSandboxedProcess({ command: "git", args: ["init"], cwd, timeoutMs: 5000, sandbox: false });
  await runSandboxedProcess({ command: "git", args: ["add", "."], cwd, timeoutMs: 5000, sandbox: false });
  await runSandboxedProcess({
    command: "git",
    args: [
      "-c",
      "user.name=DSA Coach",
      "-c",
      "user.email=dsa-coach@example.invalid",
      "commit",
      "-m",
      "Initial scenario template"
    ],
    cwd,
    timeoutMs: 10000,
    sandbox: false
  });
}

function summarizeRuns(attempt: ScenarioAttempt): string {
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

function judgeSchema(scenario: Scenario): unknown {
  return {
    type: "object",
    properties: {
      overall: { type: "string", enum: ["strong_hire", "hire", "mixed", "no_hire"] },
      summary: { type: "string" },
      scores: {
        type: "array",
        items: {
          type: "object",
          properties: {
            metricId: { type: "string", enum: scenario.rubric.map((metric) => metric.id) },
            label: { type: "string" },
            score: { type: "number", minimum: 1, maximum: 5 },
            evidence: { type: "string" },
            improvement: { type: "string" }
          },
          required: ["metricId", "label", "score", "evidence", "improvement"],
          additionalProperties: false
        }
      },
      highestRiskWeakness: { type: "string" },
      nextDrill: { type: "string" }
    },
    required: ["overall", "summary", "scores", "highestRiskWeakness", "nextDrill"],
    additionalProperties: false
  };
}

function parseJudgeResponse(response: Awaited<ReturnType<typeof runCodexText>>): Omit<ScenarioJudgeReport, "raw" | "createdAt"> {
  if (!response.ok) {
    return fallbackJudge(`Codex judge unavailable: ${response.error}`);
  }
  try {
    return JSON.parse(response.text) as Omit<ScenarioJudgeReport, "raw" | "createdAt">;
  } catch {
    return fallbackJudge(response.text);
  }
}

function fallbackJudge(summary: string): Omit<ScenarioJudgeReport, "raw" | "createdAt"> {
  return {
    overall: "mixed",
    summary,
    scores: [],
    highestRiskWeakness: "Judge response could not be parsed as structured feedback.",
    nextDrill: "Run the attempt again after checking Codex availability."
  };
}

async function collectEditableFiles(root: string, relativeRoot: string, files: ScenarioEditableFile[]): Promise<void> {
  const entries = await readdir(root, { withFileTypes: true }).catch(() => undefined);
  if (!entries) return;
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "__pycache__" || entry.name.startsWith(".")) continue;
    const absolutePath = resolve(root, entry.name);
    const relativePath = `${relativeRoot}/${entry.name}`;
    if (entry.isDirectory()) {
      await collectEditableFiles(absolutePath, relativePath, files);
      continue;
    }
    if (!entry.isFile() || !isTextEditableFile(entry.name)) continue;
    files.push({
      path: relativePath,
      content: await readFile(absolutePath, "utf8")
    });
  }
}

async function collectHiddenTestFiles(root: string, relativeRoot: string, files: ScenarioHiddenTestFile[]): Promise<void> {
  const entries = await readdir(root, { withFileTypes: true }).catch(() => undefined);
  if (!entries) return;
  for (const entry of entries) {
    if (entry.name === "__pycache__" || entry.name.startsWith(".")) continue;
    const absolutePath = resolve(root, entry.name);
    const relativePath = `${relativeRoot}/${entry.name}`;
    if (entry.isDirectory()) {
      await collectHiddenTestFiles(absolutePath, relativePath, files);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".py")) continue;
    files.push({
      path: relativePath,
      content: await readFile(absolutePath, "utf8"),
      visibility: "hidden"
    });
  }
}

function normalizeAttempt(attempt: ScenarioAttempt): ScenarioAttempt {
  return {
    ...attempt,
    visibleRuns: (attempt.visibleRuns ?? []).map((run) => normalizeRunRecord(run, "visible")),
    hiddenRuns: (attempt.hiddenRuns ?? []).map((run) => normalizeRunRecord(run, "hidden"))
  };
}

function normalizeRunRecord(run: ScenarioRunRecord | ScenarioCommandResult, visibility: TestVisibility): ScenarioRunRecord {
  if ("tests" in run && "runId" in run) return run;
  return legacyCommandResultToRunRecord(run as ScenarioCommandResult, visibility);
}

function legacyCommandResultToRunRecord(result: ScenarioCommandResult, visibility: TestVisibility): ScenarioRunRecord {
  return {
    runId: `legacy-${visibility}-${result.ranAt}`,
    visibility,
    command: result.command,
    exitCode: result.exitCode,
    ranAt: result.ranAt,
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    durationMs: result.durationMs,
    tests: []
  };
}

function isTextEditableFile(name: string): boolean {
  return [".py", ".txt", ".md", ".json", ".toml", ".yaml", ".yml", ".ini", ".cfg"].some((suffix) => name.endsWith(suffix));
}

async function readdirSafe(path: string): Promise<string[]> {
  try {
    const info = await stat(path);
    if (!info.isDirectory()) return [];
    return readdir(path);
  } catch {
    return [];
  }
}

function isInside(root: string, target: string): boolean {
  const resolvedRoot = resolve(root);
  const resolvedTarget = resolve(target);
  return resolvedTarget === resolvedRoot || resolvedTarget.startsWith(`${resolvedRoot}${sep}`);
}
