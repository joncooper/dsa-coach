import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import ts from "typescript";
import type { RunDiagnostic, RunResult, ScratchpadRequest } from "../core/types.js";
import { writableCacheRoot } from "../runtime/paths.js";
import { resolveScalaToolchain } from "../toolchains/localToolchains.js";
import { diagnosticsFromErrorText, formatDiagnosticsForStderr, locationDiagnostic, type DiagnosticContext } from "./errorDiagnostics.js";
import { commandExists, commandOutput, runSandboxedProcess, withSandboxWorkdir } from "./processSandbox.js";
import { resolvePythonRuntime } from "./pythonRuntime.js";

export class ScratchpadRunner {
  async run(request: ScratchpadRequest): Promise<RunResult> {
    if (request.language === "python") return runPythonScratchpad(request);
    if (request.language === "typescript") return runTypeScriptScratchpad(request);
    if (request.language === "go") return runGoScratchpad(request);
    if (request.language === "scala") return runScalaScratchpad(request);
    return {
      status: "unsupported",
      stdout: "",
      stderr: "",
      durationMs: 0,
      tests: [],
      message: `Scratchpad is not configured for ${request.language}`
    };
  }
}

async function runPythonScratchpad(request: ScratchpadRequest): Promise<RunResult> {
  const started = performance.now();
  const python = await resolvePythonRuntime();
  if (!python.runtime) return unsupported(started, python.message ?? "Python 3.10 or newer is not installed");
  const pythonRuntime = python.runtime;

  return withSandboxWorkdir("dsa-scratch-python-", async (workdir) => {
    await writeFile(join(workdir, "scratchpad.py"), request.code, "utf8");
    const result = await runSandboxedProcess({
      command: pythonRuntime.command,
      args: ["scratchpad.py"],
      cwd: workdir,
      timeoutMs: request.timeoutMs ?? 2500,
      processExecPaths: pythonRuntime.processExecPaths,
      allowProcessFork: pythonRuntime.allowProcessFork,
      sandbox: true
    });
    return processToRunResult(started, result, "Python scratchpad failed", {
      language: "Python",
      sourceFile: "scratchpad.py",
      source: request.code
    });
  });
}

async function runTypeScriptScratchpad(request: ScratchpadRequest): Promise<RunResult> {
  const started = performance.now();
  const nodePath = await commandOutput("node", ["-e", "process.stdout.write(process.execPath)"], 1000);
  if (!nodePath) return unsupported(started, "node is not installed");
  const transpiled = ts.transpileModule(request.code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      strict: true
    },
    fileName: "scratchpad.ts",
    reportDiagnostics: true
  });
  const blocking = (transpiled.diagnostics ?? []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  if (blocking.length) {
    const diagnostics = typeScriptDiagnostics(blocking, request.code, "scratchpad.ts");
    return {
      status: "compile-error",
      stdout: "",
      stderr: formatDiagnosticsForStderr(diagnostics),
      durationMs: elapsed(started),
      tests: [],
      message: "TypeScript scratchpad compile failed",
      diagnostics
    };
  }

  return withSandboxWorkdir("dsa-scratch-ts-", async (workdir) => {
    await writeFile(join(workdir, "scratchpad.cjs"), transpiled.outputText, "utf8");
    const result = await runSandboxedProcess({
      command: nodePath,
      args: ["scratchpad.cjs"],
      cwd: workdir,
      timeoutMs: request.timeoutMs ?? 2500,
      sandbox: true
    });
    return processToRunResult(started, result, "TypeScript scratchpad failed", {
      language: "TypeScript",
      sourceFile: "scratchpad.cjs",
      source: transpiled.outputText
    });
  });
}

async function runGoScratchpad(request: ScratchpadRequest): Promise<RunResult> {
  const started = performance.now();
  if (!(await commandExists("go"))) return unsupported(started, "go is not installed");

  return withSandboxWorkdir("dsa-scratch-go-", async (workdir) => {
    const cacheRoot = writableCacheRoot();
    const goCache = resolve(cacheRoot, "go-build");
    const goPath = resolve(cacheRoot, "gopath");
    const goToolDir = await commandOutput("go", ["env", "GOTOOLDIR"], 1000);
    const goCommand = await commandOutput("which", ["go"], 1000);
    await mkdir(goCache, { recursive: true });
    await mkdir(goPath, { recursive: true });
    await writeFile(join(workdir, "go.mod"), "module scratchpad\n\ngo 1.22\n", "utf8");
    await writeFile(join(workdir, "main.go"), request.code, "utf8");
    const common = {
      cwd: workdir,
      timeoutMs: request.timeoutMs ?? 5000,
      env: {
        GOCACHE: goCache,
        GOPATH: goPath,
        CGO_ENABLED: "0",
        GOFLAGS: "-buildvcs=false"
      },
      writePaths: [goCache, goPath],
      processExecPaths: [goToolDir, goCommand].filter((path): path is string => Boolean(path)),
      allowProcessFork: true,
      allowAnyProcessExec: true,
      sandbox: true
    };
    const compileResult = await runSandboxedProcess({
      ...common,
      command: "go",
      args: ["build", "-o", "scratchpad", "."]
    });
    if (compileResult.timedOut) return timeout(started, compileResult.stdout, compileResult.stderr);
    if (compileResult.exitCode !== 0) {
      const diagnostics = diagnosticsFromErrorText(compileResult.stderr, {
        language: "Go",
        sourceFile: "main.go",
        source: request.code
      }, "Go scratchpad compile failed");
      return {
        status: "compile-error",
        stdout: compileResult.stdout,
        stderr: compileResult.stderr,
        durationMs: elapsed(started),
        tests: [],
        message: "Go scratchpad compile failed",
        diagnostics
      };
    }
    const runResult = await runSandboxedProcess({
      command: join(workdir, "scratchpad"),
      args: [],
      cwd: workdir,
      timeoutMs: request.timeoutMs ?? 2500,
      sandbox: true
    });
    return processToRunResult(started, runResult, "Go scratchpad failed", {
      language: "Go",
      sourceFile: "main.go",
      source: request.code
    });
  });
}

async function runScalaScratchpad(request: ScratchpadRequest): Promise<RunResult> {
  const started = performance.now();
  const scala = await resolveScalaToolchain();
  if (!scala) return unsupported(started, "Scala toolchain is not installed. Run bun run setup:toolchains.");

  return withSandboxWorkdir("dsa-scratch-scala-", async (workdir) => {
    const classesDir = join(workdir, "classes");
    await mkdir(classesDir, { recursive: true });
    await writeFile(join(workdir, "Scratchpad.scala"), request.code, "utf8");
    const compileResult = await runSandboxedProcess({
      command: scala.java,
      args: [
        "-XX:+PerfDisableSharedMem",
        "-Xmx768m",
        "-Xms768m",
        "-classpath",
        scala.classpath,
        "-Dscala.expandjavacp=true",
        "-Dscala.usejavacp=true",
        `-Dscala.home=${scala.home}`,
        "dotty.tools.MainGenericCompiler",
        "-d",
        classesDir,
        "Scratchpad.scala"
      ],
      cwd: workdir,
      timeoutMs: request.timeoutMs ?? 10000,
      sandbox: true
    });
    if (compileResult.timedOut) return timeout(started, compileResult.stdout, compileResult.stderr);
    if (compileResult.exitCode !== 0) {
      const diagnostics = diagnosticsFromErrorText(compileResult.stderr, {
        language: "Scala",
        sourceFile: "Scratchpad.scala",
        source: request.code
      }, "Scala scratchpad compile failed");
      return {
        status: "compile-error",
        stdout: compileResult.stdout,
        stderr: compileResult.stderr,
        durationMs: elapsed(started),
        tests: [],
        message: "Scala scratchpad compile failed",
        diagnostics
      };
    }
    const runResult = await runSandboxedProcess({
      command: scala.java,
      args: [
        "-XX:+PerfDisableSharedMem",
        "-classpath",
        [scala.classpath, classesDir].join(":"),
        "-Dscala.expandjavacp=true",
        `-Dscala.home=${scala.home}`,
        "Scratchpad"
      ],
      cwd: workdir,
      timeoutMs: request.timeoutMs ?? 5000,
      sandbox: true
    });
    return processToRunResult(started, runResult, "Scala scratchpad failed", {
      language: "Scala",
      sourceFile: "Scratchpad.scala",
      source: request.code
    });
  });
}

function processToRunResult(
  started: number,
  result: { exitCode: number | null; stdout: string; stderr: string; timedOut: boolean },
  message: string,
  context?: DiagnosticContext
): RunResult {
  if (result.timedOut) return timeout(started, result.stdout, result.stderr);
  const failed = result.exitCode !== 0;
  return {
    status: failed ? "runtime-error" : "passed",
    stdout: result.stdout,
    stderr: result.stderr,
    durationMs: elapsed(started),
    tests: [],
    message: failed ? `${message}${result.exitCode === null ? "" : ` with exit code ${result.exitCode}`}` : undefined,
    diagnostics: failed && context ? diagnosticsFromErrorText(result.stderr || result.stdout, context, message) : undefined
  };
}

function unsupported(started: number, message: string): RunResult {
  return {
    status: "unsupported",
    stdout: "",
    stderr: "",
    durationMs: elapsed(started),
    tests: [],
    message
  };
}

function timeout(started: number, stdout: string, stderr: string): RunResult {
  return {
    status: "timeout",
    stdout,
    stderr,
    durationMs: elapsed(started),
    tests: [],
    message: "Scratchpad execution timed out"
  };
}

function elapsed(started: number): number {
  return Math.round(performance.now() - started);
}

function typeScriptDiagnostics(diagnostics: readonly ts.Diagnostic[], source: string, sourceFile: string): RunDiagnostic[] {
  return diagnostics.map((diagnostic) => {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    if (diagnostic.file && typeof diagnostic.start === "number") {
      const start = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      return {
        ...locationDiagnostic(message, { language: "TypeScript", sourceFile, source }, start.line + 1, start.character + 1, diagnostic.length ?? 1),
        code: `TS${diagnostic.code}`
      };
    }
    return {
      message,
      severity: "error",
      source: "TypeScript",
      file: sourceFile,
      code: `TS${diagnostic.code}`
    };
  });
}
