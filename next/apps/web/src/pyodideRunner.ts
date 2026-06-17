import type { Problem, ProblemTest, RunResult, TestVisibility } from "../../../src/core/types";

const DEFAULT_TIMEOUT_MS = 45_000;

export interface ScenarioPythonFile {
  path: string;
  content: string;
}

type PythonWorkerRequest =
  | {
      kind: "problem";
      problemId: string;
      entrypoint: string;
      code: string;
      tests: ProblemTest[];
      startedAt: number;
    }
  | {
      kind: "scratchpad";
      code: string;
      startedAt: number;
    }
  | {
      kind: "scenario";
      files: Record<string, string>;
      visibility: TestVisibility;
      startedAt: number;
    };

export function runPythonProblem(
  problem: Problem,
  partId: string | undefined,
  code: string,
  includeHidden: boolean,
  signal?: AbortSignal
): Promise<RunResult> {
  const target = problemRunTarget(problem, partId);
  if (!target) {
    return Promise.resolve({
      status: "unsupported",
      stdout: "",
      stderr: "",
      durationMs: 0,
      tests: [],
      message: partId ? `Problem ${problem.id} has no part ${partId}` : `Problem ${problem.id} is not runnable`
    });
  }
  const support = target.languages.python;
  if (!support) {
    return Promise.resolve({
      status: "unsupported",
      stdout: "",
      stderr: "",
      durationMs: 0,
      tests: [],
      message: `Problem ${target.label} does not support Python`
    });
  }
  const tests = target.tests.filter((test) => includeHidden || test.visibility === "visible");
  return runPythonWorker(
    {
      kind: "problem",
      problemId: problem.id,
      entrypoint: support.entrypoint,
      code,
      tests,
      startedAt: performance.now()
    },
    signal,
    timeoutResult(tests)
  );
}

export function runPythonScratchpad(code: string, signal?: AbortSignal, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<RunResult> {
  return runPythonWorker(
    {
      kind: "scratchpad",
      code,
      startedAt: performance.now()
    },
    signal,
    {
      status: "timeout",
      stdout: "",
      stderr: "Execution exceeded the local timeout.",
      durationMs: timeoutMs,
      tests: [],
      message: "Your code did not finish before the timeout."
    },
    timeoutMs
  );
}

export function runScenarioPythonTests(
  files: ScenarioPythonFile[],
  visibility: TestVisibility,
  signal?: AbortSignal,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<RunResult> {
  return runPythonWorker(
    {
      kind: "scenario",
      files: Object.fromEntries(files.map((file) => [file.path, file.content])),
      visibility,
      startedAt: performance.now()
    },
    signal,
    {
      status: "timeout",
      stdout: "",
      stderr: "Execution exceeded the local timeout.",
      durationMs: timeoutMs,
      tests: [],
      message: "Your code did not finish before the timeout."
    },
    timeoutMs
  );
}

function runPythonWorker(
  payload: PythonWorkerRequest,
  signal: AbortSignal | undefined,
  timeoutFallback: RunResult,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<RunResult> {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    if (signal?.aborted) {
      resolve(stoppedResult(startedAt));
      return;
    }

    const worker = new Worker(new URL("./pyodide.worker.ts", import.meta.url), { type: "module" });
    let settled = false;

    const settle = (result: RunResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      worker.terminate();
      resolve({
        ...result,
        durationMs: Math.max(result.durationMs, Math.round(performance.now() - startedAt))
      });
    };

    const onAbort = () => settle(stoppedResult(startedAt));
    signal?.addEventListener("abort", onAbort);

    const timer = window.setTimeout(() => {
      settle({
        ...timeoutFallback,
        durationMs: Math.round(performance.now() - startedAt)
      });
    }, timeoutMs);

    worker.onmessage = (event: MessageEvent<RunResult>) => settle(event.data);
    worker.onerror = (event) => {
      settle({
        status: "runtime-error",
        stdout: "",
        stderr: event.message,
        durationMs: Math.round(performance.now() - startedAt),
        tests: [],
        message: "The Python worker failed before returning a result."
      });
    };

    worker.postMessage(payload);
  });
}

function problemRunTarget(problem: Problem, partId: string | undefined) {
  if (!partId) {
    return {
      label: problem.id,
      tests: problem.tests,
      languages: problem.languages
    };
  }
  const part = problem.parts?.find((candidate) => candidate.id === partId);
  if (!part) return undefined;
  return {
    label: `${problem.id}#${part.id}`,
    tests: part.tests,
    languages: part.languages ?? problem.languages
  };
}

function timeoutResult(tests: ProblemTest[]): RunResult {
  return {
    status: "timeout",
    stdout: "",
    stderr: "Execution exceeded the local timeout.",
    durationMs: DEFAULT_TIMEOUT_MS,
    tests: tests.map((test) => ({
      name: test.name,
      passed: false,
      visibility: test.visibility,
      args: test.args,
      expected: test.expected,
      error: "Execution timed out"
    })),
    message: "Execution timed out"
  };
}

function stoppedResult(startedAt: number): RunResult {
  return {
    status: "stopped",
    stdout: "",
    stderr: "",
    durationMs: Math.round(performance.now() - startedAt),
    tests: []
  };
}
