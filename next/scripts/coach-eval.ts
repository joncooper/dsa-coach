import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { homedir } from "node:os";
import { buildCoachMessages, COACH_PROMPT_VERSION, type CoachMessageArgs, type CoachMode } from "../apps/web/src/coachMessages";
import type { RunResult } from "../src/core/types";
import type {
  CoachEvalCaseResult,
  CoachEvalCheckResult,
  CoachEvalMode,
  CoachEvalModeSummary,
  CoachEvalProvider,
  CoachEvalSuiteReport
} from "../src/coach/evalTypes";

const ollamaUrl = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
const ollamaModel = process.env.DSA_COACH_EVAL_MODEL ?? "gemma4:latest";

interface EvalFixture {
  id: string;
  title: string;
  mode: CoachMode;
  tags: string[];
  args: CoachMessageArgs;
  requiredTerms?: string[];
  forbiddenTerms?: string[];
  maxWords?: number;
  forbidCodeBlock?: boolean;
  expectCodeBlock?: boolean;
}

const recentEventPrompt = `Event timestamps arrive sorted in non-decreasing order. For each event at timestamp t, return how many events are in the inclusive window [t - window, t]. Return one integer per input timestamp.`;

const recentEventCode = `def recent_event_counts(timestamps, window):
    # [t - window, t]
    left = 0
    right = 0
    count = 0
    while right < len(timestamps):
        count = 0
        while left < right:
            t = timestamps[right]
            if t - window <= timestamps[left]:
                count += 1
            left += 1
        right += 1`;

const recentEventResult: RunResult = {
  status: "failed",
  stdout: "",
  stderr: "",
  durationMs: 77,
  tests: [
    {
      name: "small",
      passed: false,
      visibility: "visible",
      args: [[1, 3, 8, 10], 5],
      expected: [1, 2, 2, 2],
      actual: null
    }
  ]
};

const keyErrorResult: RunResult = {
  status: "runtime-error",
  stdout: "",
  stderr: "Traceback (most recent call last):\n  File \"solution.py\", line 105, in add_file_by\n    if size > self.users[name].quota:\nKeyError: 'f'",
  durationMs: 31,
  diagnostics: [
    { severity: "error", message: "KeyError: 'f'", file: "solution.py", line: 105 }
  ],
  tests: [
    {
      name: "l3-user-add-within-quota",
      passed: false,
      visibility: "visible",
      args: [],
      expected: true,
      actual: undefined,
      error: "KeyError: 'f'"
    }
  ]
};

function baseArgs(overrides: Partial<CoachMessageArgs>): CoachMessageArgs {
  return {
    turns: [],
    question: "Help",
    mode: "hint",
    problemTitle: "Recent Event Counts",
    prompt: recentEventPrompt,
    concepts: ["sliding window", "two pointers"],
    difficulty: "medium",
    language: "python",
    entrypoint: "recent_event_counts",
    code: recentEventCode,
    result: null,
    failedVisible: [],
    referenceCode: `def recent_event_counts(timestamps, window):
    left = 0
    result = []
    for right, timestamp in enumerate(timestamps):
        while timestamps[left] < timestamp - window:
            left += 1
        result.append(right - left + 1)
    return result`,
    ...overrides
  };
}

const fixtures: EvalFixture[] = [
  {
    id: "hint-subtle-local-bug",
    title: "Hint stays local and subtle",
    mode: "hint",
    tags: ["sliding-window", "no-solution"],
    args: baseArgs({
      mode: "hint",
      question: "Take a look at my solution and coach me very subtly without giving away the answer.",
      result: recentEventResult,
      failedVisible: recentEventResult.tests
    }),
    requiredTerms: ["left"],
    forbiddenTerms: ["append(right - left + 1)", "for right", "complete solution", "here is the code"],
    maxWords: 120,
    forbidCodeBlock: true
  },
  {
    id: "hint-can-see-code",
    title: "Hint sees current editor code",
    mode: "hint",
    tags: ["code-visibility"],
    args: baseArgs({
      mode: "hint",
      question: "Can you see the code I just wrote?"
    }),
    requiredTerms: ["yes", "right"],
    forbiddenTerms: ["paste your code", "attach your code", "I don't see"],
    maxWords: 80,
    forbidCodeBlock: true
  },
  {
    id: "debug-traceback-line-number",
    title: "Debug starts from traceback",
    mode: "debug",
    tags: ["traceback", "local-fix"],
    args: baseArgs({
      mode: "debug",
      problemTitle: "Progressive Filesystem",
      prompt: "Implement an in-memory filesystem with user quotas.",
      concepts: ["hash map", "state"],
      entrypoint: "solution",
      code: `class FS:
    def add_file_by(self, name, file, size):
        if size > self.users[name].quota:
            return "false"
        return "true"`,
      result: keyErrorResult,
      failedVisible: keyErrorResult.tests,
      question: "This error makes no sense. There is not a key f on that line."
    }),
    requiredTerms: ["line 105", "self.users[name]", "name"],
    forbiddenTerms: ["rewrite", "full solution"],
    maxWords: 180
  },
  {
    id: "debug-mismatch-not-reference",
    title: "Debug does not jump to reference approach",
    mode: "debug",
    tags: ["failed-test", "small-fix"],
    args: baseArgs({
      mode: "debug",
      question: "What am I doing wrong now?",
      result: recentEventResult,
      failedVisible: recentEventResult.tests
    }),
    requiredTerms: ["null", "return"],
    forbiddenTerms: ["reference solution", "replace your function"],
    maxWords: 160
  },
  {
    id: "explain-recent-window",
    title: "Explain concept without solving",
    mode: "explain",
    tags: ["concept"],
    args: baseArgs({
      mode: "explain",
      code: "",
      result: null,
      question: "I don't understand what this event's recent window means."
    }),
    requiredTerms: ["inclusive", "t - window", "t"],
    forbiddenTerms: ["def recent_event_counts", "solution", "append"],
    maxWords: 180,
    forbidCodeBlock: true
  },
  {
    id: "explain-short-circuit",
    title: "Explain Python behavior directly",
    mode: "explain",
    tags: ["python", "concept"],
    args: baseArgs({
      mode: "explain",
      problemTitle: "In-Memory Database",
      prompt: "Implement field operations with TTL expiry.",
      concepts: ["hash map", "ttl"],
      code: "",
      question: "Does and short circuit in statements like if key in expiries and field in expiries[key]?"
    }),
    requiredTerms: ["yes", "short", "expiries[key]"],
    forbiddenTerms: ["full solution", "rewrite"],
    maxWords: 130,
    forbidCodeBlock: true
  },
  {
    id: "review-style-not-rewrite",
    title: "Review style without rewriting",
    mode: "review",
    tags: ["style", "data-model"],
    args: baseArgs({
      mode: "review",
      problemTitle: "Flight History Tracker",
      prompt: "Given flight records and a query time, return each user's location.",
      concepts: ["events", "state"],
      entrypoint: "user_locations",
      code: `def user_locations(flights, query_time):
    users = {}
    for flight in flights:
        users.setdefault(flight[0], []).append(flight)
    result = []
    for user, fs in users.items():
        location = "UNKNOWN"
        for f in sorted(fs, key=lambda f: f[2]):
            if f[2] <= query_time:
                location = f[3]
        result.append([user, location])
    return sorted(result)`,
      question: "I feel like my solution is kind of ugly. How could I make it less ugly?"
    }),
    requiredTerms: ["data", "helper"],
    forbiddenTerms: ["replace it with", "complete rewrite", "full solution"],
    maxWords: 220,
    forbidCodeBlock: true
  },
  {
    id: "solution-request-allows-code",
    title: "Explicit solution request can reveal code",
    mode: "hint",
    tags: ["solution-allowed"],
    args: baseArgs({
      mode: "hint",
      question: "I give up. Show me the solution."
    }),
    requiredTerms: ["def recent_event_counts", "left"],
    maxWords: 260,
    expectCodeBlock: true
  }
];

async function main() {
  const provider = parseProvider(argValue("--provider"));
  const iteration = argValue("--iteration");
  const report = await runSuite(provider, iteration);
  const outputPath = await writeReport(report);
  printSummary(report, outputPath);
  if (report.summary.passedCases !== report.summary.totalCases) {
    process.exitCode = 1;
  }
}

async function runSuite(provider: CoachEvalProvider, iteration?: string): Promise<CoachEvalSuiteReport> {
  const cases: CoachEvalCaseResult[] = [];
  for (const fixture of fixtures) {
    const messages = buildCoachMessages(fixture.args);
    const promptText = messages.map((message) => message.content).join("\n\n");
    const response = provider === "ollama"
      ? await callOllama(messages)
      : deterministicResponse(fixture);
    const checks = gradeFixture(fixture, promptText, response);
    cases.push({
      id: fixture.id,
      title: fixture.title,
      mode: fixture.mode,
      tags: fixture.tags,
      userQuestion: fixture.args.question,
      promptContext: {
        includesReference: promptText.includes("Reference solution"),
        includesLearnerCode: promptText.includes("## Learner code"),
        includesRunState: promptText.includes("## Last run state"),
        charCount: promptText.length
      },
      response,
      checks,
      passed: checks.every((check) => check.passed)
    });
  }
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    promptVersion: COACH_PROMPT_VERSION,
    provider,
    model: provider === "ollama" ? ollamaModel : "static",
    ...(iteration ? { iteration } : {}),
    summary: summarize(cases),
    cases
  };
}

async function callOllama(messages: Array<{ role: string; content: string }>): Promise<string> {
  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: ollamaModel,
      messages,
      stream: false,
      options: { temperature: 0, top_p: 0.9 }
    }),
    signal: AbortSignal.timeout(90_000)
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Ollama ${res.status}${detail ? `: ${detail}` : ""}`);
  }
  const data = await res.json() as { message?: { content?: string } };
  return data.message?.content?.trim() || "";
}

function deterministicResponse(fixture: EvalFixture): string {
  if (fixture.id === "solution-request-allows-code") {
    return "```python\ndef recent_event_counts(timestamps, window):\n    left = 0\n    result = []\n    return result\n```";
  }
  if (fixture.id === "hint-can-see-code") {
    return "Yes. I can see the current function, including the `return [42]` placeholder and the `right` pointer loop.";
  }
  if (fixture.id === "debug-mismatch-not-reference") {
    return "The visible test shows `actual` is `null`, which usually means the function finished without a `return`. Check what value you return after the loop.";
  }
  if (fixture.id === "explain-recent-window") {
    return "For an event at time `t`, its recent window is the inclusive range `[t - window, t]`. You count prior events and the current event whose timestamps fall inside that range.";
  }
  if (fixture.mode === "hint") return "Look closely at how `left` moves and whether your function returns anything after the loop.";
  if (fixture.mode === "debug") return "The traceback points to line 105 at `self.users[name]`. Check what value `name` has at that point and whether it is the user id you intended.";
  if (fixture.mode === "explain") return "Yes. Python `and` short-circuits, so `expiries[key]` is only evaluated if `key in expiries` is true.";
  return "The structure is workable. I would extract a small helper around the data shape and name the state transition explicitly.";
}

function gradeFixture(fixture: EvalFixture, promptText: string, response: string): CoachEvalCheckResult[] {
  const checks: CoachEvalCheckResult[] = [];
  const lower = response.toLowerCase();
  for (const term of fixture.requiredTerms ?? []) {
    checks.push({
      id: `requires:${term}`,
      label: `Mentions ${term}`,
      passed: lower.includes(term.toLowerCase())
    });
  }
  for (const term of [...commonForbiddenTerms(), ...(fixture.forbiddenTerms ?? [])]) {
    checks.push({
      id: `forbids:${term}`,
      label: `Avoids ${term}`,
      passed: !lower.includes(term.toLowerCase())
    });
  }
  if (fixture.maxWords) {
    const words = response.trim().split(/\s+/).filter(Boolean).length;
    checks.push({
      id: "length",
      label: `At most ${fixture.maxWords} words`,
      passed: words <= fixture.maxWords,
      detail: `${words} words`
    });
  }
  if (fixture.forbidCodeBlock) {
    checks.push({
      id: "no-code-block",
      label: "Avoids fenced code",
      passed: !response.includes("```")
    });
  }
  if (fixture.expectCodeBlock) {
    checks.push({
      id: "has-code-block",
      label: "Includes fenced code",
      passed: response.includes("```")
    });
  }
  if (fixture.mode !== "hint" || !looksLikeSolutionRequest(fixture.args.question)) {
    checks.push({
      id: "prompt-reference-gating",
      label: "Prompt does not expose reference by default",
      passed: !promptText.includes("Reference solution allowed")
    });
  }
  if (fixture.mode === "hint") {
    checks.push({
      id: "hint-context-has-code",
      label: "Hint context includes current code",
      passed: promptText.includes("## Learner code")
    });
  }
  if (fixture.mode === "explain" && !fixture.args.code.trim()) {
    checks.push({
      id: "explain-context-no-empty-code",
      label: "Explain context omits empty editor code",
      passed: !promptText.includes("## Learner code")
    });
  }
  return checks;
}

function commonForbiddenTerms(): string[] {
  return [
    "great job",
    "fantastic question",
    "absolutely correct",
    "you are one line away",
    "paste your code",
    "attach your code",
    "i don't see any code",
    "😊",
    "🙂"
  ];
}

function summarize(cases: CoachEvalCaseResult[]) {
  const modes: CoachEvalMode[] = ["hint", "debug", "explain", "review"];
  const emptyModeSummary = (): CoachEvalModeSummary => ({
    totalCases: 0,
    passedCases: 0,
    totalChecks: 0,
    passedChecks: 0
  });
  const byMode = Object.fromEntries(modes.map((mode) => [mode, emptyModeSummary()])) as Record<CoachEvalMode, CoachEvalModeSummary>;
  let totalChecks = 0;
  let passedChecks = 0;
  for (const item of cases) {
    const bucket = byMode[item.mode];
    bucket.totalCases += 1;
    bucket.passedCases += item.passed ? 1 : 0;
    bucket.totalChecks += item.checks.length;
    bucket.passedChecks += item.checks.filter((check) => check.passed).length;
    totalChecks += item.checks.length;
    passedChecks += item.checks.filter((check) => check.passed).length;
  }
  return {
    totalCases: cases.length,
    passedCases: cases.filter((item) => item.passed).length,
    totalChecks,
    passedChecks,
    byMode
  };
}

async function writeReport(report: CoachEvalSuiteReport): Promise<string> {
  const root = await resolveEvalRoot();
  await mkdir(root, { recursive: true });
  const stamp = report.generatedAt.replace(/[:.]/g, "-");
  const iteration = report.iteration ? `-${safeFilePart(report.iteration)}` : "";
  const target = resolve(root, `${stamp}${iteration}-${report.provider}.json`);
  await writeFile(target, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return target;
}

async function resolveEvalRoot(): Promise<string> {
  const explicit = process.env.DSA_COACH_EVAL_DIR;
  if (explicit) return resolve(explicit);
  const userData = process.env.DSA_COACH_USER_DATA_DIR;
  if (userData) return resolve(userData, "coach-evals");
  const runtimePath = resolve(homedir(), "Library/Application Support/DSA Coach Next/runtime.json");
  try {
    const runtime = JSON.parse(await readFile(runtimePath, "utf8")) as { startedAt?: string };
    if (runtime.startedAt) return resolve(dirname(runtimePath), "User Data", "coach-evals");
  } catch {
    // Fall back below.
  }
  return resolve(".user-data", "coach-evals");
}

function printSummary(report: CoachEvalSuiteReport, outputPath: string) {
  console.log(`coach eval ${report.provider}/${report.model} ${report.summary.passedCases}/${report.summary.totalCases} cases, ${report.summary.passedChecks}/${report.summary.totalChecks} checks`);
  for (const item of report.cases) {
    const mark = item.passed ? "PASS" : "FAIL";
    console.log(`${mark} ${item.mode}/${item.id}`);
    for (const check of item.checks.filter((candidate) => !candidate.passed)) {
      console.log(`  - ${check.label}${check.detail ? ` (${check.detail})` : ""}`);
    }
  }
  console.log(`report ${outputPath}`);
}

function safeFilePart(value: string): string {
  return value.replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function argValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function parseProvider(value: string | undefined): CoachEvalProvider {
  if (value === "deterministic" || value === "ollama") return value;
  return "ollama";
}

function looksLikeSolutionRequest(text: string): boolean {
  return /\b(give up|show me the solution|full solution|complete solution)\b/i.test(text);
}

if (process.argv.includes("--list")) {
  console.log(fixtures.map((fixture) => `${fixture.mode}/${fixture.id}: ${fixture.title}`).join("\n"));
} else {
  await main();
}
