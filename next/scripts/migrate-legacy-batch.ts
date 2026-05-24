import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { course } from "../../src/content/course.ts";
import { librarySets } from "../../src/content/libraries/index.ts";
import { interviewPrepSet } from "../../src/content/problemSets.ts";
import type { Problem as LegacyProblem, ProblemTest as LegacyProblemTest } from "../../src/types.ts";
import type { FunctionSignature, Problem, ProblemLanguageSupport, ProblemTest } from "../src/core/types.js";
import { arraysStringsCurated } from "./migration/arrays-strings.js";
import { backtrackingCurated } from "./migration/backtracking.js";
import { binarySearchCurated } from "./migration/binary-search.js";
import { dynamicProgrammingCurated } from "./migration/dynamic-programming.js";
import { foundationsBonusCurated } from "./migration/foundations-bonus.js";
import { greedyCurated } from "./migration/greedy.js";
import { hashingCurated } from "./migration/hashing.js";
import { heapsCurated } from "./migration/heaps.js";
import { interviewPrepCurated, interviewPrepProblemIds } from "./migration/interview-prep.js";
import { interviewToolsCurated } from "./migration/interview-tools.js";
import { libraryCurated, libraryProblemIds } from "./migration/libraries.js";
import { linkedListsCurated } from "./migration/linked-lists.js";
import { curatedLegacyPart, curatedLegacyProblem, remainingCurated, remainingProblemIds, remainingProblemSets } from "./migration/remaining-sets.js";
import { stacksQueuesCurated } from "./migration/stacks-queues.js";
import { treesGraphsCurated } from "./migration/trees-graphs.js";
import { twoPointersSlidingWindowCurated } from "./migration/two-pointers-sliding-window.js";

type LanguageId = "python" | "typescript" | "go" | "scala";

interface LanguageFiles {
  entrypoint: string;
  extension: string;
  starter: string;
  reference: string;
}

interface CuratedProblem {
  signature: FunctionSignature;
  languages: Record<LanguageId, LanguageFiles>;
  parts?: Record<string, {
    signature: FunctionSignature;
    languages: Record<LanguageId, LanguageFiles>;
  }>;
}

const here = dirname(fileURLToPath(import.meta.url));
const nextRoot = resolve(here, "..");
const contentRoot = resolve(nextRoot, "content");

const foundationsProblemIds = [
  "sum-positive-readings",
  "first-repeated-index",
  "safe-window-count",
  "longest-true-run",
  "recursive-digit-sum",
  "halve-step-count",
  "foundations-bonus-01",
  "foundations-bonus-02",
  "foundations-bonus-03",
  "foundations-bonus-04",
  "foundations-bonus-05",
  "foundations-bonus-06",
  "foundations-bonus-07",
  "foundations-bonus-08",
  "foundations-bonus-09",
  "foundations-bonus-10",
  "foundations-bonus-11",
  "foundations-bonus-12"
] as const;

const arraysStringsProblemIds = [
  "rotate-left-local",
  "compress-runs",
  "merge-sorted-unique",
  "minimum-average-gap",
  "product-except-self-local",
  "longest-balanced-prefix",
  "arrays-strings-bonus-01",
  "arrays-strings-bonus-02",
  "arrays-strings-bonus-03",
  "arrays-strings-bonus-04",
  "arrays-strings-bonus-05",
  "arrays-strings-bonus-06",
  "arrays-strings-bonus-07",
  "arrays-strings-bonus-08",
  "arrays-strings-bonus-09",
  "arrays-strings-bonus-10",
  "arrays-strings-bonus-11",
  "arrays-strings-bonus-12"
] as const;

const hashingProblemIds = [
  "pairable-remainders",
  "first-unique-token",
  "anagram-bucket-sizes",
  "longest-distinct-span",
  "count-target-sum-subarrays",
  "common-customers",
  "hashing-bonus-01",
  "hashing-bonus-02",
  "hashing-bonus-03",
  "hashing-bonus-04",
  "hashing-bonus-05",
  "hashing-bonus-06",
  "hashing-bonus-07",
  "hashing-bonus-08",
  "hashing-bonus-09",
  "hashing-bonus-10",
  "hashing-bonus-11",
  "hashing-bonus-12"
] as const;

const twoPointersSlidingWindowProblemIds = [
  "closest-pair-sum",
  "trim-adjacent-pairs",
  "max-sum-under-limit",
  "longest-with-flips",
  "palindrome-edge-score",
  "sorted-squares-local",
  "two-pointers-sliding-window-bonus-01",
  "two-pointers-sliding-window-bonus-02",
  "two-pointers-sliding-window-bonus-03",
  "two-pointers-sliding-window-bonus-04",
  "two-pointers-sliding-window-bonus-05",
  "two-pointers-sliding-window-bonus-06",
  "two-pointers-sliding-window-bonus-07",
  "two-pointers-sliding-window-bonus-08",
  "two-pointers-sliding-window-bonus-09",
  "two-pointers-sliding-window-bonus-10",
  "two-pointers-sliding-window-bonus-11",
  "two-pointers-sliding-window-bonus-12"
] as const;

const stacksQueuesProblemIds = [
  "balanced-brackets-local",
  "warmer-day-waits",
  "simplify-folder-steps",
  "recent-event-counts",
  "next-greater-values",
  "stacks-queues-bonus-01",
  "stacks-queues-bonus-02",
  "stacks-queues-bonus-03",
  "stacks-queues-bonus-04",
  "stacks-queues-bonus-05",
  "stacks-queues-bonus-06",
  "stacks-queues-bonus-07",
  "stacks-queues-bonus-08",
  "stacks-queues-bonus-09",
  "stacks-queues-bonus-10"
] as const;

const linkedListsProblemIds = [
  "list-sum",
  "remove-list-value",
  "middle-list-value",
  "merge-two-linked-lists",
  "palindrome-linked-list-local",
  "linked-lists-bonus-01",
  "linked-lists-bonus-02",
  "linked-lists-bonus-03",
  "linked-lists-bonus-04",
  "linked-lists-bonus-05",
  "linked-lists-bonus-06",
  "linked-lists-bonus-07",
  "linked-lists-bonus-08",
  "linked-lists-bonus-09",
  "linked-lists-bonus-10"
] as const;

const treesGraphsProblemIds = [
  "tree-max-depth-local",
  "tree-level-sums",
  "tree-has-path-sum-local",
  "count-grid-islands",
  "shortest-edge-path",
  "can-finish-local",
  "connected-component-count",
  "trees-graphs-bonus-01",
  "trees-graphs-bonus-02",
  "trees-graphs-bonus-03",
  "trees-graphs-bonus-04",
  "trees-graphs-bonus-05",
  "trees-graphs-bonus-06",
  "trees-graphs-bonus-07",
  "trees-graphs-bonus-08",
  "trees-graphs-bonus-09",
  "trees-graphs-bonus-10",
  "trees-graphs-bonus-11",
  "trees-graphs-bonus-12",
  "trees-graphs-bonus-13",
  "trees-graphs-bonus-14"
] as const;

const heapsProblemIds = [
  "top-k-scores",
  "merge-sorted-batches",
  "k-closest-points-local",
  "running-medians-local",
  "combine-until-target",
  "heaps-bonus-01",
  "heaps-bonus-02",
  "heaps-bonus-03",
  "heaps-bonus-04",
  "heaps-bonus-05",
  "heaps-bonus-06",
  "heaps-bonus-07",
  "heaps-bonus-08",
  "heaps-bonus-09",
  "heaps-bonus-10"
] as const;

const greedyProblemIds = [
  "max-compatible-meetings",
  "assign-snacks",
  "largest-one-swap",
  "can-reach-end-local",
  "partition-labels-local",
  "greedy-bonus-01",
  "greedy-bonus-02",
  "greedy-bonus-03",
  "greedy-bonus-04",
  "greedy-bonus-05",
  "greedy-bonus-06",
  "greedy-bonus-07",
  "greedy-bonus-08",
  "greedy-bonus-09",
  "greedy-bonus-10"
] as const;

const binarySearchProblemIds = [
  "lower-bound-local",
  "first-day-for-bouquets",
  "integer-square-root",
  "search-rotated-local",
  "ship-capacity-local",
  "binary-search-bonus-01",
  "binary-search-bonus-02",
  "binary-search-bonus-03",
  "binary-search-bonus-04",
  "binary-search-bonus-05",
  "binary-search-bonus-06",
  "binary-search-bonus-07",
  "binary-search-bonus-08",
  "binary-search-bonus-09",
  "binary-search-bonus-10"
] as const;

const backtrackingProblemIds = [
  "subsets-lexicographic",
  "unique-tile-sequence-count",
  "combination-sum-exact-local",
  "generate-parentheses-local",
  "word-path-exists-local",
  "backtracking-bonus-01",
  "backtracking-bonus-02",
  "backtracking-bonus-03",
  "backtracking-bonus-04",
  "backtracking-bonus-05",
  "backtracking-bonus-06",
  "backtracking-bonus-07",
  "backtracking-bonus-08",
  "backtracking-bonus-09",
  "backtracking-bonus-10"
] as const;

const dynamicProgrammingProblemIds = [
  "climb-with-blocks",
  "min-cost-steps-local",
  "max-non-adjacent-local",
  "coin-change-min-local",
  "lis-length-local",
  "grid-paths-with-blocks",
  "dynamic-programming-bonus-01",
  "dynamic-programming-bonus-02",
  "dynamic-programming-bonus-03",
  "dynamic-programming-bonus-04",
  "dynamic-programming-bonus-05",
  "dynamic-programming-bonus-06",
  "dynamic-programming-bonus-07",
  "dynamic-programming-bonus-08",
  "dynamic-programming-bonus-09",
  "dynamic-programming-bonus-10",
  "dynamic-programming-bonus-11",
  "dynamic-programming-bonus-12"
] as const;

const interviewToolsProblemIds = [
  "growth-label",
  "choose-pattern-label",
  "mixed-review-score",
  "interview-tools-bonus-01",
  "interview-tools-bonus-02",
  "interview-tools-bonus-03",
  "interview-tools-bonus-04",
  "interview-tools-bonus-05",
  "interview-tools-bonus-06"
] as const;

const batchIds = [
  ...foundationsProblemIds,
  ...arraysStringsProblemIds,
  ...hashingProblemIds,
  ...twoPointersSlidingWindowProblemIds,
  ...stacksQueuesProblemIds,
  ...linkedListsProblemIds,
  ...treesGraphsProblemIds,
  ...heapsProblemIds,
  ...greedyProblemIds,
  ...binarySearchProblemIds,
  ...backtrackingProblemIds,
  ...dynamicProgrammingProblemIds,
  ...interviewToolsProblemIds,
  ...interviewPrepProblemIds,
  ...libraryProblemIds,
  ...remainingProblemIds
] as const;

const curated: Record<string, CuratedProblem> = {
  "sum-positive-readings": {
    signature: unaryNumberArray("sumPositiveReadings", "readings", "number"),
    languages: {
      python: {
        entrypoint: "sum_positive_readings",
        extension: "py",
        starter: "def sum_positive_readings(readings: list[int]) -> int:\n    raise NotImplementedError\n",
        reference:
          "def sum_positive_readings(readings: list[int]) -> int:\n    total = 0\n    for reading in readings:\n        if reading > 0:\n            total += reading\n    return total\n"
      },
      typescript: {
        entrypoint: "sumPositiveReadings",
        extension: "ts",
        starter: "export function sumPositiveReadings(readings: number[]): number {\n  throw new Error(\"TODO\");\n}\n",
        reference:
          "export function sumPositiveReadings(readings: number[]): number {\n  let total = 0;\n  for (const reading of readings) {\n    if (reading > 0) total += reading;\n  }\n  return total;\n}\n"
      },
      go: {
        entrypoint: "SumPositiveReadings",
        extension: "go",
        starter: "package solution\n\nfunc SumPositiveReadings(readings []int) int {\n\tpanic(\"TODO\")\n}\n",
        reference:
          "package solution\n\nfunc SumPositiveReadings(readings []int) int {\n\ttotal := 0\n\tfor _, reading := range readings {\n\t\tif reading > 0 {\n\t\t\ttotal += reading\n\t\t}\n\t}\n\treturn total\n}\n"
      },
      scala: {
        entrypoint: "sumPositiveReadings",
        extension: "scala",
        starter: "object Solution {\n  def sumPositiveReadings(readings: Seq[Int]): Int = ???\n}\n",
        reference:
          "object Solution {\n  def sumPositiveReadings(readings: Seq[Int]): Int = {\n    readings.foldLeft(0) { (total, reading) =>\n      if (reading > 0) total + reading else total\n    }\n  }\n}\n"
      }
    }
  },
  "first-repeated-index": {
    signature: unaryNumberArray("firstRepeatedIndex", "values", "number"),
    languages: {
      python: {
        entrypoint: "first_repeated_index",
        extension: "py",
        starter: "def first_repeated_index(values: list[int]) -> int:\n    raise NotImplementedError\n",
        reference:
          "def first_repeated_index(values: list[int]) -> int:\n    seen = set()\n    for index, value in enumerate(values):\n        if value in seen:\n            return index\n        seen.add(value)\n    return -1\n"
      },
      typescript: {
        entrypoint: "firstRepeatedIndex",
        extension: "ts",
        starter: "export function firstRepeatedIndex(values: number[]): number {\n  throw new Error(\"TODO\");\n}\n",
        reference:
          "export function firstRepeatedIndex(values: number[]): number {\n  const seen = new Set<number>();\n  for (let index = 0; index < values.length; index += 1) {\n    const value = values[index];\n    if (seen.has(value)) return index;\n    seen.add(value);\n  }\n  return -1;\n}\n"
      },
      go: {
        entrypoint: "FirstRepeatedIndex",
        extension: "go",
        starter: "package solution\n\nfunc FirstRepeatedIndex(values []int) int {\n\tpanic(\"TODO\")\n}\n",
        reference:
          "package solution\n\nfunc FirstRepeatedIndex(values []int) int {\n\tseen := map[int]bool{}\n\tfor index, value := range values {\n\t\tif seen[value] {\n\t\t\treturn index\n\t\t}\n\t\tseen[value] = true\n\t}\n\treturn -1\n}\n"
      },
      scala: {
        entrypoint: "firstRepeatedIndex",
        extension: "scala",
        starter: "object Solution {\n  def firstRepeatedIndex(values: Seq[Int]): Int = ???\n}\n",
        reference:
          "object Solution {\n  def firstRepeatedIndex(values: Seq[Int]): Int = {\n    val seen = scala.collection.mutable.Set.empty[Int]\n    for ((value, index) <- values.zipWithIndex) {\n      if (seen.contains(value)) return index\n      seen.add(value)\n    }\n    -1\n  }\n}\n"
      }
    }
  },
  "safe-window-count": {
    signature: {
      name: "countSafeWindows",
      inputs: [
        { name: "nums", type: { type: "array", items: { type: "number" } } },
        { name: "k", type: { type: "number" } },
        { name: "limit", type: { type: "number" } }
      ],
      output: { type: "number" }
    },
    languages: {
      python: {
        entrypoint: "count_safe_windows",
        extension: "py",
        starter: "def count_safe_windows(nums: list[int], k: int, limit: int) -> int:\n    raise NotImplementedError\n",
        reference:
          "def count_safe_windows(nums: list[int], k: int, limit: int) -> int:\n    if k <= 0 or k > len(nums):\n        return 0\n    window_sum = sum(nums[:k])\n    count = 1 if window_sum <= limit else 0\n    for right in range(k, len(nums)):\n        window_sum += nums[right] - nums[right - k]\n        if window_sum <= limit:\n            count += 1\n    return count\n"
      },
      typescript: {
        entrypoint: "countSafeWindows",
        extension: "ts",
        starter:
          "export function countSafeWindows(nums: number[], k: number, limit: number): number {\n  throw new Error(\"TODO\");\n}\n",
        reference:
          "export function countSafeWindows(nums: number[], k: number, limit: number): number {\n  if (k <= 0 || k > nums.length) return 0;\n  let windowSum = 0;\n  for (let index = 0; index < k; index += 1) windowSum += nums[index];\n  let count = windowSum <= limit ? 1 : 0;\n  for (let right = k; right < nums.length; right += 1) {\n    windowSum += nums[right] - nums[right - k];\n    if (windowSum <= limit) count += 1;\n  }\n  return count;\n}\n"
      },
      go: {
        entrypoint: "CountSafeWindows",
        extension: "go",
        starter: "package solution\n\nfunc CountSafeWindows(nums []int, k int, limit int) int {\n\tpanic(\"TODO\")\n}\n",
        reference:
          "package solution\n\nfunc CountSafeWindows(nums []int, k int, limit int) int {\n\tif k <= 0 || k > len(nums) {\n\t\treturn 0\n\t}\n\twindowSum := 0\n\tfor index := 0; index < k; index++ {\n\t\twindowSum += nums[index]\n\t}\n\tcount := 0\n\tif windowSum <= limit {\n\t\tcount = 1\n\t}\n\tfor right := k; right < len(nums); right++ {\n\t\twindowSum += nums[right] - nums[right-k]\n\t\tif windowSum <= limit {\n\t\t\tcount++\n\t\t}\n\t}\n\treturn count\n}\n"
      },
      scala: {
        entrypoint: "countSafeWindows",
        extension: "scala",
        starter: "object Solution {\n  def countSafeWindows(nums: Seq[Int], k: Int, limit: Int): Int = ???\n}\n",
        reference:
          "object Solution {\n  def countSafeWindows(nums: Seq[Int], k: Int, limit: Int): Int = {\n    if (k <= 0 || k > nums.length) return 0\n    var windowSum = nums.take(k).sum\n    var count = if (windowSum <= limit) 1 else 0\n    for (right <- k until nums.length) {\n      windowSum += nums(right) - nums(right - k)\n      if (windowSum <= limit) count += 1\n    }\n    count\n  }\n}\n"
      }
    }
  },
  "longest-true-run": {
    signature: {
      name: "longestTrueRun",
      inputs: [{ name: "flags", type: { type: "array", items: { type: "boolean" } } }],
      output: { type: "number" }
    },
    languages: {
      python: {
        entrypoint: "longest_true_run",
        extension: "py",
        starter: "def longest_true_run(flags: list[bool]) -> int:\n    raise NotImplementedError\n",
        reference:
          "def longest_true_run(flags: list[bool]) -> int:\n    best = 0\n    current = 0\n    for flag in flags:\n        if flag:\n            current += 1\n            best = max(best, current)\n        else:\n            current = 0\n    return best\n"
      },
      typescript: {
        entrypoint: "longestTrueRun",
        extension: "ts",
        starter: "export function longestTrueRun(flags: boolean[]): number {\n  throw new Error(\"TODO\");\n}\n",
        reference:
          "export function longestTrueRun(flags: boolean[]): number {\n  let best = 0;\n  let current = 0;\n  for (const flag of flags) {\n    if (flag) {\n      current += 1;\n      best = Math.max(best, current);\n    } else {\n      current = 0;\n    }\n  }\n  return best;\n}\n"
      },
      go: {
        entrypoint: "LongestTrueRun",
        extension: "go",
        starter: "package solution\n\nfunc LongestTrueRun(flags []bool) int {\n\tpanic(\"TODO\")\n}\n",
        reference:
          "package solution\n\nfunc LongestTrueRun(flags []bool) int {\n\tbest := 0\n\tcurrent := 0\n\tfor _, flag := range flags {\n\t\tif flag {\n\t\t\tcurrent++\n\t\t\tif current > best {\n\t\t\t\tbest = current\n\t\t\t}\n\t\t} else {\n\t\t\tcurrent = 0\n\t\t}\n\t}\n\treturn best\n}\n"
      },
      scala: {
        entrypoint: "longestTrueRun",
        extension: "scala",
        starter: "object Solution {\n  def longestTrueRun(flags: Seq[Boolean]): Int = ???\n}\n",
        reference:
          "object Solution {\n  def longestTrueRun(flags: Seq[Boolean]): Int = {\n    var best = 0\n    var current = 0\n    for (flag <- flags) {\n      if (flag) {\n        current += 1\n        best = math.max(best, current)\n      } else {\n        current = 0\n      }\n    }\n    best\n  }\n}\n"
      }
    }
  },
  "recursive-digit-sum": {
    signature: unaryNumber("recursiveDigitSum", "n", "number"),
    languages: {
      python: {
        entrypoint: "recursive_digit_sum",
        extension: "py",
        starter: "def recursive_digit_sum(n: int) -> int:\n    raise NotImplementedError\n",
        reference:
          "def recursive_digit_sum(n: int) -> int:\n    if n < 10:\n        return n\n    return n % 10 + recursive_digit_sum(n // 10)\n"
      },
      typescript: {
        entrypoint: "recursiveDigitSum",
        extension: "ts",
        starter: "export function recursiveDigitSum(n: number): number {\n  throw new Error(\"TODO\");\n}\n",
        reference:
          "export function recursiveDigitSum(n: number): number {\n  if (n < 10) return n;\n  return (n % 10) + recursiveDigitSum(Math.floor(n / 10));\n}\n"
      },
      go: {
        entrypoint: "RecursiveDigitSum",
        extension: "go",
        starter: "package solution\n\nfunc RecursiveDigitSum(n int) int {\n\tpanic(\"TODO\")\n}\n",
        reference:
          "package solution\n\nfunc RecursiveDigitSum(n int) int {\n\tif n < 10 {\n\t\treturn n\n\t}\n\treturn n%10 + RecursiveDigitSum(n/10)\n}\n"
      },
      scala: {
        entrypoint: "recursiveDigitSum",
        extension: "scala",
        starter: "object Solution {\n  def recursiveDigitSum(n: Int): Int = ???\n}\n",
        reference:
          "object Solution {\n  def recursiveDigitSum(n: Int): Int = {\n    if (n < 10) n else (n % 10) + recursiveDigitSum(n / 10)\n  }\n}\n"
      }
    }
  },
  "halve-step-count": {
    signature: unaryNumber("halveStepCount", "n", "number"),
    languages: {
      python: {
        entrypoint: "halve_step_count",
        extension: "py",
        starter: "def halve_step_count(n: int) -> int:\n    raise NotImplementedError\n",
        reference:
          "def halve_step_count(n: int) -> int:\n    steps = 0\n    while n > 0:\n        n //= 2\n        steps += 1\n    return steps\n"
      },
      typescript: {
        entrypoint: "halveStepCount",
        extension: "ts",
        starter: "export function halveStepCount(n: number): number {\n  throw new Error(\"TODO\");\n}\n",
        reference:
          "export function halveStepCount(n: number): number {\n  let steps = 0;\n  while (n > 0) {\n    n = Math.floor(n / 2);\n    steps += 1;\n  }\n  return steps;\n}\n"
      },
      go: {
        entrypoint: "HalveStepCount",
        extension: "go",
        starter: "package solution\n\nfunc HalveStepCount(n int) int {\n\tpanic(\"TODO\")\n}\n",
        reference:
          "package solution\n\nfunc HalveStepCount(n int) int {\n\tsteps := 0\n\tfor n > 0 {\n\t\tn /= 2\n\t\tsteps++\n\t}\n\treturn steps\n}\n"
      },
      scala: {
        entrypoint: "halveStepCount",
        extension: "scala",
        starter: "object Solution {\n  def halveStepCount(n: Int): Int = ???\n}\n",
        reference:
          "object Solution {\n  def halveStepCount(n: Int): Int = {\n    var value = n\n    var steps = 0\n    while (value > 0) {\n      value = value / 2\n      steps += 1\n    }\n    steps\n  }\n}\n"
      }
    }
  },
  "rotate-left-local": {
    signature: {
      name: "rotateLeft",
      inputs: [
        { name: "nums", type: { type: "array", items: { type: "number" } } },
        { name: "k", type: { type: "number" } }
      ],
      output: { type: "array", items: { type: "number" } }
    },
    languages: {
      python: {
        entrypoint: "rotate_left",
        extension: "py",
        starter: "def rotate_left(nums: list[int], k: int) -> list[int]:\n    raise NotImplementedError\n",
        reference:
          "def rotate_left(nums: list[int], k: int) -> list[int]:\n    if not nums:\n        return []\n    offset = k % len(nums)\n    return nums[offset:] + nums[:offset]\n"
      },
      typescript: {
        entrypoint: "rotateLeft",
        extension: "ts",
        starter: "export function rotateLeft(nums: number[], k: number): number[] {\n  throw new Error(\"TODO\");\n}\n",
        reference:
          "export function rotateLeft(nums: number[], k: number): number[] {\n  if (nums.length === 0) return [];\n  const offset = k % nums.length;\n  return nums.slice(offset).concat(nums.slice(0, offset));\n}\n"
      },
      go: {
        entrypoint: "RotateLeft",
        extension: "go",
        starter: "package solution\n\nfunc RotateLeft(nums []int, k int) []int {\n\tpanic(\"TODO\")\n}\n",
        reference:
          "package solution\n\nfunc RotateLeft(nums []int, k int) []int {\n\tif len(nums) == 0 {\n\t\treturn []int{}\n\t}\n\toffset := k % len(nums)\n\tresult := append([]int{}, nums[offset:]...)\n\tresult = append(result, nums[:offset]...)\n\treturn result\n}\n"
      },
      scala: {
        entrypoint: "rotateLeft",
        extension: "scala",
        starter: "object Solution {\n  def rotateLeft(nums: Seq[Int], k: Int): Seq[Int] = ???\n}\n",
        reference:
          "object Solution {\n  def rotateLeft(nums: Seq[Int], k: Int): Seq[Int] = {\n    if (nums.isEmpty) Seq.empty\n    else {\n      val offset = k % nums.length\n      nums.drop(offset) ++ nums.take(offset)\n    }\n  }\n}\n"
      }
    }
  },
  "compress-runs": {
    signature: {
      name: "compressRuns",
      inputs: [{ name: "text", type: { type: "string" } }],
      output: { type: "string" }
    },
    languages: {
      python: {
        entrypoint: "compress_runs",
        extension: "py",
        starter: "def compress_runs(text: str) -> str:\n    raise NotImplementedError\n",
        reference:
          "def compress_runs(text: str) -> str:\n    if not text:\n        return \"\"\n    pieces = []\n    active = text[0]\n    count = 1\n    for char in text[1:]:\n        if char == active:\n            count += 1\n        else:\n            pieces.append(f\"{active}{count}\")\n            active = char\n            count = 1\n    pieces.append(f\"{active}{count}\")\n    return \"\".join(pieces)\n"
      },
      typescript: {
        entrypoint: "compressRuns",
        extension: "ts",
        starter: "export function compressRuns(text: string): string {\n  throw new Error(\"TODO\");\n}\n",
        reference:
          "export function compressRuns(text: string): string {\n  if (text.length === 0) return \"\";\n  const pieces: string[] = [];\n  let active = text[0];\n  let count = 1;\n  for (let index = 1; index < text.length; index += 1) {\n    const char = text[index];\n    if (char === active) {\n      count += 1;\n    } else {\n      pieces.push(`${active}${count}`);\n      active = char;\n      count = 1;\n    }\n  }\n  pieces.push(`${active}${count}`);\n  return pieces.join(\"\");\n}\n"
      },
      go: {
        entrypoint: "CompressRuns",
        extension: "go",
        starter: "package solution\n\nfunc CompressRuns(text string) string {\n\tpanic(\"TODO\")\n}\n",
        reference:
          "package solution\n\nimport \"fmt\"\n\nfunc CompressRuns(text string) string {\n\tif len(text) == 0 {\n\t\treturn \"\"\n\t}\n\tpieces := \"\"\n\tactive := text[0]\n\tcount := 1\n\tfor index := 1; index < len(text); index++ {\n\t\tchar := text[index]\n\t\tif char == active {\n\t\t\tcount++\n\t\t} else {\n\t\t\tpieces += fmt.Sprintf(\"%c%d\", active, count)\n\t\t\tactive = char\n\t\t\tcount = 1\n\t\t}\n\t}\n\tpieces += fmt.Sprintf(\"%c%d\", active, count)\n\treturn pieces\n}\n"
      },
      scala: {
        entrypoint: "compressRuns",
        extension: "scala",
        starter: "object Solution {\n  def compressRuns(text: String): String = ???\n}\n",
        reference:
          "object Solution {\n  def compressRuns(text: String): String = {\n    if (text.isEmpty) return \"\"\n    val builder = new StringBuilder\n    var active = text.charAt(0)\n    var count = 1\n    for (index <- 1 until text.length) {\n      val char = text.charAt(index)\n      if (char == active) {\n        count += 1\n      } else {\n        builder.append(active).append(count)\n        active = char\n        count = 1\n      }\n    }\n    builder.append(active).append(count)\n    builder.toString\n  }\n}\n"
      }
    }
  },
  ...foundationsBonusCurated,
  ...arraysStringsCurated,
  ...hashingCurated,
  ...twoPointersSlidingWindowCurated,
  ...stacksQueuesCurated,
  ...linkedListsCurated,
  ...treesGraphsCurated,
  ...heapsCurated,
  ...greedyCurated,
  ...binarySearchCurated,
  ...backtrackingCurated,
  ...dynamicProgrammingCurated,
  ...interviewToolsCurated,
  ...interviewPrepCurated,
  ...libraryCurated,
  ...remainingCurated
};

const nextProblemSets = [interviewPrepSet, ...remainingProblemSets, ...librarySets];
const problemSetLegacyProblems = nextProblemSets.flatMap((set) => set.problems);

const legacyById = new Map(
  [...course.problems, ...problemSetLegacyProblems].map((problem) => [problem.id, problem])
);

for (const id of batchIds) {
  const legacy = legacyById.get(id);
  const config = curated[id];
  if (!legacy) throw new Error(`Missing legacy problem ${id}`);
  await writeProblem(legacy, config);
}

await writeCatalogFiles();

console.log(`Migrated ${batchIds.length} legacy problems into ${contentRoot}`);

async function writeProblem(legacy: LegacyProblem, config: CuratedProblem) {
  const generatedFallback = hasPlaceholderReferences(config) ? curatedLegacyProblem(legacy) : undefined;
  const tests = [
    ...toNextTests(legacy.visibleTests, "visible"),
    ...toNextTests(legacy.hiddenTests, "hidden")
  ];
  const languages = await writeLanguageFiles(legacy.id, mergeLanguageFallbacks(config.languages, generatedFallback?.languages));
  const parts = await Promise.all(
    (legacy.parts ?? []).map(async (part) => {
      const partConfig = config.parts?.[part.id] ?? generatedFallback?.parts?.[part.id] ?? curatedLegacyPart(part, legacy.id);
      return {
        id: part.id,
        title: part.title,
        prompt: part.prompt,
        signature: partConfig.signature,
        tests: [
          ...toNextTests(part.visibleTests, "visible"),
          ...toNextTests(part.hiddenTests, "hidden")
        ],
        languages: await writeLanguageFiles(
          legacy.id,
          mergeLanguageFallbacks(partConfig.languages, generatedFallback?.parts?.[part.id]?.languages),
          part.id
        )
      };
    })
  );
  const nextProblem: Problem = {
    id: legacy.id,
    kind: "problem",
    title: legacy.title,
    difficulty: legacy.difficulty,
    concepts: legacy.patterns,
    prompt: legacy.prompt,
    signature: config.signature,
    tests,
    parts: parts.length ? parts : undefined,
    languages
  };
  await writeJson(resolve(contentRoot, "problems", legacy.id, "problem.json"), nextProblem);
}

function hasPlaceholderReferences(config: CuratedProblem): boolean {
  return Object.values(config.languages).some((file) => isPlaceholderReference(file.reference)) ||
    Object.values(config.parts ?? {}).some((part) =>
      Object.values(part.languages).some((file) => isPlaceholderReference(file.reference))
    );
}

function mergeLanguageFallbacks(
  primary: Record<LanguageId, LanguageFiles>,
  fallback?: Record<LanguageId, LanguageFiles>
): Record<LanguageId, LanguageFiles> {
  if (!fallback) return primary;
  return Object.fromEntries(
    (Object.entries(primary) as [LanguageId, LanguageFiles][]).map(([language, file]) => [
      language,
      isPlaceholderReference(file.reference) ? fallback[language] : file
    ])
  ) as Record<LanguageId, LanguageFiles>;
}

function isPlaceholderReference(source: string): boolean {
  return source.includes("GENERATE_REFERENCE_FROM_LEGACY_TESTS");
}

async function writeLanguageFiles(
  problemId: string,
  files: Record<LanguageId, LanguageFiles>,
  partId?: string
): Promise<Record<LanguageId, ProblemLanguageSupport>> {
  const languages = {} as Record<LanguageId, ProblemLanguageSupport>;
  for (const [language, file] of Object.entries(files) as [LanguageId, LanguageFiles][]) {
    const basePath = partId
      ? `problems/${problemId}/parts/${partId}/solutions/${language}`
      : `problems/${problemId}/solutions/${language}`;
    await writeText(resolve(contentRoot, basePath, `starter.${file.extension}`), file.starter);
    await writeText(resolve(contentRoot, basePath, `reference.${file.extension}`), file.reference);
    languages[language] = {
      entrypoint: file.entrypoint,
      starterPath: `${basePath}/starter.${file.extension}`,
      referencePath: `${basePath}/reference.${file.extension}`
    };
  }
  return languages;
}

async function writeCatalogFiles() {
  await writeJson(resolve(contentRoot, "catalog.json"), {
    version: 1,
    tracks: [
      {
        id: "main-course",
        kind: "track",
        title: "Modules",
        entries: [
          { kind: "module", id: "foundations" },
          { kind: "module", id: "arrays-strings" },
          { kind: "module", id: "hashing" },
          { kind: "module", id: "two-pointers-sliding-window" },
          { kind: "module", id: "stacks-queues" },
          { kind: "module", id: "linked-lists" },
          { kind: "module", id: "trees-graphs" },
          { kind: "module", id: "heaps" },
          { kind: "module", id: "greedy" },
          { kind: "module", id: "binary-search" },
          { kind: "module", id: "backtracking" },
          { kind: "module", id: "dynamic-programming" },
          { kind: "module", id: "interview-tools" }
        ]
      },
      {
        id: "practice",
        kind: "track",
        title: "Problem Sets",
        entries: nextProblemSets.map((set) => ({ kind: "problem-set", id: set.id }))
      }
    ],
    modules: [
      "modules/foundations.json",
      "modules/arrays-strings.json",
      "modules/hashing.json",
      "modules/two-pointers-sliding-window.json",
      "modules/stacks-queues.json",
      "modules/linked-lists.json",
      "modules/trees-graphs.json",
      "modules/heaps.json",
      "modules/greedy.json",
      "modules/binary-search.json",
      "modules/backtracking.json",
      "modules/dynamic-programming.json",
      "modules/interview-tools.json"
    ],
    problemSets: nextProblemSets.map((set) => `problem-sets/${set.id}.json`),
    problems: batchIds.map((id) => `problems/${id}/problem.json`)
  });

  await writeJson(resolve(contentRoot, "modules", "foundations.json"), {
    id: "foundations",
    kind: "module",
    title: "Foundations",
    order: 1,
    summary: "Build the shared language for invariants, edge cases, simple scans, recursion, and complexity.",
    concepts: ["invariants", "single-pass", "edge-cases", "recursion", "complexity"],
    sequence: foundationsProblemIds.map((id) => ({ kind: "problem", id })),
    bonus: []
  });

  await writeJson(resolve(contentRoot, "modules", "arrays-strings.json"), {
    id: "arrays-strings",
    kind: "module",
    title: "Arrays & Strings",
    order: 2,
    summary: "Practice index arithmetic, string scans, array transforms, and careful boundary handling.",
    concepts: ["arrays", "strings", "indexing", "run-length encoding"],
    sequence: arraysStringsProblemIds.map((id) => ({ kind: "problem", id })),
    bonus: []
  });

  await writeJson(resolve(contentRoot, "modules", "hashing.json"), {
    id: "hashing",
    kind: "module",
    title: "Hashing",
    order: 3,
    summary: "Practice set membership, frequency maps, grouping, complements, and prefix-count tricks.",
    concepts: ["sets", "maps", "frequency tables", "prefix sums", "grouping"],
    sequence: hashingProblemIds.map((id) => ({ kind: "problem", id })),
    bonus: []
  });

  await writeJson(resolve(contentRoot, "modules", "two-pointers-sliding-window.json"), {
    id: "two-pointers-sliding-window",
    kind: "module",
    title: "Two Pointers & Sliding Window",
    order: 4,
    summary: "Practice opposite pointers, same-direction scans, fixed windows, and variable windows.",
    concepts: ["two pointers", "sliding window", "palindromes", "sorted arrays", "window sums"],
    sequence: twoPointersSlidingWindowProblemIds.map((id) => ({ kind: "problem", id })),
    bonus: []
  });

  await writeJson(resolve(contentRoot, "modules", "stacks-queues.json"), {
    id: "stacks-queues",
    kind: "module",
    title: "Stacks & Queues",
    order: 5,
    summary: "Practice stack parsing, monotonic stacks, queues, deques, and operational simulations.",
    concepts: ["stacks", "queues", "monotonic stacks", "deques", "simulation"],
    sequence: stacksQueuesProblemIds.map((id) => ({ kind: "problem", id })),
    bonus: []
  });

  await writeJson(resolve(contentRoot, "modules", "linked-lists.json"), {
    id: "linked-lists",
    kind: "module",
    title: "Linked Lists",
    order: 6,
    summary: "Practice list traversal, pointer-style updates, fast/slow scans, and position-based rewiring.",
    concepts: ["linked lists", "traversal", "fast and slow pointers", "dummy head", "pointer rewiring"],
    sequence: linkedListsProblemIds.map((id) => ({ kind: "problem", id })),
    bonus: []
  });

  await writeJson(resolve(contentRoot, "modules", "trees-graphs.json"), {
    id: "trees-graphs",
    kind: "module",
    title: "Trees & Graphs",
    order: 7,
    summary: "Practice binary tree traversals, grid search, BFS shortest paths, cycle checks, and topological order.",
    concepts: ["trees", "graphs", "DFS", "BFS", "topological sort", "grid traversal"],
    sequence: treesGraphsProblemIds.map((id) => ({ kind: "problem", id })),
    bonus: []
  });

  await writeJson(resolve(contentRoot, "modules", "heaps.json"), {
    id: "heaps",
    kind: "module",
    title: "Heaps",
    order: 8,
    summary: "Practice top-k selection, priority simulation, k-way merge, and streaming order statistics.",
    concepts: ["heaps", "priority queues", "top k", "k-way merge", "streaming medians"],
    sequence: heapsProblemIds.map((id) => ({ kind: "problem", id })),
    bonus: []
  });

  await writeJson(resolve(contentRoot, "modules", "greedy.json"), {
    id: "greedy",
    kind: "module",
    title: "Greedy",
    order: 9,
    summary: "Practice interval choices, exchange arguments, matching, and one-pass reachability.",
    concepts: ["greedy", "intervals", "sorting", "matching", "exchange arguments"],
    sequence: greedyProblemIds.map((id) => ({ kind: "problem", id })),
    bonus: []
  });

  await writeJson(resolve(contentRoot, "modules", "binary-search.json"), {
    id: "binary-search",
    kind: "module",
    title: "Binary Search",
    order: 10,
    summary: "Practice boundaries, rotated arrays, matrix search, and binary search over answer spaces.",
    concepts: ["binary search", "lower bound", "upper bound", "rotated arrays", "answer search"],
    sequence: binarySearchProblemIds.map((id) => ({ kind: "problem", id })),
    bonus: []
  });

  await writeJson(resolve(contentRoot, "modules", "backtracking.json"), {
    id: "backtracking",
    kind: "module",
    title: "Backtracking",
    order: 11,
    summary: "Practice recursion trees, choose-and-undo state, duplicate pruning, and constraint search.",
    concepts: ["backtracking", "recursion", "subsets", "permutations", "constraints", "grid search"],
    sequence: backtrackingProblemIds.map((id) => ({ kind: "problem", id })),
    bonus: []
  });

  await writeJson(resolve(contentRoot, "modules", "dynamic-programming.json"), {
    id: "dynamic-programming",
    kind: "module",
    title: "Dynamic Programming",
    order: 12,
    summary: "Practice one-dimensional state, grid DP, subsequences, knapsack, and state machines.",
    concepts: ["dynamic programming", "tabulation", "rolling state", "grid DP", "knapsack", "subsequences"],
    sequence: dynamicProgrammingProblemIds.map((id) => ({ kind: "problem", id })),
    bonus: []
  });

  await writeJson(resolve(contentRoot, "modules", "interview-tools.json"), {
    id: "interview-tools",
    kind: "module",
    title: "Interview Tools",
    order: 13,
    summary: "Practice complexity classification, pattern diagnosis, mixed review, and synthesis problems.",
    concepts: ["pattern recognition", "complexity", "mixed review", "interview practice"],
    sequence: interviewToolsProblemIds.map((id) => ({ kind: "problem", id })),
    bonus: []
  });

  for (const set of nextProblemSets) {
    await writeJson(resolve(contentRoot, "problem-sets", `${set.id}.json`), {
      id: set.id,
      kind: "problem-set",
      title: set.title,
      summary: set.summary,
      entries: set.problems.map((problem) => ({
        problem: problem.id,
        category: problem.subcategory ?? problem.chapterId,
        note: problem.patterns.join(", ")
      }))
    });
  }
}

function toNextTests(tests: LegacyProblemTest[], visibility: ProblemTest["visibility"]): ProblemTest[] {
  return tests.map((test) => ({
    name: test.name,
    args: test.args,
    expected: test.expected,
    visibility,
    validator: test.validator
  }));
}

async function writeJson(path: string, value: unknown) {
  await writeText(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeText(path: string, value: string) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, value);
}

function unaryNumberArray(name: string, inputName: string, outputType: "number"): FunctionSignature {
  return {
    name,
    inputs: [{ name: inputName, type: { type: "array", items: { type: "number" } } }],
    output: { type: outputType }
  };
}

function unaryNumber(name: string, inputName: string, outputType: "number"): FunctionSignature {
  return {
    name,
    inputs: [{ name: inputName, type: { type: "number" } }],
    output: { type: outputType }
  };
}
