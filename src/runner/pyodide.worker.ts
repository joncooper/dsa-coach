import { loadPyodide } from "pyodide";
import type { RunRequest, RunResult, ScratchpadRunRequest } from "../types";

const workerScope = self as unknown as DedicatedWorkerGlobalScope;

let pyodidePromise: ReturnType<typeof loadPyodide> | undefined;

function getPyodide() {
  pyodidePromise ??= loadPyodide({ indexURL: "/pyodide/" });
  return pyodidePromise;
}

const PYTHON_HARNESS = String.raw`
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

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def list_to_linked(values):
    dummy = ListNode()
    tail = dummy
    for value in values:
        tail.next = ListNode(value)
        tail = tail.next
    return dummy.next

def linked_to_list(node):
    out = []
    seen = 0
    while node is not None and seen < 10000:
        out.append(node.val)
        node = node.next
        seen += 1
    return out

def tree_from_level(values):
    if not values:
        return None
    nodes = [None if value is None else TreeNode(value) for value in values]
    child = 1
    for node in nodes:
        if node is None:
            continue
        if child < len(nodes):
            node.left = nodes[child]
            child += 1
        if child < len(nodes):
            node.right = nodes[child]
            child += 1
    return nodes[0]

def normalize(value):
    if isinstance(value, ListNode):
        return linked_to_list(value)
    if isinstance(value, tuple):
        return [normalize(item) for item in value]
    if isinstance(value, list):
        return [normalize(item) for item in value]
    if isinstance(value, dict):
        return {str(key): normalize(val) for key, val in value.items()}
    return value

def adapt_args(args, adapter):
    adapted = list(args)
    if adapter == "linked-list":
        converted = []
        for value in adapted:
            if isinstance(value, list) and all(not isinstance(item, (list, dict)) for item in value):
                converted.append(list_to_linked(value))
            else:
                converted.append(value)
        return converted
    if adapter == "binary-tree" and adapted and isinstance(adapted[0], list):
        adapted[0] = tree_from_level(adapted[0])
    return adapted

def _topo_valid(args, actual):
    deps = args[0]
    nodes = set()
    for task, prereqs in deps.items():
        nodes.add(task)
        for prereq in prereqs:
            nodes.add(prereq)
    indeg = {n: 0 for n in nodes}
    adj = {n: [] for n in nodes}
    for task, prereqs in deps.items():
        for prereq in prereqs:
            adj[prereq].append(task)
            indeg[task] += 1
    queue = deque([n for n in nodes if indeg[n] == 0])
    remaining = dict(indeg)
    seen = 0
    while queue:
        cur = queue.popleft()
        seen += 1
        for nxt in adj[cur]:
            remaining[nxt] -= 1
            if remaining[nxt] == 0:
                queue.append(nxt)
    if seen != len(nodes):
        return actual is None
    if not isinstance(actual, list):
        return False
    if sorted(map(str, actual)) != sorted(map(str, nodes)):
        return False
    pos = {name: i for i, name in enumerate(actual)}
    for task, prereqs in deps.items():
        for prereq in prereqs:
            if pos[prereq] >= pos[task]:
                return False
    return True

VALIDATORS = {"topological": _topo_valid}

def check(test, actual, expected):
    name = test.get("validator")
    if name:
        return bool(VALIDATORS[name](test["args"], actual))
    return actual == expected

def run_all():
    request = json.loads(RUN_REQUEST_JSON)
    namespace = {
        "ListNode": ListNode,
        "TreeNode": TreeNode,
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
    results = []
    status = "passed"
    message = ""
    started = __import__("time").perf_counter()

    try:
        with contextlib.redirect_stdout(stdout):
            exec(request["code"], namespace)
            fn = namespace.get(request["entrypoint"])
            if not callable(fn):
                raise NameError(f"Expected a callable named {request['entrypoint']}")
            for test in request["tests"]:
                try:
                    args = adapt_args(test["args"], request["adapter"])
                    actual = normalize(fn(*args))
                    expected = normalize(test["expected"])
                    if request["adapter"] == "linked-list" and actual is None and isinstance(expected, list):
                        actual = []
                    passed = check(test, actual, expected)
                    if not passed:
                        status = "failed"
                    results.append({
                        "name": test["name"],
                        "passed": passed,
                        "args": test["args"],
                        "expected": expected,
                        "actual": actual,
                        "hidden": bool(test.get("hidden", False)),
                    })
                except Exception:
                    status = "error"
                    results.append({
                        "name": test["name"],
                        "passed": False,
                        "args": test["args"],
                        "expected": test["expected"],
                        "actual": None,
                        "error": traceback.format_exc(limit=4),
                        "hidden": bool(test.get("hidden", False)),
                    })
    except Exception:
        status = "error"
        message = traceback.format_exc(limit=8)

    duration = int((__import__("time").perf_counter() - started) * 1000)
    return json.dumps({
        "status": status,
        "stdout": stdout.getvalue(),
        "stderr": stderr.getvalue(),
        "durationMs": duration,
        "tests": results,
        "message": message,
    })

run_all()
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

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def run_scratchpad():
    request = json.loads(RUN_REQUEST_JSON)
    namespace = {
        "ListNode": ListNode,
        "TreeNode": TreeNode,
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
    status = "passed"
    message = ""
    started = __import__("time").perf_counter()
    try:
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            exec(request["code"], namespace)
    except Exception:
        status = "error"
        message = traceback.format_exc(limit=8)
    duration = int((__import__("time").perf_counter() - started) * 1000)
    return json.dumps({
        "status": status,
        "stdout": stdout.getvalue(),
        "stderr": stderr.getvalue(),
        "durationMs": duration,
        "tests": [],
        "message": message,
    })

run_scratchpad()
`;

type WorkerRequest = (RunRequest & { startedAt: number }) | (ScratchpadRunRequest & { startedAt: number });

workerScope.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const startedAt = performance.now();

  try {
    const pyodide = await getPyodide();
    if ("scratchpad" in event.data) {
      pyodide.globals.set("RUN_REQUEST_JSON", JSON.stringify({ code: event.data.code }));
      const raw = await pyodide.runPythonAsync(SCRATCHPAD_HARNESS);
      const parsed = JSON.parse(raw) as RunResult;
      workerScope.postMessage({
        ...parsed,
        durationMs: Math.max(parsed.durationMs, Math.round(performance.now() - startedAt))
      });
      return;
    }

    const { problem, code, includeHidden } = event.data;
    const tests = [
      ...problem.visibleTests.map((test) => ({ ...test, hidden: false })),
      ...(includeHidden ? problem.hiddenTests.map((test) => ({ ...test, hidden: true })) : [])
    ];
    pyodide.globals.set(
      "RUN_REQUEST_JSON",
      JSON.stringify({
        code,
        tests,
        entrypoint: problem.entrypoint,
        adapter: problem.adapter
      })
    );
    const raw = await pyodide.runPythonAsync(PYTHON_HARNESS);
    const parsed = JSON.parse(raw) as RunResult;
    workerScope.postMessage({
      ...parsed,
      durationMs: Math.max(parsed.durationMs, Math.round(performance.now() - startedAt))
    });
  } catch (error) {
    workerScope.postMessage({
      status: "error",
      stdout: "",
      stderr: error instanceof Error ? error.message : String(error),
      durationMs: Math.round(performance.now() - startedAt),
      tests: [],
      message: "Pyodide could not execute this submission."
    } satisfies RunResult);
  }
};
