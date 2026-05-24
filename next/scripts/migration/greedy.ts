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

export const greedyCurated: Record<string, CuratedProblem> = {
  "max-compatible-meetings": intervalNumber("maxCompatibleMeetings", "max_compatible_meetings", "MaxCompatibleMeetings", [
    "const sorted = [...intervals].sort((a, b) => a[1] - b[1] || a[0] - b[0]);",
    "let count = 0;",
    "let currentEnd = -Infinity;",
    "for (const [start, end] of sorted) {",
    "  if (start >= currentEnd) {",
    "    count += 1;",
    "    currentEnd = end;",
    "  }",
    "}",
    "return count;"
  ], [
    "count = 0",
    "current_end = float('-inf')",
    "for start, end in sorted(intervals, key=lambda item: (item[1], item[0])):",
    "    if start >= current_end:",
    "        count += 1",
    "        current_end = end",
    "return count"
  ], [
    "sorted := sortIntervalsByEnd(intervals)",
    "count := 0",
    "currentEnd := -1 << 60",
    "for _, interval := range sorted {",
    "\tif interval[0] >= currentEnd { count++; currentEnd = interval[1] }",
    "}",
    "return count"
  ], [
    "var count = 0",
    "var currentEnd = Int.MinValue",
    "for (interval <- intervals.sortBy(item => (item(1), item(0)))) {",
    "  if (interval(0) >= currentEnd) { count += 1; currentEnd = interval(1) }",
    "}",
    "count"
  ]),
  "assign-snacks": {
    signature: {
      name: "assignSnacks",
      inputs: [
        { name: "appetites", type: numberArray() },
        { name: "snacks", type: numberArray() }
      ],
      output: numberType()
    },
    languages: {
      python: py("assign_snacks", "appetites: list[int], snacks: list[int]", "int", [
        "appetites = sorted(appetites)",
        "snacks = sorted(snacks)",
        "child = 0",
        "for snack in snacks:",
        "    if child < len(appetites) and snack >= appetites[child]:",
        "        child += 1",
        "return child"
      ]),
      typescript: ts("assignSnacks", "appetites: number[], snacks: number[]", "number", [
        "const needs = [...appetites].sort((a, b) => a - b);",
        "const sizes = [...snacks].sort((a, b) => a - b);",
        "let child = 0;",
        "for (const snack of sizes) {",
        "  if (child < needs.length && snack >= needs[child]) child += 1;",
        "}",
        "return child;"
      ]),
      go: go("AssignSnacks", "appetites []int, snacks []int", "int", [
        "needs := sortInts(appetites)",
        "sizes := sortInts(snacks)",
        "child := 0",
        "for _, snack := range sizes { if child < len(needs) && snack >= needs[child] { child++ } }",
        "return child"
      ]),
      scala: scala("assignSnacks", "appetites: Seq[Int], snacks: Seq[Int]", "Int", [
        "val needs = appetites.sorted",
        "var child = 0",
        "for (snack <- snacks.sorted) if (child < needs.length && snack >= needs(child)) child += 1",
        "child"
      ])
    }
  },
  "largest-one-swap": stringString("largestOneSwap", "largest_one_swap", "LargestOneSwap", "digits", [
    "const chars = digits.split(\"\");",
    "const last = new Array<number>(10).fill(-1);",
    "for (let index = 0; index < chars.length; index += 1) last[Number(chars[index])] = index;",
    "for (let index = 0; index < chars.length; index += 1) {",
    "  const current = Number(chars[index]);",
    "  for (let digit = 9; digit > current; digit -= 1) {",
    "    if (last[digit] > index) {",
    "      const swapIndex = last[digit];",
    "      [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];",
    "      return chars.join(\"\");",
    "    }",
    "  }",
    "}",
    "return digits;"
  ], [
    "chars = list(digits)",
    "last = {int(char): index for index, char in enumerate(chars)}",
    "for index, char in enumerate(chars):",
    "    current = int(char)",
    "    for digit in range(9, current, -1):",
    "        if last.get(digit, -1) > index:",
    "            swap_index = last[digit]",
    "            chars[index], chars[swap_index] = chars[swap_index], chars[index]",
    "            return ''.join(chars)",
    "return digits"
  ], [
    "chars := []rune(digits)",
    "last := make([]int, 10)",
    "for index := range last { last[index] = -1 }",
    "for index, char := range chars { last[int(char-'0')] = index }",
    "for index, char := range chars {",
    "\tcurrent := int(char - '0')",
    "\tfor digit := 9; digit > current; digit-- {",
    "\t\tif last[digit] > index { chars[index], chars[last[digit]] = chars[last[digit]], chars[index]; return string(chars) }",
    "\t}",
    "}",
    "return digits"
  ], [
    "val chars = digits.toCharArray",
    "val last = Array.fill(10)(-1)",
    "for (index <- chars.indices) last(chars(index).asDigit) = index",
    "for (index <- chars.indices) {",
    "  val current = chars(index).asDigit",
    "  for (digit <- 9 until current by -1) {",
    "    if (last(digit) > index) {",
    "      val swapIndex = last(digit)",
    "      val temp = chars(index); chars(index) = chars(swapIndex); chars(swapIndex) = temp",
    "      return chars.mkString",
    "    }",
    "  }",
    "}",
    "digits"
  ]),
  "can-reach-end-local": unaryNumberArrayBoolean("canReachEndLocal", "can_reach_end_local", "CanReachEndLocal", "jumps", [
    "let farthest = 0;",
    "for (let index = 0; index < jumps.length; index += 1) {",
    "  if (index > farthest) return false;",
    "  farthest = Math.max(farthest, index + jumps[index]);",
    "}",
    "return true;"
  ], [
    "farthest = 0",
    "for index, jump in enumerate(jumps):",
    "    if index > farthest:",
    "        return False",
    "    farthest = max(farthest, index + jump)",
    "return True"
  ], [
    "farthest := 0",
    "for index, jump := range jumps {",
    "\tif index > farthest { return false }",
    "\tif index+jump > farthest { farthest = index + jump }",
    "}",
    "return true"
  ], [
    "var farthest = 0",
    "for (index <- jumps.indices) {",
    "  if (index > farthest) return false",
    "  farthest = math.max(farthest, index + jumps(index))",
    "}",
    "true"
  ]),
  "partition-labels-local": stringNumberArray("partitionLabelsLocal", "partition_labels_local", "PartitionLabelsLocal", "text", [
    "const last = new Map<string, number>();",
    "for (let index = 0; index < text.length; index += 1) last.set(text[index], index);",
    "const parts: number[] = [];",
    "let start = 0;",
    "let end = 0;",
    "for (let index = 0; index < text.length; index += 1) {",
    "  end = Math.max(end, last.get(text[index])!);",
    "  if (index === end) {",
    "    parts.push(end - start + 1);",
    "    start = index + 1;",
    "  }",
    "}",
    "return parts;"
  ], [
    "last = {char: index for index, char in enumerate(text)}",
    "parts = []",
    "start = 0",
    "end = 0",
    "for index, char in enumerate(text):",
    "    end = max(end, last[char])",
    "    if index == end:",
    "        parts.append(end - start + 1)",
    "        start = index + 1",
    "return parts"
  ], [
    "last := map[rune]int{}",
    "chars := []rune(text)",
    "for index, char := range chars { last[char] = index }",
    "parts := []int{}",
    "start, end := 0, 0",
    "for index, char := range chars {",
    "\tif last[char] > end { end = last[char] }",
    "\tif index == end { parts = append(parts, end-start+1); start = index + 1 }",
    "}",
    "return parts"
  ], [
    "val last = text.zipWithIndex.toMap",
    "val parts = scala.collection.mutable.ArrayBuffer.empty[Int]",
    "var start = 0",
    "var end = 0",
    "for (index <- text.indices) {",
    "  end = math.max(end, last(text(index)))",
    "  if (index == end) { parts.append(end - start + 1); start = index + 1 }",
    "}",
    "parts.toSeq"
  ]),
  "greedy-bonus-01": twoArgNumber("fewestCoins", "fewest_coins", "FewestCoins", "coins", "amount", [
    "let remaining = amount;",
    "let count = 0;",
    "for (const coin of [...coins].sort((a, b) => b - a)) {",
    "  count += Math.floor(remaining / coin);",
    "  remaining %= coin;",
    "}",
    "return count;"
  ], [
    "remaining = amount",
    "count = 0",
    "for coin in sorted(coins, reverse=True):",
    "    count += remaining // coin",
    "    remaining %= coin",
    "return count"
  ], [
    "values := sortInts(coins); reverseInts(values)",
    "remaining, count := amount, 0",
    "for _, coin := range values { count += remaining / coin; remaining %= coin }",
    "return count"
  ], [
    "var remaining = amount",
    "var count = 0",
    "for (coin <- coins.sorted(Ordering.Int.reverse)) { count += remaining / coin; remaining = remaining % coin }",
    "count"
  ]),
  "greedy-bonus-02": maxTruckValue(),
  "greedy-bonus-03": unaryNumberArrayBoolean("canMakeChange", "can_make_change", "CanMakeChange", "bills", [
    "let fives = 0;",
    "let tens = 0;",
    "for (const bill of bills) {",
    "  if (bill === 5) fives += 1;",
    "  else if (bill === 10) {",
    "    if (fives === 0) return false;",
    "    fives -= 1; tens += 1;",
    "  } else {",
    "    if (tens > 0 && fives > 0) { tens -= 1; fives -= 1; }",
    "    else if (fives >= 3) fives -= 3;",
    "    else return false;",
    "  }",
    "}",
    "return true;"
  ], [
    "fives = 0",
    "tens = 0",
    "for bill in bills:",
    "    if bill == 5:",
    "        fives += 1",
    "    elif bill == 10:",
    "        if fives == 0:",
    "            return False",
    "        fives -= 1",
    "        tens += 1",
    "    else:",
    "        if tens > 0 and fives > 0:",
    "            tens -= 1",
    "            fives -= 1",
    "        elif fives >= 3:",
    "            fives -= 3",
    "        else:",
    "            return False",
    "return True"
  ], [
    "fives, tens := 0, 0",
    "for _, bill := range bills {",
    "\tif bill == 5 { fives++ } else if bill == 10 { if fives == 0 { return false }; fives--; tens++ } else { if tens > 0 && fives > 0 { tens--; fives-- } else if fives >= 3 { fives -= 3 } else { return false } }",
    "}",
    "return true"
  ], [
    "var fives = 0; var tens = 0",
    "for (bill <- bills) {",
    "  if (bill == 5) fives += 1",
    "  else if (bill == 10) { if (fives == 0) return false; fives -= 1; tens += 1 }",
    "  else if (tens > 0 && fives > 0) { tens -= 1; fives -= 1 }",
    "  else if (fives >= 3) fives -= 3",
    "  else return false",
    "}",
    "true"
  ]),
  "greedy-bonus-04": canPlantFlowers(),
  "greedy-bonus-05": intervalNumber("minArrows", "min_arrows", "MinArrows", [
    "if (intervals.length === 0) return 0;",
    "const sorted = [...intervals].sort((a, b) => a[1] - b[1] || a[0] - b[0]);",
    "let arrows = 0;",
    "let arrow = -Infinity;",
    "for (const [start, end] of sorted) {",
    "  if (start > arrow) {",
    "    arrows += 1;",
    "    arrow = end;",
    "  }",
    "}",
    "return arrows;"
  ], [
    "arrows = 0",
    "arrow = float('-inf')",
    "for start, end in sorted(intervals, key=lambda item: (item[1], item[0])):",
    "    if start > arrow:",
    "        arrows += 1",
    "        arrow = end",
    "return arrows"
  ], [
    "sorted := sortIntervalsByEnd(intervals)",
    "arrows := 0",
    "arrow := -1 << 60",
    "for _, interval := range sorted { if interval[0] > arrow { arrows++; arrow = interval[1] } }",
    "return arrows"
  ], [
    "var arrows = 0",
    "var arrow = Int.MinValue",
    "for (interval <- intervals.sortBy(item => (item(1), item(0)))) { if (interval(0) > arrow) { arrows += 1; arrow = interval(1) } }",
    "arrows"
  ]),
  "greedy-bonus-06": startStation(),
  "greedy-bonus-07": intervalNumber("minRooms", "min_rooms", "MinRooms", [
    "const starts = intervals.map((interval) => interval[0]).sort((a, b) => a - b);",
    "const ends = intervals.map((interval) => interval[1]).sort((a, b) => a - b);",
    "let endIndex = 0;",
    "let active = 0;",
    "let best = 0;",
    "for (const start of starts) {",
    "  while (endIndex < ends.length && ends[endIndex] <= start) { active -= 1; endIndex += 1; }",
    "  active += 1;",
    "  best = Math.max(best, active);",
    "}",
    "return best;"
  ], [
    "starts = sorted(start for start, _ in intervals)",
    "ends = sorted(end for _, end in intervals)",
    "end_index = 0",
    "active = 0",
    "best = 0",
    "for start in starts:",
    "    while end_index < len(ends) and ends[end_index] <= start:",
    "        active -= 1",
    "        end_index += 1",
    "    active += 1",
    "    best = max(best, active)",
    "return best"
  ], [
    "starts, ends := []int{}, []int{}",
    "for _, interval := range intervals { starts = append(starts, interval[0]); ends = append(ends, interval[1]) }",
    "starts = sortInts(starts); ends = sortInts(ends)",
    "endIndex, active, best := 0, 0, 0",
    "for _, start := range starts { for endIndex < len(ends) && ends[endIndex] <= start { active--; endIndex++ }; active++; if active > best { best = active } }",
    "return best"
  ], [
    "val starts = intervals.map(_(0)).sorted",
    "val ends = intervals.map(_(1)).sorted",
    "var endIndex = 0; var active = 0; var best = 0",
    "for (start <- starts) { while (endIndex < ends.length && ends(endIndex) <= start) { active -= 1; endIndex += 1 }; active += 1; best = math.max(best, active) }",
    "best"
  ]),
  "greedy-bonus-08": maxSumAfterFlips(),
  "greedy-bonus-09": countBoats(),
  "greedy-bonus-10": largestConcatenation()
};

function maxTruckValue(): CuratedProblem {
  return matrixAndNumber("maxTruckValue", "max_truck_value", "MaxTruckValue", "boxes", "capacity", [
    "const sorted = [...boxes].sort((a, b) => b[1] - a[1]);",
    "let remaining = capacity;",
    "let total = 0;",
    "for (const [units, value] of sorted) {",
    "  const take = Math.min(units, remaining);",
    "  total += take * value;",
    "  remaining -= take;",
    "  if (remaining === 0) break;",
    "}",
    "return total;"
  ], [
    "remaining = capacity",
    "total = 0",
    "for units, value in sorted(boxes, key=lambda box: box[1], reverse=True):",
    "    take = min(units, remaining)",
    "    total += take * value",
    "    remaining -= take",
    "    if remaining == 0:",
    "        break",
    "return total"
  ], [
    "sorted := append([][]int{}, boxes...)",
    "for i := 0; i < len(sorted); i++ { for j := i + 1; j < len(sorted); j++ { if sorted[j][1] > sorted[i][1] { sorted[i], sorted[j] = sorted[j], sorted[i] } } }",
    "remaining, total := capacity, 0",
    "for _, box := range sorted { take := min(box[0], remaining); total += take * box[1]; remaining -= take; if remaining == 0 { break } }",
    "return total"
  ], [
    "var remaining = capacity",
    "var total = 0",
    "for (box <- boxes.sortBy(_(1))(Ordering.Int.reverse)) { val take = math.min(box(0), remaining); total += take * box(1); remaining -= take }",
    "total"
  ]);
}

function canPlantFlowers(): CuratedProblem {
  return twoArgBoolean("canPlantFlowers", "can_plant_flowers", "CanPlantFlowers", "bed", "k", [
    "const plots = [...bed];",
    "let planted = 0;",
    "for (let index = 0; index < plots.length; index += 1) {",
    "  const leftEmpty = index === 0 || plots[index - 1] === 0;",
    "  const rightEmpty = index === plots.length - 1 || plots[index + 1] === 0;",
    "  if (plots[index] === 0 && leftEmpty && rightEmpty) {",
    "    plots[index] = 1;",
    "    planted += 1;",
    "    if (planted >= k) return true;",
    "  }",
    "}",
    "return planted >= k;"
  ], [
    "plots = bed[:]",
    "planted = 0",
    "for index in range(len(plots)):",
    "    left_empty = index == 0 or plots[index - 1] == 0",
    "    right_empty = index == len(plots) - 1 or plots[index + 1] == 0",
    "    if plots[index] == 0 and left_empty and right_empty:",
    "        plots[index] = 1",
    "        planted += 1",
    "        if planted >= k:",
    "            return True",
    "return planted >= k"
  ], [
    "plots := append([]int{}, bed...)",
    "planted := 0",
    "for index := range plots { leftEmpty := index == 0 || plots[index-1] == 0; rightEmpty := index == len(plots)-1 || plots[index+1] == 0; if plots[index] == 0 && leftEmpty && rightEmpty { plots[index] = 1; planted++; if planted >= k { return true } } }",
    "return planted >= k"
  ], [
    "val plots = bed.toArray",
    "var planted = 0",
    "for (index <- plots.indices) {",
    "  val leftEmpty = index == 0 || plots(index - 1) == 0",
    "  val rightEmpty = index == plots.length - 1 || plots(index + 1) == 0",
    "  if (plots(index) == 0 && leftEmpty && rightEmpty) { plots(index) = 1; planted += 1; if (planted >= k) return true }",
    "}",
    "planted >= k"
  ]);
}

function startStation(): CuratedProblem {
  return {
    signature: {
      name: "startStation",
      inputs: [
        { name: "fuel", type: numberArray() },
        { name: "cost", type: numberArray() }
      ],
      output: numberType()
    },
    languages: {
      python: py("start_station", "fuel: list[int], cost: list[int]", "int", [
        "if not fuel:",
        "    return 0",
        "total = 0",
        "tank = 0",
        "start = 0",
        "for index, amount in enumerate(fuel):",
        "    diff = amount - cost[index]",
        "    total += diff",
        "    tank += diff",
        "    if tank < 0:",
        "        start = index + 1",
        "        tank = 0",
        "return start if total >= 0 else -1"
      ]),
      typescript: ts("startStation", "fuel: number[], cost: number[]", "number", [
        "if (fuel.length === 0) return 0;",
        "let total = 0;",
        "let tank = 0;",
        "let start = 0;",
        "for (let index = 0; index < fuel.length; index += 1) {",
        "  const diff = fuel[index] - cost[index];",
        "  total += diff;",
        "  tank += diff;",
        "  if (tank < 0) {",
        "    start = index + 1;",
        "    tank = 0;",
        "  }",
        "}",
        "return total >= 0 ? start : -1;"
      ]),
      go: go("StartStation", "fuel []int, cost []int", "int", [
        "if len(fuel) == 0 { return 0 }",
        "total, tank, start := 0, 0, 0",
        "for index, amount := range fuel { diff := amount - cost[index]; total += diff; tank += diff; if tank < 0 { start = index + 1; tank = 0 } }",
        "if total >= 0 { return start }",
        "return -1"
      ]),
      scala: scala("startStation", "fuel: Seq[Int], cost: Seq[Int]", "Int", [
        "if (fuel.isEmpty) return 0",
        "var total = 0; var tank = 0; var start = 0",
        "for (index <- fuel.indices) { val diff = fuel(index) - cost(index); total += diff; tank += diff; if (tank < 0) { start = index + 1; tank = 0 } }",
        "if (total >= 0) start else -1"
      ])
    }
  };
}

function maxSumAfterFlips(): CuratedProblem {
  return twoArgNumber("maxSumAfterFlips", "max_sum_after_flips", "MaxSumAfterFlips", "nums", "k", [
    "const values = [...nums].sort((a, b) => a - b);",
    "let remaining = k;",
    "for (let index = 0; index < values.length && remaining > 0 && values[index] < 0; index += 1) {",
    "  values[index] = -values[index];",
    "  remaining -= 1;",
    "}",
    "let total = values.reduce((sum, value) => sum + value, 0);",
    "const smallestAbs = Math.min(...values.map((value) => Math.abs(value)));",
    "if (remaining % 2 === 1) total -= 2 * smallestAbs;",
    "return total;"
  ], [
    "values = sorted(nums)",
    "remaining = k",
    "for index in range(len(values)):",
    "    if remaining == 0 or values[index] >= 0:",
    "        break",
    "    values[index] = -values[index]",
    "    remaining -= 1",
    "total = sum(values)",
    "smallest_abs = min(abs(value) for value in values)",
    "if remaining % 2 == 1:",
    "    total -= 2 * smallest_abs",
    "return total"
  ], [
    "values := sortInts(nums)",
    "remaining := k",
    "for index := 0; index < len(values) && remaining > 0 && values[index] < 0; index++ { values[index] = -values[index]; remaining-- }",
    "total := 0; smallestAbs := 1 << 60",
    "for _, value := range values { total += value; if abs(value) < smallestAbs { smallestAbs = abs(value) } }",
    "if remaining%2 == 1 { total -= 2 * smallestAbs }",
    "return total"
  ], [
    "val values = nums.sorted.toArray",
    "var remaining = k",
    "var index = 0",
    "while (index < values.length && remaining > 0 && values(index) < 0) { values(index) = -values(index); remaining -= 1; index += 1 }",
    "var total = values.sum",
    "val smallestAbs = values.map(math.abs).min",
    "if (remaining % 2 == 1) total -= 2 * smallestAbs",
    "total"
  ], [goAbsHelper()]);
}

function countBoats(): CuratedProblem {
  return twoArgNumber("countBoats", "count_boats", "CountBoats", "weights", "limit", [
    "const sorted = [...weights].sort((a, b) => a - b);",
    "let left = 0;",
    "let right = sorted.length - 1;",
    "let boats = 0;",
    "while (left <= right) {",
    "  if (sorted[left] + sorted[right] <= limit) left += 1;",
    "  right -= 1;",
    "  boats += 1;",
    "}",
    "return boats;"
  ], [
    "weights = sorted(weights)",
    "left = 0",
    "right = len(weights) - 1",
    "boats = 0",
    "while left <= right:",
    "    if weights[left] + weights[right] <= limit:",
    "        left += 1",
    "    right -= 1",
    "    boats += 1",
    "return boats"
  ], [
    "sorted := sortInts(weights)",
    "left, right, boats := 0, len(sorted)-1, 0",
    "for left <= right { if sorted[left]+sorted[right] <= limit { left++ }; right--; boats++ }",
    "return boats"
  ], [
    "val sorted = weights.sorted",
    "var left = 0; var right = sorted.length - 1; var boats = 0",
    "while (left <= right) { if (sorted(left) + sorted(right) <= limit) left += 1; right -= 1; boats += 1 }",
    "boats"
  ]);
}

function largestConcatenation(): CuratedProblem {
  return unaryNumberArrayString("largestConcatenation", "largest_concatenation", "LargestConcatenation", "nums", [
    "if (nums.length === 0) return \"0\";",
    "const pieces = nums.map(String).sort((a, b) => (b + a).localeCompare(a + b));",
    "const result = pieces.join(\"\");",
    "return /^0+$/.test(result) ? \"0\" : result;"
  ], [
    "from functools import cmp_to_key",
    "if not nums:",
    "    return '0'",
    "def compare(a, b):",
    "    if b + a > a + b:",
    "        return 1",
    "    if b + a < a + b:",
    "        return -1",
    "    return 0",
    "pieces = sorted((str(num) for num in nums), key=cmp_to_key(compare))",
    "result = ''.join(pieces)",
    "return '0' if set(result) == {'0'} else result"
  ], [
    "pieces := []string{}",
    "for _, num := range nums { pieces = append(pieces, intToString(num)) }",
    "for i := 0; i < len(pieces); i++ { for j := i + 1; j < len(pieces); j++ { if pieces[j]+pieces[i] > pieces[i]+pieces[j] { pieces[i], pieces[j] = pieces[j], pieces[i] } } }",
    "result := \"\"",
    "for _, piece := range pieces { result += piece }",
    "if result == \"\" || allZero(result) { return \"0\" }",
    "return result"
  ], [
    "if (nums.isEmpty) return \"0\"",
    "val pieces = nums.map(_.toString).sortWith((a, b) => a + b > b + a)",
    "val result = pieces.mkString",
    "if (result.forall(_ == '0')) \"0\" else result"
  ], [goStringHelpers()]);
}

function intervalNumber(tsName: string, pyName: string, goName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: "intervals", type: arrayOf(numberArray()) }], output: numberType() },
    languages: {
      python: py(pyName, "intervals: list[list[int]]", "int", pyBody),
      typescript: ts(tsName, "intervals: number[][]", "number", tsBody),
      go: go(goName, "intervals [][]int", "int", goBody),
      scala: scala(tsName, "intervals: Seq[Seq[Int]]", "Int", scalaBody)
    }
  };
}

function matrixAndNumber(tsName: string, pyName: string, goName: string, matrixName: string, numberName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: matrixName, type: arrayOf(numberArray()) }, { name: numberName, type: numberType() }], output: numberType() },
    languages: {
      python: py(pyName, `${matrixName}: list[list[int]], ${numberName}: int`, "int", pyBody),
      typescript: ts(tsName, `${matrixName}: number[][], ${numberName}: number`, "number", tsBody),
      go: go(goName, `${matrixName} [][]int, ${numberName} int`, "int", goBody),
      scala: scala(tsName, `${matrixName}: Seq[Seq[Int]], ${numberName}: Int`, "Int", scalaBody)
    }
  };
}

function stringString(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: argName, type: stringType() }], output: stringType() },
    languages: {
      python: py(pyName, `${argName}: str`, "str", pyBody),
      typescript: ts(tsName, `${argName}: string`, "string", tsBody),
      go: go(goName, `${argName} string`, "string", goBody),
      scala: scala(tsName, `${argName}: String`, "String", scalaBody)
    }
  };
}

function stringNumberArray(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: argName, type: stringType() }], output: numberArray() },
    languages: {
      python: py(pyName, `${argName}: str`, "list[int]", pyBody),
      typescript: ts(tsName, `${argName}: string`, "number[]", tsBody),
      go: go(goName, `${argName} string`, "[]int", goBody),
      scala: scala(tsName, `${argName}: String`, "Seq[Int]", scalaBody)
    }
  };
}

function twoArgBoolean(tsName: string, pyName: string, goName: string, arrayName: string, numberName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: arrayName, type: numberArray() }, { name: numberName, type: numberType() }], output: booleanType() },
    languages: {
      python: py(pyName, `${arrayName}: list[int], ${numberName}: int`, "bool", pyBody),
      typescript: ts(tsName, `${arrayName}: number[], ${numberName}: number`, "boolean", tsBody),
      go: go(goName, `${arrayName} []int, ${numberName} int`, "bool", goBody),
      scala: scala(tsName, `${arrayName}: Seq[Int], ${numberName}: Int`, "Boolean", scalaBody)
    }
  };
}

function twoArgNumber(tsName: string, pyName: string, goName: string, arrayName: string, numberName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[], goHelpers: string[] = []): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: arrayName, type: numberArray() }, { name: numberName, type: numberType() }], output: numberType() },
    languages: {
      python: py(pyName, `${arrayName}: list[int], ${numberName}: int`, "int", pyBody),
      typescript: ts(tsName, `${arrayName}: number[], ${numberName}: number`, "number", tsBody),
      go: go(goName, `${arrayName} []int, ${numberName} int`, "int", goBody, goHelpers),
      scala: scala(tsName, `${arrayName}: Seq[Int], ${numberName}: Int`, "Int", scalaBody)
    }
  };
}

function unaryNumberArrayBoolean(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: argName, type: numberArray() }], output: booleanType() },
    languages: {
      python: py(pyName, `${argName}: list[int]`, "bool", pyBody),
      typescript: ts(tsName, `${argName}: number[]`, "boolean", tsBody),
      go: go(goName, `${argName} []int`, "bool", goBody),
      scala: scala(tsName, `${argName}: Seq[Int]`, "Boolean", scalaBody)
    }
  };
}

function unaryNumberArrayString(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[], goHelpers: string[] = []): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: argName, type: numberArray() }], output: stringType() },
    languages: {
      python: py(pyName, `${argName}: list[int]`, "str", pyBody),
      typescript: ts(tsName, `${argName}: number[]`, "string", tsBody),
      go: go(goName, `${argName} []int`, "string", goBody, goHelpers),
      scala: scala(tsName, `${argName}: Seq[Int]`, "String", scalaBody)
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

function go(name: string, args: string, returnType: string, body: string[], helpers: string[] = []): LanguageFiles {
  return {
    entrypoint: name,
    extension: "go",
    starter: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`,
    reference: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n${indent(body, "\t")}\n}\n${helpers.length ? `\n${helpers.join("\n\n")}\n` : ""}${goCommonHelpers()}\n`
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
  return `func sortInts(values []int) []int {
\tresult := append([]int{}, values...)
\tfor i := 0; i < len(result); i++ {
\t\tfor j := i + 1; j < len(result); j++ {
\t\t\tif result[j] < result[i] {
\t\t\t\tresult[i], result[j] = result[j], result[i]
\t\t\t}
\t\t}
\t}
\treturn result
}

func reverseInts(values []int) {
\tfor left, right := 0, len(values)-1; left < right; left, right = left+1, right-1 {
\t\tvalues[left], values[right] = values[right], values[left]
\t}
}

func sortIntervalsByEnd(intervals [][]int) [][]int {
\tresult := append([][]int{}, intervals...)
\tfor i := 0; i < len(result); i++ {
\t\tfor j := i + 1; j < len(result); j++ {
\t\t\tif result[j][1] < result[i][1] || (result[j][1] == result[i][1] && result[j][0] < result[i][0]) {
\t\t\t\tresult[i], result[j] = result[j], result[i]
\t\t\t}
\t\t}
\t}
\treturn result
}

func min(a int, b int) int {
\tif a < b { return a }
\treturn b
}`;
}

function goAbsHelper(): string {
  return `func abs(value int) int {
\tif value < 0 { return -value }
\treturn value
}`;
}

function goStringHelpers(): string {
  return `func intToString(value int) string {
\tif value == 0 { return "0" }
\tdigits := []byte{}
\tfor value > 0 {
\t\tdigits = append([]byte{byte('0' + value%10)}, digits...)
\t\tvalue /= 10
\t}
\treturn string(digits)
}

func allZero(value string) bool {
\tfor _, char := range value {
\t\tif char != '0' { return false }
\t}
\treturn true
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

function stringType(): ValueType {
  return { type: "string" };
}

function indent(lines: string[], prefix: string): string {
  return lines.map((line) => `${prefix}${line}`).join("\n");
}
