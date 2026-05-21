import type { Problem, RunResult } from "../types";

const RUN_TIMEOUT_MS = 45_000;

export function runPythonProblem(
  problem: Problem,
  code: string,
  includeHidden: boolean,
  signal?: AbortSignal
): Promise<RunResult> {
  return runPython({ problem, code, includeHidden }, signal);
}

export function runPythonScratchpad(code: string, signal?: AbortSignal): Promise<RunResult> {
  return runPython({ code, scratchpad: true }, signal);
}

function runPython(
  payload: { problem: Problem; code: string; includeHidden: boolean } | { code: string; scratchpad: true },
  signal?: AbortSignal
): Promise<RunResult> {
  return new Promise((resolve) => {
    const startedAt = performance.now();

    // Stop was pressed before this run even started — nothing to spin up.
    if (signal?.aborted) {
      resolve(stoppedResult(startedAt));
      return;
    }

    const worker = new Worker(new URL("./pyodide.worker.ts", import.meta.url), { type: "module" });

    // The worker result, the timeout, and a user-pressed Stop all race to end
    // the run. `settle` lets the first one win and makes the rest no-ops; it is
    // the single place the worker and its listeners are torn down.
    let settled = false;
    const settle = (result: RunResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      worker.terminate();
      resolve(result);
    };

    const onAbort = () => settle(stoppedResult(startedAt));
    signal?.addEventListener("abort", onAbort);

    const timer = window.setTimeout(() => {
      settle({
        status: "timeout",
        stdout: "",
        stderr: "Execution exceeded the local timeout.",
        durationMs: Math.round(performance.now() - startedAt),
        tests: [],
        message: "Your code did not finish before the timeout."
      });
    }, RUN_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<RunResult>) => settle(event.data);

    worker.onerror = (event) => {
      settle({
        status: "error",
        stdout: "",
        stderr: event.message,
        durationMs: Math.round(performance.now() - startedAt),
        tests: [],
        message: "The Python worker failed before returning a result."
      });
    };

    worker.postMessage({ ...payload, startedAt });
  });
}

/**
 * Synthetic result for a run the user stopped. Carries no `message` — the
 * `stopped` status is the whole signal, and a message would route it into the
 * error UI as if the code had actually failed.
 */
function stoppedResult(startedAt: number): RunResult {
  return {
    status: "stopped",
    stdout: "",
    stderr: "",
    durationMs: Math.round(performance.now() - startedAt),
    tests: []
  };
}
