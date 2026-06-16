import { cp, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";
import type { ContentGraph, Scenario, ScenarioCheckpoint } from "../core/types.js";
import { runCodexText } from "../ai/codexProvider.js";
import { resolvePythonRuntime } from "../runner/pythonRuntime.js";
import { runSandboxedProcess, type SandboxProcessResult } from "../runner/processSandbox.js";

export interface ScenarioAttempt {
  attemptId: string;
  scenarioId: string;
  scenarioTitle: string;
  workspacePath: string;
  startedAt: string;
  updatedAt: string;
  checkpoints: ScenarioCheckpointResponse[];
  aiTurns: ScenarioAiTurn[];
  visibleRuns: ScenarioCommandResult[];
  hiddenRuns: ScenarioCommandResult[];
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
    const attempt = JSON.parse(await readFile(this.attemptPath(attemptId), "utf8")) as ScenarioAttempt;
    if (!this.isAttemptWorkspace(attempt.workspacePath)) throw new Error("Attempt workspace path is outside scenario attempts root");
    return attempt;
  }

  async prompt(scenarioId: string): Promise<string> {
    const scenario = this.scenario(scenarioId);
    return readFile(this.contentPath(scenario.promptPath), "utf8");
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

  async runVisible(attemptId: string): Promise<{ attempt: ScenarioAttempt; result: ScenarioCommandResult }> {
    const attempt = await this.readAttempt(attemptId);
    const scenario = this.scenario(attempt.scenarioId);
    const result = await this.runCommand(scenario, scenario.visibleTestCommand, attempt.workspacePath);
    attempt.visibleRuns = [result, ...attempt.visibleRuns].slice(0, 20);
    attempt.updatedAt = result.ranAt;
    await this.writeAttempt(attempt);
    return { attempt, result };
  }

  async submitHidden(attemptId: string): Promise<{ attempt: ScenarioAttempt; result: ScenarioCommandResult }> {
    const attempt = await this.readAttempt(attemptId);
    const scenario = this.scenario(attempt.scenarioId);
    const temp = await mkdtemp(join(tmpdir(), "dsa-scenario-submit-"));
    try {
      const workspace = join(temp, "workspace");
      await cp(attempt.workspacePath, workspace, {
        recursive: true,
        filter: (source) => !source.split(sep).includes(".git")
      });
      await cp(this.contentPath(scenario.hiddenTestsPath), join(workspace, "tests"), { recursive: true, force: true });
      const result = await this.runCommand(scenario, scenario.hiddenTestCommand, workspace);
      attempt.hiddenRuns = [result, ...attempt.hiddenRuns].slice(0, 20);
      attempt.updatedAt = result.ranAt;
      await this.writeAttempt(attempt);
      return { attempt, result };
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
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
      timeoutMs: 180000,
      prompt: [
        "You are judging a Ramp-style AI backend live coding attempt.",
        "Score observable evidence only. Be direct, specific, and interview-calibrated.",
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

  private async runCommand(scenario: Scenario, command: Scenario["visibleTestCommand"], cwd: string): Promise<ScenarioCommandResult> {
    const started = performance.now();
    const resolved = await resolveCommand(command);
    const processResult: SandboxProcessResult = await runSandboxedProcess({
      command: resolved.command,
      args: resolved.args,
      cwd,
      timeoutMs: command.timeoutMs ?? 30000,
      processExecPaths: resolved.processExecPaths,
      allowProcessFork: resolved.allowProcessFork,
      allowAnyProcessExec: resolved.allowAnyProcessExec,
      maxOutputBytes: 1024 * 1024,
      sandbox: true
    });
    const durationMs = Math.round(performance.now() - started);
    return {
      status: processResult.timedOut ? "timeout" : processResult.exitCode === 0 ? "passed" : "failed",
      command: [basename(resolved.command), ...resolved.args].join(" "),
      exitCode: processResult.exitCode,
      stdout: processResult.stdout,
      stderr: processResult.stderr,
      durationMs,
      ranAt: new Date().toISOString()
    };
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

async function resolveCommand(command: Scenario["visibleTestCommand"]): Promise<{
  command: string;
  args: string[];
  processExecPaths?: string[];
  allowProcessFork?: boolean;
  allowAnyProcessExec?: boolean;
}> {
  if (command.command !== "python") return { command: command.command, args: command.args };
  const python = await resolvePythonRuntime();
  if (!python.runtime) throw new Error(python.message ?? "Python runtime unavailable");
  return {
    command: python.runtime.command,
    args: command.args,
    processExecPaths: python.runtime.processExecPaths,
    allowProcessFork: python.runtime.allowProcessFork,
    allowAnyProcessExec: true
  };
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
