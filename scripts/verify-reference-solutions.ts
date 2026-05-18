import { spawnSync } from "node:child_process";
import { course } from "../src/content/course";
import type { Problem } from "../src/types";

const PYTHON_HARNESS = String.raw`
import contextlib
import io
import json
import sys
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
        actual = normalize(fn(*args))
        expected = normalize(test["expected"])
        if request["adapter"] == "linked-list" and actual is None and isinstance(expected, list):
            actual = []
        if not check(test, actual, expected):
            failures.append({"name": test["name"], "actual": actual, "expected": expected})
    print(json.dumps({"ok": not failures, "failures": failures}))
except Exception:
    print(json.dumps({"ok": False, "error": traceback.format_exc(limit=8)}))
`;

interface VerifyTarget {
  label: string;
  code: string;
  entrypoint: string;
  adapter: Problem["adapter"];
  tests: Problem["visibleTests"];
}

function runTarget(target: VerifyTarget): string[] {
  const request = {
    code: target.code,
    entrypoint: target.entrypoint,
    adapter: target.adapter,
    tests: target.tests
  };
  const result = spawnSync("python3", ["-c", PYTHON_HARNESS], {
    input: JSON.stringify(request),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 10
  });

  if (result.error) return [`${target.label}: ${result.error.message}`];
  if (result.status !== 0) return [`${target.label}: python exited ${result.status}: ${result.stderr}`];

  try {
    const parsed = JSON.parse(result.stdout) as { ok: boolean; failures?: Array<{ name: string; actual: unknown; expected: unknown }>; error?: string };
    if (parsed.ok) return [];
    if (parsed.error) return [`${target.label}: ${parsed.error}`];
    return (parsed.failures ?? []).map(
      (failure) => `${target.label} / ${failure.name}: expected ${JSON.stringify(failure.expected)}, got ${JSON.stringify(failure.actual)}`
    );
  } catch {
    return [`${target.label}: invalid verifier output: ${result.stdout || result.stderr}`];
  }
}

/** Verify a problem's referenceCode and (if present) its solutionCode. */
export function verifyProblemReference(problem: Problem): string[] {
  const tests = [...problem.visibleTests, ...problem.hiddenTests];
  const out = runTarget({
    label: `${problem.id} [reference]`,
    code: problem.referenceCode,
    entrypoint: problem.entrypoint,
    adapter: problem.adapter,
    tests
  });
  if (problem.solutionCode) {
    out.push(
      ...runTarget({
        label: `${problem.id} [solution]`,
        code: problem.solutionCode,
        entrypoint: problem.entrypoint,
        adapter: problem.adapter,
        tests
      })
    );
  }
  return out;
}

const setProblems = (course.problemSets ?? []).flatMap((set) => set.problems);
const allProblems = [...course.problems, ...setProblems];

/** Verify referenceCode and solutionCode for every part of a problem. */
function verifyParts(problem: Problem): string[] {
  if (!problem.parts?.length) return [];
  const out: string[] = [];
  for (const part of problem.parts) {
    const tests = [...part.visibleTests, ...part.hiddenTests];
    out.push(
      ...runTarget({
        label: `${problem.id}#${part.id} [reference]`,
        code: part.referenceCode,
        entrypoint: part.entrypoint,
        adapter: problem.adapter,
        tests
      })
    );
    if (part.solutionCode) {
      out.push(
        ...runTarget({
          label: `${problem.id}#${part.id} [solution]`,
          code: part.solutionCode,
          entrypoint: part.entrypoint,
          adapter: problem.adapter,
          tests
        })
      );
    }
  }
  return out;
}

const failures = [
  ...allProblems.flatMap(verifyProblemReference),
  ...allProblems.flatMap(verifyParts)
];

const partCount = allProblems.reduce((total, problem) => total + (problem.parts?.length ?? 0), 0);
const solutionCount =
  allProblems.filter((problem) => problem.solutionCode).length +
  allProblems.reduce((total, problem) => total + (problem.parts?.filter((part) => part.solutionCode).length ?? 0), 0);

if (failures.length) {
  console.error("Reference/solution verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Reference + solution OK: ${allProblems.length} problems verified (${setProblems.length} from problem sets, ${partCount} parts, ${solutionCount} solutionCode bodies).`
);
