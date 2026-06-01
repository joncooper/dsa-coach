import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Problem } from "../../src/types";

/**
 * Shared Python verification harness. Used by `verify-reference-solutions.ts`
 * (whole course) and `verify-bonus-chapter.ts` (one chapter at a time). This
 * module has no side effects so either entry point can import it freely.
 */

/**
 * Prefer the project-local `.venv/bin/python3` if it exists — that is where
 * extra packages used by the Libraries section get installed. Falls back to
 * the first `python3` on PATH. Override with the `PYTHON` env var.
 */
function resolvePython(): string {
  if (process.env.PYTHON) return process.env.PYTHON;
  const localVenv = resolve(process.cwd(), ".venv/bin/python3");
  if (existsSync(localVenv)) return localVenv;
  return "python3";
}

const PYTHON_BIN = resolvePython();

const PYTHON_HARNESS = String.raw`
import contextlib
import io
import json
import sys
import traceback
from typing import *
from collections import *
import asyncio
import bisect
import functools
import heapq
import inspect
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
    guard = 0
    while node is not None and guard < 10000:
        out.append(node.val)
        node = node.next
        guard += 1
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

request = json.loads(sys.stdin.read())
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

try:
    with contextlib.redirect_stdout(io.StringIO()):
        exec(request["code"], namespace)
    fn = namespace.get(request["entrypoint"])
    if not callable(fn):
        raise NameError(f"missing callable {request['entrypoint']}")
    failures = []
    for test in request["tests"]:
        args = adapt_args(test["args"], request["adapter"])
        result = fn(*args)
        if inspect.isawaitable(result):
            result = asyncio.run(result)
        actual = normalize(result)
        expected = normalize(test["expected"])
        if request["adapter"] == "linked-list" and actual is None and isinstance(expected, list):
            actual = []
        if not check(test, actual, expected):
            failures.append({"name": test["name"], "actual": actual, "expected": expected})
    print(json.dumps({"ok": not failures, "failures": failures}))
except Exception:
    print(json.dumps({"ok": False, "error": traceback.format_exc(limit=8)}))
`;

export interface VerifyTarget {
  label: string;
  code: string;
  entrypoint: string;
  adapter: Problem["adapter"];
  tests: Problem["visibleTests"];
}

/** Run one body of code against a list of tests; returns human-readable failures. */
export function runProblemTests(target: VerifyTarget): string[] {
  const request = {
    code: target.code,
    entrypoint: target.entrypoint,
    adapter: target.adapter,
    tests: target.tests
  };
  const result = spawnSync(PYTHON_BIN, ["-c", PYTHON_HARNESS], {
    input: JSON.stringify(request),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 10
  });

  if (result.error) return [`${target.label}: ${result.error.message}`];
  if (result.status !== 0) return [`${target.label}: python exited ${result.status}: ${result.stderr}`];

  try {
    const parsed = JSON.parse(result.stdout) as {
      ok: boolean;
      failures?: Array<{ name: string; actual: unknown; expected: unknown }>;
      error?: string;
    };
    if (parsed.ok) return [];
    if (parsed.error) return [`${target.label}: ${parsed.error}`];
    return (parsed.failures ?? []).map(
      (failure) =>
        `${target.label} / ${failure.name}: expected ${JSON.stringify(failure.expected)}, got ${JSON.stringify(failure.actual)}`
    );
  } catch {
    return [`${target.label}: invalid verifier output: ${result.stdout || result.stderr}`];
  }
}
