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

export const interviewToolsCurated: Record<string, CuratedProblem> = {
  "growth-label": unaryNumberArrayString("growthLabel", "growth_label", "GrowthLabel", "operations", [
    "if (operations.length < 2) return \"unknown\";",
    "let total = 0;",
    "for (let index = 0; index < operations.length - 1; index += 1) {",
    "  if (operations[index] === 0) return \"unknown\";",
    "  total += operations[index + 1] / operations[index];",
    "}",
    "const average = total / (operations.length - 1);",
    "if (average >= 0.75 && average <= 1.35) return \"constant\";",
    "if (average >= 1.55 && average <= 2.45) return \"linear\";",
    "if (average >= 3.1 && average <= 5.0) return \"quadratic\";",
    "return \"unknown\";"
  ], [
    "if len(operations) < 2:",
    "    return 'unknown'",
    "total = 0",
    "for index in range(len(operations) - 1):",
    "    if operations[index] == 0:",
    "        return 'unknown'",
    "    total += operations[index + 1] / operations[index]",
    "average = total / (len(operations) - 1)",
    "if 0.75 <= average <= 1.35:",
    "    return 'constant'",
    "if 1.55 <= average <= 2.45:",
    "    return 'linear'",
    "if 3.1 <= average <= 5.0:",
    "    return 'quadratic'",
    "return 'unknown'"
  ], [
    "if len(operations) < 2 { return \"unknown\" }",
    "total := 0.0",
    "for index := 0; index < len(operations)-1; index++ { if operations[index] == 0 { return \"unknown\" }; total += float64(operations[index+1]) / float64(operations[index]) }",
    "average := total / float64(len(operations)-1)",
    "if average >= 0.75 && average <= 1.35 { return \"constant\" }",
    "if average >= 1.55 && average <= 2.45 { return \"linear\" }",
    "if average >= 3.1 && average <= 5.0 { return \"quadratic\" }",
    "return \"unknown\""
  ], [
    "if (operations.length < 2) return \"unknown\"",
    "var total = 0.0",
    "for (index <- 0 until operations.length - 1) { if (operations(index) == 0) return \"unknown\"; total += operations(index + 1).toDouble / operations(index).toDouble }",
    "val average = total / (operations.length - 1)",
    "if (average >= 0.75 && average <= 1.35) \"constant\"",
    "else if (average >= 1.55 && average <= 2.45) \"linear\"",
    "else if (average >= 3.1 && average <= 5.0) \"quadratic\"",
    "else \"unknown\""
  ]),
  "choose-pattern-label": {
    signature: { name: "choosePatternLabel", inputs: [{ name: "features", type: stringArray() }], output: stringType() },
    languages: {
      python: py("choose_pattern_label", "features: list[str]", "str", [
        "text = ' '.join(feature.lower() for feature in features)",
        "groups = [",
        "    ('graph', ['node', 'edge', 'shortest', 'connected']),",
        "    ('dp', ['subproblem', 'reuse', 'minimum', 'optimal']),",
        "    ('binary-search', ['sorted', 'boundary', 'answer']),",
        "    ('sliding-window', ['contiguous', 'window', 'at most', 'positive']),",
        "]",
        "for label, needles in groups:",
        "    if any(needle in text for needle in needles):",
        "        return label",
        "return 'hashing'"
      ]),
      typescript: ts("choosePatternLabel", "features: string[]", "string", [
        "const text = features.map((feature) => feature.toLowerCase()).join(\" \");",
        "const groups: Array<[string, string[]]> = [",
        "  [\"graph\", [\"node\", \"edge\", \"shortest\", \"connected\"]],",
        "  [\"dp\", [\"subproblem\", \"reuse\", \"minimum\", \"optimal\"]],",
        "  [\"binary-search\", [\"sorted\", \"boundary\", \"answer\"]],",
        "  [\"sliding-window\", [\"contiguous\", \"window\", \"at most\", \"positive\"]]",
        "];",
        "for (const [label, needles] of groups) {",
        "  if (needles.some((needle) => text.includes(needle))) return label;",
        "}",
        "return \"hashing\";"
      ]),
      go: go("ChoosePatternLabel", "features []string", "string", [
        "lowered := []string{}",
        "for _, feature := range features { lowered = append(lowered, strings.ToLower(feature)) }",
        "text := strings.Join(lowered, \" \")",
        "groups := []struct{ label string; needles []string }{{\"graph\", []string{\"node\", \"edge\", \"shortest\", \"connected\"}}, {\"dp\", []string{\"subproblem\", \"reuse\", \"minimum\", \"optimal\"}}, {\"binary-search\", []string{\"sorted\", \"boundary\", \"answer\"}}, {\"sliding-window\", []string{\"contiguous\", \"window\", \"at most\", \"positive\"}}}",
        "for _, group := range groups { for _, needle := range group.needles { if strings.Contains(text, needle) { return group.label } } }",
        "return \"hashing\""
      ], ["strings"]),
      scala: scala("choosePatternLabel", "features: Seq[String]", "String", [
        "val text = features.map(_.toLowerCase).mkString(\" \")",
        "val groups = Seq(",
        "  \"graph\" -> Seq(\"node\", \"edge\", \"shortest\", \"connected\"),",
        "  \"dp\" -> Seq(\"subproblem\", \"reuse\", \"minimum\", \"optimal\"),",
        "  \"binary-search\" -> Seq(\"sorted\", \"boundary\", \"answer\"),",
        "  \"sliding-window\" -> Seq(\"contiguous\", \"window\", \"at most\", \"positive\")",
        ")",
        "groups.collectFirst { case (label, needles) if needles.exists(text.contains) => label }.getOrElse(\"hashing\")"
      ])
    }
  },
  "mixed-review-score": {
    signature: { name: "mixedReviewScore", inputs: [{ name: "results", type: arrayOf(arrayOf(anyType())) }], output: numberType() },
    languages: {
      python: py("mixed_review_score", "results: list[list[object]]", "int", [
        "total = 0",
        "for difficulty, passed in results:",
        "    if passed:",
        "        total += difficulty",
        "return total"
      ]),
      typescript: ts("mixedReviewScore", "results: Array<[number, boolean]>", "number", [
        "let total = 0;",
        "for (const [difficulty, passed] of results) {",
        "  if (passed) total += difficulty;",
        "}",
        "return total;"
      ]),
      go: go("MixedReviewScore", "results [][]any", "int", [
        "total := 0",
        "for _, result := range results { difficulty, _ := result[0].(int); passed, _ := result[1].(bool); if passed { total += difficulty } }",
        "return total"
      ]),
      scala: scala("mixedReviewScore", "results: Seq[Seq[Any]]", "Int", [
        "results.map { result => val difficulty = result(0).asInstanceOf[Int]; val passed = result(1).asInstanceOf[Boolean]; if (passed) difficulty else 0 }.sum"
      ])
    }
  },
  "interview-tools-bonus-01": unaryStringString("reverseVowels", "reverse_vowels", "ReverseVowels", "text", [
    "const vowels = new Set(\"aeiouAEIOU\".split(\"\"));",
    "const chars = [...text];",
    "let left = 0;",
    "let right = chars.length - 1;",
    "while (left < right) {",
    "  if (!vowels.has(chars[left])) left += 1;",
    "  else if (!vowels.has(chars[right])) right -= 1;",
    "  else {",
    "    [chars[left], chars[right]] = [chars[right], chars[left]];",
    "    left += 1;",
    "    right -= 1;",
    "  }",
    "}",
    "return chars.join(\"\");"
  ], [
    "vowels = set('aeiouAEIOU')",
    "chars = list(text)",
    "left, right = 0, len(chars) - 1",
    "while left < right:",
    "    if chars[left] not in vowels:",
    "        left += 1",
    "    elif chars[right] not in vowels:",
    "        right -= 1",
    "    else:",
    "        chars[left], chars[right] = chars[right], chars[left]",
    "        left += 1",
    "        right -= 1",
    "return ''.join(chars)"
  ], [
    "vowels := map[rune]bool{'a': true, 'e': true, 'i': true, 'o': true, 'u': true, 'A': true, 'E': true, 'I': true, 'O': true, 'U': true}",
    "chars := []rune(text)",
    "left, right := 0, len(chars)-1",
    "for left < right { if !vowels[chars[left]] { left++ } else if !vowels[chars[right]] { right-- } else { chars[left], chars[right] = chars[right], chars[left]; left++; right-- } }",
    "return string(chars)"
  ], [
    "val vowels = Set('a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U')",
    "val chars = text.toCharArray",
    "var left = 0; var right = chars.length - 1",
    "while (left < right) { if (!vowels(chars(left))) left += 1 else if (!vowels(chars(right))) right -= 1 else { val temp = chars(left); chars(left) = chars(right); chars(right) = temp; left += 1; right -= 1 } }",
    "chars.mkString"
  ]),
  "interview-tools-bonus-02": unaryNumberArrayNumber("unpairedNumber", "unpaired_number", "UnpairedNumber", "nums", [
    "const unmatched = new Set<number>();",
    "for (const value of nums) {",
    "  if (unmatched.has(value)) unmatched.delete(value);",
    "  else unmatched.add(value);",
    "}",
    "return unmatched.values().next().value ?? 0;"
  ], [
    "unmatched = set()",
    "for value in nums:",
    "    if value in unmatched:",
    "        unmatched.discard(value)",
    "    else:",
    "        unmatched.add(value)",
    "return next(iter(unmatched))"
  ], [
    "unmatched := map[int]bool{}",
    "for _, value := range nums { if unmatched[value] { delete(unmatched, value) } else { unmatched[value] = true } }",
    "for value := range unmatched { return value }",
    "return 0"
  ], [
    "val unmatched = scala.collection.mutable.Set.empty[Int]",
    "for (value <- nums) if (unmatched(value)) unmatched.remove(value) else unmatched.add(value)",
    "unmatched.head"
  ]),
  "interview-tools-bonus-03": unaryNumberArrayNumber("longestTwoValueRun", "longest_two_value_run", "LongestTwoValueRun", "nums", [
    "const counts = new Map<number, number>();",
    "let left = 0;",
    "let best = 0;",
    "for (let right = 0; right < nums.length; right += 1) {",
    "  counts.set(nums[right], (counts.get(nums[right]) ?? 0) + 1);",
    "  while (counts.size > 2) {",
    "    const value = nums[left];",
    "    const next = (counts.get(value) ?? 0) - 1;",
    "    if (next === 0) counts.delete(value);",
    "    else counts.set(value, next);",
    "    left += 1;",
    "  }",
    "  best = Math.max(best, right - left + 1);",
    "}",
    "return best;"
  ], [
    "counts = {}",
    "left = 0",
    "best = 0",
    "for right, value in enumerate(nums):",
    "    counts[value] = counts.get(value, 0) + 1",
    "    while len(counts) > 2:",
    "        counts[nums[left]] -= 1",
    "        if counts[nums[left]] == 0:",
    "            del counts[nums[left]]",
    "        left += 1",
    "    best = max(best, right - left + 1)",
    "return best"
  ], [
    "counts := map[int]int{}",
    "left, best := 0, 0",
    "for right, value := range nums { counts[value]++; for len(counts) > 2 { leftValue := nums[left]; counts[leftValue]--; if counts[leftValue] == 0 { delete(counts, leftValue) }; left++ }; if right-left+1 > best { best = right-left+1 } }",
    "return best"
  ], [
    "val counts = scala.collection.mutable.Map.empty[Int, Int].withDefaultValue(0)",
    "var left = 0; var best = 0",
    "for (right <- nums.indices) { val value = nums(right); counts(value) += 1; while (counts.size > 2) { val leftValue = nums(left); counts(leftValue) -= 1; if (counts(leftValue) == 0) counts.remove(leftValue); left += 1 }; best = math.max(best, right - left + 1) }",
    "best"
  ]),
  "interview-tools-bonus-04": unaryStringBoolean("isBalanced", "is_balanced", "IsBalanced", "text", [
    "const pairs: Record<string, string> = { \")\": \"(\", \"]\": \"[\", \"}\": \"{\" };",
    "const stack: string[] = [];",
    "for (const ch of text) {",
    "  if (pairs[ch]) {",
    "    if (stack.pop() !== pairs[ch]) return false;",
    "  } else {",
    "    stack.push(ch);",
    "  }",
    "}",
    "return stack.length === 0;"
  ], [
    "pairs = {')': '(', ']': '[', '}': '{'}",
    "stack = []",
    "for ch in text:",
    "    if ch in pairs:",
    "        if not stack or stack.pop() != pairs[ch]:",
    "            return False",
    "    else:",
    "        stack.append(ch)",
    "return not stack"
  ], [
    "pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}",
    "stack := []rune{}",
    "for _, ch := range text { if opener, ok := pairs[ch]; ok { if len(stack) == 0 || stack[len(stack)-1] != opener { return false }; stack = stack[:len(stack)-1] } else { stack = append(stack, ch) } }",
    "return len(stack) == 0"
  ], [
    "val pairs = Map(')' -> '(', ']' -> '[', '}' -> '{')",
    "val stack = scala.collection.mutable.ArrayBuffer.empty[Char]",
    "for (ch <- text) { if (pairs.contains(ch)) { if (stack.isEmpty || stack.remove(stack.length - 1) != pairs(ch)) return false } else stack.append(ch) }",
    "stack.isEmpty"
  ]),
  "interview-tools-bonus-05": unaryGridNumber("countIslands", "count_islands", "CountIslands", "grid", [
    "if (grid.length === 0 || grid[0].length === 0) return 0;",
    "const rows = grid.length;",
    "const cols = grid[0].length;",
    "const visited = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));",
    "const dfs = (row: number, col: number) => {",
    "  if (row < 0 || row >= rows || col < 0 || col >= cols || visited[row][col] || grid[row][col] === 0) return;",
    "  visited[row][col] = true;",
    "  dfs(row + 1, col); dfs(row - 1, col); dfs(row, col + 1); dfs(row, col - 1);",
    "};",
    "let islands = 0;",
    "for (let row = 0; row < rows; row += 1) {",
    "  for (let col = 0; col < cols; col += 1) {",
    "    if (grid[row][col] === 1 && !visited[row][col]) { islands += 1; dfs(row, col); }",
    "  }",
    "}",
    "return islands;"
  ], [
    "if not grid or not grid[0]:",
    "    return 0",
    "rows, cols = len(grid), len(grid[0])",
    "visited = [[False] * cols for _ in range(rows)]",
    "def dfs(row, col):",
    "    if row < 0 or row >= rows or col < 0 or col >= cols or visited[row][col] or grid[row][col] == 0:",
    "        return",
    "    visited[row][col] = True",
    "    dfs(row + 1, col); dfs(row - 1, col); dfs(row, col + 1); dfs(row, col - 1)",
    "islands = 0",
    "for row in range(rows):",
    "    for col in range(cols):",
    "        if grid[row][col] == 1 and not visited[row][col]:",
    "            islands += 1",
    "            dfs(row, col)",
    "return islands"
  ], [
    "if len(grid) == 0 || len(grid[0]) == 0 { return 0 }",
    "rows, cols := len(grid), len(grid[0])",
    "visited := make([][]bool, rows)",
    "for row := range visited { visited[row] = make([]bool, cols) }",
    "var dfs func(int, int)",
    "dfs = func(row int, col int) { if row < 0 || row >= rows || col < 0 || col >= cols || visited[row][col] || grid[row][col] == 0 { return }; visited[row][col] = true; dfs(row+1, col); dfs(row-1, col); dfs(row, col+1); dfs(row, col-1) }",
    "islands := 0",
    "for row := 0; row < rows; row++ { for col := 0; col < cols; col++ { if grid[row][col] == 1 && !visited[row][col] { islands++; dfs(row, col) } } }",
    "return islands"
  ], [
    "if (grid.isEmpty || grid.head.isEmpty) return 0",
    "val rows = grid.length; val cols = grid.head.length",
    "val visited = Array.fill(rows, cols)(false)",
    "def dfs(row: Int, col: Int): Unit = { if (row < 0 || row >= rows || col < 0 || col >= cols || visited(row)(col) || grid(row)(col) == 0) return; visited(row)(col) = true; dfs(row + 1, col); dfs(row - 1, col); dfs(row, col + 1); dfs(row, col - 1) }",
    "var islands = 0",
    "for (row <- 0 until rows; col <- 0 until cols) if (grid(row)(col) == 1 && !visited(row)(col)) { islands += 1; dfs(row, col) }",
    "islands"
  ]),
  "interview-tools-bonus-06": unaryNumberArrayNumber("peakIndex", "peak_index", "PeakIndex", "nums", [
    "let lo = 0;",
    "let hi = nums.length - 1;",
    "while (lo < hi) {",
    "  const mid = Math.floor((lo + hi) / 2);",
    "  if (nums[mid] < nums[mid + 1]) lo = mid + 1;",
    "  else hi = mid;",
    "}",
    "return lo;"
  ], [
    "lo, hi = 0, len(nums) - 1",
    "while lo < hi:",
    "    mid = (lo + hi) // 2",
    "    if nums[mid] < nums[mid + 1]:",
    "        lo = mid + 1",
    "    else:",
    "        hi = mid",
    "return lo"
  ], [
    "lo, hi := 0, len(nums)-1",
    "for lo < hi { mid := (lo + hi) / 2; if nums[mid] < nums[mid+1] { lo = mid + 1 } else { hi = mid } }",
    "return lo"
  ], [
    "var lo = 0; var hi = nums.length - 1",
    "while (lo < hi) { val mid = (lo + hi) / 2; if (nums(mid) < nums(mid + 1)) lo = mid + 1 else hi = mid }",
    "lo"
  ])
};

function unaryNumberArrayString(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: argName, type: numberArray() }], output: stringType() },
    languages: {
      python: py(pyName, `${argName}: list[int]`, "str", pyBody),
      typescript: ts(tsName, `${argName}: number[]`, "string", tsBody),
      go: go(goName, `${argName} []int`, "string", goBody),
      scala: scala(tsName, `${argName}: Seq[Int]`, "String", scalaBody)
    }
  };
}

function unaryNumberArrayNumber(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
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

function unaryStringString(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
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

function unaryStringBoolean(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: argName, type: stringType() }], output: booleanType() },
    languages: {
      python: py(pyName, `${argName}: str`, "bool", pyBody),
      typescript: ts(tsName, `${argName}: string`, "boolean", tsBody),
      go: go(goName, `${argName} string`, "bool", goBody),
      scala: scala(tsName, `${argName}: String`, "Boolean", scalaBody)
    }
  };
}

function unaryGridNumber(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: argName, type: numberMatrix() }], output: numberType() },
    languages: {
      python: py(pyName, `${argName}: list[list[int]]`, "int", pyBody),
      typescript: ts(tsName, `${argName}: number[][]`, "number", tsBody),
      go: go(goName, `${argName} [][]int`, "int", goBody),
      scala: scala(tsName, `${argName}: Seq[Seq[Int]]`, "Int", scalaBody)
    }
  };
}

function py(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return { entrypoint: name, extension: "py", starter: `def ${name}(${args}) -> ${returnType}:\n    raise NotImplementedError\n`, reference: `def ${name}(${args}) -> ${returnType}:\n${indent(body, "    ")}\n` };
}

function ts(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return { entrypoint: name, extension: "ts", starter: `export function ${name}(${args}): ${returnType} {\n  throw new Error("TODO");\n}\n`, reference: `export function ${name}(${args}): ${returnType} {\n${indent(body, "  ")}\n}\n` };
}

function go(name: string, args: string, returnType: string, body: string[], imports: string[] = []): LanguageFiles {
  const importText = imports.length === 0 ? "" : imports.length === 1 ? `\nimport "${imports[0]}"\n` : `\nimport (\n${imports.map((entry) => `\t"${entry}"`).join("\n")}\n)\n`;
  return { entrypoint: name, extension: "go", starter: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`, reference: `package solution\n${importText}\nfunc ${name}(${args}) ${returnType} {\n${indent(body, "\t")}\n}\n` };
}

function scala(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return { entrypoint: name, extension: "scala", starter: `object Solution {\n  def ${name}(${args}): ${returnType} = ???\n}\n`, reference: `object Solution {\n  def ${name}(${args}): ${returnType} = {\n${indent(body, "    ")}\n  }\n}\n` };
}

function anyType(): ValueType {
  return { type: "any" };
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

function numberMatrix(): ValueType {
  return arrayOf(numberArray());
}

function numberType(): ValueType {
  return { type: "number" };
}

function stringArray(): ValueType {
  return arrayOf(stringType());
}

function stringType(): ValueType {
  return { type: "string" };
}

function indent(lines: string[], prefix: string): string {
  return lines.map((line) => `${prefix}${line}`).join("\n");
}
