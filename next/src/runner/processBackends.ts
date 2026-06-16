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
import { resolvePythonRuntime } from "./pythonRuntime.js";
import { selectRunTarget } from "./runnerTarget.js";

const RESULT_MARKER = "__DSA_COACH_RESULT__";
const API_MAZE_PROBLEM_ID = "ramp-url-maze";
const RAMP_TRAVEL_API_PROBLEM_PREFIX = "ramp-travel-api-";

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

export class PythonProcessBackend {
  async run(problem: Problem, request: RunRequest): Promise<RunResult> {
    const started = performance.now();
    const target = selectRunTarget(problem, request);
    if (!target) return baseResult("unsupported", started, [], `Problem ${problem.id} has no part ${request.partId}`);
    const support = target.languages[request.language];
    if (!support) return baseResult("unsupported", started, [], `Problem ${target.label} does not support ${request.language}`);
    const python = await resolvePythonRuntime();
    if (!python.runtime) return baseResult("unsupported", started, [], python.message ?? "Python 3.10 or newer is not installed");
    const pythonRuntime = python.runtime;
    const tests = filteredTests(target.tests, request);

    return withSandboxWorkdir("dsa-python-", async (workdir) => {
      await writeFile(join(workdir, "solution.py"), request.code, "utf8");
      await writeFile(join(workdir, "runner.py"), pythonHarness(support.entrypoint, tests, problem.id), "utf8");
      const processResult = await runSandboxedProcess({
        command: pythonRuntime.command,
        args: ["runner.py"],
        cwd: workdir,
        timeoutMs: request.timeoutMs ?? 1000,
        processExecPaths: pythonRuntime.processExecPaths,
        allowProcessFork: pythonRuntime.allowProcessFork,
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
          message: "Python runner did not produce a result payload",
          diagnostics: diagnosticsFromErrorText(processResult.stderr || processResult.stdout, {
            language: "Python",
            sourceFile: "solution.py",
            source: request.code
          }, "Python runner did not produce a result payload")
        };
      }
      return resultFromPayload(started, tests, payload, processResult.stderr, {
        language: "Python",
        sourceFile: "solution.py",
        source: request.code
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

function pythonHarness(entrypoint: string, tests: ProblemTest[], problemId: string): string {
  const mazeHelpers = problemId === API_MAZE_PROBLEM_ID ? `
def make_maze_fetch(web):
    attempts = {}

    def fetch_url(url):
        value = web.get(url, {"status": 404})
        if isinstance(value, list):
            index = attempts.get(url, 0)
            attempts[url] = index + 1
            if not value:
                return {"status": 404}
            return value[index] if index < len(value) else value[-1]
        attempts[url] = attempts.get(url, 0) + 1
        return value

    return fetch_url
` : "";
  const rampTravelApiHelpers = problemId.startsWith(RAMP_TRAVEL_API_PROBLEM_PREFIX) ? `
import copy
import re
import sys
import types
from urllib.parse import parse_qs, urlparse


class RampTravelHTTPError(RuntimeError):
    pass


class RampTravelApiError(RuntimeError):
    pass


class RampTravelAuthError(RampTravelApiError):
    pass


class RampTravelNotFoundError(RampTravelApiError):
    pass


class RampTravelOcrError(RampTravelApiError):
    pass


class RampTravelRateLimitError(RampTravelApiError):
    pass


class RampTravelMockResponse:
    def __init__(self, status_code=200, body=None, headers=None):
        self.status_code = status_code
        self._body = copy.deepcopy(body if body is not None else {})
        self.headers = headers or {}
        self.text = json.dumps(self._body)

    def json(self):
        return copy.deepcopy(self._body)

    def raise_for_status(self):
        if self.status_code >= 400:
            raise RampTravelHTTPError(f"{self.status_code} response: {self._body}")


class RampTravelMockRequests:
    def __init__(self):
        self.reset({})

    def reset(self, fixture):
        self.fixture = copy.deepcopy(fixture or {})
        self.trip_rate_limit_seen = set()
        self.transaction_attempts = {}
        self.created_expenses = {}

    def get(self, url, headers=None, params=None, timeout=None, **kwargs):
        path, merged_params = self._parse_url(url, params)

        if path == "/v1/bookings":
            return self._page_response(
                self.fixture.get("bookings", []),
                merged_params,
                default_limit=10,
                max_limit=self._page_cap("bookings", 20)
            )

        if not self._authorized(headers):
            return RampTravelMockResponse(401, {"error": "unauthorized"})

        if path == "/v1/employees":
            employees = self.fixture.get("employees", [])
            department = self._param(merged_params, "department")
            if self.fixture.get("requireDepartmentFilter") and not department:
                return RampTravelMockResponse(400, {"error": "missing_department_filter"})
            if department:
                employees = [employee for employee in employees if employee.get("department") == department]
            return self._page_response(
                employees,
                merged_params,
                default_limit=5,
                max_limit=self._page_cap("employees", 5)
            )

        employee_trips_match = re.fullmatch(r"/v1/employees/([^/]+)/trips", path)
        if employee_trips_match:
            employee_id = employee_trips_match.group(1)
            trips = [trip for trip in self.fixture.get("trips", []) if trip.get("employee_id") == employee_id]
            return RampTravelMockResponse(200, {"data": trips})

        if path == "/v1/trips":
            cursor_key = self._param(merged_params, "cursor") or ""
            rate_limited_cursors = set(str(cursor) for cursor in self.fixture.get("tripRateLimitOnce", []))
            if cursor_key in rate_limited_cursors and cursor_key not in self.trip_rate_limit_seen:
                self.trip_rate_limit_seen.add(cursor_key)
                return RampTravelMockResponse(
                    429,
                    {"error": "rate_limited", "message": "retry this same request"},
                    {"Retry-After": "0"}
                )
            return self._page_response(
                self.fixture.get("trips", []),
                merged_params,
                default_limit=10,
                max_limit=self._page_cap("trips", 25)
            )

        if path == "/v1/transactions":
            if self.fixture.get("requireBroken") and not self._param(merged_params, "broken"):
                return RampTravelMockResponse(400, {"error": "missing_broken_flag"})
            if self._param(merged_params, "broken"):
                cursor_key = self._param(merged_params, "cursor") or ""
                failure_budget = int(self.fixture.get("transactionFailures", {}).get(cursor_key, 0))
                attempts = self.transaction_attempts.get(cursor_key, 0)
                if attempts < failure_budget:
                    self.transaction_attempts[cursor_key] = attempts + 1
                    return RampTravelMockResponse(500, {"error": "temporary_failure", "cursor": cursor_key})
            return self._page_response(
                self.fixture.get("transactions", []),
                merged_params,
                default_limit=20,
                max_limit=self._page_cap("transactions", 50)
            )

        if path == "/v1/receipts":
            return self._page_response(
                self.fixture.get("receipts", []),
                merged_params,
                default_limit=30,
                max_limit=self._page_cap("receipts", 30)
            )

        return RampTravelMockResponse(404, {"error": "not_found", "path": path})

    def post(self, url, headers=None, json=None, data=None, timeout=None, **kwargs):
        path, _ = self._parse_url(url, None)
        if path != "/v1/expenses":
            return RampTravelMockResponse(404, {"error": "not_found", "path": path})
        if not self._authorized(headers):
            return RampTravelMockResponse(401, {"error": "unauthorized"})

        key = (headers or {}).get("Idempotency-Key") or (headers or {}).get("idempotency-key")
        if not key:
            return RampTravelMockResponse(400, {"error": "missing_idempotency_key"})

        preseeded = self.fixture.get("idempotencyCache", {})
        if key in preseeded:
            return RampTravelMockResponse(200, preseeded[key])
        if key in self.created_expenses:
            return RampTravelMockResponse(200, self.created_expenses[key])

        expense = copy.deepcopy(json if json is not None else data if data is not None else {})
        if self.fixture.get("rejectExpenseMetadata"):
            local_metadata = {"client_request_id", "request_id", "draft_id"}
            leaked_keys = sorted(key for key in expense if key in local_metadata)
            if leaked_keys:
                return RampTravelMockResponse(
                    400,
                    {"error": "local_metadata_in_expense_payload", "keys": leaked_keys}
                )

        response = {
            "id": f"exp_{len(self.created_expenses) + 1:04d}",
            **expense,
            "created_at": "2026-04-30T12:00:00Z",
        }
        self.created_expenses[key] = response
        return RampTravelMockResponse(200, response)

    def _authorized(self, headers):
        expected = self.fixture.get("token", "ramp_test_secret_xyz")
        auth = (headers or {}).get("Authorization") or (headers or {}).get("authorization")
        return auth == f"Bearer {expected}"

    def _parse_url(self, url, params):
        parsed = urlparse(url)
        path = parsed.path or url
        merged = {key: values[-1] for key, values in parse_qs(parsed.query).items()}
        if params:
            merged.update(params)
        return path, merged

    def _param(self, params, key):
        value = (params or {}).get(key)
        if isinstance(value, list):
            return value[-1] if value else None
        return value

    def _page_cap(self, collection, fallback):
        caps = self.fixture.get("pageCaps", {})
        try:
            return min(fallback, max(1, int(caps.get(collection, fallback))))
        except (TypeError, ValueError):
            return fallback

    def _page_response(self, items, params, *, default_limit, max_limit):
        cursor = self._param(params, "cursor")
        try:
            start = int(cursor) if cursor not in (None, "") else 0
            limit = int(self._param(params, "limit") or default_limit)
        except (TypeError, ValueError):
            return RampTravelMockResponse(400, {"error": "bad_pagination"})
        limit = min(max(limit, 1), max_limit)
        page = copy.deepcopy(items[start:start + limit])
        next_index = start + limit
        next_cursor = str(next_index) if next_index < len(items) else None
        return RampTravelMockResponse(200, {"data": page, "next_cursor": next_cursor})


class RampTravelAsyncApi:
    def __init__(self):
        self.reset({})

    def reset(self, fixture):
        self.fixture = copy.deepcopy(fixture or {})
        self.active_ocr = 0
        self.active_trip_lists = 0

    async def get_trip(self, base_url, token, trip_id):
        self._check_token(token)
        await self._yield_for("tripYields", trip_id)
        for trip in self.fixture.get("trips", []):
            if trip.get("id") == trip_id:
                return copy.deepcopy(trip)
        raise RampTravelNotFoundError(f"trip_not_found:{trip_id}")

    async def ocr_receipt(self, base_url, token, receipt_id):
        self._check_token(token)
        self.active_ocr += 1
        try:
            max_allowed = self._max_concurrency("maxConcurrentOcr")
            if self.active_ocr > max_allowed:
                raise RampTravelRateLimitError("too_many_concurrent_ocr_requests")
            await self._yield_for("ocrYields", receipt_id)
            receipts = self.fixture.get("receiptOcr", {})
            if receipt_id not in receipts:
                raise RampTravelNotFoundError(f"receipt_not_found:{receipt_id}")
            result = copy.deepcopy(receipts[receipt_id])
            if isinstance(result, dict) and result.get("error"):
                raise RampTravelOcrError(str(result["error"]))
            if isinstance(result, dict):
                result.setdefault("receipt_id", receipt_id)
            return result
        finally:
            self.active_ocr -= 1

    async def list_employee_trips(self, base_url, token, employee_id):
        self._check_token(token)
        self.active_trip_lists += 1
        try:
            max_allowed = self._max_concurrency("maxConcurrentTripLists")
            if self.active_trip_lists > max_allowed:
                raise RampTravelRateLimitError("too_many_concurrent_trip_requests")
            await self._yield_for("employeeTripYields", employee_id)
            return [
                copy.deepcopy(trip)
                for trip in self.fixture.get("trips", [])
                if trip.get("employee_id") == employee_id
            ]
        finally:
            self.active_trip_lists -= 1

    def _check_token(self, token):
        expected = self.fixture.get("token", "ramp_test_secret_xyz")
        if token != expected:
            raise RampTravelAuthError("unauthorized")

    def _max_concurrency(self, key):
        try:
            return max(1, int(self.fixture.get(key, 999999)))
        except (TypeError, ValueError):
            return 999999

    async def _yield_for(self, fixture_key, item_id):
        try:
            count = int(self.fixture.get(fixture_key, {}).get(item_id, 1))
        except (TypeError, ValueError):
            count = 1
        for _ in range(max(1, count)):
            await asyncio.sleep(0)


_ramp_travel_mock = RampTravelMockRequests()
ramp_travel_requests = types.ModuleType("requests")
ramp_travel_requests.get = _ramp_travel_mock.get
ramp_travel_requests.post = _ramp_travel_mock.post
ramp_travel_requests.reset = _ramp_travel_mock.reset
ramp_travel_requests.HTTPError = RampTravelHTTPError
ramp_travel_requests.exceptions = types.SimpleNamespace(HTTPError=RampTravelHTTPError)
_ramp_travel_async_api = RampTravelAsyncApi()
ramp_travel_api = types.ModuleType("travel_api")
ramp_travel_api.get_trip = _ramp_travel_async_api.get_trip
ramp_travel_api.ocr_receipt = _ramp_travel_async_api.ocr_receipt
ramp_travel_api.list_employee_trips = _ramp_travel_async_api.list_employee_trips
ramp_travel_api.reset = _ramp_travel_async_api.reset
ramp_travel_api.TravelApiError = RampTravelApiError
ramp_travel_api.AuthError = RampTravelAuthError
ramp_travel_api.NotFoundError = RampTravelNotFoundError
ramp_travel_api.OcrError = RampTravelOcrError
ramp_travel_api.RateLimitError = RampTravelRateLimitError
` : "";
  const beforeModuleImport = problemId.startsWith(RAMP_TRAVEL_API_PROBLEM_PREFIX)
    ? `sys.modules["requests"] = ramp_travel_requests\nsys.modules["travel_api"] = ramp_travel_api\n`
    : "";
  const beforeEachTest = problemId === API_MAZE_PROBLEM_ID
    ? `                module.fetch_url = make_maze_fetch(test.get("fixture", {}))\n`
    : problemId.startsWith(RAMP_TRAVEL_API_PROBLEM_PREFIX)
      ? `                ramp_travel_requests.reset(test.get("fixture", {}))\n                ramp_travel_api.reset(test.get("fixture", {}))\n`
    : "";
  return `import asyncio
import contextlib
import importlib.util
import inspect
import io
import json
import traceback

TESTS = json.loads(${JSON.stringify(JSON.stringify(tests))})
ENTRYPOINT = ${JSON.stringify(entrypoint)}
MARKER = ${JSON.stringify(RESULT_MARKER)}

stdout_buffer = io.StringIO()
stderr_buffer = io.StringIO()
payload = {"tests": [], "stdout": "", "stderr": ""}

_JSON_PRIMITIVES = (str, int, float, bool, type(None))


def first_non_json_path(value):
    seen = set()

    def walk(current, path):
        if isinstance(current, _JSON_PRIMITIVES):
            return None
        if isinstance(current, (list, tuple)):
            object_id = id(current)
            if object_id in seen:
                return f"{path} contains a circular reference"
            seen.add(object_id)
            for index, item in enumerate(current):
                issue = walk(item, f"{path}[{index}]")
                if issue:
                    return issue
            seen.remove(object_id)
            return None
        if isinstance(current, dict):
            object_id = id(current)
            if object_id in seen:
                return f"{path} contains a circular reference"
            seen.add(object_id)
            for key, item in current.items():
                if not isinstance(key, _JSON_PRIMITIVES):
                    return f"{path} has key {key!r} of type {type(key).__name__}"
                issue = walk(item, f"{path}[{key!r}]")
                if issue:
                    return issue
            seen.remove(object_id)
            return None
        return f"{path} is {type(current).__name__}"

    return walk(value, "return value")


def non_json_return_error(value, error):
    detail = first_non_json_path(value) or f"return value could not be encoded: {error}"
    return (
        "Return value is not JSON-serializable. "
        f"{detail}. "
        "The test runner can only compare plain JSON-like values: "
        "str, int/float, bool, None, lists, and dicts. "
        "Convert custom objects to the exact return shape from the prompt."
    )
${mazeHelpers}
${rampTravelApiHelpers}
${beforeModuleImport}

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
${beforeEachTest}                actual = fn(*test["args"])
                if inspect.isawaitable(actual):
                    actual = asyncio.run(actual)
        except Exception:
            payload["tests"].append({"error": traceback.format_exc()})
            continue
        try:
            json.dumps(actual)
        except (TypeError, ValueError) as error:
            payload["tests"].append({"error": non_json_return_error(actual, error)})
            continue
        payload["tests"].append({"actual": actual})

payload["stdout"] = stdout_buffer.getvalue()
payload["stderr"] = stderr_buffer.getvalue()
print(MARKER + json.dumps(payload, separators=(",", ":")))
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
