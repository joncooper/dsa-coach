import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import ts from "typescript";
import type { Problem, ProblemTest, RunRequest, RunResult, TestResult, ValueType } from "../core/types.js";
import { resolveScalaToolchain } from "../toolchains/localToolchains.js";
import { jsonEqual } from "./compare.js";
import { commandExists, commandOutput, runSandboxedProcess, withSandboxWorkdir } from "./processSandbox.js";
import { selectRunTarget } from "./runnerTarget.js";

const RESULT_MARKER = "__DSA_COACH_RESULT__";

interface RuntimePayload {
  stdout?: string;
  stderr?: string;
  tests?: Array<{ actual?: unknown; error?: string }>;
  status?: RunResult["status"];
  message?: string;
}

export class TypeScriptProcessBackend {
  async run(problem: Problem, request: RunRequest): Promise<RunResult> {
    const started = performance.now();
    const target = selectRunTarget(problem, request);
    if (!target) return baseResult("unsupported", started, [], `Problem ${problem.id} has no part ${request.partId}`);
    const support = target.languages[request.language];
    if (!support) return baseResult("unsupported", started, [], `Problem ${target.label} does not support ${request.language}`);
    const nodePath = await commandOutput("node", ["-e", "process.stdout.write(process.execPath)"], 1000);
    if (!nodePath) return baseResult("unsupported", started, [], "node is not installed");
    const tests = filteredTests(target.tests, request);

    const transpiled = ts.transpileModule(request.code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        strict: true
      },
      reportDiagnostics: true
    });
    const diagnostics = transpiled.diagnostics ?? [];
    const blocking = diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
    if (blocking.length) {
      return {
        status: "compile-error",
        stdout: "",
        stderr: formatDiagnostics(blocking),
        durationMs: elapsed(started),
        tests: [],
        message: "TypeScript compile failed"
      };
    }

    return withSandboxWorkdir("dsa-ts-", async (workdir) => {
      await writeFile(join(workdir, "solution.cjs"), transpiled.outputText, "utf8");
      await writeFile(join(workdir, "runner.cjs"), typeScriptHarness(support.entrypoint, tests), "utf8");
      const processResult = await runSandboxedProcess({
        command: nodePath,
        args: ["runner.cjs"],
        cwd: workdir,
        timeoutMs: request.timeoutMs ?? 1000,
        sandbox: true
      });
      if (processResult.timedOut) return timeoutResult(started, tests, processResult);
      const payload = payloadFromMarker(processResult.stdout);
      if (!payload) {
        return {
          status: processResult.exitCode === 0 ? "runtime-error" : "compile-error",
          stdout: processResult.stdout,
          stderr: processResult.stderr,
          durationMs: elapsed(started),
          tests: [],
          message: "TypeScript runner did not produce a result payload"
        };
      }
      return resultFromPayload(started, tests, payload, processResult.stderr);
    });
  }
}

export class PythonProcessBackend {
  async run(problem: Problem, request: RunRequest): Promise<RunResult> {
    const started = performance.now();
    const target = selectRunTarget(problem, request);
    if (!target) return baseResult("unsupported", started, [], `Problem ${problem.id} has no part ${request.partId}`);
    const support = target.languages[request.language];
    if (!support) return baseResult("unsupported", started, [], `Problem ${target.label} does not support ${request.language}`);
    if (!(await commandExists("python3"))) return baseResult("unsupported", started, [], "python3 is not installed");
    const pythonPath = await commandOutput("python3", ["-c", "import os, sys; print(os.path.realpath(sys.executable))"], 1000);
    if (!pythonPath) return baseResult("unsupported", started, [], "Unable to resolve python3 executable");
    const tests = filteredTests(target.tests, request);

    return withSandboxWorkdir("dsa-python-", async (workdir) => {
      await writeFile(join(workdir, "solution.py"), request.code, "utf8");
      await writeFile(join(workdir, "runner.py"), pythonHarness(support.entrypoint, tests), "utf8");
      const processResult = await runSandboxedProcess({
        command: pythonPath,
        args: ["runner.py"],
        cwd: workdir,
        timeoutMs: request.timeoutMs ?? 1000,
        processExecPaths: pythonFrameworkExecPaths(pythonPath),
        sandbox: true
      });
      if (processResult.timedOut) return timeoutResult(started, tests, processResult);
      const payload = payloadFromMarker(processResult.stdout);
      if (!payload) {
        return {
          status: processResult.exitCode === 0 ? "runtime-error" : "compile-error",
          stdout: processResult.stdout,
          stderr: processResult.stderr,
          durationMs: elapsed(started),
          tests: [],
          message: "Python runner did not produce a result payload"
        };
      }
      return resultFromPayload(started, tests, payload, processResult.stderr);
    });
  }
}

export class GoProcessBackend {
  async run(problem: Problem, request: RunRequest): Promise<RunResult> {
    const started = performance.now();
    const target = selectRunTarget(problem, request);
    if (!target) return baseResult("unsupported", started, [], `Problem ${problem.id} has no part ${request.partId}`);
    const support = target.languages[request.language];
    if (!support) return baseResult("unsupported", started, [], `Problem ${target.label} does not support ${request.language}`);
    if (!(await commandExists("go"))) return baseResult("unsupported", started, [], "go is not installed");
    const tests = filteredTests(target.tests, request);

    return withSandboxWorkdir("dsa-go-", async (workdir) => {
      const goCache = resolve(".runner-cache/go-build");
      const goPath = resolve(".runner-cache/gopath");
      const goToolDir = await commandOutput("go", ["env", "GOTOOLDIR"], 1000);
      const goCommand = await commandOutput("which", ["go"], 1000);
      await mkdir(goCache, { recursive: true });
      await mkdir(goPath, { recursive: true });
      await writeFile(join(workdir, "go.mod"), "module solution\n\ngo 1.22\n", "utf8");
      await writeFile(join(workdir, "solution.go"), request.code, "utf8");
      await writeFile(join(workdir, "solution_test.go"), goHarness(support.entrypoint, target.tests[0]?.args.length ?? 0, problem, request, tests), "utf8");
      const compileResult = await runSandboxedProcess({
        command: "go",
        args: ["test", "-c", "-o", "runner.test", "."],
        cwd: workdir,
        timeoutMs: request.timeoutMs ?? 1000,
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
      });
      if (compileResult.timedOut) return timeoutResult(started, tests, compileResult);
      if (compileResult.exitCode !== 0) {
        return {
          status: "compile-error",
          stdout: compileResult.stdout,
          stderr: compileResult.stderr,
          durationMs: elapsed(started),
          tests: [],
          message: "Go compile failed"
        };
      }
      const processResult = await runSandboxedProcess({
        command: join(workdir, "runner.test"),
        args: ["-test.run", "TestDsaCoachHarness", "-test.v=false"],
        cwd: workdir,
        timeoutMs: request.timeoutMs ?? 1000,
        sandbox: true
      });
      if (processResult.timedOut) return timeoutResult(started, tests, processResult);
      const payload = await payloadFromFile(join(workdir, "result.json"));
      if (!payload) {
        return {
          status: "runtime-error",
          stdout: processResult.stdout,
          stderr: processResult.stderr,
          durationMs: elapsed(started),
          tests: [],
          message: "Go runner did not produce a result payload"
        };
      }
      return resultFromPayload(started, tests, payload, processResult.stderr);
    });
  }
}

export class ScalaProcessBackend {
  async run(problem: Problem, request: RunRequest): Promise<RunResult> {
    const started = performance.now();
    const target = selectRunTarget(problem, request);
    if (!target) return baseResult("unsupported", started, [], `Problem ${problem.id} has no part ${request.partId}`);
    const support = target.languages[request.language];
    if (!support) return baseResult("unsupported", started, [], `Problem ${target.label} does not support ${request.language}`);
    const scala = await resolveScalaToolchain();
    if (!scala) return baseResult("unsupported", started, [], "Scala runner requires the local Scala toolchain. Run bun run setup:toolchains.");
    const tests = filteredTests(target.tests, request);
    const timeoutMs = request.timeoutMs ?? 30000;

    return withSandboxWorkdir("dsa-scala-", async (workdir) => {
      const classesDir = join(workdir, "classes");
      await mkdir(classesDir, { recursive: true });
      await writeFile(join(workdir, "Solution.scala"), request.code, "utf8");
      await writeFile(join(workdir, "Runner.scala"), scalaHarness(support.entrypoint, tests, problem, request), "utf8");
      const compileResult = await runSandboxedProcess({
        command: scala.java,
        args: scalaCompileArgs(scala.home, scala.classpath, classesDir),
        cwd: workdir,
        timeoutMs,
        sandbox: true
      });
      if (compileResult.timedOut) return timeoutResult(started, tests, compileResult);
      if (compileResult.exitCode !== 0) {
        return {
          status: "compile-error",
          stdout: compileResult.stdout,
          stderr: compileResult.stderr,
          durationMs: elapsed(started),
          tests: [],
          message: "Scala compile failed"
        };
      }
      const runResult = await runSandboxedProcess({
        command: scala.java,
        args: scalaRunArgs(scala.home, scala.classpath, classesDir),
        cwd: workdir,
        timeoutMs,
        sandbox: true
      });
      if (runResult.timedOut) return timeoutResult(started, tests, runResult);
      const payload = payloadFromMarker(runResult.stdout);
      if (!payload) {
        return {
          status: "runtime-error",
          stdout: runResult.stdout,
          stderr: runResult.stderr,
          durationMs: elapsed(started),
          tests: [],
          message: "Scala runner did not produce a result payload"
        };
      }
      return resultFromPayload(started, tests, payload, runResult.stderr);
    });
  }
}

function scalaCompileArgs(scalaHome: string, classpath: string, classesDir: string): string[] {
  return [
    "-XX:+PerfDisableSharedMem",
    "-Xmx768m",
    "-Xms768m",
    "-classpath",
    classpath,
    "-Dscala.expandjavacp=true",
    "-Dscala.usejavacp=true",
    `-Dscala.home=${scalaHome}`,
    "dotty.tools.MainGenericCompiler",
    "-d",
    classesDir,
    "Solution.scala",
    "Runner.scala"
  ];
}

function scalaRunArgs(scalaHome: string, classpath: string, classesDir: string): string[] {
  return [
    "-XX:+PerfDisableSharedMem",
    "-classpath",
    [classpath, classesDir].join(":"),
    "-Dscala.expandjavacp=true",
    `-Dscala.home=${scalaHome}`,
    "Runner"
  ];
}

function typeScriptHarness(entrypoint: string, tests: ProblemTest[]): string {
  return `"use strict";
const tests = ${JSON.stringify(tests)};
const entrypoint = ${JSON.stringify(entrypoint)};
const marker = ${JSON.stringify(RESULT_MARKER)};
const capturedStdout = [];
const capturedStderr = [];
const originalStdoutWrite = process.stdout.write.bind(process.stdout);

console.log = (...args) => capturedStdout.push(args.map(String).join(" "));
console.error = (...args) => capturedStderr.push(args.map(String).join(" "));

const payload = { tests: [], stdout: "", stderr: "" };

try {
  const solution = require("./solution.cjs");
  const fn = solution[entrypoint] ?? globalThis[entrypoint];
  if (typeof fn !== "function") throw new Error(\`Missing entrypoint \${entrypoint}\`);
  for (const test of tests) {
    try {
      const actual = fn(...test.args);
      JSON.stringify(actual);
      payload.tests.push({ actual });
    } catch (error) {
      payload.tests.push({ error: error instanceof Error ? error.stack ?? error.message : String(error) });
    }
  }
} catch (error) {
  payload.status = "runtime-error";
  payload.message = error instanceof Error ? error.stack ?? error.message : String(error);
}

payload.stdout = capturedStdout.join("\\n");
payload.stderr = capturedStderr.join("\\n");
originalStdoutWrite(marker + JSON.stringify(payload));
`;
}

function pythonHarness(entrypoint: string, tests: ProblemTest[]): string {
  return `import contextlib
import importlib.util
import io
import json
import traceback

TESTS = json.loads(${JSON.stringify(JSON.stringify(tests))})
ENTRYPOINT = ${JSON.stringify(entrypoint)}
MARKER = ${JSON.stringify(RESULT_MARKER)}

stdout_buffer = io.StringIO()
stderr_buffer = io.StringIO()
payload = {"tests": [], "stdout": "", "stderr": ""}

try:
    with contextlib.redirect_stdout(stdout_buffer), contextlib.redirect_stderr(stderr_buffer):
        spec = importlib.util.spec_from_file_location("solution", "solution.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
    fn = getattr(module, ENTRYPOINT, None)
    if not callable(fn):
        raise RuntimeError(f"Missing entrypoint {ENTRYPOINT}")
except SyntaxError:
    payload["status"] = "compile-error"
    payload["message"] = traceback.format_exc()
except Exception:
    payload["status"] = "runtime-error"
    payload["message"] = traceback.format_exc()
else:
    for test in TESTS:
        try:
            with contextlib.redirect_stdout(stdout_buffer), contextlib.redirect_stderr(stderr_buffer):
                actual = fn(*test["args"])
            json.dumps(actual)
            payload["tests"].append({"actual": actual})
        except Exception:
            payload["tests"].append({"error": traceback.format_exc()})

payload["stdout"] = stdout_buffer.getvalue()
payload["stderr"] = stderr_buffer.getvalue()
print(MARKER + json.dumps(payload, separators=(",", ":")))
`;
}

function goHarness(entrypoint: string, argCount: number, problem: Problem, request: RunRequest, tests: ProblemTest[]): string {
  const signature = activeSignature(problem, request);
  const paramTypes = goParamTypesFromSource(request.code, entrypoint, signature.inputs.map((input) => goType(input.type)));
  const argDecls = signature.inputs.map((input, index) => {
    const paramType = paramTypes[index] ?? goType(input.type);
    const normalize = needsAnyNormalization(paramType) ? `\targ${index} = normalizeAny(arg${index}).(${paramType})\n` : "";
    return `\tvar arg${index} ${paramType}
\tif err := json.Unmarshal(args[${index}], &arg${index}); err != nil {
\t\treturn nil, err.Error()
\t}
${normalize}`;
  }).join("\n");
  const callArgs = signature.inputs.map((_, index) => `arg${index}`).join(", ");
  const argsGuard = `\tif len(args) != ${argCount} {
\t\treturn nil, fmt.Sprintf("expected ${argCount} args, got %d", len(args))
\t}`;
  return `package solution

import (
\t"encoding/json"
\t"fmt"
\t"os"
\t"runtime/debug"
\t"testing"
)

type harnessCase struct {
\tName string \`json:"name"\`
\tArgs []json.RawMessage \`json:"args"\`
}

type harnessResult struct {
\tActual any \`json:"actual"\`
\tError string \`json:"error,omitempty"\`
}

func TestDsaCoachHarness(t *testing.T) {
\traw := ${goRawString(JSON.stringify(tests.map((test) => ({ name: test.name, args: test.args }))))}
\tvar cases []harnessCase
\tif err := json.Unmarshal([]byte(raw), &cases); err != nil {
\t\tpanic(err)
\t}
\tresults := make([]harnessResult, 0, len(cases))
\tfor _, tc := range cases {
\t\tactual, errText := callEntrypoint(tc.Args)
\t\tif errText != "" {
\t\t\tresults = append(results, harnessResult{Error: errText})
\t\t} else {
\t\t\tresults = append(results, harnessResult{Actual: actual})
\t\t}
\t}
\tpayload, _ := json.Marshal(map[string]any{"tests": results})
\tif err := os.WriteFile("result.json", payload, 0600); err != nil {
\t\tpanic(err)
\t}
}

func callEntrypoint(args []json.RawMessage) (actual any, errText string) {
\tdefer func() {
\t\tif recovered := recover(); recovered != nil {
\t\t\terrText = fmt.Sprintf("%v\\n%s", recovered, string(debug.Stack()))
\t\t}
\t}()
${argsGuard}
${argDecls}
\treturn ${entrypoint}(${callArgs}), ""
}

func normalizeAny(value any) any {
\tswitch typed := value.(type) {
\tcase float64:
\t\tif typed == float64(int(typed)) {
\t\t\treturn int(typed)
\t\t}
\t\treturn typed
\tcase []any:
\t\tfor index, item := range typed {
\t\t\ttyped[index] = normalizeAny(item)
\t\t}
\t\treturn typed
\tcase [][]any:
\t\tfor rowIndex, row := range typed {
\t\t\ttyped[rowIndex] = normalizeAny(row).([]any)
\t\t}
\t\treturn typed
\tcase map[string]any:
\t\tfor key, item := range typed {
\t\t\ttyped[key] = normalizeAny(item)
\t\t}
\t\treturn typed
\tcase []map[string]any:
\t\tfor index, item := range typed {
\t\t\ttyped[index] = normalizeAny(item).(map[string]any)
\t\t}
\t\treturn typed
\tcase map[string][]any:
\t\tfor key, item := range typed {
\t\t\ttyped[key] = normalizeAny(item).([]any)
\t\t}
\t\treturn typed
\tdefault:
\t\treturn typed
\t}
}
`;
}

function scalaHarness(entrypoint: string, tests: ProblemTest[], problem: Problem, request: RunRequest): string {
  const signature = activeSignature(problem, request);
  const cases = tests.map((test, index) => {
    const args = signature.inputs.map((input, argIndex) => scalaLiteral(test.args[argIndex], input.type)).join(", ");
    return `      runCase(${index}) { Solution.${entrypoint}(${args}) }`;
  }).join(",\n");
  return `object Runner {
  def main(args: Array[String]): Unit = {
    val results = Seq(
${cases}
    )
    println(${JSON.stringify(RESULT_MARKER)} + toJson(Map("tests" -> results)))
  }

  private def runCase(index: Int)(body: => Any): Map[String, Any] = {
    try Map("actual" -> body)
    catch {
      case error: Throwable => Map("error" -> (error.getClass.getName + ": " + error.getMessage))
    }
  }

  private def toJson(value: Any): String = value match {
    case null => "null"
    case s: String => quote(s)
    case b: Boolean => b.toString
    case n: Byte => n.toString
    case n: Short => n.toString
    case n: Int => n.toString
    case n: Long => n.toString
    case n: Float => if (n.isWhole) n.toInt.toString else n.toString
    case n: Double => if (n.isWhole) n.toInt.toString else n.toString
    case Some(inner) => toJson(inner)
    case None => "null"
    case tuple: Product if tuple.productArity > 0 && tuple.productPrefix.startsWith("Tuple") =>
      tuple.productIterator.map(toJson).mkString("[", ",", "]")
    case map: scala.collection.Map[_, _] =>
      map.toSeq.map { case (k, v) => quote(k.toString) + ":" + toJson(v) }.sortBy(identity).mkString("{", ",", "}")
    case seq: Seq[_] => seq.map(toJson).mkString("[", ",", "]")
    case array: Array[_] => array.toSeq.map(toJson).mkString("[", ",", "]")
    case other => quote(other.toString)
  }

  private def quote(value: String): String = {
    val escaped = value.flatMap {
      case char if char == 92.toChar => 92.toChar.toString + 92.toChar.toString
      case char if char == 34.toChar => 92.toChar.toString + 34.toChar.toString
      case '\\n' => 92.toChar.toString + "n"
      case '\\r' => 92.toChar.toString + "r"
      case '\\t' => 92.toChar.toString + "t"
      case char => char.toString
    }
    34.toChar.toString + escaped + 34.toChar.toString
  }
}
`;
}

function filteredTests(tests: ProblemTest[], request: RunRequest): ProblemTest[] {
  return tests.filter((test) => request.includeHidden || test.visibility === "visible");
}

function resultFromPayload(started: number, tests: ProblemTest[], payload: RuntimePayload, processStderr: string): RunResult {
  if (payload.status === "compile-error" || payload.status === "runtime-error") {
    return {
      status: payload.status,
      stdout: payload.stdout ?? "",
      stderr: [payload.stderr, payload.message, processStderr].filter(Boolean).join("\n"),
      durationMs: elapsed(started),
      tests: [],
      message: payload.message
    };
  }
  const results = tests.map((test, index) => {
    const item = payload.tests?.[index];
    if (!item) {
      return { ...toErroredTest(test, "Runner did not return a result for this test") };
    }
    if (item.error) return toErroredTest(test, item.error);
    return toTestResult(test, jsonEqual(item.actual, test.expected), item.actual);
  });
  return {
    status: results.every((result) => result.passed) ? "passed" : "failed",
    stdout: payload.stdout ?? "",
    stderr: [payload.stderr, processStderr].filter(Boolean).join("\n"),
    durationMs: elapsed(started),
    tests: results
  };
}

function payloadFromMarker(stdout: string): RuntimePayload | undefined {
  const markerIndex = stdout.lastIndexOf(RESULT_MARKER);
  if (markerIndex === -1) return undefined;
  try {
    return JSON.parse(stdout.slice(markerIndex + RESULT_MARKER.length)) as RuntimePayload;
  } catch {
    return undefined;
  }
}

async function payloadFromFile(path: string): Promise<RuntimePayload | undefined> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as RuntimePayload;
  } catch {
    return undefined;
  }
}

function activeSignature(problem: Problem, request: RunRequest) {
  if (!request.partId) return problem.signature;
  return problem.parts?.find((part) => part.id === request.partId)?.signature ?? problem.signature;
}

function baseResult(status: RunResult["status"], started: number, tests: TestResult[], message: string): RunResult {
  return {
    status,
    stdout: "",
    stderr: "",
    durationMs: elapsed(started),
    tests,
    message
  };
}

function timeoutResult(started: number, tests: ProblemTest[], processResult: { stdout: string; stderr: string }): RunResult {
  return {
    status: "timeout",
    stdout: processResult.stdout,
    stderr: processResult.stderr,
    durationMs: elapsed(started),
    tests: tests.map((test) => toErroredTest(test, "Execution timed out")),
    message: "Execution timed out"
  };
}

function toTestResult(test: ProblemTest, passed: boolean, actual: unknown): TestResult {
  return {
    name: test.name,
    passed,
    visibility: test.visibility,
    args: test.args,
    expected: test.expected,
    actual
  };
}

function toErroredTest(test: ProblemTest, error: string): TestResult {
  return {
    name: test.name,
    passed: false,
    visibility: test.visibility,
    args: test.args,
    expected: test.expected,
    error
  };
}

function elapsed(started: number): number {
  return Math.round(performance.now() - started);
}

function formatDiagnostics(diagnostics: readonly ts.Diagnostic[]): string {
  return diagnostics.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")).join("\n");
}

function goType(type: ValueType): string {
  if (type.type === "array") return `[]${goType(type.items ?? { type: "any" })}`;
  if (type.type === "object") return "map[string]any";
  if (type.type === "number") return "int";
  if (type.type === "boolean") return "bool";
  if (type.type === "string") return "string";
  return "any";
}

function goParamTypesFromSource(source: string, entrypoint: string, fallback: string[]): string[] {
  const escaped = entrypoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`func\\s+${escaped}\\s*\\(([^)]*)\\)`));
  if (!match) return fallback;
  const params = match[1].split(",").map((param) => param.trim()).filter(Boolean);
  if (params.length !== fallback.length) return fallback;
  return params.map((param, index) => {
    const pieces = param.split(/\s+/);
    return pieces.length >= 2 ? pieces.slice(1).join(" ") : fallback[index];
  });
}

function pythonFrameworkExecPaths(pythonPath: string): string[] {
  const marker = "/Python.framework/Versions/";
  const index = pythonPath.indexOf(marker);
  if (index === -1) return [];
  const rest = pythonPath.slice(index + marker.length);
  const version = rest.split("/")[0];
  return [`${pythonPath.slice(0, index)}${marker}${version}`];
}

function needsAnyNormalization(goTypeName: string): boolean {
  return /\bany\b|interface\{\}/.test(goTypeName);
}

function scalaLiteral(value: unknown, type: ValueType): string {
  if (value === null || value === undefined) return "null";
  if (type.type === "number" && typeof value === "number") return String(value);
  if (type.type === "string" && typeof value === "string") return JSON.stringify(value);
  if (type.type === "boolean" && typeof value === "boolean") return value ? "true" : "false";
  if (type.type === "array" && Array.isArray(value)) {
    const itemType = type.items ?? { type: "any" as const };
    return `Seq(${value.map((item) => scalaLiteral(item, itemType)).join(", ")})`;
  }
  if (type.type === "object" && isPlainObject(value)) {
    return `Map(${Object.entries(value).map(([key, item]) => `${JSON.stringify(key)} -> ${scalaAnyLiteral(item)}`).join(", ")})`;
  }
  return scalaAnyLiteral(value);
}

function scalaAnyLiteral(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return `Seq(${value.map(scalaAnyLiteral).join(", ")})`;
  if (isPlainObject(value)) {
    return `Map(${Object.entries(value).map(([key, item]) => `${JSON.stringify(key)} -> ${scalaAnyLiteral(item)}`).join(", ")})`;
  }
  return JSON.stringify(String(value));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function goRawString(value: string): string {
  return `\`${value.replaceAll("`", "` + \"`\" + `")}\``;
}
