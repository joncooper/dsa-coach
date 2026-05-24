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

export const dynamicProgrammingCurated: Record<string, CuratedProblem> = {
  "climb-with-blocks": {
    signature: { name: "climbWithBlocks", inputs: [{ name: "n", type: numberType() }, { name: "blocks", type: numberArray() }], output: numberType() },
    languages: {
      python: py("climb_with_blocks", "n: int, blocks: list[int]", "int", ["dp = [0] * (n + 1)", "dp[0] = 1", "for stair in range(1, n + 1):", "    for block in blocks:", "        if stair >= block:", "            dp[stair] += dp[stair - block]", "return dp[n]"]),
      typescript: ts("climbWithBlocks", "n: number, blocks: number[]", "number", ["const dp = new Array<number>(n + 1).fill(0);", "dp[0] = 1;", "for (let stair = 1; stair <= n; stair += 1) {", "  for (const block of blocks) if (stair >= block) dp[stair] += dp[stair - block];", "}", "return dp[n];"]),
      go: go("ClimbWithBlocks", "n int, blocks []int", "int", ["dp := make([]int, n+1)", "dp[0] = 1", "for stair := 1; stair <= n; stair++ { for _, block := range blocks { if stair >= block { dp[stair] += dp[stair-block] } } }", "return dp[n]"]),
      scala: scala("climbWithBlocks", "n: Int, blocks: Seq[Int]", "Int", ["val dp = Array.fill(n + 1)(0)", "dp(0) = 1", "for (stair <- 1 to n; block <- blocks) if (stair >= block) dp(stair) += dp(stair - block)", "dp(n)"])
    }
  },
  "min-cost-steps-local": unaryArrayNumber("minCostStepsLocal", "min_cost_steps_local", "MinCostStepsLocal", "costs", ["let before = 0;", "let current = 0;", "for (let step = 2; step <= costs.length; step += 1) {", "  const next = Math.min(current + costs[step - 1], before + costs[step - 2]);", "  before = current;", "  current = next;", "}", "return current;"], ["before = 0", "current = 0", "for step in range(2, len(costs) + 1):", "    before, current = current, min(current + costs[step - 1], before + costs[step - 2])", "return current"], ["before, current := 0, 0", "for step := 2; step <= len(costs); step++ { next := min(current+costs[step-1], before+costs[step-2]); before = current; current = next }", "return current"], ["var before = 0; var current = 0", "for (step <- 2 to costs.length) { val next = math.min(current + costs(step - 1), before + costs(step - 2)); before = current; current = next }", "current"]),
  "max-non-adjacent-local": unaryArrayNumber("maxNonAdjacentLocal", "max_non_adjacent_local", "MaxNonAdjacentLocal", "nums", ["let skip = 0;", "let take = 0;", "for (const num of nums) {", "  const nextTake = skip + num;", "  skip = Math.max(skip, take);", "  take = nextTake;", "}", "return Math.max(skip, take, 0);"], ["skip = 0", "take = 0", "for num in nums:", "    next_take = skip + num", "    skip = max(skip, take)", "    take = next_take", "return max(skip, take, 0)"], ["skip, take := 0, 0", "for _, num := range nums { nextTake := skip + num; skip = max(skip, take); take = nextTake }", "return max(max(skip, take), 0)"], ["var skip = 0; var take = 0", "for (num <- nums) { val nextTake = skip + num; skip = math.max(skip, take); take = nextTake }", "math.max(math.max(skip, take), 0)"]),
  "coin-change-min-local": coinChangeMin(),
  "lis-length-local": unaryArrayNumber("lisLengthLocal", "lis_length_local", "LisLengthLocal", "nums", ["const tails: number[] = [];", "for (const num of nums) {", "  let left = 0;", "  let right = tails.length;", "  while (left < right) {", "    const mid = Math.floor((left + right) / 2);", "    if (tails[mid] < num) left = mid + 1;", "    else right = mid;", "  }", "  tails[left] = num;", "}", "return tails.length;"], ["tails = []", "for num in nums:", "    left = 0", "    right = len(tails)", "    while left < right:", "        mid = (left + right) // 2", "        if tails[mid] < num:", "            left = mid + 1", "        else:", "            right = mid", "    if left == len(tails):", "        tails.append(num)", "    else:", "        tails[left] = num", "return len(tails)"], ["tails := []int{}", "for _, num := range nums { left, right := 0, len(tails); for left < right { mid := (left + right) / 2; if tails[mid] < num { left = mid + 1 } else { right = mid } }; if left == len(tails) { tails = append(tails, num) } else { tails[left] = num } }", "return len(tails)"], ["val tails = scala.collection.mutable.ArrayBuffer.empty[Int]", "for (num <- nums) { var left = 0; var right = tails.length; while (left < right) { val mid = (left + right) / 2; if (tails(mid) < num) left = mid + 1 else right = mid }; if (left == tails.length) tails.append(num) else tails(left) = num }", "tails.length"]),
  "grid-paths-with-blocks": gridPaths(),
  "dynamic-programming-bonus-01": unaryNumber("tribonacci", "tribonacci", "Tribonacci", "n", ["if (n === 0) return 0;", "if (n <= 2) return 1;", "let a = 0, b = 1, c = 1;", "for (let index = 3; index <= n; index += 1) {", "  const next = a + b + c;", "  a = b; b = c; c = next;", "}", "return c;"], ["if n == 0:", "    return 0", "if n <= 2:", "    return 1", "a, b, c = 0, 1, 1", "for _ in range(3, n + 1):", "    a, b, c = b, c, a + b + c", "return c"], ["if n == 0 { return 0 }", "if n <= 2 { return 1 }", "a, b, c := 0, 1, 1", "for index := 3; index <= n; index++ { a, b, c = b, c, a+b+c }", "return c"], ["if (n == 0) return 0", "if (n <= 2) return 1", "var a = 0; var b = 1; var c = 1", "for (_ <- 3 to n) { val next = a + b + c; a = b; b = c; c = next }", "c"]),
  "dynamic-programming-bonus-02": unaryNumber("countBinaryStrings", "count_binary_strings", "CountBinaryStrings", "n", ["let endZero = 1;", "let endOne = 0;", "for (let index = 0; index < n; index += 1) {", "  const nextZero = endZero + endOne;", "  const nextOne = endZero;", "  endZero = nextZero;", "  endOne = nextOne;", "}", "return endZero + endOne;"], ["end_zero = 1", "end_one = 0", "for _ in range(n):", "    end_zero, end_one = end_zero + end_one, end_zero", "return end_zero + end_one"], ["endZero, endOne := 1, 0", "for index := 0; index < n; index++ { endZero, endOne = endZero+endOne, endZero }", "return endZero + endOne"], ["var endZero = 1; var endOne = 0", "for (_ <- 0 until n) { val nextZero = endZero + endOne; val nextOne = endZero; endZero = nextZero; endOne = nextOne }", "endZero + endOne"]),
  "dynamic-programming-bonus-03": countDecodings(),
  "dynamic-programming-bonus-04": minPathSum(),
  "dynamic-programming-bonus-05": subsetSumReachable(),
  "dynamic-programming-bonus-06": stringPairNumber("longestCommonSubsequence", "longest_common_subsequence", "LongestCommonSubsequence", "a", "b", ["const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));", "for (let i = 1; i <= a.length; i += 1) {", "  for (let j = 1; j <= b.length; j += 1) {", "    dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);", "  }", "}", "return dp[a.length][b.length];"], ["dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]", "for i in range(1, len(a) + 1):", "    for j in range(1, len(b) + 1):", "        if a[i - 1] == b[j - 1]:", "            dp[i][j] = dp[i - 1][j - 1] + 1", "        else:", "            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])", "return dp[len(a)][len(b)]"], ["dp := make([][]int, len(a)+1)", "for i := range dp { dp[i] = make([]int, len(b)+1) }", "for i := 1; i <= len(a); i++ { for j := 1; j <= len(b); j++ { if a[i-1] == b[j-1] { dp[i][j] = dp[i-1][j-1] + 1 } else { dp[i][j] = max(dp[i-1][j], dp[i][j-1]) } } }", "return dp[len(a)][len(b)]"], ["val dp = Array.fill(a.length + 1, b.length + 1)(0)", "for (i <- 1 to a.length; j <- 1 to b.length) dp(i)(j) = if (a(i - 1) == b(j - 1)) dp(i - 1)(j - 1) + 1 else math.max(dp(i - 1)(j), dp(i)(j - 1))", "dp(a.length)(b.length)"]),
  "dynamic-programming-bonus-07": stringPairNumber("editDistance", "edit_distance", "EditDistance", "source", "target", ["const dp = Array.from({ length: source.length + 1 }, () => new Array<number>(target.length + 1).fill(0));", "for (let i = 0; i <= source.length; i += 1) dp[i][0] = i;", "for (let j = 0; j <= target.length; j += 1) dp[0][j] = j;", "for (let i = 1; i <= source.length; i += 1) {", "  for (let j = 1; j <= target.length; j += 1) {", "    if (source[i - 1] === target[j - 1]) dp[i][j] = dp[i - 1][j - 1];", "    else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);", "  }", "}", "return dp[source.length][target.length];"], ["dp = [[0] * (len(target) + 1) for _ in range(len(source) + 1)]", "for i in range(len(source) + 1):", "    dp[i][0] = i", "for j in range(len(target) + 1):", "    dp[0][j] = j", "for i in range(1, len(source) + 1):", "    for j in range(1, len(target) + 1):", "        if source[i - 1] == target[j - 1]:", "            dp[i][j] = dp[i - 1][j - 1]", "        else:", "            dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])", "return dp[len(source)][len(target)]"], ["dp := make([][]int, len(source)+1)", "for i := range dp { dp[i] = make([]int, len(target)+1); dp[i][0] = i }", "for j := 0; j <= len(target); j++ { dp[0][j] = j }", "for i := 1; i <= len(source); i++ { for j := 1; j <= len(target); j++ { if source[i-1] == target[j-1] { dp[i][j] = dp[i-1][j-1] } else { dp[i][j] = 1 + min3(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) } } }", "return dp[len(source)][len(target)]"], ["val dp = Array.fill(source.length + 1, target.length + 1)(0)", "for (i <- 0 to source.length) dp(i)(0) = i", "for (j <- 0 to target.length) dp(0)(j) = j", "for (i <- 1 to source.length; j <- 1 to target.length) dp(i)(j) = if (source(i - 1) == target(j - 1)) dp(i - 1)(j - 1) else 1 + Seq(dp(i - 1)(j), dp(i)(j - 1), dp(i - 1)(j - 1)).min", "dp(source.length)(target.length)"]),
  "dynamic-programming-bonus-08": countChange(),
  "dynamic-programming-bonus-09": knapsackMaxValue(),
  "dynamic-programming-bonus-10": unaryStringNumber("longestPalindromeLength", "longest_palindrome_length", "LongestPalindromeLength", "text", ["let best = 0;", "const expand = (leftStart: number, rightStart: number) => {", "  let left = leftStart;", "  let right = rightStart;", "  while (left >= 0 && right < text.length && text[left] === text[right]) { left -= 1; right += 1; }", "  best = Math.max(best, right - left - 1);", "};", "for (let center = 0; center < text.length; center += 1) { expand(center, center); expand(center, center + 1); }", "return best;"], ["best = 0", "def expand(left, right):", "    nonlocal best", "    while left >= 0 and right < len(text) and text[left] == text[right]:", "        left -= 1", "        right += 1", "    best = max(best, right - left - 1)", "for center in range(len(text)):", "    expand(center, center)", "    expand(center, center + 1)", "return best"], ["best := 0", "expand := func(left int, right int) { for left >= 0 && right < len(text) && text[left] == text[right] { left--; right++ }; best = max(best, right-left-1) }", "for center := 0; center < len(text); center++ { expand(center, center); expand(center, center+1) }", "return best"], ["var best = 0", "def expand(leftStart: Int, rightStart: Int): Unit = { var left = leftStart; var right = rightStart; while (left >= 0 && right < text.length && text(left) == text(right)) { left -= 1; right += 1 }; best = math.max(best, right - left - 1) }", "for (center <- text.indices) { expand(center, center); expand(center, center + 1) }", "best"]),
  "dynamic-programming-bonus-11": largestSquare(),
  "dynamic-programming-bonus-12": unaryArrayNumber("maxProfitWithCooldown", "max_profit_with_cooldown", "MaxProfitWithCooldown", "prices", ["if (prices.length === 0) return 0;", "let hold = -prices[0];", "let sold = 0;", "let rest = 0;", "for (let index = 1; index < prices.length; index += 1) {", "  const previousSold = sold;", "  sold = hold + prices[index];", "  hold = Math.max(hold, rest - prices[index]);", "  rest = Math.max(rest, previousSold);", "}", "return Math.max(sold, rest);"], ["if not prices:", "    return 0", "hold = -prices[0]", "sold = 0", "rest = 0", "for price in prices[1:]:", "    previous_sold = sold", "    sold = hold + price", "    hold = max(hold, rest - price)", "    rest = max(rest, previous_sold)", "return max(sold, rest)"], ["if len(prices) == 0 { return 0 }", "hold, sold, rest := -prices[0], 0, 0", "for index := 1; index < len(prices); index++ { previousSold := sold; sold = hold + prices[index]; hold = max(hold, rest-prices[index]); rest = max(rest, previousSold) }", "return max(sold, rest)"], ["if (prices.isEmpty) return 0", "var hold = -prices.head; var sold = 0; var rest = 0", "for (price <- prices.tail) { val previousSold = sold; sold = hold + price; hold = math.max(hold, rest - price); rest = math.max(rest, previousSold) }", "math.max(sold, rest)"])
};

function coinChangeMin(): CuratedProblem {
  return twoArgNumber("coinChangeMinLocal", "coin_change_min_local", "CoinChangeMinLocal", "coins", "amount", ["const impossible = amount + 1;", "const dp = new Array<number>(amount + 1).fill(impossible);", "dp[0] = 0;", "for (let total = 1; total <= amount; total += 1) { for (const coin of coins) if (total >= coin) dp[total] = Math.min(dp[total], dp[total - coin] + 1); }", "return dp[amount] === impossible ? -1 : dp[amount];"], ["impossible = amount + 1", "dp = [impossible] * (amount + 1)", "dp[0] = 0", "for total in range(1, amount + 1):", "    for coin in coins:", "        if total >= coin:", "            dp[total] = min(dp[total], dp[total - coin] + 1)", "return -1 if dp[amount] == impossible else dp[amount]"], ["impossible := amount + 1", "dp := make([]int, amount+1)", "for index := range dp { dp[index] = impossible }", "dp[0] = 0", "for total := 1; total <= amount; total++ { for _, coin := range coins { if total >= coin { dp[total] = min(dp[total], dp[total-coin]+1) } } }", "if dp[amount] == impossible { return -1 }", "return dp[amount]"], ["val impossible = amount + 1", "val dp = Array.fill(amount + 1)(impossible)", "dp(0) = 0", "for (total <- 1 to amount; coin <- coins) if (total >= coin) dp(total) = math.min(dp(total), dp(total - coin) + 1)", "if (dp(amount) == impossible) -1 else dp(amount)"]);
}

function gridPaths(): CuratedProblem {
  return gridNumber("gridPathsWithBlocks", "grid_paths_with_blocks", "GridPathsWithBlocks", "grid", ["if (grid.length === 0 || grid[0].length === 0 || grid[0][0] === 1) return 0;", "const rows = grid.length;", "const cols = grid[0].length;", "const dp = new Array<number>(cols).fill(0);", "dp[0] = 1;", "for (let row = 0; row < rows; row += 1) {", "  for (let col = 0; col < cols; col += 1) {", "    if (grid[row][col] === 1) dp[col] = 0;", "    else if (col > 0) dp[col] += dp[col - 1];", "  }", "}", "return dp[cols - 1];"], ["if not grid or not grid[0] or grid[0][0] == 1:", "    return 0", "cols = len(grid[0])", "dp = [0] * cols", "dp[0] = 1", "for row in range(len(grid)):", "    for col in range(cols):", "        if grid[row][col] == 1:", "            dp[col] = 0", "        elif col > 0:", "            dp[col] += dp[col - 1]", "return dp[-1]"], ["if len(grid) == 0 || len(grid[0]) == 0 || grid[0][0] == 1 { return 0 }", "cols := len(grid[0])", "dp := make([]int, cols)", "dp[0] = 1", "for row := 0; row < len(grid); row++ { for col := 0; col < cols; col++ { if grid[row][col] == 1 { dp[col] = 0 } else if col > 0 { dp[col] += dp[col-1] } } }", "return dp[cols-1]"], ["if (grid.isEmpty || grid.head.isEmpty || grid.head.head == 1) return 0", "val cols = grid.head.length", "val dp = Array.fill(cols)(0)", "dp(0) = 1", "for (row <- grid.indices; col <- 0 until cols) { if (grid(row)(col) == 1) dp(col) = 0 else if (col > 0) dp(col) += dp(col - 1) }", "dp(cols - 1)"]);
}

function countDecodings(): CuratedProblem {
  return unaryStringNumber("countDecodings", "count_decodings", "CountDecodings", "text", ["if (text.length === 0 || text[0] === \"0\") return 0;", "const dp = new Array<number>(text.length + 1).fill(0);", "dp[0] = 1; dp[1] = 1;", "for (let index = 2; index <= text.length; index += 1) {", "  const one = Number(text.slice(index - 1, index));", "  const two = Number(text.slice(index - 2, index));", "  if (one >= 1) dp[index] += dp[index - 1];", "  if (two >= 10 && two <= 26) dp[index] += dp[index - 2];", "}", "return dp[text.length];"], ["if not text or text[0] == '0':", "    return 0", "dp = [0] * (len(text) + 1)", "dp[0] = 1", "dp[1] = 1", "for index in range(2, len(text) + 1):", "    one = int(text[index - 1:index])", "    two = int(text[index - 2:index])", "    if one >= 1:", "        dp[index] += dp[index - 1]", "    if 10 <= two <= 26:", "        dp[index] += dp[index - 2]", "return dp[len(text)]"], ["if len(text) == 0 || text[0] == '0' { return 0 }", "dp := make([]int, len(text)+1)", "dp[0], dp[1] = 1, 1", "for index := 2; index <= len(text); index++ { one := int(text[index-1]-'0'); two := int(text[index-2]-'0')*10 + int(text[index-1]-'0'); if one >= 1 { dp[index] += dp[index-1] }; if two >= 10 && two <= 26 { dp[index] += dp[index-2] } }", "return dp[len(text)]"], ["if (text.isEmpty || text.head == '0') return 0", "val dp = Array.fill(text.length + 1)(0)", "dp(0) = 1; dp(1) = 1", "for (index <- 2 to text.length) { val one = text.substring(index - 1, index).toInt; val two = text.substring(index - 2, index).toInt; if (one >= 1) dp(index) += dp(index - 1); if (two >= 10 && two <= 26) dp(index) += dp(index - 2) }", "dp(text.length)"]);
}

function minPathSum(): CuratedProblem {
  return gridNumber("minPathSum", "min_path_sum", "MinPathSum", "grid", ["if (grid.length === 0 || grid[0].length === 0) return 0;", "const rows = grid.length;", "const cols = grid[0].length;", "const dp = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));", "for (let row = 0; row < rows; row += 1) {", "  for (let col = 0; col < cols; col += 1) {", "    if (row === 0 && col === 0) dp[row][col] = grid[row][col];", "    else dp[row][col] = grid[row][col] + Math.min(row > 0 ? dp[row - 1][col] : Infinity, col > 0 ? dp[row][col - 1] : Infinity);", "  }", "}", "return dp[rows - 1][cols - 1];"], ["if not grid or not grid[0]:", "    return 0", "rows = len(grid)", "cols = len(grid[0])", "dp = [[0] * cols for _ in range(rows)]", "for row in range(rows):", "    for col in range(cols):", "        if row == 0 and col == 0:", "            dp[row][col] = grid[row][col]", "        else:", "            dp[row][col] = grid[row][col] + min(dp[row - 1][col] if row > 0 else float('inf'), dp[row][col - 1] if col > 0 else float('inf'))", "return dp[-1][-1]"], ["if len(grid) == 0 || len(grid[0]) == 0 { return 0 }", "rows, cols := len(grid), len(grid[0])", "dp := make([][]int, rows)", "for row := range dp { dp[row] = make([]int, cols) }", "for row := 0; row < rows; row++ { for col := 0; col < cols; col++ { if row == 0 && col == 0 { dp[row][col] = grid[row][col] } else { up, left := 1<<60, 1<<60; if row > 0 { up = dp[row-1][col] }; if col > 0 { left = dp[row][col-1] }; dp[row][col] = grid[row][col] + min(up, left) } } }", "return dp[rows-1][cols-1]"], ["if (grid.isEmpty || grid.head.isEmpty) return 0", "val rows = grid.length; val cols = grid.head.length", "val dp = Array.fill(rows, cols)(0)", "for (row <- 0 until rows; col <- 0 until cols) { if (row == 0 && col == 0) dp(row)(col) = grid(row)(col) else dp(row)(col) = grid(row)(col) + math.min(if (row > 0) dp(row - 1)(col) else Int.MaxValue / 4, if (col > 0) dp(row)(col - 1) else Int.MaxValue / 4) }", "dp(rows - 1)(cols - 1)"]);
}

function subsetSumReachable(): CuratedProblem {
  return twoArgBoolean("subsetSumReachable", "subset_sum_reachable", "SubsetSumReachable", "nums", "target", ["const reachable = new Array<boolean>(target + 1).fill(false);", "reachable[0] = true;", "for (const num of nums) {", "  for (let total = target; total >= num; total -= 1) reachable[total] = reachable[total] || reachable[total - num];", "}", "return reachable[target] ?? false;"], ["reachable = [False] * (target + 1)", "reachable[0] = True", "for num in nums:", "    for total in range(target, num - 1, -1):", "        reachable[total] = reachable[total] or reachable[total - num]", "return reachable[target]"], ["reachable := make([]bool, target+1)", "reachable[0] = true", "for _, num := range nums { for total := target; total >= num; total-- { reachable[total] = reachable[total] || reachable[total-num] } }", "return reachable[target]"], ["val reachable = Array.fill(target + 1)(false)", "reachable(0) = true", "for (num <- nums; total <- target to num by -1) reachable(total) = reachable(total) || reachable(total - num)", "reachable(target)"]);
}

function countChange(): CuratedProblem {
  return twoArgNumber("countChange", "count_change", "CountChange", "coins", "amount", ["const dp = new Array<number>(amount + 1).fill(0);", "dp[0] = 1;", "for (const coin of coins) for (let total = coin; total <= amount; total += 1) dp[total] += dp[total - coin];", "return dp[amount];"], ["dp = [0] * (amount + 1)", "dp[0] = 1", "for coin in coins:", "    for total in range(coin, amount + 1):", "        dp[total] += dp[total - coin]", "return dp[amount]"], ["dp := make([]int, amount+1)", "dp[0] = 1", "for _, coin := range coins { for total := coin; total <= amount; total++ { dp[total] += dp[total-coin] } }", "return dp[amount]"], ["val dp = Array.fill(amount + 1)(0)", "dp(0) = 1", "for (coin <- coins; total <- coin to amount) dp(total) += dp(total - coin)", "dp(amount)"]);
}

function knapsackMaxValue(): CuratedProblem {
  return {
    signature: { name: "knapsackMaxValue", inputs: [{ name: "weights", type: numberArray() }, { name: "values", type: numberArray() }, { name: "capacity", type: numberType() }], output: numberType() },
    languages: {
      python: py("knapsack_max_value", "weights: list[int], values: list[int], capacity: int", "int", ["dp = [0] * (capacity + 1)", "for weight, value in zip(weights, values):", "    for cap in range(capacity, weight - 1, -1):", "        dp[cap] = max(dp[cap], dp[cap - weight] + value)", "return dp[capacity]"]),
      typescript: ts("knapsackMaxValue", "weights: number[], values: number[], capacity: number", "number", ["const dp = new Array<number>(capacity + 1).fill(0);", "for (let index = 0; index < weights.length; index += 1) {", "  const weight = weights[index];", "  const value = values[index];", "  for (let cap = capacity; cap >= weight; cap -= 1) dp[cap] = Math.max(dp[cap], dp[cap - weight] + value);", "}", "return dp[capacity];"]),
      go: go("KnapsackMaxValue", "weights []int, values []int, capacity int", "int", ["dp := make([]int, capacity+1)", "for index, weight := range weights { value := values[index]; for cap := capacity; cap >= weight; cap-- { dp[cap] = max(dp[cap], dp[cap-weight]+value) } }", "return dp[capacity]"]),
      scala: scala("knapsackMaxValue", "weights: Seq[Int], values: Seq[Int], capacity: Int", "Int", ["val dp = Array.fill(capacity + 1)(0)", "for (index <- weights.indices) { val weight = weights(index); val value = values(index); for (cap <- capacity to weight by -1) dp(cap) = math.max(dp(cap), dp(cap - weight) + value) }", "dp(capacity)"])
    }
  };
}

function largestSquare(): CuratedProblem {
  return gridNumber("largestSquare", "largest_square", "LargestSquare", "grid", ["if (grid.length === 0 || grid[0].length === 0) return 0;", "const rows = grid.length;", "const cols = grid[0].length;", "const dp = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));", "let best = 0;", "for (let row = 0; row < rows; row += 1) {", "  for (let col = 0; col < cols; col += 1) {", "    if (grid[row][col] === 1) {", "      dp[row][col] = row === 0 || col === 0 ? 1 : 1 + Math.min(dp[row - 1][col], dp[row][col - 1], dp[row - 1][col - 1]);", "      best = Math.max(best, dp[row][col]);", "    }", "  }", "}", "return best * best;"], ["if not grid or not grid[0]:", "    return 0", "rows = len(grid)", "cols = len(grid[0])", "dp = [[0] * cols for _ in range(rows)]", "best = 0", "for row in range(rows):", "    for col in range(cols):", "        if grid[row][col] == 1:", "            dp[row][col] = 1 if row == 0 or col == 0 else 1 + min(dp[row - 1][col], dp[row][col - 1], dp[row - 1][col - 1])", "            best = max(best, dp[row][col])", "return best * best"], ["if len(grid) == 0 || len(grid[0]) == 0 { return 0 }", "rows, cols := len(grid), len(grid[0])", "dp := make([][]int, rows)", "for row := range dp { dp[row] = make([]int, cols) }", "best := 0", "for row := 0; row < rows; row++ { for col := 0; col < cols; col++ { if grid[row][col] == 1 { if row == 0 || col == 0 { dp[row][col] = 1 } else { dp[row][col] = 1 + min3(dp[row-1][col], dp[row][col-1], dp[row-1][col-1]) }; best = max(best, dp[row][col]) } } }", "return best * best"], ["if (grid.isEmpty || grid.head.isEmpty) return 0", "val rows = grid.length; val cols = grid.head.length", "val dp = Array.fill(rows, cols)(0)", "var best = 0", "for (row <- 0 until rows; col <- 0 until cols) if (grid(row)(col) == 1) { dp(row)(col) = if (row == 0 || col == 0) 1 else 1 + Seq(dp(row - 1)(col), dp(row)(col - 1), dp(row - 1)(col - 1)).min; best = math.max(best, dp(row)(col)) }", "best * best"]);
}

function gridNumber(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return { signature: { name: tsName, inputs: [{ name: argName, type: arrayOf(numberArray()) }], output: numberType() }, languages: { python: py(pyName, `${argName}: list[list[int]]`, "int", pyBody), typescript: ts(tsName, `${argName}: number[][]`, "number", tsBody), go: go(goName, `${argName} [][]int`, "int", goBody), scala: scala(tsName, `${argName}: Seq[Seq[Int]]`, "Int", scalaBody) } };
}

function stringPairNumber(tsName: string, pyName: string, goName: string, aName: string, bName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return { signature: { name: tsName, inputs: [{ name: aName, type: stringType() }, { name: bName, type: stringType() }], output: numberType() }, languages: { python: py(pyName, `${aName}: str, ${bName}: str`, "int", pyBody), typescript: ts(tsName, `${aName}: string, ${bName}: string`, "number", tsBody), go: go(goName, `${aName} string, ${bName} string`, "int", goBody), scala: scala(tsName, `${aName}: String, ${bName}: String`, "Int", scalaBody) } };
}

function twoArgBoolean(tsName: string, pyName: string, goName: string, arrayName: string, numberName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return { signature: { name: tsName, inputs: [{ name: arrayName, type: numberArray() }, { name: numberName, type: numberType() }], output: booleanType() }, languages: { python: py(pyName, `${arrayName}: list[int], ${numberName}: int`, "bool", pyBody), typescript: ts(tsName, `${arrayName}: number[], ${numberName}: number`, "boolean", tsBody), go: go(goName, `${arrayName} []int, ${numberName} int`, "bool", goBody), scala: scala(tsName, `${arrayName}: Seq[Int], ${numberName}: Int`, "Boolean", scalaBody) } };
}

function twoArgNumber(tsName: string, pyName: string, goName: string, arrayName: string, numberName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return { signature: { name: tsName, inputs: [{ name: arrayName, type: numberArray() }, { name: numberName, type: numberType() }], output: numberType() }, languages: { python: py(pyName, `${arrayName}: list[int], ${numberName}: int`, "int", pyBody), typescript: ts(tsName, `${arrayName}: number[], ${numberName}: number`, "number", tsBody), go: go(goName, `${arrayName} []int, ${numberName} int`, "int", goBody), scala: scala(tsName, `${arrayName}: Seq[Int], ${numberName}: Int`, "Int", scalaBody) } };
}

function unaryArrayNumber(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return { signature: { name: tsName, inputs: [{ name: argName, type: numberArray() }], output: numberType() }, languages: { python: py(pyName, `${argName}: list[int]`, "int", pyBody), typescript: ts(tsName, `${argName}: number[]`, "number", tsBody), go: go(goName, `${argName} []int`, "int", goBody), scala: scala(tsName, `${argName}: Seq[Int]`, "Int", scalaBody) } };
}

function unaryNumber(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return { signature: { name: tsName, inputs: [{ name: argName, type: numberType() }], output: numberType() }, languages: { python: py(pyName, `${argName}: int`, "int", pyBody), typescript: ts(tsName, `${argName}: number`, "number", tsBody), go: go(goName, `${argName} int`, "int", goBody), scala: scala(tsName, `${argName}: Int`, "Int", scalaBody) } };
}

function unaryStringNumber(tsName: string, pyName: string, goName: string, argName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return { signature: { name: tsName, inputs: [{ name: argName, type: stringType() }], output: numberType() }, languages: { python: py(pyName, `${argName}: str`, "int", pyBody), typescript: ts(tsName, `${argName}: string`, "number", tsBody), go: go(goName, `${argName} string`, "int", goBody), scala: scala(tsName, `${argName}: String`, "Int", scalaBody) } };
}

function py(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return { entrypoint: name, extension: "py", starter: `def ${name}(${args}) -> ${returnType}:\n    raise NotImplementedError\n`, reference: `def ${name}(${args}) -> ${returnType}:\n${indent(body, "    ")}\n` };
}

function ts(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return { entrypoint: name, extension: "ts", starter: `export function ${name}(${args}): ${returnType} {\n  throw new Error("TODO");\n}\n`, reference: `export function ${name}(${args}): ${returnType} {\n${indent(body, "  ")}\n}\n` };
}

function go(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return { entrypoint: name, extension: "go", starter: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`, reference: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n${indent(body, "\t")}\n}\n\n${goHelpers()}\n` };
}

function scala(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return { entrypoint: name, extension: "scala", starter: `object Solution {\n  def ${name}(${args}): ${returnType} = ???\n}\n`, reference: `object Solution {\n  def ${name}(${args}): ${returnType} = {\n${indent(body, "    ")}\n  }\n}\n` };
}

function goHelpers(): string {
  return `func min(a int, b int) int { if a < b { return a }; return b }
func max(a int, b int) int { if a > b { return a }; return b }
func min3(a int, b int, c int) int { return min(min(a, b), c) }`;
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
