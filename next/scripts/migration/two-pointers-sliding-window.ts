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

export const twoPointersSlidingWindowCurated: Record<string, CuratedProblem> = {
  "closest-pair-sum": {
    signature: {
      name: "closestPairSum",
      inputs: [
        { name: "nums", type: arrayOfNumbers() },
        { name: "target", type: { type: "number" } }
      ],
      output: { type: "number" }
    },
    languages: {
      python: py("closest_pair_sum", "nums: list[int], target: int", "int", [
        "left = 0",
        "right = len(nums) - 1",
        "best = nums[0] + nums[1]",
        "while left < right:",
        "    total = nums[left] + nums[right]",
        "    if abs(total - target) < abs(best - target) or (abs(total - target) == abs(best - target) and total < best):",
        "        best = total",
        "    if total < target:",
        "        left += 1",
        "    elif total > target:",
        "        right -= 1",
        "    else:",
        "        return total",
        "return best"
      ]),
      typescript: ts("closestPairSum", "nums: number[], target: number", "number", [
        "let left = 0;",
        "let right = nums.length - 1;",
        "let best = nums[0] + nums[1];",
        "while (left < right) {",
        "  const total = nums[left] + nums[right];",
        "  const better = Math.abs(total - target) < Math.abs(best - target);",
        "  const tiedSmaller = Math.abs(total - target) === Math.abs(best - target) && total < best;",
        "  if (better || tiedSmaller) best = total;",
        "  if (total < target) left += 1;",
        "  else if (total > target) right -= 1;",
        "  else return total;",
        "}",
        "return best;"
      ]),
      go: go("ClosestPairSum", "nums []int, target int", "int", [
        "left := 0",
        "right := len(nums) - 1",
        "best := nums[0] + nums[1]",
        "for left < right {",
        "\ttotal := nums[left] + nums[right]",
        "\tif abs(total-target) < abs(best-target) || (abs(total-target) == abs(best-target) && total < best) {",
        "\t\tbest = total",
        "\t}",
        "\tif total < target {",
        "\t\tleft++",
        "\t} else if total > target {",
        "\t\tright--",
        "\t} else {",
        "\t\treturn total",
        "\t}",
        "}",
        "return best"
      ], ["func abs(value int) int {\n\tif value < 0 {\n\t\treturn -value\n\t}\n\treturn value\n}"]),
      scala: scala("closestPairSum", "nums: Seq[Int], target: Int", "Int", [
        "var left = 0",
        "var right = nums.length - 1",
        "var best = nums(0) + nums(1)",
        "while (left < right) {",
        "  val total = nums(left) + nums(right)",
        "  val better = math.abs(total - target) < math.abs(best - target)",
        "  val tiedSmaller = math.abs(total - target) == math.abs(best - target) && total < best",
        "  if (better || tiedSmaller) best = total",
        "  if (total < target) left += 1",
        "  else if (total > target) right -= 1",
        "  else return total",
        "}",
        "best"
      ])
    }
  },
  "trim-adjacent-pairs": {
    signature: {
      name: "trimAdjacentPairs",
      inputs: [{ name: "text", type: { type: "string" } }],
      output: { type: "string" }
    },
    languages: {
      python: py("trim_adjacent_pairs", "text: str", "str", [
        "stack = []",
        "for char in text:",
        "    if stack and stack[-1] == char:",
        "        stack.pop()",
        "    else:",
        "        stack.append(char)",
        "return \"\".join(stack)"
      ]),
      typescript: ts("trimAdjacentPairs", "text: string", "string", [
        "const stack: string[] = [];",
        "for (const char of text) {",
        "  if (stack.length > 0 && stack[stack.length - 1] === char) stack.pop();",
        "  else stack.push(char);",
        "}",
        "return stack.join(\"\");"
      ]),
      go: go("TrimAdjacentPairs", "text string", "string", [
        "stack := []rune{}",
        "for _, char := range text {",
        "\tif len(stack) > 0 && stack[len(stack)-1] == char {",
        "\t\tstack = stack[:len(stack)-1]",
        "\t} else {",
        "\t\tstack = append(stack, char)",
        "\t}",
        "}",
        "return string(stack)"
      ]),
      scala: scala("trimAdjacentPairs", "text: String", "String", [
        "val stack = scala.collection.mutable.ArrayBuffer.empty[Char]",
        "for (char <- text) {",
        "  if (stack.nonEmpty && stack.last == char) stack.remove(stack.length - 1)",
        "  else stack.append(char)",
        "}",
        "stack.mkString"
      ])
    }
  },
  "max-sum-under-limit": {
    signature: {
      name: "maxSumUnderLimit",
      inputs: [
        { name: "nums", type: arrayOfNumbers() },
        { name: "limit", type: { type: "number" } }
      ],
      output: { type: "number" }
    },
    languages: {
      python: py("max_sum_under_limit", "nums: list[int], limit: int", "int", [
        "left = 0",
        "total = 0",
        "best = 0",
        "for right, num in enumerate(nums):",
        "    total += num",
        "    while left <= right and total > limit:",
        "        total -= nums[left]",
        "        left += 1",
        "    best = max(best, total)",
        "return best"
      ]),
      typescript: ts("maxSumUnderLimit", "nums: number[], limit: number", "number", [
        "let left = 0;",
        "let total = 0;",
        "let best = 0;",
        "for (let right = 0; right < nums.length; right += 1) {",
        "  total += nums[right];",
        "  while (left <= right && total > limit) {",
        "    total -= nums[left];",
        "    left += 1;",
        "  }",
        "  best = Math.max(best, total);",
        "}",
        "return best;"
      ]),
      go: go("MaxSumUnderLimit", "nums []int, limit int", "int", [
        "left := 0",
        "total := 0",
        "best := 0",
        "for right, num := range nums {",
        "\ttotal += num",
        "\tfor left <= right && total > limit {",
        "\t\ttotal -= nums[left]",
        "\t\tleft++",
        "\t}",
        "\tif total > best {",
        "\t\tbest = total",
        "\t}",
        "}",
        "return best"
      ]),
      scala: scala("maxSumUnderLimit", "nums: Seq[Int], limit: Int", "Int", [
        "var left = 0",
        "var total = 0",
        "var best = 0",
        "for (right <- nums.indices) {",
        "  total += nums(right)",
        "  while (left <= right && total > limit) {",
        "    total -= nums(left)",
        "    left += 1",
        "  }",
        "  best = math.max(best, total)",
        "}",
        "best"
      ])
    }
  },
  "longest-with-flips": {
    signature: {
      name: "longestWithFlips",
      inputs: [
        { name: "bits", type: arrayOfNumbers() },
        { name: "k", type: { type: "number" } }
      ],
      output: { type: "number" }
    },
    languages: {
      python: py("longest_with_flips", "bits: list[int], k: int", "int", [
        "left = 0",
        "zeroes = 0",
        "best = 0",
        "for right, bit in enumerate(bits):",
        "    if bit == 0:",
        "        zeroes += 1",
        "    while zeroes > k:",
        "        if bits[left] == 0:",
        "            zeroes -= 1",
        "        left += 1",
        "    best = max(best, right - left + 1)",
        "return best"
      ]),
      typescript: ts("longestWithFlips", "bits: number[], k: number", "number", [
        "let left = 0;",
        "let zeroes = 0;",
        "let best = 0;",
        "for (let right = 0; right < bits.length; right += 1) {",
        "  if (bits[right] === 0) zeroes += 1;",
        "  while (zeroes > k) {",
        "    if (bits[left] === 0) zeroes -= 1;",
        "    left += 1;",
        "  }",
        "  best = Math.max(best, right - left + 1);",
        "}",
        "return best;"
      ]),
      go: go("LongestWithFlips", "bits []int, k int", "int", [
        "left := 0",
        "zeroes := 0",
        "best := 0",
        "for right, bit := range bits {",
        "\tif bit == 0 {",
        "\t\tzeroes++",
        "\t}",
        "\tfor zeroes > k {",
        "\t\tif bits[left] == 0 {",
        "\t\t\tzeroes--",
        "\t\t}",
        "\t\tleft++",
        "\t}",
        "\tlength := right - left + 1",
        "\tif length > best {",
        "\t\tbest = length",
        "\t}",
        "}",
        "return best"
      ]),
      scala: scala("longestWithFlips", "bits: Seq[Int], k: Int", "Int", [
        "var left = 0",
        "var zeroes = 0",
        "var best = 0",
        "for (right <- bits.indices) {",
        "  if (bits(right) == 0) zeroes += 1",
        "  while (zeroes > k) {",
        "    if (bits(left) == 0) zeroes -= 1",
        "    left += 1",
        "  }",
        "  best = math.max(best, right - left + 1)",
        "}",
        "best"
      ])
    }
  },
  "palindrome-edge-score": stringNumber("palindromeEdgeScore", "text", [
    "let left = 0;",
    "let right = text.length - 1;",
    "let score = 0;",
    "while (left < right && text[left] === text[right]) {",
    "  score += 1;",
    "  left += 1;",
    "  right -= 1;",
    "}",
    "return score;"
  ], [
    "left = 0",
    "right = len(text) - 1",
    "score = 0",
    "while left < right and text[left] == text[right]:",
    "    score += 1",
    "    left += 1",
    "    right -= 1",
    "return score"
  ], [
    "left := 0",
    "right := len(text) - 1",
    "score := 0",
    "for left < right && text[left] == text[right] {",
    "\tscore++",
    "\tleft++",
    "\tright--",
    "}",
    "return score"
  ], [
    "var left = 0",
    "var right = text.length - 1",
    "var score = 0",
    "while (left < right && text.charAt(left) == text.charAt(right)) {",
    "  score += 1",
    "  left += 1",
    "  right -= 1",
    "}",
    "score"
  ], "PalindromeEdgeScore"),
  "sorted-squares-local": arrayNumberArray("sortedSquaresLocal", "nums", [
    "const result = new Array<number>(nums.length);",
    "let left = 0;",
    "let right = nums.length - 1;",
    "for (let write = nums.length - 1; write >= 0; write -= 1) {",
    "  const leftSquare = nums[left] * nums[left];",
    "  const rightSquare = nums[right] * nums[right];",
    "  if (leftSquare > rightSquare) {",
    "    result[write] = leftSquare;",
    "    left += 1;",
    "  } else {",
    "    result[write] = rightSquare;",
    "    right -= 1;",
    "  }",
    "}",
    "return result;"
  ], [
    "result = [0] * len(nums)",
    "left = 0",
    "right = len(nums) - 1",
    "for write in range(len(nums) - 1, -1, -1):",
    "    left_square = nums[left] * nums[left]",
    "    right_square = nums[right] * nums[right]",
    "    if left_square > right_square:",
    "        result[write] = left_square",
    "        left += 1",
    "    else:",
    "        result[write] = right_square",
    "        right -= 1",
    "return result"
  ], [
    "result := make([]int, len(nums))",
    "left := 0",
    "right := len(nums) - 1",
    "for write := len(nums) - 1; write >= 0; write-- {",
    "\tleftSquare := nums[left] * nums[left]",
    "\trightSquare := nums[right] * nums[right]",
    "\tif leftSquare > rightSquare {",
    "\t\tresult[write] = leftSquare",
    "\t\tleft++",
    "\t} else {",
    "\t\tresult[write] = rightSquare",
    "\t\tright--",
    "\t}",
    "}",
    "return result"
  ], [
    "val result = Array.fill(nums.length)(0)",
    "var left = 0",
    "var right = nums.length - 1",
    "for (write <- nums.indices.reverse) {",
    "  val leftSquare = nums(left) * nums(left)",
    "  val rightSquare = nums(right) * nums(right)",
    "  if (leftSquare > rightSquare) {",
    "    result(write) = leftSquare",
    "    left += 1",
    "  } else {",
    "    result(write) = rightSquare",
    "    right -= 1",
    "  }",
    "}",
    "result.toSeq"
  ], "SortedSquaresLocal"),
  "two-pointers-sliding-window-bonus-01": simpleArrayNumber("maxWaterArea", "heights", [
    "let left = 0;",
    "let right = heights.length - 1;",
    "let best = 0;",
    "while (left < right) {",
    "  best = Math.max(best, Math.min(heights[left], heights[right]) * (right - left));",
    "  if (heights[left] < heights[right]) left += 1;",
    "  else right -= 1;",
    "}",
    "return best;"
  ], [
    "left = 0",
    "right = len(heights) - 1",
    "best = 0",
    "while left < right:",
    "    best = max(best, min(heights[left], heights[right]) * (right - left))",
    "    if heights[left] < heights[right]:",
    "        left += 1",
    "    else:",
    "        right -= 1",
    "return best"
  ], [
    "left := 0",
    "right := len(heights) - 1",
    "best := 0",
    "for left < right {",
    "\tarea := min(heights[left], heights[right]) * (right - left)",
    "\tif area > best {",
    "\t\tbest = area",
    "\t}",
    "\tif heights[left] < heights[right] {",
    "\t\tleft++",
    "\t} else {",
    "\t\tright--",
    "\t}",
    "}",
    "return best"
  ], [
    "var left = 0",
    "var right = heights.length - 1",
    "var best = 0",
    "while (left < right) {",
    "  best = math.max(best, math.min(heights(left), heights(right)) * (right - left))",
    "  if (heights(left) < heights(right)) left += 1 else right -= 1",
    "}",
    "best"
  ], "MaxWaterArea"),
  "two-pointers-sliding-window-bonus-02": {
    signature: {
      name: "twoSumSorted",
      inputs: [
        { name: "nums", type: arrayOfNumbers() },
        { name: "target", type: { type: "number" } }
      ],
      output: arrayOfNumbers()
    },
    languages: {
      python: py("two_sum_sorted", "nums: list[int], target: int", "list[int]", [
        "left = 0",
        "right = len(nums) - 1",
        "while left < right:",
        "    total = nums[left] + nums[right]",
        "    if total == target:",
        "        return [left, right]",
        "    if total < target:",
        "        left += 1",
        "    else:",
        "        right -= 1",
        "return [-1, -1]"
      ]),
      typescript: ts("twoSumSorted", "nums: number[], target: number", "number[]", [
        "let left = 0;",
        "let right = nums.length - 1;",
        "while (left < right) {",
        "  const total = nums[left] + nums[right];",
        "  if (total === target) return [left, right];",
        "  if (total < target) left += 1;",
        "  else right -= 1;",
        "}",
        "return [-1, -1];"
      ]),
      go: go("TwoSumSorted", "nums []int, target int", "[]int", [
        "left := 0",
        "right := len(nums) - 1",
        "for left < right {",
        "\ttotal := nums[left] + nums[right]",
        "\tif total == target {",
        "\t\treturn []int{left, right}",
        "\t}",
        "\tif total < target {",
        "\t\tleft++",
        "\t} else {",
        "\t\tright--",
        "\t}",
        "}",
        "return []int{-1, -1}"
      ]),
      scala: scala("twoSumSorted", "nums: Seq[Int], target: Int", "Seq[Int]", [
        "var left = 0",
        "var right = nums.length - 1",
        "while (left < right) {",
        "  val total = nums(left) + nums(right)",
        "  if (total == target) return Seq(left, right)",
        "  if (total < target) left += 1 else right -= 1",
        "}",
        "Seq(-1, -1)"
      ])
    }
  },
  "two-pointers-sliding-window-bonus-03": countExcept("removeElement", "nums", "value", "RemoveElement"),
  "two-pointers-sliding-window-bonus-04": {
    signature: {
      name: "isLoosePalindrome",
      inputs: [{ name: "text", type: { type: "string" } }],
      output: { type: "boolean" }
    },
    languages: {
      python: py("is_loose_palindrome", "text: str", "bool", [
        "left = 0",
        "right = len(text) - 1",
        "while left < right:",
        "    while left < right and not text[left].isalnum():",
        "        left += 1",
        "    while left < right and not text[right].isalnum():",
        "        right -= 1",
        "    if text[left].lower() != text[right].lower():",
        "        return False",
        "    left += 1",
        "    right -= 1",
        "return True"
      ]),
      typescript: ts("isLoosePalindrome", "text: string", "boolean", [
        "let left = 0;",
        "let right = text.length - 1;",
        "const isAlnum = (char: string) => /[a-z0-9]/i.test(char);",
        "while (left < right) {",
        "  while (left < right && !isAlnum(text[left])) left += 1;",
        "  while (left < right && !isAlnum(text[right])) right -= 1;",
        "  if (text[left].toLowerCase() !== text[right].toLowerCase()) return false;",
        "  left += 1;",
        "  right -= 1;",
        "}",
        "return true;"
      ]),
      go: goWithImport("IsLoosePalindrome", "text string", "bool", ["\"unicode\""], [
        "chars := []rune(text)",
        "left := 0",
        "right := len(chars) - 1",
        "for left < right {",
        "\tfor left < right && !unicode.IsLetter(chars[left]) && !unicode.IsDigit(chars[left]) {",
        "\t\tleft++",
        "\t}",
        "\tfor left < right && !unicode.IsLetter(chars[right]) && !unicode.IsDigit(chars[right]) {",
        "\t\tright--",
        "\t}",
        "\tif unicode.ToLower(chars[left]) != unicode.ToLower(chars[right]) {",
        "\t\treturn false",
        "\t}",
        "\tleft++",
        "\tright--",
        "}",
        "return true"
      ]),
      scala: scala("isLoosePalindrome", "text: String", "Boolean", [
        "var left = 0",
        "var right = text.length - 1",
        "while (left < right) {",
        "  while (left < right && !text.charAt(left).isLetterOrDigit) left += 1",
        "  while (left < right && !text.charAt(right).isLetterOrDigit) right -= 1",
        "  if (text.charAt(left).toLower != text.charAt(right).toLower) return false",
        "  left += 1",
        "  right -= 1",
        "}",
        "true"
      ])
    }
  },
  "two-pointers-sliding-window-bonus-05": {
    signature: {
      name: "windowAverages",
      inputs: [
        { name: "nums", type: arrayOfNumbers() },
        { name: "k", type: { type: "number" } }
      ],
      output: arrayOfNumbers()
    },
    languages: {
      python: py("window_averages", "nums: list[int], k: int", "list[float]", [
        "if k <= 0 or k > len(nums):",
        "    return []",
        "total = sum(nums[:k])",
        "result = [total / k]",
        "for right in range(k, len(nums)):",
        "    total += nums[right] - nums[right - k]",
        "    result.append(total / k)",
        "return result"
      ]),
      typescript: ts("windowAverages", "nums: number[], k: number", "number[]", [
        "if (k <= 0 || k > nums.length) return [];",
        "let total = 0;",
        "for (let index = 0; index < k; index += 1) total += nums[index];",
        "const result = [total / k];",
        "for (let right = k; right < nums.length; right += 1) {",
        "  total += nums[right] - nums[right - k];",
        "  result.push(total / k);",
        "}",
        "return result;"
      ]),
      go: go("WindowAverages", "nums []int, k int", "[]float64", [
        "if k <= 0 || k > len(nums) {",
        "\treturn []float64{}",
        "}",
        "total := 0",
        "for index := 0; index < k; index++ {",
        "\ttotal += nums[index]",
        "}",
        "result := []float64{float64(total) / float64(k)}",
        "for right := k; right < len(nums); right++ {",
        "\ttotal += nums[right] - nums[right-k]",
        "\tresult = append(result, float64(total)/float64(k))",
        "}",
        "return result"
      ]),
      scala: scala("windowAverages", "nums: Seq[Int], k: Int", "Seq[Double]", [
        "if (k <= 0 || k > nums.length) return Seq.empty",
        "var total = nums.take(k).sum",
        "val result = scala.collection.mutable.ArrayBuffer(total.toDouble / k)",
        "for (right <- k until nums.length) {",
        "  total += nums(right) - nums(right - k)",
        "  result.append(total.toDouble / k)",
        "}",
        "result.toSeq"
      ])
    }
  },
  "two-pointers-sliding-window-bonus-06": stringNumber("longestUniqueSubstring", "text", [
    "const lastSeen = new Map<string, number>();",
    "let left = 0;",
    "let best = 0;",
    "for (let right = 0; right < text.length; right += 1) {",
    "  const char = text[right];",
    "  const previous = lastSeen.get(char);",
    "  if (previous !== undefined && previous >= left) left = previous + 1;",
    "  lastSeen.set(char, right);",
    "  best = Math.max(best, right - left + 1);",
    "}",
    "return best;"
  ], [
    "last_seen = {}",
    "left = 0",
    "best = 0",
    "for right, char in enumerate(text):",
    "    if char in last_seen and last_seen[char] >= left:",
    "        left = last_seen[char] + 1",
    "    last_seen[char] = right",
    "    best = max(best, right - left + 1)",
    "return best"
  ], [
    "lastSeen := map[rune]int{}",
    "chars := []rune(text)",
    "left := 0",
    "best := 0",
    "for right, char := range chars {",
    "\tif previous, ok := lastSeen[char]; ok && previous >= left {",
    "\t\tleft = previous + 1",
    "\t}",
    "\tlastSeen[char] = right",
    "\tlength := right - left + 1",
    "\tif length > best {",
    "\t\tbest = length",
    "\t}",
    "}",
    "return best"
  ], [
    "val lastSeen = scala.collection.mutable.Map.empty[Char, Int]",
    "var left = 0",
    "var best = 0",
    "for (right <- text.indices) {",
    "  val char = text.charAt(right)",
    "  lastSeen.get(char).foreach { previous =>",
    "    if (previous >= left) left = previous + 1",
    "  }",
    "  lastSeen(char) = right",
    "  best = math.max(best, right - left + 1)",
    "}",
    "best"
  ], "LongestUniqueSubstring"),
  "two-pointers-sliding-window-bonus-07": minWindowForSum(),
  "two-pointers-sliding-window-bonus-08": countPairsBelow(),
  "two-pointers-sliding-window-bonus-09": dedupeSortedLength(),
  "two-pointers-sliding-window-bonus-10": mergeSorted(),
  "two-pointers-sliding-window-bonus-11": longestWithinLimit(),
  "two-pointers-sliding-window-bonus-12": arrayNumberArray("sortBinaryArray", "bits", [
    "const result = bits.slice();",
    "let left = 0;",
    "let right = result.length - 1;",
    "while (left < right) {",
    "  while (left < right && result[left] === 0) left += 1;",
    "  while (left < right && result[right] === 1) right -= 1;",
    "  if (left < right) {",
    "    result[left] = 0;",
    "    result[right] = 1;",
    "  }",
    "}",
    "return result;"
  ], [
    "result = bits[:]",
    "left = 0",
    "right = len(result) - 1",
    "while left < right:",
    "    while left < right and result[left] == 0:",
    "        left += 1",
    "    while left < right and result[right] == 1:",
    "        right -= 1",
    "    if left < right:",
    "        result[left], result[right] = 0, 1",
    "return result"
  ], [
    "result := append([]int{}, bits...)",
    "left := 0",
    "right := len(result) - 1",
    "for left < right {",
    "\tfor left < right && result[left] == 0 {",
    "\t\tleft++",
    "\t}",
    "\tfor left < right && result[right] == 1 {",
    "\t\tright--",
    "\t}",
    "\tif left < right {",
    "\t\tresult[left] = 0",
    "\t\tresult[right] = 1",
    "\t}",
    "}",
    "return result"
  ], [
    "val result = bits.toArray",
    "var left = 0",
    "var right = result.length - 1",
    "while (left < right) {",
    "  while (left < right && result(left) == 0) left += 1",
    "  while (left < right && result(right) == 1) right -= 1",
    "  if (left < right) {",
    "    result(left) = 0",
    "    result(right) = 1",
    "  }",
    "}",
    "result.toSeq"
  ], "SortBinaryArray")
};

function minWindowForSum(): CuratedProblem {
  return {
    signature: {
      name: "minWindowForSum",
      inputs: [
        { name: "nums", type: arrayOfNumbers() },
        { name: "target", type: { type: "number" } }
      ],
      output: { type: "number" }
    },
    languages: {
      python: py("min_window_for_sum", "nums: list[int], target: int", "int", [
        "left = 0",
        "total = 0",
        "best = None",
        "for right, num in enumerate(nums):",
        "    total += num",
        "    while total >= target:",
        "        length = right - left + 1",
        "        best = length if best is None else min(best, length)",
        "        total -= nums[left]",
        "        left += 1",
        "return 0 if best is None else best"
      ]),
      typescript: ts("minWindowForSum", "nums: number[], target: number", "number", [
        "let left = 0;",
        "let total = 0;",
        "let best = Number.POSITIVE_INFINITY;",
        "for (let right = 0; right < nums.length; right += 1) {",
        "  total += nums[right];",
        "  while (total >= target) {",
        "    best = Math.min(best, right - left + 1);",
        "    total -= nums[left];",
        "    left += 1;",
        "  }",
        "}",
        "return Number.isFinite(best) ? best : 0;"
      ]),
      go: go("MinWindowForSum", "nums []int, target int", "int", [
        "left := 0",
        "total := 0",
        "best := len(nums) + 1",
        "for right, num := range nums {",
        "\ttotal += num",
        "\tfor total >= target {",
        "\t\tlength := right - left + 1",
        "\t\tif length < best {",
        "\t\t\tbest = length",
        "\t\t}",
        "\t\ttotal -= nums[left]",
        "\t\tleft++",
        "\t}",
        "}",
        "if best == len(nums)+1 {",
        "\treturn 0",
        "}",
        "return best"
      ]),
      scala: scala("minWindowForSum", "nums: Seq[Int], target: Int", "Int", [
        "var left = 0",
        "var total = 0",
        "var best = Int.MaxValue",
        "for (right <- nums.indices) {",
        "  total += nums(right)",
        "  while (total >= target) {",
        "    best = math.min(best, right - left + 1)",
        "    total -= nums(left)",
        "    left += 1",
        "  }",
        "}",
        "if (best == Int.MaxValue) 0 else best"
      ])
    }
  };
}

function countPairsBelow(): CuratedProblem {
  return {
    signature: {
      name: "countPairsBelow",
      inputs: [
        { name: "nums", type: arrayOfNumbers() },
        { name: "threshold", type: { type: "number" } }
      ],
      output: { type: "number" }
    },
    languages: {
      python: py("count_pairs_below", "nums: list[int], threshold: int", "int", [
        "values = sorted(nums)",
        "left = 0",
        "right = len(values) - 1",
        "count = 0",
        "while left < right:",
        "    if values[left] + values[right] < threshold:",
        "        count += right - left",
        "        left += 1",
        "    else:",
        "        right -= 1",
        "return count"
      ]),
      typescript: ts("countPairsBelow", "nums: number[], threshold: number", "number", [
        "const values = nums.slice().sort((left, right) => left - right);",
        "let left = 0;",
        "let right = values.length - 1;",
        "let count = 0;",
        "while (left < right) {",
        "  if (values[left] + values[right] < threshold) {",
        "    count += right - left;",
        "    left += 1;",
        "  } else {",
        "    right -= 1;",
        "  }",
        "}",
        "return count;"
      ]),
      go: goWithImport("CountPairsBelow", "nums []int, threshold int", "int", ["\"sort\""], [
        "values := append([]int{}, nums...)",
        "sort.Ints(values)",
        "left := 0",
        "right := len(values) - 1",
        "count := 0",
        "for left < right {",
        "\tif values[left]+values[right] < threshold {",
        "\t\tcount += right - left",
        "\t\tleft++",
        "\t} else {",
        "\t\tright--",
        "\t}",
        "}",
        "return count"
      ]),
      scala: scala("countPairsBelow", "nums: Seq[Int], threshold: Int", "Int", [
        "val values = nums.sorted",
        "var left = 0",
        "var right = values.length - 1",
        "var count = 0",
        "while (left < right) {",
        "  if (values(left) + values(right) < threshold) {",
        "    count += right - left",
        "    left += 1",
        "  } else right -= 1",
        "}",
        "count"
      ])
    }
  };
}

function dedupeSortedLength(): CuratedProblem {
  return {
    signature: {
      name: "dedupeSortedLength",
      inputs: [{ name: "nums", type: arrayOfNumbers() }],
      output: { type: "number" }
    },
    languages: {
      python: py("dedupe_sorted_length", "nums: list[int]", "int", [
        "if not nums:",
        "    return 0",
        "write = 1",
        "for read in range(1, len(nums)):",
        "    if nums[read] != nums[write - 1]:",
        "        nums[write] = nums[read]",
        "        write += 1",
        "return write"
      ]),
      typescript: ts("dedupeSortedLength", "nums: number[]", "number", [
        "if (nums.length === 0) return 0;",
        "let write = 1;",
        "for (let read = 1; read < nums.length; read += 1) {",
        "  if (nums[read] !== nums[write - 1]) {",
        "    nums[write] = nums[read];",
        "    write += 1;",
        "  }",
        "}",
        "return write;"
      ]),
      go: go("DedupeSortedLength", "nums []int", "int", [
        "if len(nums) == 0 {",
        "\treturn 0",
        "}",
        "write := 1",
        "for read := 1; read < len(nums); read++ {",
        "\tif nums[read] != nums[write-1] {",
        "\t\tnums[write] = nums[read]",
        "\t\twrite++",
        "\t}",
        "}",
        "return write"
      ]),
      scala: scala("dedupeSortedLength", "nums: Seq[Int]", "Int", [
        "if (nums.isEmpty) return 0",
        "var count = 1",
        "for (index <- 1 until nums.length) {",
        "  if (nums(index) != nums(index - 1)) count += 1",
        "}",
        "count"
      ])
    }
  };
}

function mergeSorted(): CuratedProblem {
  return {
    signature: {
      name: "mergeSorted",
      inputs: [
        { name: "a", type: arrayOfNumbers() },
        { name: "b", type: arrayOfNumbers() }
      ],
      output: arrayOfNumbers()
    },
    languages: {
      python: py("merge_sorted", "a: list[int], b: list[int]", "list[int]", [
        "result = []",
        "i = 0",
        "j = 0",
        "while i < len(a) and j < len(b):",
        "    if a[i] <= b[j]:",
        "        result.append(a[i])",
        "        i += 1",
        "    else:",
        "        result.append(b[j])",
        "        j += 1",
        "result.extend(a[i:])",
        "result.extend(b[j:])",
        "return result"
      ]),
      typescript: ts("mergeSorted", "a: number[], b: number[]", "number[]", [
        "const result: number[] = [];",
        "let i = 0;",
        "let j = 0;",
        "while (i < a.length && j < b.length) {",
        "  if (a[i] <= b[j]) {",
        "    result.push(a[i]);",
        "    i += 1;",
        "  } else {",
        "    result.push(b[j]);",
        "    j += 1;",
        "  }",
        "}",
        "return result.concat(a.slice(i), b.slice(j));"
      ]),
      go: go("MergeSorted", "a []int, b []int", "[]int", [
        "result := []int{}",
        "i := 0",
        "j := 0",
        "for i < len(a) && j < len(b) {",
        "\tif a[i] <= b[j] {",
        "\t\tresult = append(result, a[i])",
        "\t\ti++",
        "\t} else {",
        "\t\tresult = append(result, b[j])",
        "\t\tj++",
        "\t}",
        "}",
        "result = append(result, a[i:]...)",
        "result = append(result, b[j:]...)",
        "return result"
      ]),
      scala: scala("mergeSorted", "a: Seq[Int], b: Seq[Int]", "Seq[Int]", [
        "val result = scala.collection.mutable.ArrayBuffer.empty[Int]",
        "var i = 0",
        "var j = 0",
        "while (i < a.length && j < b.length) {",
        "  if (a(i) <= b(j)) {",
        "    result.append(a(i))",
        "    i += 1",
        "  } else {",
        "    result.append(b(j))",
        "    j += 1",
        "  }",
        "}",
        "result.toSeq ++ a.drop(i) ++ b.drop(j)"
      ])
    }
  };
}

function longestWithinLimit(): CuratedProblem {
  return {
    signature: {
      name: "longestWithinLimit",
      inputs: [
        { name: "nums", type: arrayOfNumbers() },
        { name: "limit", type: { type: "number" } }
      ],
      output: { type: "number" }
    },
    languages: {
      python: py("longest_within_limit", "nums: list[int], limit: int", "int", [
        "left = 0",
        "total = 0",
        "best = 0",
        "for right, num in enumerate(nums):",
        "    total += num",
        "    while total > limit and left <= right:",
        "        total -= nums[left]",
        "        left += 1",
        "    best = max(best, right - left + 1)",
        "return best"
      ]),
      typescript: ts("longestWithinLimit", "nums: number[], limit: number", "number", [
        "let left = 0;",
        "let total = 0;",
        "let best = 0;",
        "for (let right = 0; right < nums.length; right += 1) {",
        "  total += nums[right];",
        "  while (total > limit && left <= right) {",
        "    total -= nums[left];",
        "    left += 1;",
        "  }",
        "  best = Math.max(best, right - left + 1);",
        "}",
        "return best;"
      ]),
      go: go("LongestWithinLimit", "nums []int, limit int", "int", [
        "left := 0",
        "total := 0",
        "best := 0",
        "for right, num := range nums {",
        "\ttotal += num",
        "\tfor total > limit && left <= right {",
        "\t\ttotal -= nums[left]",
        "\t\tleft++",
        "\t}",
        "\tlength := right - left + 1",
        "\tif length > best {",
        "\t\tbest = length",
        "\t}",
        "}",
        "return best"
      ]),
      scala: scala("longestWithinLimit", "nums: Seq[Int], limit: Int", "Int", [
        "var left = 0",
        "var total = 0",
        "var best = 0",
        "for (right <- nums.indices) {",
        "  total += nums(right)",
        "  while (total > limit && left <= right) {",
        "    total -= nums(left)",
        "    left += 1",
        "  }",
        "  best = math.max(best, right - left + 1)",
        "}",
        "best"
      ])
    }
  };
}

function countExcept(tsName: string, numsName: string, valueName: string, goName: string): CuratedProblem {
  return {
    signature: {
      name: tsName,
      inputs: [
        { name: numsName, type: arrayOfNumbers() },
        { name: valueName, type: { type: "number" } }
      ],
      output: { type: "number" }
    },
    languages: {
      python: py("remove_element", `${numsName}: list[int], ${valueName}: int`, "int", [
        `write = 0`,
        `for num in ${numsName}:`,
        `    if num != ${valueName}:`,
        `        ${numsName}[write] = num`,
        `        write += 1`,
        `return write`
      ]),
      typescript: ts(tsName, `${numsName}: number[], ${valueName}: number`, "number", [
        "let write = 0;",
        `for (const num of ${numsName}) {`,
        `  if (num !== ${valueName}) {`,
        `    ${numsName}[write] = num;`,
        "    write += 1;",
        "  }",
        "}",
        "return write;"
      ]),
      go: go(goName, `${numsName} []int, ${valueName} int`, "int", [
        "write := 0",
        `for _, num := range ${numsName} {`,
        `\tif num != ${valueName} {`,
        `\t\t${numsName}[write] = num`,
        "\t\twrite++",
        "\t}",
        "}",
        "return write"
      ]),
      scala: scala(tsName, `${numsName}: Seq[Int], ${valueName}: Int`, "Int", [
        `${numsName}.count(_ != ${valueName})`
      ])
    }
  };
}

function simpleArrayNumber(
  tsName: string,
  argName: string,
  tsBody: string[],
  pyBody: string[],
  goBody: string[],
  scalaBody: string[],
  goName: string
): CuratedProblem {
  return {
    signature: {
      name: tsName,
      inputs: [{ name: argName, type: arrayOfNumbers() }],
      output: { type: "number" }
    },
    languages: {
      python: py(snakeCase(tsName), `${argName}: list[int]`, "int", pyBody),
      typescript: ts(tsName, `${argName}: number[]`, "number", tsBody),
      go: go(goName, `${argName} []int`, "int", goBody),
      scala: scala(tsName, `${argName}: Seq[Int]`, "Int", scalaBody)
    }
  };
}

function stringNumber(
  tsName: string,
  argName: string,
  tsBody: string[],
  pyBody: string[],
  goBody: string[],
  scalaBody: string[],
  goName: string
): CuratedProblem {
  return {
    signature: {
      name: tsName,
      inputs: [{ name: argName, type: { type: "string" } }],
      output: { type: "number" }
    },
    languages: {
      python: py(snakeCase(tsName), `${argName}: str`, "int", pyBody),
      typescript: ts(tsName, `${argName}: string`, "number", tsBody),
      go: go(goName, `${argName} string`, "int", goBody),
      scala: scala(tsName, `${argName}: String`, "Int", scalaBody)
    }
  };
}

function arrayNumberArray(
  tsName: string,
  argName: string,
  tsBody: string[],
  pyBody: string[],
  goBody: string[],
  scalaBody: string[],
  goName: string
): CuratedProblem {
  return {
    signature: {
      name: tsName,
      inputs: [{ name: argName, type: arrayOfNumbers() }],
      output: arrayOfNumbers()
    },
    languages: {
      python: py(snakeCase(tsName), `${argName}: list[int]`, "list[int]", pyBody),
      typescript: ts(tsName, `${argName}: number[]`, "number[]", tsBody),
      go: go(goName, `${argName} []int`, "[]int", goBody),
      scala: scala(tsName, `${argName}: Seq[Int]`, "Seq[Int]", scalaBody)
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
    reference: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n${indent(body, "\t")}\n}\n${helpers.length ? `\n${helpers.join("\n\n")}\n` : ""}`
  };
}

function goWithImport(name: string, args: string, returnType: string, imports: string[], body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "go",
    starter: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`,
    reference: `package solution\n\nimport (\n${indent(imports, "\t")}\n)\n\nfunc ${name}(${args}) ${returnType} {\n${indent(body, "\t")}\n}\n`
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

function indent(lines: string[], prefix: string): string {
  return lines.map((line) => `${prefix}${line}`).join("\n");
}

function snakeCase(value: string): string {
  return value.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
}
