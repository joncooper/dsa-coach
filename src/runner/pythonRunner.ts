import type { Problem, RunResult } from "../types";

const RUN_TIMEOUT_MS = 45_000;

export function runPythonProblem(problem: Problem, code: string, includeHidden: boolean): Promise<RunResult> {
  return runPython({ problem, code, includeHidden });
}

export function runPythonScratchpad(code: string): Promise<RunResult> {
  return runPython({ code, scratchpad: true });
}

function runPython(payload: { problem: Problem; code: string; includeHidden: boolean } | { code: string; scratchpad: true }): Promise<RunResult> {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    const worker = new Worker(new URL("./pyodide.worker.ts", import.meta.url), { type: "module" });
    const timer = window.setTimeout(() => {
      worker.terminate();
      resolve({
        status: "timeout",
        stdout: "",
        stderr: "Execution exceeded the local timeout.",
        durationMs: Math.round(performance.now() - startedAt),
        tests: [],
        message: "Your code did not finish before the timeout."
      });
    }, RUN_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<RunResult>) => {
      window.clearTimeout(timer);
      worker.terminate();
      resolve(event.data);
    };

    worker.onerror = (event) => {
      window.clearTimeout(timer);
      worker.terminate();
      resolve({
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
