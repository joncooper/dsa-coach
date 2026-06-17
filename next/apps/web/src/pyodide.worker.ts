import { loadPyodide } from "pyodide";
import type { RunResult } from "../../../src/core/types";

const workerScope = self as unknown as DedicatedWorkerGlobalScope;

let pyodidePromise: Promise<Awaited<ReturnType<typeof loadPyodide>>> | undefined;

function getPyodide() {
  pyodidePromise ??= (async () => {
    const pyodide = await loadPyodide({ indexURL: "/pyodide/" });
    try {
      await pyodide.loadPackage(["sortedcontainers"]);
    } catch (err) {
      console.warn("sortedcontainers preload failed", err);
    }
    return pyodide;
  })();
  return pyodidePromise;
}

const PROBLEM_HARNESS = String.raw`
import asyncio
import contextlib
import copy
import importlib
import inspect
import io
import json
import math
import re
import sys
import traceback
import types
from urllib.parse import parse_qs, urlparse

API_MAZE_PROBLEM_ID = "ramp-url-maze"
RAMP_TRAVEL_API_PROBLEM_PREFIX = "ramp-travel-api-"
_JSON_PRIMITIVES = (str, int, float, bool, type(None))


def json_equal(actual, expected):
    if isinstance(actual, bool) or isinstance(expected, bool):
        return actual is expected
    if isinstance(actual, (int, float)) and isinstance(expected, (int, float)):
        return math.isclose(actual, expected, rel_tol=0, abs_tol=1e-9)
    if isinstance(actual, tuple):
        actual = list(actual)
    if isinstance(expected, tuple):
        expected = list(expected)
    if isinstance(actual, list) and isinstance(expected, list):
        return len(actual) == len(expected) and all(json_equal(left, right) for left, right in zip(actual, expected))
    if isinstance(actual, dict) and isinstance(expected, dict):
        actual_keys = sorted(str(key) for key in actual.keys())
        expected_keys = sorted(str(key) for key in expected.keys())
        return actual_keys == expected_keys and all(json_equal(actual.get(key), expected.get(key)) for key in expected_keys)
    return actual == expected


def normalize(value):
    if isinstance(value, tuple):
        return [normalize(item) for item in value]
    if isinstance(value, list):
        return [normalize(item) for item in value]
    if isinstance(value, dict):
        return {str(key): normalize(item) for key, item in value.items()}
    return value


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
            return self._page_response(self.fixture.get("bookings", []), merged_params, default_limit=10, max_limit=self._page_cap("bookings", 20))

        if not self._authorized(headers):
            return RampTravelMockResponse(401, {"error": "unauthorized"})

        if path == "/v1/employees":
            employees = self.fixture.get("employees", [])
            department = self._param(merged_params, "department")
            if self.fixture.get("requireDepartmentFilter") and not department:
                return RampTravelMockResponse(400, {"error": "missing_department_filter"})
            if department:
                employees = [employee for employee in employees if employee.get("department") == department]
            return self._page_response(employees, merged_params, default_limit=5, max_limit=self._page_cap("employees", 5))

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
                return RampTravelMockResponse(429, {"error": "rate_limited", "message": "retry this same request"}, {"Retry-After": "0"})
            return self._page_response(self.fixture.get("trips", []), merged_params, default_limit=10, max_limit=self._page_cap("trips", 25))

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
            return self._page_response(self.fixture.get("transactions", []), merged_params, default_limit=20, max_limit=self._page_cap("transactions", 50))

        if path == "/v1/receipts":
            return self._page_response(self.fixture.get("receipts", []), merged_params, default_limit=30, max_limit=self._page_cap("receipts", 30))

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
        response = {"id": f"exp_{len(self.created_expenses) + 1:04d}", **expense, "created_at": "2026-04-30T12:00:00Z"}
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
            return [copy.deepcopy(trip) for trip in self.fixture.get("trips", []) if trip.get("employee_id") == employee_id]
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


def run_problem():
    request = json.loads(RUN_REQUEST_JSON)
    stdout = io.StringIO()
    stderr = io.StringIO()
    tests = request["tests"]
    results = []

    try:
        if request["problemId"].startswith(RAMP_TRAVEL_API_PROBLEM_PREFIX):
            sys.modules["requests"] = ramp_travel_requests
            sys.modules["travel_api"] = ramp_travel_api
        module = types.ModuleType("solution")
        sys.modules["solution"] = module
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            exec(compile(request["code"], "solution.py", "exec"), module.__dict__)
        fn = getattr(module, request["entrypoint"], None)
        if not callable(fn):
            raise RuntimeError(f"Missing entrypoint {request['entrypoint']}")
    except SyntaxError:
        return {
            "status": "compile-error",
            "stdout": stdout.getvalue(),
            "stderr": stderr.getvalue(),
            "durationMs": 0,
            "tests": [],
            "message": traceback.format_exc(),
        }
    except Exception:
        return {
            "status": "runtime-error",
            "stdout": stdout.getvalue(),
            "stderr": stderr.getvalue(),
            "durationMs": 0,
            "tests": [],
            "message": traceback.format_exc(),
        }

    for test in tests:
        expected = normalize(test.get("expected"))
        try:
            with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                if request["problemId"] == API_MAZE_PROBLEM_ID:
                    module.fetch_url = make_maze_fetch(test.get("fixture", {}))
                if request["problemId"].startswith(RAMP_TRAVEL_API_PROBLEM_PREFIX):
                    ramp_travel_requests.reset(test.get("fixture", {}))
                    ramp_travel_api.reset(test.get("fixture", {}))
                actual = fn(*test["args"])
                if inspect.isawaitable(actual):
                    actual = asyncio.run(actual)
                actual = normalize(actual)
            try:
                json.dumps(actual)
            except (TypeError, ValueError) as error:
                results.append({
                    "name": test["name"],
                    "passed": False,
                    "visibility": test["visibility"],
                    "args": test["args"],
                    "expected": expected,
                    "error": non_json_return_error(actual, error),
                })
                continue
            passed = json_equal(actual, expected)
            results.append({
                "name": test["name"],
                "passed": passed,
                "visibility": test["visibility"],
                "args": test["args"],
                "expected": expected,
                "actual": actual,
            })
        except Exception:
            results.append({
                "name": test["name"],
                "passed": False,
                "visibility": test["visibility"],
                "args": test["args"],
                "expected": expected,
                "error": traceback.format_exc(limit=6),
            })

    return {
        "status": "passed" if all(result["passed"] for result in results) else "failed",
        "stdout": stdout.getvalue(),
        "stderr": stderr.getvalue(),
        "durationMs": 0,
        "tests": results,
    }


json.dumps(run_problem())
`;

const SCRATCHPAD_HARNESS = String.raw`
import contextlib
import io
import json
import traceback
from typing import *
from collections import *
import bisect
import functools
import heapq
import itertools
import math

def run_scratchpad():
    request = json.loads(RUN_REQUEST_JSON)
    namespace = {
        "List": List,
        "Optional": Optional,
        "deque": deque,
        "defaultdict": defaultdict,
        "Counter": Counter,
        "heapq": heapq,
        "bisect": bisect,
        "math": math,
        "itertools": itertools,
        "functools": functools,
    }
    stdout = io.StringIO()
    stderr = io.StringIO()
    try:
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            exec(compile(request["code"], "scratchpad.py", "exec"), namespace)
    except SyntaxError:
        return json.dumps({
            "status": "compile-error",
            "stdout": stdout.getvalue(),
            "stderr": stderr.getvalue(),
            "durationMs": 0,
            "tests": [],
            "message": traceback.format_exc(limit=8),
        })
    except Exception:
        return json.dumps({
            "status": "runtime-error",
            "stdout": stdout.getvalue(),
            "stderr": stderr.getvalue(),
            "durationMs": 0,
            "tests": [],
            "message": traceback.format_exc(limit=8),
        })
    return json.dumps({
        "status": "passed",
        "stdout": stdout.getvalue(),
        "stderr": stderr.getvalue(),
        "durationMs": 0,
        "tests": [],
    })

run_scratchpad()
`;

const SCENARIO_HARNESS = String.raw`
import contextlib
import io
import json
import os
import shutil
import sys
import traceback
import unittest

def safe_test_name(test):
    ident = test.id()
    return ident.split(".")[-1] if ident else str(test)

class RecordingResult(unittest.TextTestResult):
    def __init__(self, stream, descriptions, verbosity):
        super().__init__(stream, descriptions, verbosity)
        self.records = []

    def addSuccess(self, test):
        super().addSuccess(test)
        self.records.append({"name": safe_test_name(test), "passed": True})

    def addFailure(self, test, err):
        super().addFailure(test, err)
        self.records.append({"name": safe_test_name(test), "passed": False, "error": self._exc_info_to_string(err, test)})

    def addError(self, test, err):
        super().addError(test, err)
        self.records.append({"name": safe_test_name(test), "passed": False, "error": self._exc_info_to_string(err, test)})

def write_workspace(files):
    root = "/workspace"
    if os.path.exists(root):
        shutil.rmtree(root)
    os.makedirs(root, exist_ok=True)
    for path, content in files.items():
        normalized = path.replace("\\", "/").lstrip("/")
        if ".." in normalized.split("/"):
            raise RuntimeError(f"Invalid scenario file path: {path}")
        target = os.path.join(root, normalized)
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "w", encoding="utf8") as handle:
            handle.write(content)
    src_init = os.path.join(root, "src", "__init__.py")
    if os.path.isdir(os.path.dirname(src_init)) and not os.path.exists(src_init):
        with open(src_init, "w", encoding="utf8") as handle:
            handle.write("")
    tests_init = os.path.join(root, "tests", "__init__.py")
    if os.path.isdir(os.path.dirname(tests_init)) and not os.path.exists(tests_init):
        with open(tests_init, "w", encoding="utf8") as handle:
            handle.write("")
    return root

def run_scenario():
    request = json.loads(RUN_REQUEST_JSON)
    stdout = io.StringIO()
    runner_output = io.StringIO()
    visibility = request.get("visibility", "visible")
    try:
        root = write_workspace(request["files"])
        os.chdir(root)
        if root not in sys.path:
            sys.path.insert(0, root)
        for name in list(sys.modules):
            if name == "src" or name.startswith("src.") or name == "tests" or name.startswith("tests."):
                del sys.modules[name]
        with contextlib.redirect_stdout(stdout):
            suite = unittest.defaultTestLoader.discover("tests")
            result = unittest.TextTestRunner(stream=runner_output, verbosity=2, resultclass=RecordingResult).run(suite)
        tests = [{
            "name": record["name"],
            "passed": bool(record["passed"]),
            "visibility": visibility,
            "args": [],
            "expected": None,
            **({"error": record["error"]} if record.get("error") else {}),
        } for record in result.records]
        status = "passed" if tests and all(test["passed"] for test in tests) else "failed"
        if not tests:
            status = "runtime-error"
        return json.dumps({
            "status": status,
            "stdout": stdout.getvalue(),
            "stderr": runner_output.getvalue(),
            "durationMs": 0,
            "tests": tests,
            **({"message": "No tests were discovered."} if not tests else {}),
        })
    except SyntaxError:
        return json.dumps({
            "status": "compile-error",
            "stdout": stdout.getvalue(),
            "stderr": runner_output.getvalue(),
            "durationMs": 0,
            "tests": [],
            "message": traceback.format_exc(limit=8),
        })
    except Exception:
        return json.dumps({
            "status": "runtime-error",
            "stdout": stdout.getvalue(),
            "stderr": runner_output.getvalue(),
            "durationMs": 0,
            "tests": [],
            "message": traceback.format_exc(limit=8),
        })

run_scenario()
`;

type WorkerRequest =
  | {
      kind: "problem";
      problemId: string;
      entrypoint: string;
      code: string;
      tests: unknown[];
      startedAt: number;
    }
  | { kind: "scratchpad"; code: string; startedAt: number }
  | { kind: "scenario"; files: Record<string, string>; visibility: "visible" | "hidden"; startedAt: number };

workerScope.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const startedAt = performance.now();
  try {
    const pyodide = await getPyodide();
    pyodide.globals.set("RUN_REQUEST_JSON", JSON.stringify(event.data));
    const raw = await pyodide.runPythonAsync(
      event.data.kind === "problem"
        ? PROBLEM_HARNESS
        : event.data.kind === "scratchpad"
          ? SCRATCHPAD_HARNESS
          : SCENARIO_HARNESS
    );
    const parsed = JSON.parse(raw) as RunResult;
    workerScope.postMessage({
      ...parsed,
      durationMs: Math.max(parsed.durationMs, Math.round(performance.now() - startedAt))
    } satisfies RunResult);
  } catch (error) {
    workerScope.postMessage({
      status: "runtime-error",
      stdout: "",
      stderr: error instanceof Error ? error.message : String(error),
      durationMs: Math.round(performance.now() - startedAt),
      tests: [],
      message: "Pyodide could not execute this submission."
    } satisfies RunResult);
  }
};
