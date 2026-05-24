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

export const heapsCurated: Record<string, CuratedProblem> = {
  "top-k-scores": twoArgNumberArray("topKScores", "top_k_scores", "TopKScores", "scores", "k", [
    "if (k <= 0) return [];",
    "return [...scores].sort((a, b) => b - a).slice(0, k);"
  ], [
    "if k <= 0:",
    "    return []",
    "return sorted(scores, reverse=True)[:k]"
  ], [
    "values := sortInts(scores)",
    "reverseInts(values)",
    "if k < 0 { k = 0 }",
    "if k > len(values) { k = len(values) }",
    "return values[:k]"
  ], [
    "if (k <= 0) Seq.empty else scores.sorted(Ordering.Int.reverse).take(k)"
  ]),
  "merge-sorted-batches": {
    signature: {
      name: "mergeSortedBatches",
      inputs: [{ name: "batches", type: arrayOf(numberArray()) }],
      output: numberArray()
    },
    languages: {
      python: py("merge_sorted_batches", "batches: list[list[int]]", "list[int]", [
        "merged = []",
        "for batch in batches:",
        "    merged.extend(batch)",
        "return sorted(merged)"
      ]),
      typescript: ts("mergeSortedBatches", "batches: number[][]", "number[]", [
        "return batches.flat().sort((a, b) => a - b);"
      ]),
      go: go("MergeSortedBatches", "batches [][]int", "[]int", [
        "merged := []int{}",
        "for _, batch := range batches { merged = append(merged, batch...) }",
        "return sortInts(merged)"
      ]),
      scala: scala("mergeSortedBatches", "batches: Seq[Seq[Int]]", "Seq[Int]", [
        "batches.flatten.sorted"
      ])
    }
  },
  "k-closest-points-local": {
    signature: {
      name: "kClosestPointsLocal",
      inputs: [
        { name: "points", type: arrayOf(numberArray()) },
        { name: "k", type: numberType() }
      ],
      output: arrayOf(numberArray())
    },
    languages: {
      python: py("k_closest_points_local", "points: list[list[int]], k: int", "list[list[int]]", [
        "return sorted(points, key=lambda point: (point[0] * point[0] + point[1] * point[1], point[0], point[1]))[:k]"
      ]),
      typescript: ts("kClosestPointsLocal", "points: number[][], k: number", "number[][]", [
        "return [...points]",
        "  .sort((a, b) => (a[0] * a[0] + a[1] * a[1]) - (b[0] * b[0] + b[1] * b[1]) || a[0] - b[0] || a[1] - b[1])",
        "  .slice(0, k);"
      ]),
      go: go("KClosestPointsLocal", "points [][]int, k int", "[][]int", [
        "result := append([][]int{}, points...)",
        "for i := 0; i < len(result); i++ {",
        "\tfor j := i + 1; j < len(result); j++ {",
        "\t\tif comparePoint(result[j], result[i]) < 0 { result[i], result[j] = result[j], result[i] }",
        "\t}",
        "}",
        "if k > len(result) { k = len(result) }",
        "return result[:k]"
      ], [goPointCompareHelper()]),
      scala: scala("kClosestPointsLocal", "points: Seq[Seq[Int]], k: Int", "Seq[Seq[Int]]", [
        "points.sortBy(point => (point(0) * point(0) + point(1) * point(1), point(0), point(1))).take(k)"
      ])
    }
  },
  "running-medians-local": unaryNumberArrayToNumberArray("runningMediansLocal", "running_medians_local", "RunningMediansLocal", "nums", [
    "const seen: number[] = [];",
    "const medians: number[] = [];",
    "for (const num of nums) {",
    "  let index = 0;",
    "  while (index < seen.length && seen[index] < num) index += 1;",
    "  seen.splice(index, 0, num);",
    "  const middle = Math.floor(seen.length / 2);",
    "  if (seen.length % 2 === 1) medians.push(seen[middle]);",
    "  else medians.push((seen[middle - 1] + seen[middle]) / 2);",
    "}",
    "return medians;"
  ], [
    "seen = []",
    "medians = []",
    "for num in nums:",
    "    index = 0",
    "    while index < len(seen) and seen[index] < num:",
    "        index += 1",
    "    seen.insert(index, num)",
    "    middle = len(seen) // 2",
    "    if len(seen) % 2 == 1:",
    "        medians.append(seen[middle])",
    "    else:",
    "        medians.append((seen[middle - 1] + seen[middle]) / 2)",
    "return medians"
  ], [
    "seen := []int{}",
    "medians := []float64{}",
    "for _, num := range nums {",
    "\tindex := 0",
    "\tfor index < len(seen) && seen[index] < num { index++ }",
    "\tseen = append(seen, 0)",
    "\tcopy(seen[index+1:], seen[index:])",
    "\tseen[index] = num",
    "\tmiddle := len(seen) / 2",
    "\tif len(seen)%2 == 1 { medians = append(medians, float64(seen[middle])) } else { medians = append(medians, float64(seen[middle-1]+seen[middle])/2.0) }",
    "}",
    "return medians"
  ], [
    "val seen = scala.collection.mutable.ArrayBuffer.empty[Int]",
    "val medians = scala.collection.mutable.ArrayBuffer.empty[Double]",
    "for (num <- nums) {",
    "  val index = seen.indexWhere(_ >= num) match { case -1 => seen.length; case found => found }",
    "  seen.insert(index, num)",
    "  val middle = seen.length / 2",
    "  if (seen.length % 2 == 1) medians.append(seen(middle).toDouble)",
    "  else medians.append((seen(middle - 1) + seen(middle)).toDouble / 2.0)",
    "}",
    "medians.toSeq"
  ]),
  "combine-until-target": twoArgNumber("combineUntilTarget", "combine_until_target", "CombineUntilTarget", "values", "target", [
    "const heap = [...values].sort((a, b) => a - b);",
    "let combines = 0;",
    "while (heap.length > 0 && heap[0] < target) {",
    "  if (heap.length < 2) return -1;",
    "  const small = heap.shift()!;",
    "  const large = heap.shift()!;",
    "  heap.push(small + 2 * large);",
    "  heap.sort((a, b) => a - b);",
    "  combines += 1;",
    "}",
    "return heap.length === 0 ? -1 : combines;"
  ], [
    "heap = sorted(values)",
    "combines = 0",
    "while heap and heap[0] < target:",
    "    if len(heap) < 2:",
    "        return -1",
    "    small = heap.pop(0)",
    "    large = heap.pop(0)",
    "    heap.append(small + 2 * large)",
    "    heap.sort()",
    "    combines += 1",
    "return -1 if not heap else combines"
  ], [
    "heap := sortInts(values)",
    "combines := 0",
    "for len(heap) > 0 && heap[0] < target {",
    "\tif len(heap) < 2 { return -1 }",
    "\tsmall, large := heap[0], heap[1]",
    "\theap = heap[2:]",
    "\theap = append(heap, small+2*large)",
    "\theap = sortInts(heap)",
    "\tcombines++",
    "}",
    "if len(heap) == 0 { return -1 }",
    "return combines"
  ], [
    "var heap = values.sorted",
    "var combines = 0",
    "while (heap.nonEmpty && heap.head < target) {",
    "  if (heap.length < 2) return -1",
    "  val small = heap.head; val large = heap(1)",
    "  heap = (heap.drop(2) :+ (small + 2 * large)).sorted",
    "  combines += 1",
    "}",
    "if (heap.isEmpty) -1 else combines"
  ]),
  "heaps-bonus-01": twoArgNumber("kthLargest", "kth_largest", "KthLargest", "nums", "k", [
    "return [...nums].sort((a, b) => b - a)[k - 1];"
  ], [
    "return sorted(nums, reverse=True)[k - 1]"
  ], [
    "values := sortInts(nums)",
    "reverseInts(values)",
    "return values[k-1]"
  ], [
    "nums.sorted(Ordering.Int.reverse)(k - 1)"
  ]),
  "heaps-bonus-02": unaryNumberArray("heapsort", "heapsort", "Heapsort", "nums", [
    "return [...nums].sort((a, b) => a - b);"
  ], [
    "return sorted(nums)"
  ], [
    "return sortInts(nums)"
  ], [
    "nums.sorted"
  ]),
  "heaps-bonus-03": unaryNumberArrayToNumber("lastStoneWeight", "last_stone_weight", "LastStoneWeight", "stones", [
    "const heap = [...stones].sort((a, b) => a - b);",
    "while (heap.length > 1) {",
    "  const y = heap.pop()!;",
    "  const x = heap.pop()!;",
    "  if (x !== y) heap.push(y - x);",
    "  heap.sort((a, b) => a - b);",
    "}",
    "return heap[0] ?? 0;"
  ], [
    "heap = sorted(stones)",
    "while len(heap) > 1:",
    "    y = heap.pop()",
    "    x = heap.pop()",
    "    if x != y:",
    "        heap.append(y - x)",
    "        heap.sort()",
    "return heap[0] if heap else 0"
  ], [
    "heap := sortInts(stones)",
    "for len(heap) > 1 {",
    "\ty := heap[len(heap)-1]",
    "\tx := heap[len(heap)-2]",
    "\theap = heap[:len(heap)-2]",
    "\tif x != y { heap = append(heap, y-x); heap = sortInts(heap) }",
    "}",
    "if len(heap) == 0 { return 0 }",
    "return heap[0]"
  ], [
    "var heap = stones.sorted",
    "while (heap.length > 1) {",
    "  val y = heap.last; val x = heap(heap.length - 2)",
    "  heap = heap.dropRight(2)",
    "  if (x != y) heap = (heap :+ (y - x)).sorted",
    "}",
    "heap.headOption.getOrElse(0)"
  ]),
  "heaps-bonus-04": unaryNumberArrayToNumber("minConnectCost", "min_connect_cost", "MinConnectCost", "ropes", [
    "const heap = [...ropes].sort((a, b) => a - b);",
    "let cost = 0;",
    "while (heap.length > 1) {",
    "  const merged = heap.shift()! + heap.shift()!;",
    "  cost += merged;",
    "  heap.push(merged);",
    "  heap.sort((a, b) => a - b);",
    "}",
    "return cost;"
  ], [
    "heap = sorted(ropes)",
    "cost = 0",
    "while len(heap) > 1:",
    "    merged = heap.pop(0) + heap.pop(0)",
    "    cost += merged",
    "    heap.append(merged)",
    "    heap.sort()",
    "return cost"
  ], [
    "heap := sortInts(ropes)",
    "cost := 0",
    "for len(heap) > 1 {",
    "\tmerged := heap[0] + heap[1]",
    "\theap = heap[2:]",
    "\tcost += merged",
    "\theap = append(heap, merged)",
    "\theap = sortInts(heap)",
    "}",
    "return cost"
  ], [
    "var heap = ropes.sorted",
    "var cost = 0",
    "while (heap.length > 1) {",
    "  val merged = heap.head + heap(1)",
    "  cost += merged",
    "  heap = (heap.drop(2) :+ merged).sorted",
    "}",
    "cost"
  ]),
  "heaps-bonus-05": twoArgNumberArray("topKFrequent", "top_k_frequent", "TopKFrequent", "nums", "k", [
    "const counts = new Map<number, number>();",
    "for (const num of nums) counts.set(num, (counts.get(num) ?? 0) + 1);",
    "return [...counts.entries()]",
    "  .sort((a, b) => b[1] - a[1] || a[0] - b[0])",
    "  .slice(0, k)",
    "  .map(([num]) => num)",
    "  .sort((a, b) => a - b);"
  ], [
    "counts = {}",
    "for num in nums:",
    "    counts[num] = counts.get(num, 0) + 1",
    "chosen = sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:k]",
    "return sorted(num for num, _ in chosen)"
  ], [
    "counts := map[int]int{}",
    "for _, num := range nums { counts[num]++ }",
    "pairs := countPairs(counts)",
    "for i := 0; i < len(pairs); i++ { for j := i + 1; j < len(pairs); j++ { if pairs[j][1] > pairs[i][1] || (pairs[j][1] == pairs[i][1] && pairs[j][0] < pairs[i][0]) { pairs[i], pairs[j] = pairs[j], pairs[i] } } }",
    "if k > len(pairs) { k = len(pairs) }",
    "result := []int{}",
    "for _, pair := range pairs[:k] { result = append(result, pair[0]) }",
    "return sortInts(result)"
  ], [
    "val counts = nums.groupBy(identity).map { case (num, items) => num -> items.length }",
    "counts.toSeq.sortBy { case (num, count) => (-count, num) }.take(k).map(_._1).sorted"
  ]),
  "heaps-bonus-06": kthSmallestPairSum(),
  "heaps-bonus-07": kWeakestRows(),
  "heaps-bonus-08": unaryMatrixToArray("printOrder", "print_order", "PrintOrder", "jobs", [
    "return [...jobs].sort((a, b) => b[0] - a[0] || a[1] - b[1]).map((job) => job[1]);"
  ], [
    "return [job[1] for job in sorted(jobs, key=lambda job: (-job[0], job[1]))]"
  ], [
    "ordered := append([][]int{}, jobs...)",
    "for i := 0; i < len(ordered); i++ { for j := i + 1; j < len(ordered); j++ { if ordered[j][0] > ordered[i][0] || (ordered[j][0] == ordered[i][0] && ordered[j][1] < ordered[i][1]) { ordered[i], ordered[j] = ordered[j], ordered[i] } } }",
    "result := []int{}",
    "for _, job := range ordered { result = append(result, job[1]) }",
    "return result"
  ], [
    "jobs.sortBy(job => (-job(0), job(1))).map(_(1))"
  ]),
  "heaps-bonus-09": kClosestNumbers(),
  "heaps-bonus-10": maxScoreAfterHalving()
};

function kthSmallestPairSum(): CuratedProblem {
  return {
    signature: {
      name: "kthSmallestPairSum",
      inputs: [
        { name: "a", type: numberArray() },
        { name: "b", type: numberArray() },
        { name: "k", type: numberType() }
      ],
      output: numberType()
    },
    languages: {
      python: py("kth_smallest_pair_sum", "a: list[int], b: list[int], k: int", "int", [
        "sums = sorted(x + y for x in a for y in b)",
        "return sums[k - 1]"
      ]),
      typescript: ts("kthSmallestPairSum", "a: number[], b: number[], k: number", "number", [
        "const sums: number[] = [];",
        "for (const x of a) for (const y of b) sums.push(x + y);",
        "sums.sort((left, right) => left - right);",
        "return sums[k - 1];"
      ]),
      go: go("KthSmallestPairSum", "a []int, b []int, k int", "int", [
        "sums := []int{}",
        "for _, x := range a { for _, y := range b { sums = append(sums, x+y) } }",
        "sums = sortInts(sums)",
        "return sums[k-1]"
      ]),
      scala: scala("kthSmallestPairSum", "a: Seq[Int], b: Seq[Int], k: Int", "Int", [
        "(for (x <- a; y <- b) yield x + y).sorted.apply(k - 1)"
      ])
    }
  };
}

function kWeakestRows(): CuratedProblem {
  return {
    signature: {
      name: "kWeakestRows",
      inputs: [
        { name: "grid", type: arrayOf(numberArray()) },
        { name: "k", type: numberType() }
      ],
      output: numberArray()
    },
    languages: {
      python: py("k_weakest_rows", "grid: list[list[int]], k: int", "list[int]", [
        "ranked = sorted((sum(row), index) for index, row in enumerate(grid))",
        "return [index for _, index in ranked[:k]]"
      ]),
      typescript: ts("kWeakestRows", "grid: number[][], k: number", "number[]", [
        "return grid",
        "  .map((row, index) => [row.reduce((sum, value) => sum + value, 0), index])",
        "  .sort((a, b) => a[0] - b[0] || a[1] - b[1])",
        "  .slice(0, k)",
        "  .map((entry) => entry[1]);"
      ]),
      go: go("KWeakestRows", "grid [][]int, k int", "[]int", [
        "ranked := [][]int{}",
        "for index, row := range grid { total := 0; for _, value := range row { total += value }; ranked = append(ranked, []int{total, index}) }",
        "for i := 0; i < len(ranked); i++ { for j := i + 1; j < len(ranked); j++ { if ranked[j][0] < ranked[i][0] || (ranked[j][0] == ranked[i][0] && ranked[j][1] < ranked[i][1]) { ranked[i], ranked[j] = ranked[j], ranked[i] } } }",
        "if k > len(ranked) { k = len(ranked) }",
        "result := []int{}",
        "for _, entry := range ranked[:k] { result = append(result, entry[1]) }",
        "return result"
      ]),
      scala: scala("kWeakestRows", "grid: Seq[Seq[Int]], k: Int", "Seq[Int]", [
        "grid.zipWithIndex.map { case (row, index) => (row.sum, index) }.sortBy(identity).take(k).map(_._2)"
      ])
    }
  };
}

function kClosestNumbers(): CuratedProblem {
  return {
    signature: {
      name: "kClosestNumbers",
      inputs: [
        { name: "nums", type: numberArray() },
        { name: "target", type: numberType() },
        { name: "k", type: numberType() }
      ],
      output: numberArray()
    },
    languages: {
      python: py("k_closest_numbers", "nums: list[int], target: int, k: int", "list[int]", [
        "chosen = sorted(nums, key=lambda num: (abs(num - target), num))[:k]",
        "return sorted(chosen)"
      ]),
      typescript: ts("kClosestNumbers", "nums: number[], target: number, k: number", "number[]", [
        "return [...nums]",
        "  .sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || a - b)",
        "  .slice(0, k)",
        "  .sort((a, b) => a - b);"
      ]),
      go: go("KClosestNumbers", "nums []int, target int, k int", "[]int", [
        "values := append([]int{}, nums...)",
        "for i := 0; i < len(values); i++ { for j := i + 1; j < len(values); j++ { if abs(values[j]-target) < abs(values[i]-target) || (abs(values[j]-target) == abs(values[i]-target) && values[j] < values[i]) { values[i], values[j] = values[j], values[i] } } }",
        "if k > len(values) { k = len(values) }",
        "return sortInts(values[:k])"
      ], [goAbsHelper()]),
      scala: scala("kClosestNumbers", "nums: Seq[Int], target: Int, k: Int", "Seq[Int]", [
        "nums.sortBy(num => (math.abs(num - target), num)).take(k).sorted"
      ])
    }
  };
}

function maxScoreAfterHalving(): CuratedProblem {
  return {
    signature: {
      name: "maxScoreAfterHalving",
      inputs: [
        { name: "nums", type: numberArray() },
        { name: "k", type: numberType() }
      ],
      output: numberType()
    },
    languages: {
      python: py("max_score_after_halving", "nums: list[int], k: int", "int", [
        "values = nums[:]",
        "for _ in range(k):",
        "    values.sort(reverse=True)",
        "    if not values or values[0] <= 1:",
        "        break",
        "    values[0] = (values[0] + 1) // 2",
        "return sum(values)"
      ]),
      typescript: ts("maxScoreAfterHalving", "nums: number[], k: number", "number", [
        "const values = [...nums];",
        "for (let count = 0; count < k; count += 1) {",
        "  values.sort((a, b) => b - a);",
        "  if (values.length === 0 || values[0] <= 1) break;",
        "  values[0] = Math.ceil(values[0] / 2);",
        "}",
        "return values.reduce((sum, value) => sum + value, 0);"
      ]),
      go: go("MaxScoreAfterHalving", "nums []int, k int", "int", [
        "values := append([]int{}, nums...)",
        "for count := 0; count < k; count++ {",
        "\tvalues = sortInts(values); reverseInts(values)",
        "\tif len(values) == 0 || values[0] <= 1 { break }",
        "\tvalues[0] = (values[0] + 1) / 2",
        "}",
        "total := 0",
        "for _, value := range values { total += value }",
        "return total"
      ]),
      scala: scala("maxScoreAfterHalving", "nums: Seq[Int], k: Int", "Int", [
        "var values = nums",
        "for (_ <- 0 until k) {",
        "  values = values.sorted(Ordering.Int.reverse)",
        "  if (values.isEmpty || values.head <= 1) return values.sum",
        "  values = (math.ceil(values.head / 2.0).toInt +: values.tail)",
        "}",
        "values.sum"
      ])
    }
  };
}

function unaryNumberArray(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: argName, type: numberArray() }], output: numberArray() },
    languages: {
      python: py(pyName, `${argName}: list[int]`, "list[int]", pyBody),
      typescript: ts(tsName, `${argName}: number[]`, "number[]", tsBody),
      go: go(goName, `${argName} []int`, "[]int", goBody),
      scala: scala(tsName, `${argName}: Seq[Int]`, "Seq[Int]", scalaBody)
    }
  };
}

function unaryNumberArrayToNumber(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
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

function unaryNumberArrayToNumberArray(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: argName, type: numberArray() }], output: numberArray() },
    languages: {
      python: py(pyName, `${argName}: list[int]`, "list[float]", pyBody),
      typescript: ts(tsName, `${argName}: number[]`, "number[]", tsBody),
      go: go(goName, `${argName} []int`, "[]float64", goBody),
      scala: scala(tsName, `${argName}: Seq[Int]`, "Seq[Double]", scalaBody)
    }
  };
}

function unaryMatrixToArray(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: argName, type: arrayOf(numberArray()) }], output: numberArray() },
    languages: {
      python: py(pyName, `${argName}: list[list[int]]`, "list[int]", pyBody),
      typescript: ts(tsName, `${argName}: number[][]`, "number[]", tsBody),
      go: go(goName, `${argName} [][]int`, "[]int", goBody),
      scala: scala(tsName, `${argName}: Seq[Seq[Int]]`, "Seq[Int]", scalaBody)
    }
  };
}

function twoArgNumberArray(tsName: string, pyName: string, goName: string, arrayName: string, numberName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: {
      name: tsName,
      inputs: [
        { name: arrayName, type: numberArray() },
        { name: numberName, type: numberType() }
      ],
      output: numberArray()
    },
    languages: {
      python: py(pyName, `${arrayName}: list[int], ${numberName}: int`, "list[int]", pyBody),
      typescript: ts(tsName, `${arrayName}: number[], ${numberName}: number`, "number[]", tsBody),
      go: go(goName, `${arrayName} []int, ${numberName} int`, "[]int", goBody),
      scala: scala(tsName, `${arrayName}: Seq[Int], ${numberName}: Int`, "Seq[Int]", scalaBody)
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

func countPairs(counts map[int]int) [][]int {
\tpairs := [][]int{}
\tfor num, count := range counts {
\t\tpairs = append(pairs, []int{num, count})
\t}
\treturn pairs
}`;
}

function goPointCompareHelper(): string {
  return `func comparePoint(a []int, b []int) int {
\tda := a[0]*a[0] + a[1]*a[1]
\tdb := b[0]*b[0] + b[1]*b[1]
\tif da != db { return da - db }
\tif a[0] != b[0] { return a[0] - b[0] }
\treturn a[1] - b[1]
}`;
}

function goAbsHelper(): string {
  return `func abs(value int) int {
\tif value < 0 { return -value }
\treturn value
}`;
}

function arrayOf(items: ValueType): ValueType {
  return { type: "array", items };
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
