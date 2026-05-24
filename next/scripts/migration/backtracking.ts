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

export const backtrackingCurated: Record<string, CuratedProblem> = {
  "subsets-lexicographic": {
    signature: { name: "subsetsLexicographic", inputs: [{ name: "nums", type: numberArray() }], output: numberMatrix() },
    languages: {
      python: py("subsets_lexicographic", "nums: list[int]", "list[list[int]]", [
        "ordered = sorted(nums)",
        "result = []",
        "path = []",
        "def backtrack(start):",
        "    result.append(list(path))",
        "    for index in range(start, len(ordered)):",
        "        path.append(ordered[index])",
        "        backtrack(index + 1)",
        "        path.pop()",
        "backtrack(0)",
        "return result"
      ]),
      typescript: ts("subsetsLexicographic", "nums: number[]", "number[][]", [
        "const ordered = [...nums].sort((a, b) => a - b);",
        "const result: number[][] = [];",
        "const path: number[] = [];",
        "const backtrack = (start: number) => {",
        "  result.push([...path]);",
        "  for (let index = start; index < ordered.length; index += 1) {",
        "    path.push(ordered[index]);",
        "    backtrack(index + 1);",
        "    path.pop();",
        "  }",
        "};",
        "backtrack(0);",
        "return result;"
      ]),
      go: go("SubsetsLexicographic", "nums []int", "[][]int", [
        "ordered := append([]int{}, nums...)",
        "sort.Ints(ordered)",
        "result := [][]int{}",
        "path := []int{}",
        "var backtrack func(int)",
        "backtrack = func(start int) {",
        "\tcopyPath := append([]int{}, path...)",
        "\tresult = append(result, copyPath)",
        "\tfor index := start; index < len(ordered); index++ {",
        "\t\tpath = append(path, ordered[index])",
        "\t\tbacktrack(index + 1)",
        "\t\tpath = path[:len(path)-1]",
        "\t}",
        "}",
        "backtrack(0)",
        "return result"
      ], ["sort"]),
      scala: scala("subsetsLexicographic", "nums: Seq[Int]", "Seq[Seq[Int]]", [
        "val ordered = nums.sorted",
        "val result = scala.collection.mutable.ArrayBuffer.empty[Seq[Int]]",
        "val path = scala.collection.mutable.ArrayBuffer.empty[Int]",
        "def backtrack(start: Int): Unit = {",
        "  result.append(path.toSeq)",
        "  for (index <- start until ordered.length) {",
        "    path.append(ordered(index))",
        "    backtrack(index + 1)",
        "    path.remove(path.length - 1)",
        "  }",
        "}",
        "backtrack(0)",
        "result.toSeq"
      ])
    }
  },
  "unique-tile-sequence-count": {
    signature: { name: "uniqueTileSequenceCount", inputs: [{ name: "tiles", type: stringType() }], output: numberType() },
    languages: {
      python: py("unique_tile_sequence_count", "tiles: str", "int", [
        "counts = {}",
        "for tile in tiles:",
        "    counts[tile] = counts.get(tile, 0) + 1",
        "letters = sorted(counts)",
        "def dfs():",
        "    total = 0",
        "    for letter in letters:",
        "        if counts[letter] == 0:",
        "            continue",
        "        counts[letter] -= 1",
        "        total += 1 + dfs()",
        "        counts[letter] += 1",
        "    return total",
        "return dfs()"
      ]),
      typescript: ts("uniqueTileSequenceCount", "tiles: string", "number", [
        "const counts = new Map<string, number>();",
        "for (const tile of tiles) counts.set(tile, (counts.get(tile) ?? 0) + 1);",
        "const letters = [...counts.keys()].sort();",
        "const dfs = (): number => {",
        "  let total = 0;",
        "  for (const letter of letters) {",
        "    const count = counts.get(letter) ?? 0;",
        "    if (count === 0) continue;",
        "    counts.set(letter, count - 1);",
        "    total += 1 + dfs();",
        "    counts.set(letter, count);",
        "  }",
        "  return total;",
        "};",
        "return dfs();"
      ]),
      go: go("UniqueTileSequenceCount", "tiles string", "int", [
        "counts := map[rune]int{}",
        "for _, tile := range tiles { counts[tile]++ }",
        "letters := []rune{}",
        "for letter := range counts { letters = append(letters, letter) }",
        "sort.Slice(letters, func(i int, j int) bool { return letters[i] < letters[j] })",
        "var dfs func() int",
        "dfs = func() int {",
        "\ttotal := 0",
        "\tfor _, letter := range letters {",
        "\t\tif counts[letter] == 0 { continue }",
        "\t\tcounts[letter]--",
        "\t\ttotal += 1 + dfs()",
        "\t\tcounts[letter]++",
        "\t}",
        "\treturn total",
        "}",
        "return dfs()"
      ], ["sort"]),
      scala: scala("uniqueTileSequenceCount", "tiles: String", "Int", [
        "val counts = scala.collection.mutable.Map.empty[Char, Int].withDefaultValue(0)",
        "for (tile <- tiles) counts(tile) += 1",
        "val letters = counts.keys.toSeq.sorted",
        "def dfs(): Int = {",
        "  var total = 0",
        "  for (letter <- letters if counts(letter) > 0) {",
        "    counts(letter) -= 1",
        "    total += 1 + dfs()",
        "    counts(letter) += 1",
        "  }",
        "  total",
        "}",
        "dfs()"
      ])
    }
  },
  "combination-sum-exact-local": {
    signature: { name: "combinationSumExactLocal", inputs: [{ name: "nums", type: numberArray() }, { name: "target", type: numberType() }], output: numberMatrix() },
    languages: {
      python: py("combination_sum_exact_local", "nums: list[int], target: int", "list[list[int]]", [
        "ordered = sorted(nums)",
        "result = []",
        "path = []",
        "def backtrack(start, remaining):",
        "    if remaining == 0:",
        "        result.append(list(path))",
        "        return",
        "    previous = None",
        "    for index in range(start, len(ordered)):",
        "        value = ordered[index]",
        "        if previous is not None and value == previous:",
        "            continue",
        "        if value > remaining:",
        "            break",
        "        path.append(value)",
        "        backtrack(index + 1, remaining - value)",
        "        path.pop()",
        "        previous = value",
        "backtrack(0, target)",
        "return result"
      ]),
      typescript: ts("combinationSumExactLocal", "nums: number[], target: number", "number[][]", [
        "const ordered = [...nums].sort((a, b) => a - b);",
        "const result: number[][] = [];",
        "const path: number[] = [];",
        "const backtrack = (start: number, remaining: number) => {",
        "  if (remaining === 0) {",
        "    result.push([...path]);",
        "    return;",
        "  }",
        "  let previous: number | undefined;",
        "  for (let index = start; index < ordered.length; index += 1) {",
        "    const value = ordered[index];",
        "    if (previous !== undefined && value === previous) continue;",
        "    if (value > remaining) break;",
        "    path.push(value);",
        "    backtrack(index + 1, remaining - value);",
        "    path.pop();",
        "    previous = value;",
        "  }",
        "};",
        "backtrack(0, target);",
        "return result;"
      ]),
      go: go("CombinationSumExactLocal", "nums []int, target int", "[][]int", [
        "ordered := append([]int{}, nums...)",
        "sort.Ints(ordered)",
        "result := [][]int{}",
        "path := []int{}",
        "var backtrack func(int, int)",
        "backtrack = func(start int, remaining int) {",
        "\tif remaining == 0 { result = append(result, append([]int{}, path...)); return }",
        "\tpreviousSet := false",
        "\tprevious := 0",
        "\tfor index := start; index < len(ordered); index++ {",
        "\t\tvalue := ordered[index]",
        "\t\tif previousSet && value == previous { continue }",
        "\t\tif value > remaining { break }",
        "\t\tpath = append(path, value)",
        "\t\tbacktrack(index + 1, remaining - value)",
        "\t\tpath = path[:len(path)-1]",
        "\t\tpreviousSet = true; previous = value",
        "\t}",
        "}",
        "backtrack(0, target)",
        "return result"
      ], ["sort"]),
      scala: scala("combinationSumExactLocal", "nums: Seq[Int], target: Int", "Seq[Seq[Int]]", [
        "val ordered = nums.sorted",
        "val result = scala.collection.mutable.ArrayBuffer.empty[Seq[Int]]",
        "val path = scala.collection.mutable.ArrayBuffer.empty[Int]",
        "def backtrack(start: Int, remaining: Int): Unit = {",
        "  if (remaining == 0) { result.append(path.toSeq); return }",
        "  var previous: Option[Int] = None",
        "  for (index <- start until ordered.length) {",
        "    val value = ordered(index)",
        "    if (!previous.contains(value) && value <= remaining) {",
        "      path.append(value)",
        "      backtrack(index + 1, remaining - value)",
        "      path.remove(path.length - 1)",
        "    }",
        "    previous = Some(value)",
        "  }",
        "}",
        "backtrack(0, target)",
        "result.toSeq"
      ])
    }
  },
  "generate-parentheses-local": {
    signature: { name: "generateParenthesesLocal", inputs: [{ name: "n", type: numberType() }], output: stringArray() },
    languages: {
      python: py("generate_parentheses_local", "n: int", "list[str]", [
        "result = []",
        "path = []",
        "def backtrack(opened, closed):",
        "    if len(path) == 2 * n:",
        "        result.append(''.join(path))",
        "        return",
        "    if opened < n:",
        "        path.append('(')",
        "        backtrack(opened + 1, closed)",
        "        path.pop()",
        "    if closed < opened:",
        "        path.append(')')",
        "        backtrack(opened, closed + 1)",
        "        path.pop()",
        "backtrack(0, 0)",
        "return result"
      ]),
      typescript: ts("generateParenthesesLocal", "n: number", "string[]", [
        "const result: string[] = [];",
        "const path: string[] = [];",
        "const backtrack = (opened: number, closed: number) => {",
        "  if (path.length === 2 * n) {",
        "    result.push(path.join(\"\"));",
        "    return;",
        "  }",
        "  if (opened < n) {",
        "    path.push(\"(\");",
        "    backtrack(opened + 1, closed);",
        "    path.pop();",
        "  }",
        "  if (closed < opened) {",
        "    path.push(\")\");",
        "    backtrack(opened, closed + 1);",
        "    path.pop();",
        "  }",
        "};",
        "backtrack(0, 0);",
        "return result;"
      ]),
      go: go("GenerateParenthesesLocal", "n int", "[]string", [
        "result := []string{}",
        "path := []byte{}",
        "var backtrack func(int, int)",
        "backtrack = func(opened int, closed int) {",
        "\tif len(path) == 2*n { result = append(result, string(path)); return }",
        "\tif opened < n { path = append(path, '('); backtrack(opened+1, closed); path = path[:len(path)-1] }",
        "\tif closed < opened { path = append(path, ')'); backtrack(opened, closed+1); path = path[:len(path)-1] }",
        "}",
        "backtrack(0, 0)",
        "return result"
      ]),
      scala: scala("generateParenthesesLocal", "n: Int", "Seq[String]", [
        "val result = scala.collection.mutable.ArrayBuffer.empty[String]",
        "val path = new StringBuilder",
        "def backtrack(opened: Int, closed: Int): Unit = {",
        "  if (path.length == 2 * n) { result.append(path.toString); return }",
        "  if (opened < n) { path.append('('); backtrack(opened + 1, closed); path.deleteCharAt(path.length - 1) }",
        "  if (closed < opened) { path.append(')'); backtrack(opened, closed + 1); path.deleteCharAt(path.length - 1) }",
        "}",
        "backtrack(0, 0)",
        "result.toSeq"
      ])
    }
  },
  "word-path-exists-local": {
    signature: { name: "wordPathExistsLocal", inputs: [{ name: "board", type: stringMatrix() }, { name: "word", type: stringType() }], output: booleanType() },
    languages: {
      python: py("word_path_exists_local", "board: list[list[str]], word: str", "bool", [
        "if word == '':",
        "    return True",
        "if not board or not board[0]:",
        "    return False",
        "rows, cols = len(board), len(board[0])",
        "if len(word) > rows * cols:",
        "    return False",
        "visited = [[False] * cols for _ in range(rows)]",
        "def dfs(row, col, index):",
        "    if index == len(word):",
        "        return True",
        "    if row < 0 or row >= rows or col < 0 or col >= cols:",
        "        return False",
        "    if visited[row][col] or board[row][col] != word[index]:",
        "        return False",
        "    visited[row][col] = True",
        "    found = dfs(row + 1, col, index + 1) or dfs(row - 1, col, index + 1) or dfs(row, col + 1, index + 1) or dfs(row, col - 1, index + 1)",
        "    visited[row][col] = False",
        "    return found",
        "for row in range(rows):",
        "    for col in range(cols):",
        "        if dfs(row, col, 0):",
        "            return True",
        "return False"
      ]),
      typescript: ts("wordPathExistsLocal", "board: string[][], word: string", "boolean", [
        "if (word.length === 0) return true;",
        "if (board.length === 0 || board[0].length === 0) return false;",
        "const rows = board.length;",
        "const cols = board[0].length;",
        "if (word.length > rows * cols) return false;",
        "const visited = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));",
        "const dfs = (row: number, col: number, index: number): boolean => {",
        "  if (index === word.length) return true;",
        "  if (row < 0 || row >= rows || col < 0 || col >= cols) return false;",
        "  if (visited[row][col] || board[row][col] !== word[index]) return false;",
        "  visited[row][col] = true;",
        "  const found = dfs(row + 1, col, index + 1) || dfs(row - 1, col, index + 1) || dfs(row, col + 1, index + 1) || dfs(row, col - 1, index + 1);",
        "  visited[row][col] = false;",
        "  return found;",
        "};",
        "for (let row = 0; row < rows; row += 1) {",
        "  for (let col = 0; col < cols; col += 1) {",
        "    if (dfs(row, col, 0)) return true;",
        "  }",
        "}",
        "return false;"
      ]),
      go: go("WordPathExistsLocal", "board [][]string, word string", "bool", [
        "if len(word) == 0 { return true }",
        "if len(board) == 0 || len(board[0]) == 0 { return false }",
        "rows, cols := len(board), len(board[0])",
        "if len(word) > rows*cols { return false }",
        "visited := make([][]bool, rows)",
        "for row := range visited { visited[row] = make([]bool, cols) }",
        "var dfs func(int, int, int) bool",
        "dfs = func(row int, col int, index int) bool {",
        "\tif index == len(word) { return true }",
        "\tif row < 0 || row >= rows || col < 0 || col >= cols { return false }",
        "\tif visited[row][col] || board[row][col] != string(word[index]) { return false }",
        "\tvisited[row][col] = true",
        "\tfound := dfs(row+1, col, index+1) || dfs(row-1, col, index+1) || dfs(row, col+1, index+1) || dfs(row, col-1, index+1)",
        "\tvisited[row][col] = false",
        "\treturn found",
        "}",
        "for row := 0; row < rows; row++ { for col := 0; col < cols; col++ { if dfs(row, col, 0) { return true } } }",
        "return false"
      ]),
      scala: scala("wordPathExistsLocal", "board: Seq[Seq[String]], word: String", "Boolean", [
        "if (word.isEmpty) return true",
        "if (board.isEmpty || board.head.isEmpty) return false",
        "val rows = board.length; val cols = board.head.length",
        "if (word.length > rows * cols) return false",
        "val visited = Array.fill(rows, cols)(false)",
        "def dfs(row: Int, col: Int, index: Int): Boolean = {",
        "  if (index == word.length) return true",
        "  if (row < 0 || row >= rows || col < 0 || col >= cols) return false",
        "  if (visited(row)(col) || board(row)(col) != word(index).toString) return false",
        "  visited(row)(col) = true",
        "  val found = dfs(row + 1, col, index + 1) || dfs(row - 1, col, index + 1) || dfs(row, col + 1, index + 1) || dfs(row, col - 1, index + 1)",
        "  visited(row)(col) = false",
        "  found",
        "}",
        "board.indices.exists(row => board(row).indices.exists(col => dfs(row, col, 0)))"
      ])
    }
  },
  "backtracking-bonus-01": subsetsOfSize(),
  "backtracking-bonus-02": letterCaseCombinations(),
  "backtracking-bonus-03": distinctPermutations(),
  "backtracking-bonus-04": canPartitionKSubsets(),
  "backtracking-bonus-05": countGridPaths(),
  "backtracking-bonus-06": restoreIpAddresses(),
  "backtracking-bonus-07": countNQueens(),
  "backtracking-bonus-08": keypadLetterWords(),
  "backtracking-bonus-09": countLatinCompletions(),
  "backtracking-bonus-10": countSignAssignments()
};

function subsetsOfSize(): CuratedProblem {
  return {
    signature: { name: "subsetsOfSize", inputs: [{ name: "nums", type: numberArray() }, { name: "k", type: numberType() }], output: numberMatrix() },
    languages: {
      python: py("subsets_of_size", "nums: list[int], k: int", "list[list[int]]", [
        "result = []",
        "chosen = []",
        "def backtrack(start):",
        "    if len(chosen) == k:",
        "        result.append(list(chosen))",
        "        return",
        "    for index in range(start, len(nums)):",
        "        chosen.append(nums[index])",
        "        backtrack(index + 1)",
        "        chosen.pop()",
        "if 0 <= k <= len(nums):",
        "    backtrack(0)",
        "return sorted(result)"
      ]),
      typescript: ts("subsetsOfSize", "nums: number[], k: number", "number[][]", [
        "const result: number[][] = [];",
        "const chosen: number[] = [];",
        "const backtrack = (start: number) => {",
        "  if (chosen.length === k) {",
        "    result.push([...chosen]);",
        "    return;",
        "  }",
        "  for (let index = start; index < nums.length; index += 1) {",
        "    chosen.push(nums[index]);",
        "    backtrack(index + 1);",
        "    chosen.pop();",
        "  }",
        "};",
        "if (k >= 0 && k <= nums.length) backtrack(0);",
        "result.sort(compareNumberArrays);",
        "return result;"
      ], [compareNumberArraysTs()]),
      go: go("SubsetsOfSize", "nums []int, k int", "[][]int", [
        "result := [][]int{}",
        "chosen := []int{}",
        "var backtrack func(int)",
        "backtrack = func(start int) {",
        "\tif len(chosen) == k { result = append(result, append([]int{}, chosen...)); return }",
        "\tfor index := start; index < len(nums); index++ { chosen = append(chosen, nums[index]); backtrack(index+1); chosen = chosen[:len(chosen)-1] }",
        "}",
        "if k >= 0 && k <= len(nums) { backtrack(0) }",
        "sort.Slice(result, func(i int, j int) bool { return compareIntSlices(result[i], result[j]) < 0 })",
        "return result"
      ], ["sort"], [goCompareSlices()]),
      scala: scala("subsetsOfSize", "nums: Seq[Int], k: Int", "Seq[Seq[Int]]", [
        "val result = scala.collection.mutable.ArrayBuffer.empty[Seq[Int]]",
        "val chosen = scala.collection.mutable.ArrayBuffer.empty[Int]",
        "def backtrack(start: Int): Unit = {",
        "  if (chosen.length == k) { result.append(chosen.toSeq); return }",
        "  for (index <- start until nums.length) { chosen.append(nums(index)); backtrack(index + 1); chosen.remove(chosen.length - 1) }",
        "}",
        "if (k >= 0 && k <= nums.length) backtrack(0)",
        "result.toSeq.sortWith(compareSeq)"
      ], [scalaCompareSeq()])
    }
  };
}

function letterCaseCombinations(): CuratedProblem {
  return unaryStringArray("letterCaseCombinations", "letter_case_combinations", "LetterCaseCombinations", "text", [
    "const result: string[] = [];",
    "const chars: string[] = [];",
    "const backtrack = (index: number) => {",
    "  if (index === text.length) { result.push(chars.join(\"\")); return; }",
    "  const ch = text[index];",
    "  if (/^[A-Za-z]$/.test(ch)) {",
    "    chars.push(ch.toLowerCase());",
    "    backtrack(index + 1);",
    "    chars.pop();",
    "    chars.push(ch.toUpperCase());",
    "    backtrack(index + 1);",
    "    chars.pop();",
    "  } else {",
    "    chars.push(ch);",
    "    backtrack(index + 1);",
    "    chars.pop();",
    "  }",
    "};",
    "backtrack(0);",
    "return result.sort();"
  ], [
    "result = []",
    "chars = []",
    "def backtrack(index):",
    "    if index == len(text):",
    "        result.append(''.join(chars))",
    "        return",
    "    ch = text[index]",
    "    if ch.isalpha():",
    "        chars.append(ch.lower())",
    "        backtrack(index + 1)",
    "        chars.pop()",
    "        chars.append(ch.upper())",
    "        backtrack(index + 1)",
    "        chars.pop()",
    "    else:",
    "        chars.append(ch)",
    "        backtrack(index + 1)",
    "        chars.pop()",
    "backtrack(0)",
    "return sorted(result)"
  ], [
    "result := []string{}",
    "chars := []rune{}",
    "var backtrack func(int)",
    "backtrack = func(index int) {",
    "\tif index == len([]rune(text)) { result = append(result, string(chars)); return }",
    "\trunes := []rune(text)",
    "\tch := runes[index]",
    "\tif isAsciiLetter(ch) { chars = append(chars, toLowerAscii(ch)); backtrack(index+1); chars = chars[:len(chars)-1]; chars = append(chars, toUpperAscii(ch)); backtrack(index+1); chars = chars[:len(chars)-1] } else { chars = append(chars, ch); backtrack(index+1); chars = chars[:len(chars)-1] }",
    "}",
    "backtrack(0)",
    "sort.Strings(result)",
    "return result"
  ], [
    "val result = scala.collection.mutable.ArrayBuffer.empty[String]",
    "val chars = scala.collection.mutable.ArrayBuffer.empty[Char]",
    "def backtrack(index: Int): Unit = {",
    "  if (index == text.length) { result.append(chars.mkString); return }",
    "  val ch = text(index)",
    "  if (ch.isLetter) { chars.append(ch.toLower); backtrack(index + 1); chars.remove(chars.length - 1); chars.append(ch.toUpper); backtrack(index + 1); chars.remove(chars.length - 1) }",
    "  else { chars.append(ch); backtrack(index + 1); chars.remove(chars.length - 1) }",
    "}",
    "backtrack(0)",
    "result.toSeq.sorted"
  ], [goAsciiHelpers()], ["sort"]);
}

function distinctPermutations(): CuratedProblem {
  return unaryNumberMatrix("distinctPermutations", "distinct_permutations", "DistinctPermutations", "nums", [
    "const ordered = [...nums].sort((a, b) => a - b);",
    "const result: number[][] = [];",
    "const used = new Array<boolean>(ordered.length).fill(false);",
    "const current: number[] = [];",
    "const backtrack = () => {",
    "  if (current.length === ordered.length) { result.push([...current]); return; }",
    "  for (let index = 0; index < ordered.length; index += 1) {",
    "    if (used[index]) continue;",
    "    if (index > 0 && ordered[index] === ordered[index - 1] && !used[index - 1]) continue;",
    "    used[index] = true;",
    "    current.push(ordered[index]);",
    "    backtrack();",
    "    current.pop();",
    "    used[index] = false;",
    "  }",
    "};",
    "backtrack();",
    "return result;"
  ], [
    "ordered = sorted(nums)",
    "result = []",
    "used = [False] * len(ordered)",
    "current = []",
    "def backtrack():",
    "    if len(current) == len(ordered):",
    "        result.append(list(current))",
    "        return",
    "    for index in range(len(ordered)):",
    "        if used[index]:",
    "            continue",
    "        if index > 0 and ordered[index] == ordered[index - 1] and not used[index - 1]:",
    "            continue",
    "        used[index] = True",
    "        current.append(ordered[index])",
    "        backtrack()",
    "        current.pop()",
    "        used[index] = False",
    "backtrack()",
    "return result"
  ], [
    "ordered := append([]int{}, nums...)",
    "sort.Ints(ordered)",
    "result := [][]int{}",
    "used := make([]bool, len(ordered))",
    "current := []int{}",
    "var backtrack func()",
    "backtrack = func() {",
    "\tif len(current) == len(ordered) { result = append(result, append([]int{}, current...)); return }",
    "\tfor index := 0; index < len(ordered); index++ {",
    "\t\tif used[index] { continue }",
    "\t\tif index > 0 && ordered[index] == ordered[index-1] && !used[index-1] { continue }",
    "\t\tused[index] = true; current = append(current, ordered[index]); backtrack(); current = current[:len(current)-1]; used[index] = false",
    "\t}",
    "}",
    "backtrack()",
    "return result"
  ], [
    "val ordered = nums.sorted",
    "val result = scala.collection.mutable.ArrayBuffer.empty[Seq[Int]]",
    "val used = Array.fill(ordered.length)(false)",
    "val current = scala.collection.mutable.ArrayBuffer.empty[Int]",
    "def backtrack(): Unit = {",
    "  if (current.length == ordered.length) { result.append(current.toSeq); return }",
    "  for (index <- ordered.indices) if (!used(index) && !(index > 0 && ordered(index) == ordered(index - 1) && !used(index - 1))) {",
    "    used(index) = true; current.append(ordered(index)); backtrack(); current.remove(current.length - 1); used(index) = false",
    "  }",
    "}",
    "backtrack()",
    "result.toSeq"
  ], ["sort"]);
}

function canPartitionKSubsets(): CuratedProblem {
  return twoArgBoolean("canPartitionKSubsets", "can_partition_k_subsets", "CanPartitionKSubsets", "nums", "k", [
    "const total = nums.reduce((sum, num) => sum + num, 0);",
    "if (k <= 0 || total % k !== 0) return false;",
    "const target = total / k;",
    "const ordered = [...nums].sort((a, b) => b - a);",
    "if (ordered.length > 0 && ordered[0] > target) return false;",
    "const buckets = new Array<number>(k).fill(0);",
    "const backtrack = (index: number): boolean => {",
    "  if (index === ordered.length) return true;",
    "  const seen = new Set<number>();",
    "  for (let bucket = 0; bucket < k; bucket += 1) {",
    "    if (seen.has(buckets[bucket])) continue;",
    "    if (buckets[bucket] + ordered[index] <= target) {",
    "      seen.add(buckets[bucket]);",
    "      buckets[bucket] += ordered[index];",
    "      if (backtrack(index + 1)) return true;",
    "      buckets[bucket] -= ordered[index];",
    "    }",
    "    if (buckets[bucket] === 0) break;",
    "  }",
    "  return false;",
    "};",
    "return backtrack(0);"
  ], [
    "total = sum(nums)",
    "if k <= 0 or total % k != 0:",
    "    return False",
    "target = total // k",
    "ordered = sorted(nums, reverse=True)",
    "if ordered and ordered[0] > target:",
    "    return False",
    "buckets = [0] * k",
    "def backtrack(index):",
    "    if index == len(ordered):",
    "        return True",
    "    seen = set()",
    "    for bucket in range(k):",
    "        if buckets[bucket] in seen:",
    "            continue",
    "        if buckets[bucket] + ordered[index] <= target:",
    "            seen.add(buckets[bucket])",
    "            buckets[bucket] += ordered[index]",
    "            if backtrack(index + 1):",
    "                return True",
    "            buckets[bucket] -= ordered[index]",
    "        if buckets[bucket] == 0:",
    "            break",
    "    return False",
    "return backtrack(0)"
  ], [
    "total := 0",
    "for _, num := range nums { total += num }",
    "if k <= 0 || total%k != 0 { return false }",
    "target := total / k",
    "ordered := append([]int{}, nums...)",
    "sort.Sort(sort.Reverse(sort.IntSlice(ordered)))",
    "if len(ordered) > 0 && ordered[0] > target { return false }",
    "buckets := make([]int, k)",
    "var backtrack func(int) bool",
    "backtrack = func(index int) bool {",
    "\tif index == len(ordered) { return true }",
    "\tseen := map[int]bool{}",
    "\tfor bucket := 0; bucket < k; bucket++ {",
    "\t\tif seen[buckets[bucket]] { continue }",
    "\t\tif buckets[bucket] + ordered[index] <= target { seen[buckets[bucket]] = true; buckets[bucket] += ordered[index]; if backtrack(index+1) { return true }; buckets[bucket] -= ordered[index] }",
    "\t\tif buckets[bucket] == 0 { break }",
    "\t}",
    "\treturn false",
    "}",
    "return backtrack(0)"
  ], [
    "val total = nums.sum",
    "if (k <= 0 || total % k != 0) return false",
    "val target = total / k",
    "val ordered = nums.sorted(Ordering.Int.reverse)",
    "if (ordered.nonEmpty && ordered.head > target) return false",
    "val buckets = Array.fill(k)(0)",
    "def backtrack(index: Int): Boolean = {",
    "  if (index == ordered.length) return true",
    "  val seen = scala.collection.mutable.Set.empty[Int]",
    "  for (bucket <- 0 until k) {",
    "    if (!seen.contains(buckets(bucket)) && buckets(bucket) + ordered(index) <= target) {",
    "      seen.add(buckets(bucket)); buckets(bucket) += ordered(index)",
    "      if (backtrack(index + 1)) return true",
    "      buckets(bucket) -= ordered(index)",
    "    }",
    "    if (buckets(bucket) == 0) return false",
    "  }",
    "  false",
    "}",
    "backtrack(0)"
  ], ["sort"]);
}

function countGridPaths(): CuratedProblem {
  return unaryGridNumber("countGridPaths", "count_grid_paths", "CountGridPaths", "grid", [
    "if (grid.length === 0 || grid[0].length === 0) return 0;",
    "const rows = grid.length;",
    "const cols = grid[0].length;",
    "if (grid[0][0] === 1 || grid[rows - 1][cols - 1] === 1) return 0;",
    "const visited = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));",
    "let count = 0;",
    "const backtrack = (row: number, col: number) => {",
    "  if (row === rows - 1 && col === cols - 1) { count += 1; return; }",
    "  for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {",
    "    const nr = row + dr;",
    "    const nc = col + dc;",
    "    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc] && grid[nr][nc] === 0) {",
    "      visited[nr][nc] = true;",
    "      backtrack(nr, nc);",
    "      visited[nr][nc] = false;",
    "    }",
    "  }",
    "};",
    "visited[0][0] = true;",
    "backtrack(0, 0);",
    "return count;"
  ], [
    "if not grid or not grid[0]:",
    "    return 0",
    "rows, cols = len(grid), len(grid[0])",
    "if grid[0][0] == 1 or grid[rows - 1][cols - 1] == 1:",
    "    return 0",
    "visited = [[False] * cols for _ in range(rows)]",
    "count = 0",
    "def backtrack(row, col):",
    "    nonlocal count",
    "    if row == rows - 1 and col == cols - 1:",
    "        count += 1",
    "        return",
    "    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):",
    "        nr, nc = row + dr, col + dc",
    "        if 0 <= nr < rows and 0 <= nc < cols and not visited[nr][nc] and grid[nr][nc] == 0:",
    "            visited[nr][nc] = True",
    "            backtrack(nr, nc)",
    "            visited[nr][nc] = False",
    "visited[0][0] = True",
    "backtrack(0, 0)",
    "return count"
  ], [
    "if len(grid) == 0 || len(grid[0]) == 0 { return 0 }",
    "rows, cols := len(grid), len(grid[0])",
    "if grid[0][0] == 1 || grid[rows-1][cols-1] == 1 { return 0 }",
    "visited := make([][]bool, rows)",
    "for row := range visited { visited[row] = make([]bool, cols) }",
    "count := 0",
    "dirs := [][]int{{1,0},{-1,0},{0,1},{0,-1}}",
    "var backtrack func(int, int)",
    "backtrack = func(row int, col int) {",
    "\tif row == rows-1 && col == cols-1 { count++; return }",
    "\tfor _, dir := range dirs { nr, nc := row+dir[0], col+dir[1]; if nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc] && grid[nr][nc] == 0 { visited[nr][nc] = true; backtrack(nr, nc); visited[nr][nc] = false } }",
    "}",
    "visited[0][0] = true",
    "backtrack(0, 0)",
    "return count"
  ], [
    "if (grid.isEmpty || grid.head.isEmpty) return 0",
    "val rows = grid.length; val cols = grid.head.length",
    "if (grid.head.head == 1 || grid(rows - 1)(cols - 1) == 1) return 0",
    "val visited = Array.fill(rows, cols)(false)",
    "var count = 0",
    "val dirs = Seq((1, 0), (-1, 0), (0, 1), (0, -1))",
    "def backtrack(row: Int, col: Int): Unit = {",
    "  if (row == rows - 1 && col == cols - 1) { count += 1; return }",
    "  for ((dr, dc) <- dirs) { val nr = row + dr; val nc = col + dc; if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited(nr)(nc) && grid(nr)(nc) == 0) { visited(nr)(nc) = true; backtrack(nr, nc); visited(nr)(nc) = false } }",
    "}",
    "visited(0)(0) = true",
    "backtrack(0, 0)",
    "count"
  ]);
}

function restoreIpAddresses(): CuratedProblem {
  return unaryStringArray("restoreIpAddresses", "restore_ip_addresses", "RestoreIpAddresses", "digits", [
    "if (!/^\\d+$/.test(digits)) return [];",
    "const result: string[] = [];",
    "const parts: string[] = [];",
    "const valid = (segment: string) => {",
    "  if (segment.length > 1 && segment[0] === \"0\") return false;",
    "  const value = Number(segment);",
    "  return value >= 0 && value <= 255;",
    "};",
    "const backtrack = (start: number) => {",
    "  if (parts.length === 4) {",
    "    if (start === digits.length) result.push(parts.join(\".\"));",
    "    return;",
    "  }",
    "  for (let length = 1; length <= 3; length += 1) {",
    "    if (start + length > digits.length) break;",
    "    const segment = digits.slice(start, start + length);",
    "    if (valid(segment)) {",
    "      parts.push(segment);",
    "      backtrack(start + length);",
    "      parts.pop();",
    "    }",
    "  }",
    "};",
    "backtrack(0);",
    "return result.sort();"
  ], [
    "result = []",
    "parts = []",
    "def valid(segment):",
    "    if len(segment) > 1 and segment[0] == '0':",
    "        return False",
    "    return 0 <= int(segment) <= 255",
    "def backtrack(start):",
    "    if len(parts) == 4:",
    "        if start == len(digits):",
    "            result.append('.'.join(parts))",
    "        return",
    "    for length in (1, 2, 3):",
    "        if start + length > len(digits):",
    "            break",
    "        segment = digits[start:start + length]",
    "        if valid(segment):",
    "            parts.append(segment)",
    "            backtrack(start + length)",
    "            parts.pop()",
    "if digits.isdigit():",
    "    backtrack(0)",
    "return sorted(result)"
  ], [
    "if len(digits) == 0 || !allDigits(digits) { return []string{} }",
    "result := []string{}",
    "parts := []string{}",
    "valid := func(segment string) bool { if len(segment) > 1 && segment[0] == '0' { return false }; value := atoi(segment); return value >= 0 && value <= 255 }",
    "var backtrack func(int)",
    "backtrack = func(start int) {",
    "\tif len(parts) == 4 { if start == len(digits) { result = append(result, strings.Join(parts, \".\")) }; return }",
    "\tfor length := 1; length <= 3; length++ { if start+length > len(digits) { break }; segment := digits[start:start+length]; if valid(segment) { parts = append(parts, segment); backtrack(start+length); parts = parts[:len(parts)-1] } }",
    "}",
    "backtrack(0)",
    "sort.Strings(result)",
    "return result"
  ], [
    "if (digits.isEmpty || !digits.forall(_.isDigit)) return Seq.empty",
    "val result = scala.collection.mutable.ArrayBuffer.empty[String]",
    "val parts = scala.collection.mutable.ArrayBuffer.empty[String]",
    "def valid(segment: String): Boolean = !(segment.length > 1 && segment.head == '0') && segment.toInt >= 0 && segment.toInt <= 255",
    "def backtrack(start: Int): Unit = {",
    "  if (parts.length == 4) { if (start == digits.length) result.append(parts.mkString(\".\")); return }",
    "  for (length <- 1 to 3 if start + length <= digits.length) { val segment = digits.substring(start, start + length); if (valid(segment)) { parts.append(segment); backtrack(start + length); parts.remove(parts.length - 1) } }",
    "}",
    "backtrack(0)",
    "result.toSeq.sorted"
  ], [goAtoiHelpers()], ["sort", "strings"]);
}

function countNQueens(): CuratedProblem {
  return unaryNumber("countNQueens", "count_n_queens", "CountNQueens", "n", [
    "if (n <= 0) return 0;",
    "const cols = new Set<number>();",
    "const diag1 = new Set<number>();",
    "const diag2 = new Set<number>();",
    "let count = 0;",
    "const backtrack = (row: number) => {",
    "  if (row === n) { count += 1; return; }",
    "  for (let col = 0; col < n; col += 1) {",
    "    if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;",
    "    cols.add(col); diag1.add(row - col); diag2.add(row + col);",
    "    backtrack(row + 1);",
    "    cols.delete(col); diag1.delete(row - col); diag2.delete(row + col);",
    "  }",
    "};",
    "backtrack(0);",
    "return count;"
  ], [
    "if n <= 0:",
    "    return 0",
    "cols = set()",
    "diag1 = set()",
    "diag2 = set()",
    "count = 0",
    "def backtrack(row):",
    "    nonlocal count",
    "    if row == n:",
    "        count += 1",
    "        return",
    "    for col in range(n):",
    "        if col in cols or row - col in diag1 or row + col in diag2:",
    "            continue",
    "        cols.add(col); diag1.add(row - col); diag2.add(row + col)",
    "        backtrack(row + 1)",
    "        cols.remove(col); diag1.remove(row - col); diag2.remove(row + col)",
    "backtrack(0)",
    "return count"
  ], [
    "if n <= 0 { return 0 }",
    "cols := map[int]bool{}",
    "diag1 := map[int]bool{}",
    "diag2 := map[int]bool{}",
    "count := 0",
    "var backtrack func(int)",
    "backtrack = func(row int) {",
    "\tif row == n { count++; return }",
    "\tfor col := 0; col < n; col++ { if cols[col] || diag1[row-col] || diag2[row+col] { continue }; cols[col] = true; diag1[row-col] = true; diag2[row+col] = true; backtrack(row+1); delete(cols, col); delete(diag1, row-col); delete(diag2, row+col) }",
    "}",
    "backtrack(0)",
    "return count"
  ], [
    "if (n <= 0) return 0",
    "val cols = scala.collection.mutable.Set.empty[Int]",
    "val diag1 = scala.collection.mutable.Set.empty[Int]",
    "val diag2 = scala.collection.mutable.Set.empty[Int]",
    "var count = 0",
    "def backtrack(row: Int): Unit = {",
    "  if (row == n) { count += 1; return }",
    "  for (col <- 0 until n if !cols(col) && !diag1(row - col) && !diag2(row + col)) { cols.add(col); diag1.add(row - col); diag2.add(row + col); backtrack(row + 1); cols.remove(col); diag1.remove(row - col); diag2.remove(row + col) }",
    "}",
    "backtrack(0)",
    "count"
  ]);
}

function keypadLetterWords(): CuratedProblem {
  return unaryStringArray("keypadLetterWords", "keypad_letter_words", "KeypadLetterWords", "digits", [
    "const mapping: Record<string, string> = { \"2\": \"abc\", \"3\": \"def\", \"4\": \"ghi\", \"5\": \"jkl\", \"6\": \"mno\", \"7\": \"pqrs\", \"8\": \"tuv\", \"9\": \"wxyz\" };",
    "if (digits.length === 0 || [...digits].some((digit) => !mapping[digit])) return [];",
    "const result: string[] = [];",
    "const letters: string[] = [];",
    "const backtrack = (index: number) => {",
    "  if (index === digits.length) { result.push(letters.join(\"\")); return; }",
    "  for (const letter of mapping[digits[index]]) {",
    "    letters.push(letter);",
    "    backtrack(index + 1);",
    "    letters.pop();",
    "  }",
    "};",
    "backtrack(0);",
    "return result.sort();"
  ], [
    "mapping = {'2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'}",
    "if not digits or any(digit not in mapping for digit in digits):",
    "    return []",
    "result = []",
    "letters = []",
    "def backtrack(index):",
    "    if index == len(digits):",
    "        result.append(''.join(letters))",
    "        return",
    "    for letter in mapping[digits[index]]:",
    "        letters.append(letter)",
    "        backtrack(index + 1)",
    "        letters.pop()",
    "backtrack(0)",
    "return sorted(result)"
  ], [
    "mapping := map[byte]string{'2': \"abc\", '3': \"def\", '4': \"ghi\", '5': \"jkl\", '6': \"mno\", '7': \"pqrs\", '8': \"tuv\", '9': \"wxyz\"}",
    "if len(digits) == 0 { return []string{} }",
    "for index := 0; index < len(digits); index++ { if _, ok := mapping[digits[index]]; !ok { return []string{} } }",
    "result := []string{}",
    "letters := []byte{}",
    "var backtrack func(int)",
    "backtrack = func(index int) {",
    "\tif index == len(digits) { result = append(result, string(letters)); return }",
    "\tfor _, letter := range []byte(mapping[digits[index]]) { letters = append(letters, letter); backtrack(index+1); letters = letters[:len(letters)-1] }",
    "}",
    "backtrack(0)",
    "sort.Strings(result)",
    "return result"
  ], [
    "val mapping = Map('2' -> \"abc\", '3' -> \"def\", '4' -> \"ghi\", '5' -> \"jkl\", '6' -> \"mno\", '7' -> \"pqrs\", '8' -> \"tuv\", '9' -> \"wxyz\")",
    "if (digits.isEmpty || digits.exists(digit => !mapping.contains(digit))) return Seq.empty",
    "val result = scala.collection.mutable.ArrayBuffer.empty[String]",
    "val letters = scala.collection.mutable.ArrayBuffer.empty[Char]",
    "def backtrack(index: Int): Unit = {",
    "  if (index == digits.length) { result.append(letters.mkString); return }",
    "  for (letter <- mapping(digits(index))) { letters.append(letter); backtrack(index + 1); letters.remove(letters.length - 1) }",
    "}",
    "backtrack(0)",
    "result.toSeq.sorted"
  ], undefined, ["sort"]);
}

function countLatinCompletions(): CuratedProblem {
  return unaryGridNumber("countLatinCompletions", "count_latin_completions", "CountLatinCompletions", "grid", [
    "const n = grid.length;",
    "if (n === 0) return 0;",
    "for (const row of grid) if (row.length !== n) return 0;",
    "const rowsUsed = Array.from({ length: n }, () => new Set<number>());",
    "const colsUsed = Array.from({ length: n }, () => new Set<number>());",
    "const blanks: Array<[number, number]> = [];",
    "for (let row = 0; row < n; row += 1) {",
    "  for (let col = 0; col < n; col += 1) {",
    "    const value = grid[row][col];",
    "    if (value === 0) { blanks.push([row, col]); continue; }",
    "    if (value < 1 || value > n || rowsUsed[row].has(value) || colsUsed[col].has(value)) return 0;",
    "    rowsUsed[row].add(value);",
    "    colsUsed[col].add(value);",
    "  }",
    "}",
    "let count = 0;",
    "const backtrack = (index: number) => {",
    "  if (index === blanks.length) { count += 1; return; }",
    "  const [row, col] = blanks[index];",
    "  for (let value = 1; value <= n; value += 1) {",
    "    if (rowsUsed[row].has(value) || colsUsed[col].has(value)) continue;",
    "    rowsUsed[row].add(value); colsUsed[col].add(value);",
    "    backtrack(index + 1);",
    "    rowsUsed[row].delete(value); colsUsed[col].delete(value);",
    "  }",
    "};",
    "backtrack(0);",
    "return count;"
  ], [
    "n = len(grid)",
    "if n == 0:",
    "    return 0",
    "for row in grid:",
    "    if len(row) != n:",
    "        return 0",
    "rows_used = [set() for _ in range(n)]",
    "cols_used = [set() for _ in range(n)]",
    "blanks = []",
    "for row in range(n):",
    "    for col in range(n):",
    "        value = grid[row][col]",
    "        if value == 0:",
    "            blanks.append((row, col))",
    "            continue",
    "        if value < 1 or value > n or value in rows_used[row] or value in cols_used[col]:",
    "            return 0",
    "        rows_used[row].add(value)",
    "        cols_used[col].add(value)",
    "count = 0",
    "def backtrack(index):",
    "    nonlocal count",
    "    if index == len(blanks):",
    "        count += 1",
    "        return",
    "    row, col = blanks[index]",
    "    for value in range(1, n + 1):",
    "        if value in rows_used[row] or value in cols_used[col]:",
    "            continue",
    "        rows_used[row].add(value); cols_used[col].add(value)",
    "        backtrack(index + 1)",
    "        rows_used[row].remove(value); cols_used[col].remove(value)",
    "backtrack(0)",
    "return count"
  ], [
    "n := len(grid)",
    "if n == 0 { return 0 }",
    "for _, row := range grid { if len(row) != n { return 0 } }",
    "rowsUsed := make([]map[int]bool, n)",
    "colsUsed := make([]map[int]bool, n)",
    "for index := 0; index < n; index++ { rowsUsed[index] = map[int]bool{}; colsUsed[index] = map[int]bool{} }",
    "blanks := [][]int{}",
    "for row := 0; row < n; row++ { for col := 0; col < n; col++ { value := grid[row][col]; if value == 0 { blanks = append(blanks, []int{row, col}); continue }; if value < 1 || value > n || rowsUsed[row][value] || colsUsed[col][value] { return 0 }; rowsUsed[row][value] = true; colsUsed[col][value] = true } }",
    "count := 0",
    "var backtrack func(int)",
    "backtrack = func(index int) {",
    "\tif index == len(blanks) { count++; return }",
    "\trow, col := blanks[index][0], blanks[index][1]",
    "\tfor value := 1; value <= n; value++ { if rowsUsed[row][value] || colsUsed[col][value] { continue }; rowsUsed[row][value] = true; colsUsed[col][value] = true; backtrack(index+1); delete(rowsUsed[row], value); delete(colsUsed[col], value) }",
    "}",
    "backtrack(0)",
    "return count"
  ], [
    "val n = grid.length",
    "if (n == 0) return 0",
    "if (grid.exists(_.length != n)) return 0",
    "val rowsUsed = Array.fill(n)(scala.collection.mutable.Set.empty[Int])",
    "val colsUsed = Array.fill(n)(scala.collection.mutable.Set.empty[Int])",
    "val blanks = scala.collection.mutable.ArrayBuffer.empty[(Int, Int)]",
    "for (row <- 0 until n; col <- 0 until n) {",
    "  val value = grid(row)(col)",
    "  if (value == 0) blanks.append((row, col))",
    "  else { if (value < 1 || value > n || rowsUsed(row)(value) || colsUsed(col)(value)) return 0; rowsUsed(row).add(value); colsUsed(col).add(value) }",
    "}",
    "var count = 0",
    "def backtrack(index: Int): Unit = {",
    "  if (index == blanks.length) { count += 1; return }",
    "  val (row, col) = blanks(index)",
    "  for (value <- 1 to n if !rowsUsed(row)(value) && !colsUsed(col)(value)) { rowsUsed(row).add(value); colsUsed(col).add(value); backtrack(index + 1); rowsUsed(row).remove(value); colsUsed(col).remove(value) }",
    "}",
    "backtrack(0)",
    "count"
  ]);
}

function countSignAssignments(): CuratedProblem {
  return twoArgNumber("countSignAssignments", "count_sign_assignments", "CountSignAssignments", "nums", "target", [
    "let count = 0;",
    "const backtrack = (index: number, running: number) => {",
    "  if (index === nums.length) {",
    "    if (running === target) count += 1;",
    "    return;",
    "  }",
    "  backtrack(index + 1, running + nums[index]);",
    "  backtrack(index + 1, running - nums[index]);",
    "};",
    "backtrack(0, 0);",
    "return count;"
  ], [
    "count = 0",
    "def backtrack(index, running):",
    "    nonlocal count",
    "    if index == len(nums):",
    "        if running == target:",
    "            count += 1",
    "        return",
    "    backtrack(index + 1, running + nums[index])",
    "    backtrack(index + 1, running - nums[index])",
    "backtrack(0, 0)",
    "return count"
  ], [
    "count := 0",
    "var backtrack func(int, int)",
    "backtrack = func(index int, running int) {",
    "\tif index == len(nums) { if running == target { count++ }; return }",
    "\tbacktrack(index+1, running+nums[index])",
    "\tbacktrack(index+1, running-nums[index])",
    "}",
    "backtrack(0, 0)",
    "return count"
  ], [
    "var count = 0",
    "def backtrack(index: Int, running: Int): Unit = {",
    "  if (index == nums.length) { if (running == target) count += 1; return }",
    "  backtrack(index + 1, running + nums(index))",
    "  backtrack(index + 1, running - nums(index))",
    "}",
    "backtrack(0, 0)",
    "count"
  ]);
}

function unaryStringArray(
  tsName: string,
  pyName: string,
  goName: string,
  argName: string,
  tsBody: string[],
  pyBody: string[],
  goBody: string[],
  scalaBody: string[],
  goHelpers?: string[],
  goImports?: string[]
): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: argName, type: stringType() }], output: stringArray() },
    languages: {
      python: py(pyName, `${argName}: str`, "list[str]", pyBody),
      typescript: ts(tsName, `${argName}: string`, "string[]", tsBody),
      go: go(goName, `${argName} string`, "[]string", goBody, goImports, goHelpers),
      scala: scala(tsName, `${argName}: String`, "Seq[String]", scalaBody)
    }
  };
}

function unaryNumberMatrix(
  tsName: string,
  pyName: string,
  goName: string,
  argName: string,
  tsBody: string[],
  pyBody: string[],
  goBody: string[],
  scalaBody: string[],
  goImports?: string[]
): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: argName, type: numberArray() }], output: numberMatrix() },
    languages: {
      python: py(pyName, `${argName}: list[int]`, "list[list[int]]", pyBody),
      typescript: ts(tsName, `${argName}: number[]`, "number[][]", tsBody),
      go: go(goName, `${argName} []int`, "[][]int", goBody, goImports),
      scala: scala(tsName, `${argName}: Seq[Int]`, "Seq[Seq[Int]]", scalaBody)
    }
  };
}

function unaryGridNumber(
  tsName: string,
  pyName: string,
  goName: string,
  argName: string,
  tsBody: string[],
  pyBody: string[],
  goBody: string[],
  scalaBody: string[]
): CuratedProblem {
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

function twoArgBoolean(
  tsName: string,
  pyName: string,
  goName: string,
  arrayName: string,
  numberName: string,
  tsBody: string[],
  pyBody: string[],
  goBody: string[],
  scalaBody: string[],
  goImports?: string[]
): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: arrayName, type: numberArray() }, { name: numberName, type: numberType() }], output: booleanType() },
    languages: {
      python: py(pyName, `${arrayName}: list[int], ${numberName}: int`, "bool", pyBody),
      typescript: ts(tsName, `${arrayName}: number[], ${numberName}: number`, "boolean", tsBody),
      go: go(goName, `${arrayName} []int, ${numberName} int`, "bool", goBody, goImports),
      scala: scala(tsName, `${arrayName}: Seq[Int], ${numberName}: Int`, "Boolean", scalaBody)
    }
  };
}

function twoArgNumber(
  tsName: string,
  pyName: string,
  goName: string,
  arrayName: string,
  numberName: string,
  tsBody: string[],
  pyBody: string[],
  goBody: string[],
  scalaBody: string[]
): CuratedProblem {
  return {
    signature: { name: tsName, inputs: [{ name: arrayName, type: numberArray() }, { name: numberName, type: numberType() }], output: numberType() },
    languages: {
      python: py(pyName, `${arrayName}: list[int], ${numberName}: int`, "int", pyBody),
      typescript: ts(tsName, `${arrayName}: number[], ${numberName}: number`, "number", tsBody),
      go: go(goName, `${arrayName} []int, ${numberName} int`, "int", goBody),
      scala: scala(tsName, `${arrayName}: Seq[Int], ${numberName}: Int`, "Int", scalaBody)
    }
  };
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

function py(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return { entrypoint: name, extension: "py", starter: `def ${name}(${args}) -> ${returnType}:\n    raise NotImplementedError\n`, reference: `def ${name}(${args}) -> ${returnType}:\n${indent(body, "    ")}\n` };
}

function ts(name: string, args: string, returnType: string, body: string[], helpers: string[] = []): LanguageFiles {
  const helperText = helpers.length ? `\n\n${helpers.join("\n\n")}\n` : "\n";
  return { entrypoint: name, extension: "ts", starter: `export function ${name}(${args}): ${returnType} {\n  throw new Error("TODO");\n}\n`, reference: `export function ${name}(${args}): ${returnType} {\n${indent(body, "  ")}\n}${helperText}` };
}

function go(name: string, args: string, returnType: string, body: string[], imports: string[] = [], helpers: string[] = []): LanguageFiles {
  const importText = imports.length === 0 ? "" : imports.length === 1 ? `\nimport "${imports[0]}"\n` : `\nimport (\n${imports.map((entry) => `\t"${entry}"`).join("\n")}\n)\n`;
  const helperText = helpers.length ? `\n\n${helpers.join("\n\n")}` : "";
  return { entrypoint: name, extension: "go", starter: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`, reference: `package solution\n${importText}\nfunc ${name}(${args}) ${returnType} {\n${indent(body, "\t")}\n}${helperText}\n` };
}

function scala(name: string, args: string, returnType: string, body: string[], helpers: string[] = []): LanguageFiles {
  const helperText = helpers.length ? `\n\n${indent(helpers, "  ")}\n` : "\n";
  return { entrypoint: name, extension: "scala", starter: `object Solution {\n  def ${name}(${args}): ${returnType} = ???\n}\n`, reference: `object Solution {\n  def ${name}(${args}): ${returnType} = {\n${indent(body, "    ")}\n  }${helperText}}\n` };
}

function compareNumberArraysTs(): string {
  return `function compareNumberArrays(left: number[], right: number[]): number {
  const limit = Math.min(left.length, right.length);
  for (let index = 0; index < limit; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return left.length - right.length;
}`;
}

function goCompareSlices(): string {
  return `func compareIntSlices(left []int, right []int) int {
\tlimit := len(left)
\tif len(right) < limit { limit = len(right) }
\tfor index := 0; index < limit; index++ {
\t\tif left[index] < right[index] { return -1 }
\t\tif left[index] > right[index] { return 1 }
\t}
\tif len(left) < len(right) { return -1 }
\tif len(left) > len(right) { return 1 }
\treturn 0
}`;
}

function goAsciiHelpers(): string {
  return `func isAsciiLetter(ch rune) bool { return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') }
func toLowerAscii(ch rune) rune { if ch >= 'A' && ch <= 'Z' { return ch + 32 }; return ch }
func toUpperAscii(ch rune) rune { if ch >= 'a' && ch <= 'z' { return ch - 32 }; return ch }`;
}

function goAtoiHelpers(): string {
  return `func allDigits(text string) bool {
\tfor index := 0; index < len(text); index++ { if text[index] < '0' || text[index] > '9' { return false } }
\treturn true
}
func atoi(text string) int {
\tvalue := 0
\tfor index := 0; index < len(text); index++ { value = value*10 + int(text[index]-'0') }
\treturn value
}`;
}

function scalaCompareSeq(): string {
  return `def compareSeq(left: Seq[Int], right: Seq[Int]): Boolean = {
    val limit = math.min(left.length, right.length)
    for (index <- 0 until limit) {
      if (left(index) != right(index)) return left(index) < right(index)
    }
    left.length < right.length
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

function numberMatrix(): ValueType {
  return arrayOf(numberArray());
}

function numberType(): ValueType {
  return { type: "number" };
}

function stringArray(): ValueType {
  return arrayOf(stringType());
}

function stringMatrix(): ValueType {
  return arrayOf(stringArray());
}

function stringType(): ValueType {
  return { type: "string" };
}

function indent(lines: string[], prefix: string): string {
  return lines.map((line) => `${prefix}${line}`).join("\n");
}
