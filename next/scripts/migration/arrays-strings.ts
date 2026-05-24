import type { FunctionSignature } from "../../src/core/types.js";

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

export const arraysStringsCurated: Record<string, CuratedProblem> = {
  "merge-sorted-unique": {
    signature: {
      name: "mergeSortedUnique",
      inputs: [
        { name: "a", type: arrayOfNumbers() },
        { name: "b", type: arrayOfNumbers() }
      ],
      output: arrayOfNumbers()
    },
    languages: {
      python: py("merge_sorted_unique", "a: list[int], b: list[int]", "list[int]", [
        "result = []",
        "i = 0",
        "j = 0",
        "while i < len(a) or j < len(b):",
        "    if j >= len(b) or (i < len(a) and a[i] <= b[j]):",
        "        value = a[i]",
        "        i += 1",
        "    else:",
        "        value = b[j]",
        "        j += 1",
        "    if not result or result[-1] != value:",
        "        result.append(value)",
        "return result"
      ]),
      typescript: ts("mergeSortedUnique", "a: number[], b: number[]", "number[]", [
        "const result: number[] = [];",
        "let i = 0;",
        "let j = 0;",
        "while (i < a.length || j < b.length) {",
        "  let value: number;",
        "  if (j >= b.length || (i < a.length && a[i] <= b[j])) {",
        "    value = a[i];",
        "    i += 1;",
        "  } else {",
        "    value = b[j];",
        "    j += 1;",
        "  }",
        "  if (result.length === 0 || result[result.length - 1] !== value) result.push(value);",
        "}",
        "return result;"
      ]),
      go: go("MergeSortedUnique", "a []int, b []int", "[]int", [
        "result := []int{}",
        "i := 0",
        "j := 0",
        "for i < len(a) || j < len(b) {",
        "\tvalue := 0",
        "\tif j >= len(b) || (i < len(a) && a[i] <= b[j]) {",
        "\t\tvalue = a[i]",
        "\t\ti++",
        "\t} else {",
        "\t\tvalue = b[j]",
        "\t\tj++",
        "\t}",
        "\tif len(result) == 0 || result[len(result)-1] != value {",
        "\t\tresult = append(result, value)",
        "\t}",
        "}",
        "return result"
      ]),
      scala: scala("mergeSortedUnique", "a: Seq[Int], b: Seq[Int]", "Seq[Int]", [
        "val result = scala.collection.mutable.ArrayBuffer.empty[Int]",
        "var i = 0",
        "var j = 0",
        "while (i < a.length || j < b.length) {",
        "  val value = if (j >= b.length || (i < a.length && a(i) <= b(j))) {",
        "    val current = a(i)",
        "    i += 1",
        "    current",
        "  } else {",
        "    val current = b(j)",
        "    j += 1",
        "    current",
        "  }",
        "  if (result.isEmpty || result.last != value) result.append(value)",
        "}",
        "result.toSeq"
      ])
    }
  },
  "minimum-average-gap": {
    signature: {
      name: "minimumAverageGapIndex",
      inputs: [{ name: "nums", type: arrayOfNumbers() }],
      output: { type: "number" }
    },
    languages: {
      python: py("minimum_average_gap_index", "nums: list[int]", "int", [
        "total = sum(nums)",
        "left = 0",
        "best_index = 0",
        "best_gap = None",
        "for index, num in enumerate(nums):",
        "    left += num",
        "    right_count = len(nums) - index - 1",
        "    left_avg = left // (index + 1)",
        "    right_avg = 0 if right_count == 0 else (total - left) // right_count",
        "    gap = abs(left_avg - right_avg)",
        "    if best_gap is None or gap < best_gap:",
        "        best_gap = gap",
        "        best_index = index",
        "return best_index"
      ]),
      typescript: ts("minimumAverageGapIndex", "nums: number[]", "number", [
        "const total = nums.reduce((sum, num) => sum + num, 0);",
        "let left = 0;",
        "let bestIndex = 0;",
        "let bestGap = Number.POSITIVE_INFINITY;",
        "for (let index = 0; index < nums.length; index += 1) {",
        "  left += nums[index];",
        "  const rightCount = nums.length - index - 1;",
        "  const leftAverage = Math.floor(left / (index + 1));",
        "  const rightAverage = rightCount === 0 ? 0 : Math.floor((total - left) / rightCount);",
        "  const gap = Math.abs(leftAverage - rightAverage);",
        "  if (gap < bestGap) {",
        "    bestGap = gap;",
        "    bestIndex = index;",
        "  }",
        "}",
        "return bestIndex;"
      ]),
      go: go("MinimumAverageGapIndex", "nums []int", "int", [
        "total := 0",
        "for _, num := range nums {",
        "\ttotal += num",
        "}",
        "left := 0",
        "bestIndex := 0",
        "bestGap := 0",
        "for index, num := range nums {",
        "\tleft += num",
        "\trightCount := len(nums) - index - 1",
        "\tleftAverage := left / (index + 1)",
        "\trightAverage := 0",
        "\tif rightCount != 0 {",
        "\t\trightAverage = (total - left) / rightCount",
        "\t}",
        "\tgap := leftAverage - rightAverage",
        "\tif gap < 0 {",
        "\t\tgap = -gap",
        "\t}",
        "\tif index == 0 || gap < bestGap {",
        "\t\tbestGap = gap",
        "\t\tbestIndex = index",
        "\t}",
        "}",
        "return bestIndex"
      ]),
      scala: scala("minimumAverageGapIndex", "nums: Seq[Int]", "Int", [
        "val total = nums.sum",
        "var left = 0",
        "var bestIndex = 0",
        "var bestGap = Int.MaxValue",
        "for ((num, index) <- nums.zipWithIndex) {",
        "  left += num",
        "  val rightCount = nums.length - index - 1",
        "  val leftAverage = math.floor(left.toDouble / (index + 1)).toInt",
        "  val rightAverage = if (rightCount == 0) 0 else math.floor((total - left).toDouble / rightCount).toInt",
        "  val gap = math.abs(leftAverage - rightAverage)",
        "  if (gap < bestGap) {",
        "    bestGap = gap",
        "    bestIndex = index",
        "  }",
        "}",
        "bestIndex"
      ])
    }
  },
  "product-except-self-local": {
    signature: {
      name: "productExceptSelfLocal",
      inputs: [{ name: "nums", type: arrayOfNumbers() }],
      output: arrayOfNumbers()
    },
    languages: {
      python: py("product_except_self_local", "nums: list[int]", "list[int]", [
        "result = [1] * len(nums)",
        "prefix = 1",
        "for index, num in enumerate(nums):",
        "    result[index] = prefix",
        "    prefix *= num",
        "suffix = 1",
        "for index in range(len(nums) - 1, -1, -1):",
        "    result[index] *= suffix",
        "    suffix *= nums[index]",
        "return result"
      ]),
      typescript: ts("productExceptSelfLocal", "nums: number[]", "number[]", [
        "const result = new Array<number>(nums.length).fill(1);",
        "let prefix = 1;",
        "for (let index = 0; index < nums.length; index += 1) {",
        "  result[index] = prefix;",
        "  prefix *= nums[index];",
        "}",
        "let suffix = 1;",
        "for (let index = nums.length - 1; index >= 0; index -= 1) {",
        "  result[index] *= suffix;",
        "  suffix *= nums[index];",
        "}",
        "return result;"
      ]),
      go: go("ProductExceptSelfLocal", "nums []int", "[]int", [
        "result := make([]int, len(nums))",
        "for index := range result {",
        "\tresult[index] = 1",
        "}",
        "prefix := 1",
        "for index, num := range nums {",
        "\tresult[index] = prefix",
        "\tprefix *= num",
        "}",
        "suffix := 1",
        "for index := len(nums) - 1; index >= 0; index-- {",
        "\tresult[index] *= suffix",
        "\tsuffix *= nums[index]",
        "}",
        "return result"
      ]),
      scala: scala("productExceptSelfLocal", "nums: Seq[Int]", "Seq[Int]", [
        "val result = Array.fill(nums.length)(1)",
        "var prefix = 1",
        "for (index <- nums.indices) {",
        "  result(index) = prefix",
        "  prefix *= nums(index)",
        "}",
        "var suffix = 1",
        "for (index <- nums.indices.reverse) {",
        "  result(index) *= suffix",
        "  suffix *= nums(index)",
        "}",
        "result.toSeq"
      ])
    }
  },
  "longest-balanced-prefix": {
    signature: {
      name: "longestBalancedPrefix",
      inputs: [{ name: "text", type: { type: "string" } }],
      output: { type: "number" }
    },
    languages: {
      python: py("longest_balanced_prefix", "text: str", "int", [
        "balance = 0",
        "best = 0",
        "for index, char in enumerate(text):",
        "    balance += 1 if char == \"A\" else -1",
        "    if balance == 0:",
        "        best = index + 1",
        "return best"
      ]),
      typescript: ts("longestBalancedPrefix", "text: string", "number", [
        "let balance = 0;",
        "let best = 0;",
        "for (let index = 0; index < text.length; index += 1) {",
        "  balance += text[index] === \"A\" ? 1 : -1;",
        "  if (balance === 0) best = index + 1;",
        "}",
        "return best;"
      ]),
      go: go("LongestBalancedPrefix", "text string", "int", [
        "balance := 0",
        "best := 0",
        "for index, char := range text {",
        "\tif char == 'A' {",
        "\t\tbalance++",
        "\t} else {",
        "\t\tbalance--",
        "\t}",
        "\tif balance == 0 {",
        "\t\tbest = index + 1",
        "\t}",
        "}",
        "return best"
      ]),
      scala: scala("longestBalancedPrefix", "text: String", "Int", [
        "var balance = 0",
        "var best = 0",
        "for (index <- text.indices) {",
        "  balance += (if (text.charAt(index) == 'A') 1 else -1)",
        "  if (balance == 0) best = index + 1",
        "}",
        "best"
      ])
    }
  },
  "arrays-strings-bonus-01": {
    signature: {
      name: "reverseWords",
      inputs: [{ name: "text", type: { type: "string" } }],
      output: { type: "string" }
    },
    languages: {
      python: py("reverse_words", "text: str", "str", ["return \" \".join(reversed(text.split()))"]),
      typescript: ts("reverseWords", "text: string", "string", [
        "return text.trim().split(/\\s+/).filter(Boolean).reverse().join(\" \");"
      ]),
      go: goWithImport("ReverseWords", "text string", "string", "\"strings\"", [
        "words := strings.Fields(text)",
        "for left, right := 0, len(words)-1; left < right; left, right = left+1, right-1 {",
        "\twords[left], words[right] = words[right], words[left]",
        "}",
        "return strings.Join(words, \" \")"
      ]),
      scala: scala("reverseWords", "text: String", "String", [
        "text.trim.split(\"\\\\s+\").filter(_.nonEmpty).reverse.mkString(\" \")"
      ])
    }
  },
  "arrays-strings-bonus-02": {
    signature: {
      name: "runningRangeWidth",
      inputs: [{ name: "nums", type: arrayOfNumbers() }],
      output: arrayOfNumbers()
    },
    languages: {
      python: py("running_range_width", "nums: list[int]", "list[int]", [
        "result = []",
        "low = None",
        "high = None",
        "for num in nums:",
        "    low = num if low is None else min(low, num)",
        "    high = num if high is None else max(high, num)",
        "    result.append(high - low)",
        "return result"
      ]),
      typescript: ts("runningRangeWidth", "nums: number[]", "number[]", [
        "const result: number[] = [];",
        "let low: number | null = null;",
        "let high: number | null = null;",
        "for (const num of nums) {",
        "  low = low === null ? num : Math.min(low, num);",
        "  high = high === null ? num : Math.max(high, num);",
        "  result.push(high - low);",
        "}",
        "return result;"
      ]),
      go: go("RunningRangeWidth", "nums []int", "[]int", [
        "result := []int{}",
        "low := 0",
        "high := 0",
        "for index, num := range nums {",
        "\tif index == 0 || num < low {",
        "\t\tlow = num",
        "\t}",
        "\tif index == 0 || num > high {",
        "\t\thigh = num",
        "\t}",
        "\tresult = append(result, high-low)",
        "}",
        "return result"
      ]),
      scala: scala("runningRangeWidth", "nums: Seq[Int]", "Seq[Int]", [
        "val result = scala.collection.mutable.ArrayBuffer.empty[Int]",
        "var low: Option[Int] = None",
        "var high: Option[Int] = None",
        "for (num <- nums) {",
        "  low = Some(low.fold(num)(current => math.min(current, num)))",
        "  high = Some(high.fold(num)(current => math.max(current, num)))",
        "  result.append(high.get - low.get)",
        "}",
        "result.toSeq"
      ])
    }
  },
  "arrays-strings-bonus-03": {
    signature: {
      name: "moveZeros",
      inputs: [{ name: "nums", type: arrayOfNumbers() }],
      output: arrayOfNumbers()
    },
    languages: {
      python: py("move_zeros", "nums: list[int]", "list[int]", [
        "non_zero = [num for num in nums if num != 0]",
        "return non_zero + [0] * (len(nums) - len(non_zero))"
      ]),
      typescript: ts("moveZeros", "nums: number[]", "number[]", [
        "const nonZero = nums.filter((num) => num !== 0);",
        "return nonZero.concat(new Array(nums.length - nonZero.length).fill(0));"
      ]),
      go: go("MoveZeros", "nums []int", "[]int", [
        "result := []int{}",
        "zeros := 0",
        "for _, num := range nums {",
        "\tif num == 0 {",
        "\t\tzeros++",
        "\t} else {",
        "\t\tresult = append(result, num)",
        "\t}",
        "}",
        "for zeros > 0 {",
        "\tresult = append(result, 0)",
        "\tzeros--",
        "}",
        "return result"
      ]),
      scala: scala("moveZeros", "nums: Seq[Int]", "Seq[Int]", [
        "val nonZero = nums.filter(_ != 0)",
        "nonZero ++ Seq.fill(nums.length - nonZero.length)(0)"
      ])
    }
  },
  "arrays-strings-bonus-04": {
    signature: {
      name: "countEquilibriumIndices",
      inputs: [{ name: "nums", type: arrayOfNumbers() }],
      output: { type: "number" }
    },
    languages: {
      python: py("count_equilibrium_indices", "nums: list[int]", "int", [
        "total = sum(nums)",
        "left = 0",
        "count = 0",
        "for num in nums:",
        "    if left == total - left - num:",
        "        count += 1",
        "    left += num",
        "return count"
      ]),
      typescript: ts("countEquilibriumIndices", "nums: number[]", "number", [
        "const total = nums.reduce((sum, num) => sum + num, 0);",
        "let left = 0;",
        "let count = 0;",
        "for (const num of nums) {",
        "  if (left === total - left - num) count += 1;",
        "  left += num;",
        "}",
        "return count;"
      ]),
      go: go("CountEquilibriumIndices", "nums []int", "int", [
        "total := 0",
        "for _, num := range nums {",
        "\ttotal += num",
        "}",
        "left := 0",
        "count := 0",
        "for _, num := range nums {",
        "\tif left == total-left-num {",
        "\t\tcount++",
        "\t}",
        "\tleft += num",
        "}",
        "return count"
      ]),
      scala: scala("countEquilibriumIndices", "nums: Seq[Int]", "Int", [
        "val total = nums.sum",
        "var left = 0",
        "var count = 0",
        "for (num <- nums) {",
        "  if (left == total - left - num) count += 1",
        "  left += num",
        "}",
        "count"
      ])
    }
  },
  "arrays-strings-bonus-05": {
    signature: {
      name: "mostFrequentCharacter",
      inputs: [{ name: "text", type: { type: "string" } }],
      output: { type: "string", nullable: true }
    },
    languages: {
      python: py("most_frequent_character", "text: str", "str | None", [
        "if not text:",
        "    return None",
        "counts = {}",
        "for char in text:",
        "    counts[char] = counts.get(char, 0) + 1",
        "best = text[0]",
        "for char in text:",
        "    if counts[char] > counts[best]:",
        "        best = char",
        "return best"
      ]),
      typescript: ts("mostFrequentCharacter", "text: string", "string | null", [
        "if (text.length === 0) return null;",
        "const counts = new Map<string, number>();",
        "for (const char of text) {",
        "  counts.set(char, (counts.get(char) ?? 0) + 1);",
        "}",
        "let best = text[0];",
        "for (const char of text) {",
        "  if ((counts.get(char) ?? 0) > (counts.get(best) ?? 0)) best = char;",
        "}",
        "return best;"
      ]),
      go: go("MostFrequentCharacter", "text string", "*string", [
        "if len(text) == 0 {",
        "\treturn nil",
        "}",
        "counts := map[rune]int{}",
        "chars := []rune(text)",
        "for _, char := range chars {",
        "\tcounts[char]++",
        "}",
        "best := chars[0]",
        "for _, char := range chars {",
        "\tif counts[char] > counts[best] {",
        "\t\tbest = char",
        "\t}",
        "}",
        "result := string(best)",
        "return &result"
      ]),
      scala: scala("mostFrequentCharacter", "text: String", "Option[String]", [
        "if (text.isEmpty) return None",
        "val counts = scala.collection.mutable.Map.empty[Char, Int].withDefaultValue(0)",
        "for (char <- text) counts(char) = counts(char) + 1",
        "var best = text.charAt(0)",
        "for (char <- text) {",
        "  if (counts(char) > counts(best)) best = char",
        "}",
        "Some(best.toString)"
      ])
    }
  },
  "arrays-strings-bonus-06": {
    signature: {
      name: "plusOne",
      inputs: [{ name: "digits", type: arrayOfNumbers() }],
      output: arrayOfNumbers()
    },
    languages: {
      python: py("plus_one", "digits: list[int]", "list[int]", [
        "result = digits[:]",
        "carry = 1",
        "for index in range(len(result) - 1, -1, -1):",
        "    value = result[index] + carry",
        "    result[index] = value % 10",
        "    carry = value // 10",
        "    if carry == 0:",
        "        break",
        "if carry:",
        "    result.insert(0, carry)",
        "return result"
      ]),
      typescript: ts("plusOne", "digits: number[]", "number[]", [
        "const result = digits.slice();",
        "let carry = 1;",
        "for (let index = result.length - 1; index >= 0; index -= 1) {",
        "  const value = result[index] + carry;",
        "  result[index] = value % 10;",
        "  carry = Math.floor(value / 10);",
        "  if (carry === 0) break;",
        "}",
        "if (carry > 0) result.unshift(carry);",
        "return result;"
      ]),
      go: go("PlusOne", "digits []int", "[]int", [
        "result := append([]int{}, digits...)",
        "carry := 1",
        "for index := len(result) - 1; index >= 0; index-- {",
        "\tvalue := result[index] + carry",
        "\tresult[index] = value % 10",
        "\tcarry = value / 10",
        "\tif carry == 0 {",
        "\t\tbreak",
        "\t}",
        "}",
        "if carry > 0 {",
        "\tresult = append([]int{carry}, result...)",
        "}",
        "return result"
      ]),
      scala: scala("plusOne", "digits: Seq[Int]", "Seq[Int]", [
        "val result = digits.toBuffer",
        "var carry = 1",
        "var index = result.length - 1",
        "while (index >= 0 && carry > 0) {",
        "  val value = result(index) + carry",
        "  result(index) = value % 10",
        "  carry = value / 10",
        "  index -= 1",
        "}",
        "if (carry > 0) carry +: result.toSeq else result.toSeq"
      ])
    }
  },
  "arrays-strings-bonus-07": {
    signature: {
      name: "firstUniqueIndex",
      inputs: [{ name: "text", type: { type: "string" } }],
      output: { type: "number" }
    },
    languages: {
      python: py("first_unique_index", "text: str", "int", [
        "counts = {}",
        "for char in text:",
        "    counts[char] = counts.get(char, 0) + 1",
        "for index, char in enumerate(text):",
        "    if counts[char] == 1:",
        "        return index",
        "return -1"
      ]),
      typescript: ts("firstUniqueIndex", "text: string", "number", [
        "const counts = new Map<string, number>();",
        "for (const char of text) counts.set(char, (counts.get(char) ?? 0) + 1);",
        "for (let index = 0; index < text.length; index += 1) {",
        "  if (counts.get(text[index]) === 1) return index;",
        "}",
        "return -1;"
      ]),
      go: go("FirstUniqueIndex", "text string", "int", [
        "counts := map[rune]int{}",
        "chars := []rune(text)",
        "for _, char := range chars {",
        "\tcounts[char]++",
        "}",
        "for index, char := range chars {",
        "\tif counts[char] == 1 {",
        "\t\treturn index",
        "\t}",
        "}",
        "return -1"
      ]),
      scala: scala("firstUniqueIndex", "text: String", "Int", [
        "val counts = scala.collection.mutable.Map.empty[Char, Int].withDefaultValue(0)",
        "for (char <- text) counts(char) = counts(char) + 1",
        "for (index <- text.indices) {",
        "  if (counts(text.charAt(index)) == 1) return index",
        "}",
        "-1"
      ])
    }
  },
  "arrays-strings-bonus-08": {
    signature: {
      name: "rangeSumQueries",
      inputs: [
        { name: "nums", type: arrayOfNumbers() },
        { name: "queries", type: arrayOf(arrayOfNumbers()) }
      ],
      output: arrayOfNumbers()
    },
    languages: {
      python: py("range_sum_queries", "nums: list[int], queries: list[list[int]]", "list[int]", [
        "prefix = [0]",
        "for num in nums:",
        "    prefix.append(prefix[-1] + num)",
        "result = []",
        "for lo, hi in queries:",
        "    result.append(prefix[hi + 1] - prefix[lo])",
        "return result"
      ]),
      typescript: ts("rangeSumQueries", "nums: number[], queries: number[][]", "number[]", [
        "const prefix = [0];",
        "for (const num of nums) prefix.push(prefix[prefix.length - 1] + num);",
        "return queries.map(([lo, hi]) => prefix[hi + 1] - prefix[lo]);"
      ]),
      go: go("RangeSumQueries", "nums []int, queries [][]int", "[]int", [
        "prefix := []int{0}",
        "for _, num := range nums {",
        "\tprefix = append(prefix, prefix[len(prefix)-1]+num)",
        "}",
        "result := []int{}",
        "for _, query := range queries {",
        "\tlo := query[0]",
        "\thi := query[1]",
        "\tresult = append(result, prefix[hi+1]-prefix[lo])",
        "}",
        "return result"
      ]),
      scala: scala("rangeSumQueries", "nums: Seq[Int], queries: Seq[Seq[Int]]", "Seq[Int]", [
        "val prefix = scala.collection.mutable.ArrayBuffer(0)",
        "for (num <- nums) prefix.append(prefix.last + num)",
        "queries.map { query =>",
        "  val lo = query(0)",
        "  val hi = query(1)",
        "  prefix(hi + 1) - prefix(lo)",
        "}"
      ])
    }
  },
  "arrays-strings-bonus-09": {
    signature: {
      name: "dedupeSorted",
      inputs: [{ name: "nums", type: arrayOfNumbers() }],
      output: arrayOfNumbers()
    },
    languages: {
      python: py("dedupe_sorted", "nums: list[int]", "list[int]", [
        "result = []",
        "for num in nums:",
        "    if not result or result[-1] != num:",
        "        result.append(num)",
        "return result"
      ]),
      typescript: ts("dedupeSorted", "nums: number[]", "number[]", [
        "const result: number[] = [];",
        "for (const num of nums) {",
        "  if (result.length === 0 || result[result.length - 1] !== num) result.push(num);",
        "}",
        "return result;"
      ]),
      go: go("DedupeSorted", "nums []int", "[]int", [
        "result := []int{}",
        "for _, num := range nums {",
        "\tif len(result) == 0 || result[len(result)-1] != num {",
        "\t\tresult = append(result, num)",
        "\t}",
        "}",
        "return result"
      ]),
      scala: scala("dedupeSorted", "nums: Seq[Int]", "Seq[Int]", [
        "val result = scala.collection.mutable.ArrayBuffer.empty[Int]",
        "for (num <- nums) {",
        "  if (result.isEmpty || result.last != num) result.append(num)",
        "}",
        "result.toSeq"
      ])
    }
  },
  "arrays-strings-bonus-10": {
    signature: {
      name: "diagonalSum",
      inputs: [{ name: "matrix", type: arrayOf(arrayOfNumbers()) }],
      output: { type: "number" }
    },
    languages: {
      python: py("diagonal_sum", "matrix: list[list[int]]", "int", [
        "total = 0",
        "n = len(matrix)",
        "for index in range(n):",
        "    total += matrix[index][index]",
        "    other = n - 1 - index",
        "    if other != index:",
        "        total += matrix[index][other]",
        "return total"
      ]),
      typescript: ts("diagonalSum", "matrix: number[][]", "number", [
        "let total = 0;",
        "const n = matrix.length;",
        "for (let index = 0; index < n; index += 1) {",
        "  total += matrix[index][index];",
        "  const other = n - 1 - index;",
        "  if (other !== index) total += matrix[index][other];",
        "}",
        "return total;"
      ]),
      go: go("DiagonalSum", "matrix [][]int", "int", [
        "total := 0",
        "n := len(matrix)",
        "for index := 0; index < n; index++ {",
        "\ttotal += matrix[index][index]",
        "\tother := n - 1 - index",
        "\tif other != index {",
        "\t\ttotal += matrix[index][other]",
        "\t}",
        "}",
        "return total"
      ]),
      scala: scala("diagonalSum", "matrix: Seq[Seq[Int]]", "Int", [
        "var total = 0",
        "val n = matrix.length",
        "for (index <- 0 until n) {",
        "  total += matrix(index)(index)",
        "  val other = n - 1 - index",
        "  if (other != index) total += matrix(index)(other)",
        "}",
        "total"
      ])
    }
  },
  "arrays-strings-bonus-11": {
    signature: {
      name: "longestMountain",
      inputs: [{ name: "nums", type: arrayOfNumbers() }],
      output: { type: "number" }
    },
    languages: {
      python: py("longest_mountain", "nums: list[int]", "int", [
        "best = 0",
        "index = 1",
        "while index < len(nums) - 1:",
        "    is_peak = nums[index - 1] < nums[index] > nums[index + 1]",
        "    if not is_peak:",
        "        index += 1",
        "        continue",
        "    left = index - 1",
        "    while left > 0 and nums[left - 1] < nums[left]:",
        "        left -= 1",
        "    right = index + 1",
        "    while right < len(nums) - 1 and nums[right] > nums[right + 1]:",
        "        right += 1",
        "    best = max(best, right - left + 1)",
        "    index = right + 1",
        "return best"
      ]),
      typescript: ts("longestMountain", "nums: number[]", "number", [
        "let best = 0;",
        "let index = 1;",
        "while (index < nums.length - 1) {",
        "  const isPeak = nums[index - 1] < nums[index] && nums[index] > nums[index + 1];",
        "  if (!isPeak) {",
        "    index += 1;",
        "    continue;",
        "  }",
        "  let left = index - 1;",
        "  while (left > 0 && nums[left - 1] < nums[left]) left -= 1;",
        "  let right = index + 1;",
        "  while (right < nums.length - 1 && nums[right] > nums[right + 1]) right += 1;",
        "  best = Math.max(best, right - left + 1);",
        "  index = right + 1;",
        "}",
        "return best;"
      ]),
      go: go("LongestMountain", "nums []int", "int", [
        "best := 0",
        "index := 1",
        "for index < len(nums)-1 {",
        "\tisPeak := nums[index-1] < nums[index] && nums[index] > nums[index+1]",
        "\tif !isPeak {",
        "\t\tindex++",
        "\t\tcontinue",
        "\t}",
        "\tleft := index - 1",
        "\tfor left > 0 && nums[left-1] < nums[left] {",
        "\t\tleft--",
        "\t}",
        "\tright := index + 1",
        "\tfor right < len(nums)-1 && nums[right] > nums[right+1] {",
        "\t\tright++",
        "\t}",
        "\tlength := right - left + 1",
        "\tif length > best {",
        "\t\tbest = length",
        "\t}",
        "\tindex = right + 1",
        "}",
        "return best"
      ]),
      scala: scala("longestMountain", "nums: Seq[Int]", "Int", [
        "var best = 0",
        "var index = 1",
        "while (index < nums.length - 1) {",
        "  val isPeak = nums(index - 1) < nums(index) && nums(index) > nums(index + 1)",
        "  if (!isPeak) {",
        "    index += 1",
        "  } else {",
        "    var left = index - 1",
        "    while (left > 0 && nums(left - 1) < nums(left)) left -= 1",
        "    var right = index + 1",
        "    while (right < nums.length - 1 && nums(right) > nums(right + 1)) right += 1",
        "    best = math.max(best, right - left + 1)",
        "    index = right + 1",
        "  }",
        "}",
        "best"
      ])
    }
  },
  "arrays-strings-bonus-12": {
    signature: {
      name: "maxSubarraySum",
      inputs: [{ name: "nums", type: arrayOfNumbers() }],
      output: { type: "number" }
    },
    languages: {
      python: py("max_subarray_sum", "nums: list[int]", "int", [
        "best = nums[0]",
        "current = nums[0]",
        "for num in nums[1:]:",
        "    current = max(num, current + num)",
        "    best = max(best, current)",
        "return best"
      ]),
      typescript: ts("maxSubarraySum", "nums: number[]", "number", [
        "let best = nums[0];",
        "let current = nums[0];",
        "for (let index = 1; index < nums.length; index += 1) {",
        "  current = Math.max(nums[index], current + nums[index]);",
        "  best = Math.max(best, current);",
        "}",
        "return best;"
      ]),
      go: go("MaxSubarraySum", "nums []int", "int", [
        "best := nums[0]",
        "current := nums[0]",
        "for index := 1; index < len(nums); index++ {",
        "\tnum := nums[index]",
        "\tif current+num < num {",
        "\t\tcurrent = num",
        "\t} else {",
        "\t\tcurrent += num",
        "\t}",
        "\tif current > best {",
        "\t\tbest = current",
        "\t}",
        "}",
        "return best"
      ]),
      scala: scala("maxSubarraySum", "nums: Seq[Int]", "Int", [
        "var best = nums.head",
        "var current = nums.head",
        "for (index <- 1 until nums.length) {",
        "  current = math.max(nums(index), current + nums(index))",
        "  best = math.max(best, current)",
        "}",
        "best"
      ])
    }
  }
};

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
    reference: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n${indent(body, "\t")}\n}\n`
  };
}

function goWithImport(name: string, args: string, returnType: string, importPath: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "go",
    starter: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`,
    reference: `package solution\n\nimport ${importPath}\n\nfunc ${name}(${args}) ${returnType} {\n${indent(body, "\t")}\n}\n`
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

function arrayOfNumbers() {
  return { type: "array" as const, items: { type: "number" as const } };
}

function arrayOf(items: ReturnType<typeof arrayOfNumbers>) {
  return { type: "array" as const, items };
}

function indent(lines: string[], prefix: string): string {
  return lines.map((line) => `${prefix}${line}`).join("\n");
}
