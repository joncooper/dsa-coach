import type { ContentGraph, Problem, RunRequest, RunResult } from "../core/types.js";
import { ContentCatalog } from "../core/graph.js";
import { GoProcessBackend, ScalaProcessBackend, TypeScriptProcessBackend } from "./processBackends.js";

interface RuntimeBackend {
  run(problem: Problem, request: RunRequest): Promise<RunResult>;
}

export class LocalRunner {
  private readonly catalog: ContentCatalog;
  private readonly backends: Map<string, RuntimeBackend>;

  constructor(graph: ContentGraph) {
    this.catalog = new ContentCatalog(graph);
    this.backends = new Map([
      ["typescript", new TypeScriptProcessBackend()],
      ["go", new GoProcessBackend()],
      ["scala", new ScalaProcessBackend()]
    ]);
  }

  async run(request: RunRequest): Promise<RunResult> {
    const started = performance.now();
    const problem = this.catalog.problem(request.problemId);
    if (!problem) {
      return {
        status: "runtime-error",
        stdout: "",
        stderr: "",
        durationMs: Math.round(performance.now() - started),
        tests: [],
        message: `Unknown problem ${request.problemId}`
      };
    }
    if (request.language === "python") {
      return {
        status: "unsupported",
        stdout: "",
        stderr: "",
        durationMs: Math.round(performance.now() - started),
        tests: [],
        message: "Python execution runs in the browser Pyodide worker; daemon /run does not execute Python."
      };
    }
    const backend = this.backends.get(request.language);
    if (!backend) {
      return {
        status: "unsupported",
        stdout: "",
        stderr: "",
        durationMs: Math.round(performance.now() - started),
        tests: [],
        message: `No local backend installed for ${request.language}`
      };
    }
    return backend.run(problem, request);
  }
}
