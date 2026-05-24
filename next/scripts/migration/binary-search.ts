import type { FunctionSignature, ValueType } from "../../src/core/types.js";

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
}

export const binarySearchCurated: Record<string, CuratedProblem> = {
  "lower-bound-local": boundsProblem("lowerBoundLocal", "lower_bound_local", "LowerBoundLocal", "target", [
    "let left = 0;",
    "let right = nums.length;",
    "while (left < right) {",
    "  const mid = Math.floor((left + right) / 2);",
    "  if (nums[mid] < target) left = mid + 1;",
    "  else right = mid;",
    "}",
    "return left;"
  ], [
    "left = 0",
    "right = len(nums)",
    "while left < right:",
    "    mid = (left + right) // 2",
    "    if nums[mid] < target:",
    "        left = mid + 1",
    "    else:",
    "        right = mid",
    "return left"
  ], [
    "left, right := 0, len(nums)",
    "for left < right { mid := (left + right) / 2; if nums[mid] < target { left = mid + 1 } else { right = mid } }",
    "return left"
  ], [
    "var left = 0; var right = nums.length",
    "while (left < right) { val mid = (left + right) / 2; if (nums(mid) < target) left = mid + 1 else right = mid }",
    "left"
  ]),
  "first-day-for-bouquets": firstDayForBouquets(),
  "integer-square-root": unaryNumber("integerSquareRoot", "integer_square_root", "IntegerSquareRoot", "n", [
    "let left = 0;",
    "let right = n;",
    "let answer = 0;",
    "while (left <= right) {",
    "  const mid = Math.floor((left + right) / 2);",
    "  if (mid * mid <= n) { answer = mid; left = mid + 1; }",
    "  else right = mid - 1;",
    "}",
    "return answer;"
  ], [
    "left = 0",
    "right = n",
    "answer = 0",
    "while left <= right:",
    "    mid = (left + right) // 2",
    "    if mid * mid <= n:",
    "        answer = mid",
    "        left = mid + 1",
    "    else:",
    "        right = mid - 1",
    "return answer"
  ], [
    "left, right, answer := 0, n, 0",
    "for left <= right { mid := (left + right) / 2; if mid*mid <= n { answer = mid; left = mid + 1 } else { right = mid - 1 } }",
    "return answer"
  ], [
    "var left = 0; var right = n; var answer = 0",
    "while (left <= right) { val mid = left + (right - left) / 2; if (mid.toLong * mid.toLong <= n.toLong) { answer = mid; left = mid + 1 } else right = mid - 1 }",
    "answer"
  ]),
  "search-rotated-local": rotatedSearch("searchRotatedLocal", "search_rotated_local", "SearchRotatedLocal"),
  "ship-capacity-local": shipCapacity(),
  "binary-search-bonus-01": boundsProblem("binarySearch", "binary_search", "BinarySearch", "target", [
    "let left = 0;",
    "let right = nums.length - 1;",
    "while (left <= right) {",
    "  const mid = Math.floor((left + right) / 2);",
    "  if (nums[mid] === target) return mid;",
    "  if (nums[mid] < target) left = mid + 1;",
    "  else right = mid - 1;",
    "}",
    "return -1;"
  ], [
    "left = 0",
    "right = len(nums) - 1",
    "while left <= right:",
    "    mid = (left + right) // 2",
    "    if nums[mid] == target:",
    "        return mid",
    "    if nums[mid] < target:",
    "        left = mid + 1",
    "    else:",
    "        right = mid - 1",
    "return -1"
  ], [
    "left, right := 0, len(nums)-1",
    "for left <= right { mid := (left + right) / 2; if nums[mid] == target { return mid }; if nums[mid] < target { left = mid + 1 } else { right = mid - 1 } }",
    "return -1"
  ], [
    "var left = 0; var right = nums.length - 1",
    "while (left <= right) { val mid = (left + right) / 2; if (nums(mid) == target) return mid; if (nums(mid) < target) left = mid + 1 else right = mid - 1 }",
    "-1"
  ]),
  "binary-search-bonus-02": boundsProblem("upperBound", "upper_bound", "UpperBound", "target", [
    "let left = 0;",
    "let right = nums.length;",
    "while (left < right) {",
    "  const mid = Math.floor((left + right) / 2);",
    "  if (nums[mid] <= target) left = mid + 1;",
    "  else right = mid;",
    "}",
    "return left;"
  ], [
    "left = 0",
    "right = len(nums)",
    "while left < right:",
    "    mid = (left + right) // 2",
    "    if nums[mid] <= target:",
    "        left = mid + 1",
    "    else:",
    "        right = mid",
    "return left"
  ], [
    "left, right := 0, len(nums)",
    "for left < right { mid := (left + right) / 2; if nums[mid] <= target { left = mid + 1 } else { right = mid } }",
    "return left"
  ], [
    "var left = 0; var right = nums.length",
    "while (left < right) { val mid = (left + right) / 2; if (nums(mid) <= target) left = mid + 1 else right = mid }",
    "left"
  ]),
  "binary-search-bonus-03": countOccurrences(),
  "binary-search-bonus-04": unaryNumberArray("findPeakElement", "find_peak_element", "FindPeakElement", "nums", [
    "let left = 0;",
    "let right = nums.length - 1;",
    "while (left < right) {",
    "  const mid = Math.floor((left + right) / 2);",
    "  if (nums[mid] < nums[mid + 1]) left = mid + 1;",
    "  else right = mid;",
    "}",
    "return left;"
  ], [
    "left = 0",
    "right = len(nums) - 1",
    "while left < right:",
    "    mid = (left + right) // 2",
    "    if nums[mid] < nums[mid + 1]:",
    "        left = mid + 1",
    "    else:",
    "        right = mid",
    "return left"
  ], [
    "left, right := 0, len(nums)-1",
    "for left < right { mid := (left + right) / 2; if nums[mid] < nums[mid+1] { left = mid + 1 } else { right = mid } }",
    "return left"
  ], [
    "var left = 0; var right = nums.length - 1",
    "while (left < right) { val mid = (left + right) / 2; if (nums(mid) < nums(mid + 1)) left = mid + 1 else right = mid }",
    "left"
  ]),
  "binary-search-bonus-05": unaryNumberArray("findMinRotated", "find_min_rotated", "FindMinRotated", "nums", [
    "let left = 0;",
    "let right = nums.length - 1;",
    "while (left < right) {",
    "  const mid = Math.floor((left + right) / 2);",
    "  if (nums[mid] > nums[right]) left = mid + 1;",
    "  else right = mid;",
    "}",
    "return nums[left];"
  ], [
    "left = 0",
    "right = len(nums) - 1",
    "while left < right:",
    "    mid = (left + right) // 2",
    "    if nums[mid] > nums[right]:",
    "        left = mid + 1",
    "    else:",
    "        right = mid",
    "return nums[left]"
  ], [
    "left, right := 0, len(nums)-1",
    "for left < right { mid := (left + right) / 2; if nums[mid] > nums[right] { left = mid + 1 } else { right = mid } }",
    "return nums[left]"
  ], [
    "var left = 0; var right = nums.length - 1",
    "while (left < right) { val mid = (left + right) / 2; if (nums(mid) > nums(right)) left = mid + 1 else right = mid }",
    "nums(left)"
  ]),
  "binary-search-bonus-06": searchMatrix(),
  "binary-search-bonus-07": minEatingSpeed(),
  "binary-search-bonus-08": splitArrayMinLargest(),
  "binary-search-bonus-09": unaryNumber("cubeRootFloor", "cube_root_floor", "CubeRootFloor", "n", [
    "let left = 0;",
    "let right = n;",
    "let answer = 0;",
    "while (left <= right) {",
    "  const mid = Math.floor((left + right) / 2);",
    "  if (mid * mid * mid <= n) { answer = mid; left = mid + 1; }",
    "  else right = mid - 1;",
    "}",
    "return answer;"
  ], [
    "left = 0",
    "right = n",
    "answer = 0",
    "while left <= right:",
    "    mid = (left + right) // 2",
    "    if mid * mid * mid <= n:",
    "        answer = mid",
    "        left = mid + 1",
    "    else:",
    "        right = mid - 1",
    "return answer"
  ], [
    "left, right, answer := 0, n, 0",
    "for left <= right { mid := (left + right) / 2; if mid*mid*mid <= n { answer = mid; left = mid + 1 } else { right = mid - 1 } }",
    "return answer"
  ], [
    "var left = 0; var right = n; var answer = 0",
    "while (left <= right) { val mid = left + (right - left) / 2; val cube = mid.toLong * mid.toLong * mid.toLong; if (cube <= n.toLong) { answer = mid; left = mid + 1 } else right = mid - 1 }",
    "answer"
  ]),
  "binary-search-bonus-10": boundsProblem("searchUnknownSize", "search_unknown_size", "SearchUnknownSize", "target", [
    "if (nums.length === 0) return -1;",
    "let bound = 1;",
    "while (bound < nums.length && nums[bound] < target) bound *= 2;",
    "let left = Math.floor(bound / 2);",
    "let right = Math.min(bound, nums.length - 1);",
    "while (left <= right) {",
    "  const mid = Math.floor((left + right) / 2);",
    "  if (nums[mid] === target) return mid;",
    "  if (nums[mid] < target) left = mid + 1;",
    "  else right = mid - 1;",
    "}",
    "return -1;"
  ], [
    "if not nums:",
    "    return -1",
    "bound = 1",
    "while bound < len(nums) and nums[bound] < target:",
    "    bound *= 2",
    "left = bound // 2",
    "right = min(bound, len(nums) - 1)",
    "while left <= right:",
    "    mid = (left + right) // 2",
    "    if nums[mid] == target:",
    "        return mid",
    "    if nums[mid] < target:",
    "        left = mid + 1",
    "    else:",
    "        right = mid - 1",
    "return -1"
  ], [
    "if len(nums) == 0 { return -1 }",
    "bound := 1",
    "for bound < len(nums) && nums[bound] < target { bound *= 2 }",
    "left, right := bound/2, min(bound, len(nums)-1)",
    "for left <= right { mid := (left + right) / 2; if nums[mid] == target { return mid }; if nums[mid] < target { left = mid + 1 } else { right = mid - 1 } }",
    "return -1"
  ], [
    "if (nums.isEmpty) return -1",
    "var bound = 1",
    "while (bound < nums.length && nums(bound) < target) bound *= 2",
    "var left = bound / 2; var right = math.min(bound, nums.length - 1)",
    "while (left <= right) { val mid = (left + right) / 2; if (nums(mid) == target) return mid; if (nums(mid) < target) left = mid + 1 else right = mid - 1 }",
    "-1"
  ])
};

function firstDayForBouquets(): CuratedProblem {
  return {
    signature: {
      name: "firstDayForBouquets",
      inputs: [
        { name: "bloomDays", type: numberArray() },
        { name: "bouquets", type: numberType() },
        { name: "size", type: numberType() }
      ],
      output: numberType()
    },
    languages: {
      python: py("first_day_for_bouquets", "bloomDays: list[int], bouquets: int, size: int", "int", [
        "if bouquets * size > len(bloomDays):",
        "    return -1",
        "def can(day):",
        "    made = 0",
        "    run = 0",
        "    for bloom in bloomDays:",
        "        if bloom <= day:",
        "            run += 1",
        "            if run == size:",
        "                made += 1",
        "                run = 0",
        "        else:",
        "            run = 0",
        "    return made >= bouquets",
        "left = min(bloomDays)",
        "right = max(bloomDays)",
        "while left < right:",
        "    mid = (left + right) // 2",
        "    if can(mid):",
        "        right = mid",
        "    else:",
        "        left = mid + 1",
        "return left"
      ]),
      typescript: ts("firstDayForBouquets", "bloomDays: number[], bouquets: number, size: number", "number", [
        "if (bouquets * size > bloomDays.length) return -1;",
        "const can = (day: number) => {",
        "  let made = 0;",
        "  let run = 0;",
        "  for (const bloom of bloomDays) {",
        "    if (bloom <= day) {",
        "      run += 1;",
        "      if (run === size) { made += 1; run = 0; }",
        "    } else run = 0;",
        "  }",
        "  return made >= bouquets;",
        "};",
        "let left = Math.min(...bloomDays);",
        "let right = Math.max(...bloomDays);",
        "while (left < right) {",
        "  const mid = Math.floor((left + right) / 2);",
        "  if (can(mid)) right = mid;",
        "  else left = mid + 1;",
        "}",
        "return left;"
      ]),
      go: go("FirstDayForBouquets", "bloomDays []int, bouquets int, size int", "int", [
        "if bouquets*size > len(bloomDays) { return -1 }",
        "left, right := minInSlice(bloomDays), maxInSlice(bloomDays)",
        "can := func(day int) bool { made, run := 0, 0; for _, bloom := range bloomDays { if bloom <= day { run++; if run == size { made++; run = 0 } } else { run = 0 } }; return made >= bouquets }",
        "for left < right { mid := (left + right) / 2; if can(mid) { right = mid } else { left = mid + 1 } }",
        "return left"
      ]),
      scala: scala("firstDayForBouquets", "bloomDays: Seq[Int], bouquets: Int, size: Int", "Int", [
        "if (bouquets * size > bloomDays.length) return -1",
        "def can(day: Int): Boolean = { var made = 0; var run = 0; for (bloom <- bloomDays) { if (bloom <= day) { run += 1; if (run == size) { made += 1; run = 0 } } else run = 0 }; made >= bouquets }",
        "var left = bloomDays.min; var right = bloomDays.max",
        "while (left < right) { val mid = (left + right) / 2; if (can(mid)) right = mid else left = mid + 1 }",
        "left"
      ])
    }
  };
}

function rotatedSearch(tsName: string, pyName: string, goName: string): CuratedProblem {
  return boundsProblem(tsName, pyName, goName, "target", [
    "let left = 0;",
    "let right = nums.length - 1;",
    "while (left <= right) {",
    "  const mid = Math.floor((left + right) / 2);",
    "  if (nums[mid] === target) return mid;",
    "  if (nums[left] <= nums[mid]) {",
    "    if (nums[left] <= target && target < nums[mid]) right = mid - 1;",
    "    else left = mid + 1;",
    "  } else {",
    "    if (nums[mid] < target && target <= nums[right]) left = mid + 1;",
    "    else right = mid - 1;",
    "  }",
    "}",
    "return -1;"
  ], [
    "left = 0",
    "right = len(nums) - 1",
    "while left <= right:",
    "    mid = (left + right) // 2",
    "    if nums[mid] == target:",
    "        return mid",
    "    if nums[left] <= nums[mid]:",
    "        if nums[left] <= target < nums[mid]:",
    "            right = mid - 1",
    "        else:",
    "            left = mid + 1",
    "    else:",
    "        if nums[mid] < target <= nums[right]:",
    "            left = mid + 1",
    "        else:",
    "            right = mid - 1",
    "return -1"
  ], [
    "left, right := 0, len(nums)-1",
    "for left <= right { mid := (left + right) / 2; if nums[mid] == target { return mid }; if nums[left] <= nums[mid] { if nums[left] <= target && target < nums[mid] { right = mid - 1 } else { left = mid + 1 } } else { if nums[mid] < target && target <= nums[right] { left = mid + 1 } else { right = mid - 1 } } }",
    "return -1"
  ], [
    "var left = 0; var right = nums.length - 1",
    "while (left <= right) { val mid = (left + right) / 2; if (nums(mid) == target) return mid; if (nums(left) <= nums(mid)) { if (nums(left) <= target && target < nums(mid)) right = mid - 1 else left = mid + 1 } else { if (nums(mid) < target && target <= nums(right)) left = mid + 1 else right = mid - 1 } }",
    "-1"
  ]);
}

function shipCapacity(): CuratedProblem {
  return twoArgNumber("shipCapacityLocal", "ship_capacity_local", "ShipCapacityLocal", "weights", "days", [
    "const can = (capacity: number) => {",
    "  let usedDays = 1;",
    "  let load = 0;",
    "  for (const weight of weights) {",
    "    if (load + weight > capacity) { usedDays += 1; load = 0; }",
    "    load += weight;",
    "  }",
    "  return usedDays <= days;",
    "};",
    "let left = Math.max(...weights);",
    "let right = weights.reduce((sum, value) => sum + value, 0);",
    "while (left < right) {",
    "  const mid = Math.floor((left + right) / 2);",
    "  if (can(mid)) right = mid;",
    "  else left = mid + 1;",
    "}",
    "return left;"
  ], [
    "def can(capacity):",
    "    used_days = 1",
    "    load = 0",
    "    for weight in weights:",
    "        if load + weight > capacity:",
    "            used_days += 1",
    "            load = 0",
    "        load += weight",
    "    return used_days <= days",
    "left = max(weights)",
    "right = sum(weights)",
    "while left < right:",
    "    mid = (left + right) // 2",
    "    if can(mid):",
    "        right = mid",
    "    else:",
    "        left = mid + 1",
    "return left"
  ], [
    "can := func(capacity int) bool { usedDays, load := 1, 0; for _, weight := range weights { if load+weight > capacity { usedDays++; load = 0 }; load += weight }; return usedDays <= days }",
    "left, right := maxInSlice(weights), sumSlice(weights)",
    "for left < right { mid := (left + right) / 2; if can(mid) { right = mid } else { left = mid + 1 } }",
    "return left"
  ], [
    "def can(capacity: Int): Boolean = { var usedDays = 1; var load = 0; for (weight <- weights) { if (load + weight > capacity) { usedDays += 1; load = 0 }; load += weight }; usedDays <= days }",
    "var left = weights.max; var right = weights.sum",
    "while (left < right) { val mid = (left + right) / 2; if (can(mid)) right = mid else left = mid + 1 }",
    "left"
  ]);
}

function countOccurrences(): CuratedProblem {
  return boundsProblem("countOccurrences", "count_occurrences", "CountOccurrences", "target", [
    "const lower = (value: number) => { let left = 0; let right = nums.length; while (left < right) { const mid = Math.floor((left + right) / 2); if (nums[mid] < value) left = mid + 1; else right = mid; } return left; };",
    "return lower(target + 1) - lower(target);"
  ], [
    "def lower(value):",
    "    left = 0",
    "    right = len(nums)",
    "    while left < right:",
    "        mid = (left + right) // 2",
    "        if nums[mid] < value:",
    "            left = mid + 1",
    "        else:",
    "            right = mid",
    "    return left",
    "return lower(target + 1) - lower(target)"
  ], [
    "lower := func(value int) int { left, right := 0, len(nums); for left < right { mid := (left + right) / 2; if nums[mid] < value { left = mid + 1 } else { right = mid } }; return left }",
    "return lower(target+1) - lower(target)"
  ], [
    "def lower(value: Int): Int = { var left = 0; var right = nums.length; while (left < right) { val mid = (left + right) / 2; if (nums(mid) < value) left = mid + 1 else right = mid }; left }",
    "lower(target + 1) - lower(target)"
  ]);
}

function searchMatrix(): CuratedProblem {
  return {
    signature: {
      name: "searchMatrix",
      inputs: [
        { name: "matrix", type: arrayOf(numberArray()) },
        { name: "target", type: numberType() }
      ],
      output: booleanType()
    },
    languages: {
      python: py("search_matrix", "matrix: list[list[int]], target: int", "bool", [
        "if not matrix or not matrix[0]:",
        "    return False",
        "rows = len(matrix)",
        "cols = len(matrix[0])",
        "left = 0",
        "right = rows * cols - 1",
        "while left <= right:",
        "    mid = (left + right) // 2",
        "    value = matrix[mid // cols][mid % cols]",
        "    if value == target:",
        "        return True",
        "    if value < target:",
        "        left = mid + 1",
        "    else:",
        "        right = mid - 1",
        "return False"
      ]),
      typescript: ts("searchMatrix", "matrix: number[][], target: number", "boolean", [
        "if (matrix.length === 0 || matrix[0].length === 0) return false;",
        "const rows = matrix.length;",
        "const cols = matrix[0].length;",
        "let left = 0;",
        "let right = rows * cols - 1;",
        "while (left <= right) {",
        "  const mid = Math.floor((left + right) / 2);",
        "  const value = matrix[Math.floor(mid / cols)][mid % cols];",
        "  if (value === target) return true;",
        "  if (value < target) left = mid + 1;",
        "  else right = mid - 1;",
        "}",
        "return false;"
      ]),
      go: go("SearchMatrix", "matrix [][]int, target int", "bool", [
        "if len(matrix) == 0 || len(matrix[0]) == 0 { return false }",
        "rows, cols := len(matrix), len(matrix[0])",
        "left, right := 0, rows*cols-1",
        "for left <= right { mid := (left + right) / 2; value := matrix[mid/cols][mid%cols]; if value == target { return true }; if value < target { left = mid + 1 } else { right = mid - 1 } }",
        "return false"
      ]),
      scala: scala("searchMatrix", "matrix: Seq[Seq[Int]], target: Int", "Boolean", [
        "if (matrix.isEmpty || matrix.head.isEmpty) return false",
        "val rows = matrix.length; val cols = matrix.head.length",
        "var left = 0; var right = rows * cols - 1",
        "while (left <= right) { val mid = (left + right) / 2; val value = matrix(mid / cols)(mid % cols); if (value == target) return true; if (value < target) left = mid + 1 else right = mid - 1 }",
        "false"
      ])
    }
  };
}

function minEatingSpeed(): CuratedProblem {
  return twoArgNumber("minEatingSpeed", "min_eating_speed", "MinEatingSpeed", "piles", "hours", [
    "const neededHours = (speed: number) => piles.reduce((total, pile) => total + Math.ceil(pile / speed), 0);",
    "let left = 1;",
    "let right = Math.max(...piles);",
    "while (left < right) {",
    "  const mid = Math.floor((left + right) / 2);",
    "  if (neededHours(mid) <= hours) right = mid;",
    "  else left = mid + 1;",
    "}",
    "return left;"
  ], [
    "def needed_hours(speed):",
    "    return sum((pile + speed - 1) // speed for pile in piles)",
    "left = 1",
    "right = max(piles)",
    "while left < right:",
    "    mid = (left + right) // 2",
    "    if needed_hours(mid) <= hours:",
    "        right = mid",
    "    else:",
    "        left = mid + 1",
    "return left"
  ], [
    "neededHours := func(speed int) int { total := 0; for _, pile := range piles { total += (pile + speed - 1) / speed }; return total }",
    "left, right := 1, maxInSlice(piles)",
    "for left < right { mid := (left + right) / 2; if neededHours(mid) <= hours { right = mid } else { left = mid + 1 } }",
    "return left"
  ], [
    "def neededHours(speed: Int): Int = piles.map(pile => (pile + speed - 1) / speed).sum",
    "var left = 1; var right = piles.max",
    "while (left < right) { val mid = (left + right) / 2; if (neededHours(mid) <= hours) right = mid else left = mid + 1 }",
    "left"
  ]);
}

function splitArrayMinLargest(): CuratedProblem {
  return twoArgNumber("splitArrayMinLargest", "split_array_min_largest", "SplitArrayMinLargest", "nums", "k", [
    "const partsNeeded = (limit: number) => { let parts = 1; let total = 0; for (const num of nums) { if (total + num > limit) { parts += 1; total = 0; } total += num; } return parts; };",
    "let left = Math.max(...nums);",
    "let right = nums.reduce((sum, value) => sum + value, 0);",
    "while (left < right) {",
    "  const mid = Math.floor((left + right) / 2);",
    "  if (partsNeeded(mid) <= k) right = mid;",
    "  else left = mid + 1;",
    "}",
    "return left;"
  ], [
    "def parts_needed(limit):",
    "    parts = 1",
    "    total = 0",
    "    for num in nums:",
    "        if total + num > limit:",
    "            parts += 1",
    "            total = 0",
    "        total += num",
    "    return parts",
    "left = max(nums)",
    "right = sum(nums)",
    "while left < right:",
    "    mid = (left + right) // 2",
    "    if parts_needed(mid) <= k:",
    "        right = mid",
    "    else:",
    "        left = mid + 1",
    "return left"
  ], [
    "partsNeeded := func(limit int) int { parts, total := 1, 0; for _, num := range nums { if total+num > limit { parts++; total = 0 }; total += num }; return parts }",
    "left, right := maxInSlice(nums), sumSlice(nums)",
    "for left < right { mid := (left + right) / 2; if partsNeeded(mid) <= k { right = mid } else { left = mid + 1 } }",
    "return left"
  ], [
    "def partsNeeded(limit: Int): Int = { var parts = 1; var total = 0; for (num <- nums) { if (total + num > limit) { parts += 1; total = 0 }; total += num }; parts }",
    "var left = nums.max; var right = nums.sum",
    "while (left < right) { val mid = (left + right) / 2; if (partsNeeded(mid) <= k) right = mid else left = mid + 1 }",
    "left"
  ]);
}

function boundsProblem(tsName: string, pyName: string, goName: string, numberName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return twoArgNumber(tsName, pyName, goName, "nums", numberName, tsBody, pyBody, goBody, scalaBody);
}

function unaryNumber(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: argName, type: numberType() }], output: numberType() },
    languages: {
      python: py(pyName, `${argName}: int`, "int", pyBody),
      typescript: ts(tsName, `${argName}: number`, "number", tsBody),
      go: go(goName, `${argName} int`, "int", goBody),
      scala: scala(tsName, `${argName}: Int`, "Int", scalaBody)
    }
  };
}

function unaryNumberArray(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: argName, type: numberArray() }], output: numberType() },
    languages: {
      python: py(pyName, `${argName}: list[int]`, "int", pyBody),
      typescript: ts(tsName, `${argName}: number[]`, "number", tsBody),
      go: go(goName, `${argName} []int`, "int", goBody),
      scala: scala(tsName, `${argName}: Seq[Int]`, "Int", scalaBody)
    }
  };
}

function twoArgNumber(tsName: string, pyName: string, goName: string, arrayName: string, numberName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: {
      name: tsName,
      inputs: [
        { name: arrayName, type: numberArray() },
        { name: numberName, type: numberType() }
      ],
      output: numberType()
    },
    languages: {
      python: py(pyName, `${arrayName}: list[int], ${numberName}: int`, "int", pyBody),
      typescript: ts(tsName, `${arrayName}: number[], ${numberName}: number`, "number", tsBody),
      go: go(goName, `${arrayName} []int, ${numberName} int`, "int", goBody),
      scala: scala(tsName, `${arrayName}: Seq[Int], ${numberName}: Int`, "Int", scalaBody)
    }
  };
}

function py(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "py",
    starter: `def ${name}(${args}) -> ${returnType}:\n    raise NotImplementedError\n`,
    reference: `def ${name}(${args}) -> ${returnType}:\n${indent(body, "    ")}\n`
  };
}

function ts(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "ts",
    starter: `export function ${name}(${args}): ${returnType} {\n  throw new Error("TODO");\n}\n`,
    reference: `export function ${name}(${args}): ${returnType} {\n${indent(body, "  ")}\n}\n`
  };
}

function go(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "go",
    starter: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`,
    reference: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n${indent(body, "\t")}\n}\n\n${goCommonHelpers()}\n`
  };
}

function scala(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "scala",
    starter: `object Solution {\n  def ${name}(${args}): ${returnType} = ???\n}\n`,
    reference: `object Solution {\n  def ${name}(${args}): ${returnType} = {\n${indent(body, "    ")}\n  }\n}\n`
  };
}

function goCommonHelpers(): string {
  return `func min(a int, b int) int {
\tif a < b { return a }
\treturn b
}

func maxInSlice(values []int) int {
\tbest := values[0]
\tfor _, value := range values { if value > best { best = value } }
\treturn best
}

func minInSlice(values []int) int {
\tbest := values[0]
\tfor _, value := range values { if value < best { best = value } }
\treturn best
}

func sumSlice(values []int) int {
\ttotal := 0
\tfor _, value := range values { total += value }
\treturn total
}`;
}

function arrayOf(items: ValueType): ValueType {
  return { type: "array", items };
}

function booleanType(): ValueType {
  return { type: "boolean" };
}

function numberArray(): ValueType {
  return arrayOf(numberType());
}

function numberType(): ValueType {
  return { type: "number" };
}

function indent(lines: string[], prefix: string): string {
  return lines.map((line) => `${prefix}${line}`).join("\n");
}
