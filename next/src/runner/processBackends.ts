import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import ts from "typescript";
import type { Problem, ProblemTest, RunDiagnostic, RunRequest, RunResult, TestResult, ValueType } from "../core/types.js";
import { writableCacheRoot } from "../runtime/paths.js";
import { resolveScalaToolchain } from "../toolchains/localToolchains.js";
import { jsonEqual } from "./compare.js";
import { diagnosticsFromErrorText, formatDiagnosticsForStderr, locationDiagnostic, type DiagnosticContext } from "./errorDiagnostics.js";
import { resolveGoRuntime } from "./goRuntime.js";
import { commandOutput, runSandboxedProcess, withSandboxWorkdir } from "./processSandbox.js";
import { selectRunTarget } from "./runnerTarget.js";

const RESULT_MARKER = "__DSA_COACH_RESULT__";
const API_MAZE_PROBLEM_ID = "ramp-url-maze";

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
      fileName: "solution.ts",
      reportDiagnostics: true
    });
    const diagnostics = transpiled.diagnostics ?? [];
    const blocking = diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
    if (blocking.length) {
      const runDiagnostics = typeScriptDiagnostics(blocking, request.code, "solution.ts");
      return {
        status: "compile-error",
        stdout: "",
        stderr: formatDiagnosticsForStderr(runDiagnostics),
        durationMs: elapsed(started),
        tests: [],
        message: "TypeScript compile failed",
        diagnostics: runDiagnostics
      };
    }

    return withSandboxWorkdir("dsa-ts-", async (workdir) => {
      await writeFile(join(workdir, "solution.cjs"), transpiled.outputText, "utf8");
      await writeFile(join(workdir, "runner.cjs"), typeScriptHarness(support.entrypoint, tests, problem.id), "utf8");
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
          message: "TypeScript runner did not produce a result payload",
          diagnostics: diagnosticsFromErrorText(processResult.stderr || processResult.stdout, {
            language: "TypeScript",
            sourceFile: "solution.cjs",
            source: transpiled.outputText
          }, "TypeScript runner did not produce a result payload")
        };
      }
      return resultFromPayload(started, tests, payload, processResult.stderr, {
        language: "TypeScript",
        sourceFile: "solution.cjs",
        source: transpiled.outputText
      });
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
    const go = await resolveGoRuntime();
    if (!go.runtime) return baseResult("unsupported", started, [], go.message ?? "Go runner toolchain is not installed");
    const goRuntime = go.runtime;
    const tests = filteredTests(target.tests, request);

    return withSandboxWorkdir("dsa-go-", async (workdir) => {
      const cacheRoot = writableCacheRoot();
      const goCache = resolve(cacheRoot, "go-build");
      const goPath = resolve(cacheRoot, "gopath");
      await mkdir(goCache, { recursive: true });
      await mkdir(goPath, { recursive: true });
      await writeFile(join(workdir, "go.mod"), "module solution\n\ngo 1.22\n", "utf8");
      await writeFile(join(workdir, "solution.go"), request.code, "utf8");
      await writeFile(join(workdir, "solution_test.go"), goHarness(support.entrypoint, activeSignature(problem, request).inputs.length, problem, request, tests), "utf8");
      const compileResult = await runSandboxedProcess({
        command: goRuntime.command,
        args: ["test", "-c", "-o", "runner.test", "."],
        cwd: workdir,
        timeoutMs: request.timeoutMs ?? 1000,
        env: {
          ...(goRuntime.goRoot ? { GOROOT: goRuntime.goRoot } : {}),
          GOCACHE: goCache,
          GOPATH: goPath,
          CGO_ENABLED: "0",
          GOFLAGS: "-buildvcs=false"
        },
        writePaths: [goCache, goPath],
        processExecPaths: goRuntime.processExecPaths,
        allowProcessFork: true,
        allowAnyProcessExec: true,
        sandbox: true
      });
      if (compileResult.timedOut) return timeoutResult(started, tests, compileResult);
      if (compileResult.exitCode !== 0) {
        const diagnostics = diagnosticsFromErrorText(compileResult.stderr, {
          language: "Go",
          sourceFile: "solution.go",
          source: request.code
        }, "Go compile failed");
        return {
          status: "compile-error",
          stdout: compileResult.stdout,
          stderr: compileResult.stderr,
          durationMs: elapsed(started),
          tests: [],
          message: "Go compile failed",
          diagnostics
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
          message: "Go runner did not produce a result payload",
          diagnostics: diagnosticsFromErrorText(processResult.stderr || processResult.stdout, {
            language: "Go",
            sourceFile: "solution.go",
            source: request.code
          }, "Go runner did not produce a result payload")
        };
      }
      return resultFromPayload(started, tests, payload, processResult.stderr, {
        language: "Go",
        sourceFile: "solution.go",
        source: request.code
      });
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
        const diagnostics = diagnosticsFromErrorText(compileResult.stderr, {
          language: "Scala",
          sourceFile: "Solution.scala",
          source: request.code
        }, "Scala compile failed");
        return {
          status: "compile-error",
          stdout: compileResult.stdout,
          stderr: compileResult.stderr,
          durationMs: elapsed(started),
          tests: [],
          message: "Scala compile failed",
          diagnostics
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
          message: "Scala runner did not produce a result payload",
          diagnostics: diagnosticsFromErrorText(runResult.stderr || runResult.stdout, {
            language: "Scala",
            sourceFile: "Solution.scala",
            source: request.code
          }, "Scala runner did not produce a result payload")
        };
      }
      return resultFromPayload(started, tests, payload, runResult.stderr, {
        language: "Scala",
        sourceFile: "Solution.scala",
        source: request.code
      });
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

function typeScriptHarness(entrypoint: string, tests: ProblemTest[], problemId: string): string {
  const mazeHelpers = problemId === API_MAZE_PROBLEM_ID ? `
function makeMazeFetch(web) {
  const attempts = new Map();
  return (url) => {
    const value = Object.prototype.hasOwnProperty.call(web, url) ? web[url] : { status: 404 };
    if (Array.isArray(value)) {
      const index = attempts.get(url) ?? 0;
      attempts.set(url, index + 1);
      if (value.length === 0) return { status: 404 };
      return index < value.length ? value[index] : value[value.length - 1];
    }
    attempts.set(url, (attempts.get(url) ?? 0) + 1);
    return value;
  };
}
` : "";
  const beforeEachTest = problemId === API_MAZE_PROBLEM_ID
    ? `      globalThis.fetchUrl = makeMazeFetch(test.fixture ?? {});\n`
    : "";
  return `"use strict";
const tests = ${JSON.stringify(tests)};
const entrypoint = ${JSON.stringify(entrypoint)};
const marker = ${JSON.stringify(RESULT_MARKER)};
const capturedStdout = [];
const capturedStderr = [];
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
${mazeHelpers}

console.log = (...args) => capturedStdout.push(args.map(String).join(" "));
console.error = (...args) => capturedStderr.push(args.map(String).join(" "));

const payload = { tests: [], stdout: "", stderr: "" };

try {
  const solution = require("./solution.cjs");
  const fn = solution[entrypoint] ?? globalThis[entrypoint];
  if (typeof fn !== "function") throw new Error(\`Missing entrypoint \${entrypoint}\`);
  for (const test of tests) {
    try {
${beforeEachTest}      const actual = fn(...test.args);
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

function goHarness(entrypoint: string, argCount: number, problem: Problem, request: RunRequest, tests: ProblemTest[]): string {
  if (problem.id === API_MAZE_PROBLEM_ID) return goMazeHarness(entrypoint, argCount, problem, request, tests);
  return goStandardHarness(entrypoint, argCount, problem, request, tests);
}

function goHarnessArgs(entrypoint: string, argCount: number, problem: Problem, request: RunRequest) {
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
  return {
    argDecls,
    argsGuard: `\tif len(args) != ${argCount} {
\t\treturn nil, fmt.Sprintf("expected ${argCount} args, got %d", len(args))
\t}`,
    callArgs: signature.inputs.map((_, index) => `arg${index}`).join(", ")
  };
}

function goStandardHarness(entrypoint: string, argCount: number, problem: Problem, request: RunRequest, tests: ProblemTest[]): string {
  const { argDecls, argsGuard, callArgs } = goHarnessArgs(entrypoint, argCount, problem, request);
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

${goNormalizeAnyFunction()}
`;
}

function goMazeHarness(entrypoint: string, argCount: number, problem: Problem, request: RunRequest, tests: ProblemTest[]): string {
  const { argDecls, argsGuard, callArgs } = goHarnessArgs(entrypoint, argCount, problem, request);
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
\tFixture map[string]any \`json:"fixture"\`
}

type harnessResult struct {
\tActual any \`json:"actual"\`
\tError string \`json:"error,omitempty"\`
}

var mazeWeb map[string]any
var mazeAttempts map[string]int

func TestDsaCoachHarness(t *testing.T) {
\traw := ${goRawString(JSON.stringify(tests.map((test) => ({ name: test.name, args: test.args, fixture: test.fixture ?? {} }))))}
\tvar cases []harnessCase
\tif err := json.Unmarshal([]byte(raw), &cases); err != nil {
\t\tpanic(err)
\t}
\tresults := make([]harnessResult, 0, len(cases))
\tfor _, tc := range cases {
\t\tresetMaze(tc.Fixture)
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

func resetMaze(fixture map[string]any) {
\tmazeWeb = normalizeAny(fixture).(map[string]any)
\tmazeAttempts = map[string]int{}
}

func FetchURL(url string) any {
\tvalue, ok := mazeWeb[url]
\tif !ok {
\t\treturn map[string]any{"status": 404}
\t}
\tif responses, ok := value.([]any); ok {
\t\tindex := mazeAttempts[url]
\t\tmazeAttempts[url] = index + 1
\t\tif len(responses) == 0 {
\t\t\treturn map[string]any{"status": 404}
\t\t}
\t\tif index < len(responses) {
\t\t\treturn normalizeAny(responses[index])
\t\t}
\t\treturn normalizeAny(responses[len(responses)-1])
\t}
\tmazeAttempts[url]++
\treturn normalizeAny(value)
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

${goNormalizeAnyFunction()}
`;
}

function goNormalizeAnyFunction(): string {
  return `func normalizeAny(value any) any {
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
}`;
}

function scalaHarness(entrypoint: string, tests: ProblemTest[], problem: Problem, request: RunRequest): string {
  if (problem.id === API_MAZE_PROBLEM_ID) return scalaMazeHarness(entrypoint, tests, problem, request);

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

function scalaMazeHarness(entrypoint: string, tests: ProblemTest[], problem: Problem, request: RunRequest): string {
  const signature = activeSignature(problem, request);
  const cases = tests.map((test, index) => {
    const args = signature.inputs.map((input, argIndex) => scalaLiteral(test.args[argIndex], input.type)).join(", ");
    const fixture = scalaAnyLiteral(test.fixture ?? {});
    return `      runCase(${index}) { MazeApi.reset(${fixture}.asInstanceOf[Map[String, Any]]); Solution.${entrypoint}(${args}) }`;
  }).join(",\n");
  return `import scala.collection.mutable

object MazeApi {
  private var web: Map[String, Any] = Map.empty
  private val attempts = mutable.Map[String, Int]().withDefaultValue(0)

  def reset(fixture: Map[String, Any]): Unit = {
    web = fixture
    attempts.clear()
  }

  def fetchUrl(url: String): Any = {
    web.get(url) match {
      case None => Map("status" -> 404)
      case Some(responses: Seq[_]) =>
        val index = attempts(url)
        attempts(url) = index + 1
        if (responses.isEmpty) Map("status" -> 404)
        else if (index < responses.length) responses(index)
        else responses.last
      case Some(value) =>
        attempts(url) = attempts(url) + 1
        value
    }
  }
}

object Runner {
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

function resultFromPayload(started: number, tests: ProblemTest[], payload: RuntimePayload, processStderr: string, context?: DiagnosticContext): RunResult {
  if (payload.status === "compile-error" || payload.status === "runtime-error") {
    const diagnosticText = [payload.stderr, payload.message, processStderr].filter(Boolean).join("\n");
    return {
      status: payload.status,
      stdout: payload.stdout ?? "",
      stderr: [payload.stderr, payload.message, processStderr].filter(Boolean).join("\n"),
      durationMs: elapsed(started),
      tests: [],
      message: payload.message,
      diagnostics: context ? diagnosticsFromErrorText(diagnosticText, context, payload.message ?? payload.status) : undefined
    };
  }
  const results = tests.map((test, index) => {
    const item = payload.tests?.[index];
    if (!item) {
      return { ...toErroredTest(test, "Runner did not return a result for this test") };
    }
    if (item.error) return toErroredTest(test, item.error, context ? diagnosticsFromErrorText(item.error, context, item.error) : undefined);
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

function toErroredTest(test: ProblemTest, error: string, diagnostics?: RunDiagnostic[]): TestResult {
  return {
    name: test.name,
    passed: false,
    visibility: test.visibility,
    args: test.args,
    expected: test.expected,
    error,
    diagnostics
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
