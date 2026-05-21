import type { BonusSeed } from "./types";

/**
 * Dynamic Programming bonus problems. Concepts: memoization, tabulation,
 * state, transition, optimization. Every problem has overlapping subproblems
 * and an optimal-substructure transition. The DP shapes are deliberately
 * varied — 1D recurrences, 1D/2D counting, grid optimization, knapsack
 * (bounded and unbounded), string-pair tables, interval DP, and a
 * state-machine — and each solution is structurally distinct from the others
 * and from the guided set.
 */
export const bonus: BonusSeed[] = [
  {
    id: "dynamic-programming-bonus-01",
    chapterId: "dynamic-programming",
    title: "Tribonacci Number",
    difficulty: "warmup",
    patterns: ["dynamic-programming", "linear recurrence", "tabulation"],
    entrypoint: "tribonacci",
    signature: "n",
    prompt:
      "The Tribonacci sequence starts 0, 1, 1 and every later term is the sum of the previous three. Return the n-th Tribonacci number (0-indexed).",
    constraints: [
      "The input n is a non-negative integer.",
      "tribonacci(0) is 0, tribonacci(1) is 1, and tribonacci(2) is 1.",
      "Compute it iteratively so each term is built only once."
    ],
    hints: [
      "Only the last three terms are needed to produce the next one.",
      "Carry a window of three values and roll it forward one term at a time."
    ],
    solution:
      "Define the three base terms, then roll a sliding window of the last three values forward, summing them to produce each new term until index n is reached.",
    walkthrough:
      "The state is the trailing window of three terms; the transition adds them to extend the sequence by one. Each subproblem (a term) is computed exactly once, so the run is linear with constant extra space.",
    followUps: [
      "Why is a three-call recursion exponential without memoization?",
      "How would you return the entire sequence up to index n?"
    ],
    code: `def tribonacci(n):
    if n == 0:
        return 0
    if n <= 2:
        return 1
    a, b, c = 0, 1, 1
    for _ in range(n - 2):
        a, b, c = b, c, a + b + c
    return c
`,
    visibleTests: [
      { name: "sixth term", args: [6], expected: 13 },
      { name: "base case two", args: [2], expected: 1 }
    ],
    hiddenTests: [
      { name: "base zero", args: [0], expected: 0 },
      { name: "base one", args: [1], expected: 1 },
      { name: "third term", args: [3], expected: 2 },
      { name: "fourth term", args: [4], expected: 4 },
      { name: "fifth term", args: [5], expected: 7 },
      { name: "tenth term", args: [10], expected: 149 },
      { name: "large index", args: [25], expected: 1389537 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "dynamic-programming-bonus-02",
    chapterId: "dynamic-programming",
    title: "Count Binary Strings Without Adjacent Ones",
    difficulty: "easy",
    patterns: ["dynamic-programming", "counting", "state split"],
    entrypoint: "count_binary_strings",
    signature: "n",
    prompt:
      "Return how many binary strings of length n contain no two adjacent 1s. The empty string of length 0 counts as one valid string.",
    constraints: [
      "The input n is a non-negative integer.",
      "count_binary_strings(0) is 1 (the empty string).",
      "A string is invalid only if it contains the substring 11."
    ],
    hints: [
      "Split the count by what the string ends with: a 0 or a 1.",
      "A string ending in 1 must have had a 0 before it, so it extends only strings that ended in 0."
    ],
    solution:
      "Track two counts: strings of the current length ending in 0 and ending in 1. A new 0 can follow either ending; a new 1 can follow only a 0. Roll both counts forward n-1 times and sum them.",
    walkthrough:
      "The state is the final character, because that is all that constrains the next character. Splitting the count this way gives a clean two-term transition, and the answer is the sum of the two states — the Fibonacci numbers in disguise.",
    followUps: [
      "How would you also forbid two adjacent 0s?",
      "Can you collapse the two states into a single recurrence?"
    ],
    code: `def count_binary_strings(n):
    if n == 0:
        return 1
    end_zero, end_one = 1, 1
    for _ in range(n - 1):
        end_zero, end_one = end_zero + end_one, end_zero
    return end_zero + end_one
`,
    visibleTests: [
      { name: "length three", args: [3], expected: 5 },
      { name: "length one", args: [1], expected: 2 }
    ],
    hiddenTests: [
      { name: "length zero", args: [0], expected: 1 },
      { name: "length two", args: [2], expected: 3 },
      { name: "length four", args: [4], expected: 8 },
      { name: "length five", args: [5], expected: 13 },
      { name: "length ten", args: [10], expected: 144 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "dynamic-programming-bonus-03",
    chapterId: "dynamic-programming",
    title: "Decode Digit String",
    difficulty: "medium",
    patterns: ["dynamic-programming", "counting", "tabulation"],
    entrypoint: "count_decodings",
    signature: "digits",
    prompt:
      "Letters A to Z map to the codes 1 to 26. Given a string of digits, return how many distinct letter strings could have produced it. A leading zero in any code is invalid (so '0' decodes nothing and '06' is not a valid '6').",
    constraints: [
      "The input is a string of decimal digit characters and may be empty.",
      "An empty string decodes to 0 ways.",
      "A single code is valid only if it is '1' through '9' or '10' through '26'."
    ],
    hints: [
      "Let dp[i] be the number of ways to decode the first i characters.",
      "The i-th character can stand alone (if it is not '0') or join the previous one (if the pair is between 10 and 26)."
    ],
    solution:
      "Fill dp left to right where dp[i] counts decodings of the first i digits. Add dp[i-1] when the last digit alone is a valid code, and add dp[i-2] when the last two digits form a code in 10..26.",
    walkthrough:
      "Each prefix length is a subproblem, and a decoding ends with either a one-digit or a two-digit code, so dp[i] is the sum of the two compatible earlier states. Comparing two-character substrings lexically against '10' and '26' correctly screens leading zeros.",
    followUps: [
      "How would you handle a '*' wildcard that matches any digit 1 to 9?",
      "Why can the table be reduced to two rolling variables?"
    ],
    code: `def count_decodings(digits):
    n = len(digits)
    if n == 0:
        return 0
    dp = [0] * (n + 1)
    dp[0] = 1
    dp[1] = 1 if digits[0] != "0" else 0
    for i in range(2, n + 1):
        one = digits[i - 1]
        two = digits[i - 2:i]
        if one != "0":
            dp[i] += dp[i - 1]
        if "10" <= two <= "26":
            dp[i] += dp[i - 2]
    return dp[n]
`,
    visibleTests: [
      { name: "two then six", args: ["226"], expected: 3 },
      { name: "single pair", args: ["12"], expected: 2 }
    ],
    hiddenTests: [
      { name: "empty", args: [""], expected: 0 },
      { name: "lone zero", args: ["0"], expected: 0 },
      { name: "leading zero pair", args: ["06"], expected: 0 },
      { name: "valid ten", args: ["10"], expected: 1 },
      { name: "trailing zero unreachable", args: ["100"], expected: 0 },
      { name: "out of range pair", args: ["27"], expected: 1 },
      { name: "forced ten one", args: ["2101"], expected: 1 },
      { name: "all ones", args: ["111111"], expected: 13 },
      { name: "mixed string", args: ["11106"], expected: 2 }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "dynamic-programming-bonus-04",
    chapterId: "dynamic-programming",
    title: "Minimum Path Sum In Grid",
    difficulty: "medium",
    patterns: ["dynamic-programming", "grid", "optimization"],
    entrypoint: "min_path_sum",
    signature: "grid",
    prompt:
      "Given a grid of non-negative integers, you start at the top-left cell and may move only right or down. Return the smallest possible sum of the values on a path to the bottom-right cell.",
    constraints: [
      "The grid may be empty or have empty rows; return 0 in that case.",
      "Every cell value is a non-negative integer.",
      "Both the start and the end cell are included in the sum."
    ],
    hints: [
      "The cheapest way to reach a cell uses the cheaper of its top and left neighbour.",
      "The first row and first column have only one way in, so fill them as prefix sums first."
    ],
    solution:
      "Build a table where dp[r][c] is the minimum cost to reach that cell. Seed the top row and left column as running sums, then set each interior cell to its own value plus the smaller of the cell above and the cell to its left.",
    walkthrough:
      "Reaching a cell optimally requires reaching one of its two predecessors optimally — that is the optimal substructure. Each cell is filled once from already-computed neighbours, so the whole grid is processed in a single sweep.",
    followUps: [
      "How would the recurrence change if diagonal moves were also allowed?",
      "How can you reduce the table to a single row of length equal to the width?"
    ],
    code: `def min_path_sum(grid):
    if not grid or not grid[0]:
        return 0
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]
    dp[0][0] = grid[0][0]
    for c in range(1, cols):
        dp[0][c] = dp[0][c - 1] + grid[0][c]
    for r in range(1, rows):
        dp[r][0] = dp[r - 1][0] + grid[r][0]
    for r in range(1, rows):
        for c in range(1, cols):
            dp[r][c] = grid[r][c] + min(dp[r - 1][c], dp[r][c - 1])
    return dp[rows - 1][cols - 1]
`,
    visibleTests: [
      { name: "three by three", args: [[[1, 3, 1], [1, 5, 1], [4, 2, 1]]], expected: 7 },
      { name: "two rows", args: [[[1, 2, 3], [4, 5, 6]]], expected: 12 }
    ],
    hiddenTests: [
      { name: "empty grid", args: [[]], expected: 0 },
      { name: "empty row", args: [[[]]], expected: 0 },
      { name: "single cell", args: [[[5]]], expected: 5 },
      { name: "single row", args: [[[1, 2, 3, 4]]], expected: 10 },
      { name: "single column", args: [[[1], [2], [3]]], expected: 6 },
      { name: "all zeros", args: [[[0, 0], [0, 0]]], expected: 0 }
    ],
    time: "O(r*c)",
    space: "O(r*c)"
  },
  {
    id: "dynamic-programming-bonus-05",
    chapterId: "dynamic-programming",
    title: "Subset Sum Reachable",
    difficulty: "medium",
    patterns: ["dynamic-programming", "subset sum", "knapsack"],
    entrypoint: "subset_sum_reachable",
    signature: "nums, target",
    prompt:
      "Given a list of integers and a target, return True if some subset of the list sums exactly to the target, and False otherwise. The empty subset sums to 0.",
    constraints: [
      "A target of 0 is always reachable via the empty subset.",
      "A negative target can never be reached; the list values are treated as positive amounts.",
      "Each list element may be used at most once."
    ],
    hints: [
      "Track a boolean for every amount from 0 to the target: is it reachable so far?",
      "When you add an item, sweep amounts from high to low so the item is not counted twice."
    ],
    solution:
      "Keep a boolean array indexed by amount, with 0 reachable initially. For each item, walk amounts downward from the target; an amount becomes reachable if the amount minus the item was already reachable. The target's flag is the answer.",
    walkthrough:
      "The subproblem is whether an amount is reachable using the items considered so far. The high-to-low sweep enforces the at-most-once rule because each item updates the array before it could be re-applied within the same pass.",
    followUps: [
      "How would you also recover which elements form the subset?",
      "What changes if each element may be reused any number of times?"
    ],
    code: `def subset_sum_reachable(nums, target):
    if target == 0:
        return True
    if target < 0:
        return False
    reachable = [False] * (target + 1)
    reachable[0] = True
    for num in nums:
        if num <= 0:
            continue
        for amount in range(target, num - 1, -1):
            if reachable[amount - num]:
                reachable[amount] = True
    return reachable[target]
`,
    visibleTests: [
      { name: "subset exists", args: [[3, 34, 4, 12, 5, 2], 9], expected: true },
      { name: "no subset", args: [[3, 34, 4, 12, 5, 2], 30], expected: false }
    ],
    hiddenTests: [
      { name: "empty list zero target", args: [[], 0], expected: true },
      { name: "empty list nonzero target", args: [[], 5], expected: false },
      { name: "single matches", args: [[5], 5], expected: true },
      { name: "single misses", args: [[5], 3], expected: false },
      { name: "use everything", args: [[1, 2, 3], 6], expected: true },
      { name: "parity blocks odd", args: [[2, 4, 6], 5], expected: false },
      { name: "zero target with items", args: [[7, 3], 0], expected: true }
    ],
    time: "O(n*target)",
    space: "O(target)"
  },
  {
    id: "dynamic-programming-bonus-06",
    chapterId: "dynamic-programming",
    title: "Longest Common Subsequence",
    difficulty: "medium",
    patterns: ["dynamic-programming", "string pair", "tabulation"],
    entrypoint: "longest_common_subsequence",
    signature: "a, b",
    prompt:
      "Given two strings, return the length of their longest common subsequence — the longest sequence of characters that appears in both strings in the same relative order, though not necessarily contiguously.",
    constraints: [
      "Either string may be empty; the answer is then 0.",
      "Characters are matched in order but need not be adjacent.",
      "Only the length is required, not the subsequence itself."
    ],
    hints: [
      "Let dp[i][j] be the answer for the first i characters of a and the first j characters of b.",
      "If the current characters match, extend the diagonal subproblem; otherwise drop one character from one string."
    ],
    solution:
      "Fill a two-dimensional table over prefix lengths. When the i-th and j-th characters match, dp[i][j] is dp[i-1][j-1] plus one; otherwise it is the larger of dropping a character from either string.",
    walkthrough:
      "Each pair of prefixes is a subproblem. A matching pair must extend the shorter-prefix solution by exactly that character; a mismatch means at least one of the two characters is unused, so the best of those two cases wins. The table fills row by row from smaller prefixes.",
    followUps: [
      "How would you reconstruct an actual longest common subsequence?",
      "How does this relate to the shortest common supersequence length?"
    ],
    code: `def longest_common_subsequence(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]
`,
    visibleTests: [
      { name: "scattered match", args: ["abcde", "ace"], expected: 3 },
      { name: "no common letters", args: ["abc", "def"], expected: 0 }
    ],
    hiddenTests: [
      { name: "both empty", args: ["", ""], expected: 0 },
      { name: "first empty", args: ["", "abc"], expected: 0 },
      { name: "second empty", args: ["abc", ""], expected: 0 },
      { name: "identical", args: ["abc", "abc"], expected: 3 },
      { name: "repeated capped by shorter", args: ["aaaa", "aa"], expected: 2 },
      { name: "subsequence in middle", args: ["abcba", "bcb"], expected: 3 }
    ],
    time: "O(m*n)",
    space: "O(m*n)"
  },
  {
    id: "dynamic-programming-bonus-07",
    chapterId: "dynamic-programming",
    title: "Edit Distance",
    difficulty: "hard",
    patterns: ["dynamic-programming", "string pair", "optimization"],
    entrypoint: "edit_distance",
    signature: "source, target",
    prompt:
      "Return the minimum number of single-character edits needed to turn the source string into the target string. An edit inserts a character, deletes a character, or replaces a character.",
    constraints: [
      "Either string may be empty.",
      "Turning an empty string into a string of length k costs k insertions.",
      "Each insertion, deletion, or replacement counts as exactly one edit."
    ],
    hints: [
      "Let dp[i][j] be the cost to convert the first i characters of source into the first j characters of target.",
      "If the current characters already match, no edit is needed; otherwise take one plus the cheapest of insert, delete, or replace."
    ],
    solution:
      "Fill a table over prefix lengths. The first row and column are pure insertions and deletions. For an interior cell, equal characters carry the diagonal cost unchanged; otherwise the cost is one plus the minimum of the cell above (delete), the cell to the left (insert), and the diagonal (replace).",
    walkthrough:
      "Each prefix pair is a subproblem, and the last edit on an optimal alignment is an insert, a delete, a replace, or a free match. Each maps to one neighbouring cell, so the recurrence picks the cheapest predecessor. Filling smaller prefixes first guarantees every dependency is ready.",
    followUps: [
      "How would you change the recurrence if a replacement cost two instead of one?",
      "Why can the table be reduced to two rows of length equal to the target?"
    ],
    code: `def edit_distance(source, target):
    m, n = len(source), len(target)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if source[i - 1] == target[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]
`,
    visibleTests: [
      { name: "horse to ros", args: ["horse", "ros"], expected: 3 },
      { name: "intention to execution", args: ["intention", "execution"], expected: 5 }
    ],
    hiddenTests: [
      { name: "both empty", args: ["", ""], expected: 0 },
      { name: "delete all", args: ["abc", ""], expected: 3 },
      { name: "insert all", args: ["", "abc"], expected: 3 },
      { name: "already equal", args: ["abc", "abc"], expected: 0 },
      { name: "single replace", args: ["a", "b"], expected: 1 },
      { name: "kitten to sitting", args: ["kitten", "sitting"], expected: 3 }
    ],
    time: "O(m*n)",
    space: "O(m*n)"
  },
  {
    id: "dynamic-programming-bonus-08",
    chapterId: "dynamic-programming",
    title: "Count Ways To Make Change",
    difficulty: "medium",
    patterns: ["dynamic-programming", "unbounded knapsack", "counting"],
    entrypoint: "count_change",
    signature: "coins, amount",
    prompt:
      "Given coin denominations and a target amount, return how many distinct combinations of coins add up to the amount. Each denomination may be used any number of times, and combinations that differ only in order count as the same.",
    constraints: [
      "An amount of 0 has exactly one combination: use no coins.",
      "Each denomination may be reused without limit.",
      "Order does not matter — {1, 2} and {2, 1} are the same combination."
    ],
    hints: [
      "Track, for every amount, how many combinations build it.",
      "Process coins in an outer loop so each combination is counted in one fixed coin order."
    ],
    solution:
      "Keep a count array indexed by amount with one combination for 0. For each coin, sweep amounts upward and add the count from amount minus the coin. Iterating coins on the outside fixes a canonical order and prevents counting permutations separately.",
    walkthrough:
      "After a coin is processed, ways[v] holds combinations that use only coins seen so far. The forward sweep allows a coin to be reused, while the coin-outside loop ensures each combination is enumerated once in non-decreasing coin order.",
    followUps: [
      "How would the loop order change if you instead wanted to count ordered sequences?",
      "How would you find the minimum number of coins rather than the count?"
    ],
    code: `def count_change(coins, amount):
    ways = [0] * (amount + 1)
    ways[0] = 1
    for coin in coins:
        if coin <= 0:
            continue
        for value in range(coin, amount + 1):
            ways[value] += ways[value - coin]
    return ways[amount]
`,
    visibleTests: [
      { name: "standard coins", args: [[1, 2, 5], 5], expected: 4 },
      { name: "unreachable amount", args: [[2], 3], expected: 0 }
    ],
    hiddenTests: [
      { name: "empty coins zero amount", args: [[], 0], expected: 1 },
      { name: "empty coins nonzero amount", args: [[], 5], expected: 0 },
      { name: "zero amount with coins", args: [[1], 0], expected: 1 },
      { name: "single combination", args: [[3, 5, 7], 8], expected: 1 },
      { name: "small denominations", args: [[1, 2, 3], 4], expected: 4 },
      { name: "four denominations", args: [[2, 5, 3, 6], 10], expected: 5 }
    ],
    time: "O(n*amount)",
    space: "O(amount)"
  },
  {
    id: "dynamic-programming-bonus-09",
    chapterId: "dynamic-programming",
    title: "Knapsack Maximum Value",
    difficulty: "medium",
    patterns: ["dynamic-programming", "knapsack", "optimization"],
    entrypoint: "knapsack_max_value",
    signature: "weights, values, capacity",
    prompt:
      "You have items, each with a weight and a value, and a knapsack with a weight capacity. Return the maximum total value of a subset of items whose total weight does not exceed the capacity. Each item may be taken at most once.",
    constraints: [
      "The weights and values lists have the same length and may be empty.",
      "Each item is either taken whole or left behind — no fractions.",
      "An item that is heavier than the capacity can never be taken."
    ],
    hints: [
      "Let dp[i][cap] be the best value using the first i items within weight cap.",
      "For each item, either skip it or take it — taking it frees its weight from the capacity and adds its value."
    ],
    solution:
      "Build a table over items by capacity. Each cell starts as the value without the current item; if the item fits, compare against taking it, which uses the best value of the earlier items at the reduced capacity plus this item's value.",
    walkthrough:
      "Considering items one at a time makes each (item count, capacity) pair a subproblem. The optimal solution either excludes the last item or includes it, and both cases reduce to a strictly smaller item prefix, so the table fills correctly from fewer items upward.",
    followUps: [
      "How would the recurrence change if each item could be taken multiple times?",
      "How can the table collapse to a single capacity-indexed row?"
    ],
    code: `def knapsack_max_value(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        weight = weights[i - 1]
        value = values[i - 1]
        for cap in range(capacity + 1):
            dp[i][cap] = dp[i - 1][cap]
            if weight <= cap:
                dp[i][cap] = max(dp[i][cap], dp[i - 1][cap - weight] + value)
    return dp[n][capacity]
`,
    visibleTests: [
      { name: "four items", args: [[1, 3, 4, 5], [1, 4, 5, 7], 7], expected: 9 },
      { name: "three items", args: [[2, 3, 4], [3, 4, 5], 5], expected: 7 }
    ],
    hiddenTests: [
      { name: "no items", args: [[], [], 10], expected: 0 },
      { name: "item too heavy", args: [[5], [10], 4], expected: 0 },
      { name: "item exactly fits", args: [[5], [10], 5], expected: 10 },
      { name: "zero capacity", args: [[1, 2, 3], [6, 10, 12], 0], expected: 0 },
      { name: "all items overweight", args: [[4, 5, 6], [1, 2, 3], 3], expected: 0 },
      { name: "light high value items", args: [[1, 1, 1], [10, 20, 30], 2], expected: 50 }
    ],
    time: "O(n*capacity)",
    space: "O(n*capacity)"
  },
  {
    id: "dynamic-programming-bonus-10",
    chapterId: "dynamic-programming",
    title: "Longest Palindromic Substring Length",
    difficulty: "medium",
    patterns: ["dynamic-programming", "interval", "tabulation"],
    entrypoint: "longest_palindrome_length",
    signature: "text",
    prompt:
      "Return the length of the longest contiguous substring of the input string that reads the same forwards and backwards.",
    constraints: [
      "The string may be empty; the answer is then 0.",
      "Any single character is a palindrome of length 1.",
      "The substring must be contiguous, not a subsequence."
    ],
    hints: [
      "Let dp[i][j] record whether the substring from index i to j is a palindrome.",
      "A range is a palindrome when its two ends match and the strictly inner range is already known to be a palindrome."
    ],
    solution:
      "Use an interval table where dp[i][j] is true when text[i..j] is a palindrome. Every length-1 range is true; a longer range is true when its endpoints match and the range one shorter on each side is true. Fill by increasing length and track the longest true range.",
    walkthrough:
      "The subproblem is an index interval, and a palindrome's optimal substructure is that stripping the matching outer pair leaves a smaller palindrome. Ordering the fill by interval length guarantees the inner range is solved before the outer one.",
    followUps: [
      "How would the expand-around-center technique solve this in constant space?",
      "How would you return the actual substring rather than its length?"
    ],
    code: `def longest_palindrome_length(text):
    n = len(text)
    if n == 0:
        return 0
    dp = [[False] * n for _ in range(n)]
    best = 1
    for i in range(n):
        dp[i][i] = True
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if text[i] == text[j] and (length == 2 or dp[i + 1][j - 1]):
                dp[i][j] = True
                if length > best:
                    best = length
    return best
`,
    visibleTests: [
      { name: "odd palindrome", args: ["babad"], expected: 3 },
      { name: "even palindrome", args: ["cbbd"], expected: 2 }
    ],
    hiddenTests: [
      { name: "empty", args: [""], expected: 0 },
      { name: "single character", args: ["a"], expected: 1 },
      { name: "no repeat", args: ["abcd"], expected: 1 },
      { name: "all same", args: ["aaaa"], expected: 4 },
      { name: "whole string palindrome", args: ["racecar"], expected: 7 },
      { name: "short palindrome inside", args: ["abacdfgdcaba"], expected: 3 },
      { name: "long even palindrome", args: ["forgeeksskeegfor"], expected: 10 }
    ],
    time: "O(n^2)",
    space: "O(n^2)"
  },
  {
    id: "dynamic-programming-bonus-11",
    chapterId: "dynamic-programming",
    title: "Largest Square Of Ones",
    difficulty: "medium",
    patterns: ["dynamic-programming", "grid", "optimization"],
    entrypoint: "largest_square",
    signature: "grid",
    prompt:
      "Given a grid of 0s and 1s, return the area (number of cells) of the largest square submatrix that contains only 1s. If there is no 1 in the grid, return 0.",
    constraints: [
      "The grid may be empty or have empty rows; return 0 in that case.",
      "Every cell is either 0 or 1.",
      "The answer is an area, so it is the side length squared."
    ],
    hints: [
      "Let dp[r][c] be the side of the largest all-ones square whose bottom-right corner is that cell.",
      "A 1 cell can only extend a square as far as its weakest of three neighbours: above, left, and the diagonal."
    ],
    solution:
      "For each 1 cell, the largest square ending there has side one plus the minimum of the squares ending at the cell above, to the left, and on the upper-left diagonal. First-row and first-column 1 cells have side 1. Track the largest side and return its square.",
    walkthrough:
      "The subproblem is the biggest square anchored at a bottom-right corner. Such a square exists only if all three overlapping squares at the neighbouring corners are at least one smaller, so the minimum of the three plus one is the exact transition.",
    followUps: [
      "How would you find the largest all-ones rectangle instead of a square?",
      "How can the table be reduced to a single row plus one saved value?"
    ],
    code: `def largest_square(grid):
    if not grid or not grid[0]:
        return 0
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]
    best = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                if r == 0 or c == 0:
                    dp[r][c] = 1
                else:
                    dp[r][c] = 1 + min(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1])
                best = max(best, dp[r][c])
    return best * best
`,
    visibleTests: [
      {
        name: "two by two square",
        args: [[[1, 0, 1, 0, 0], [1, 0, 1, 1, 1], [1, 1, 1, 1, 1], [1, 0, 0, 1, 0]]],
        expected: 4
      },
      { name: "only single ones", args: [[[0, 1], [1, 0]]], expected: 1 }
    ],
    hiddenTests: [
      { name: "all zeros", args: [[[0, 0], [0, 0]]], expected: 0 },
      { name: "empty grid", args: [[]], expected: 0 },
      { name: "empty row", args: [[[]]], expected: 0 },
      { name: "single one", args: [[[1]]], expected: 1 },
      { name: "single zero", args: [[[0]]], expected: 0 },
      { name: "full three by three", args: [[[1, 1, 1], [1, 1, 1], [1, 1, 1]]], expected: 9 },
      { name: "full two by two", args: [[[1, 1], [1, 1]]], expected: 4 }
    ],
    time: "O(r*c)",
    space: "O(r*c)"
  },
  {
    id: "dynamic-programming-bonus-12",
    chapterId: "dynamic-programming",
    title: "Stock Profit With Cooldown",
    difficulty: "medium",
    patterns: ["dynamic-programming", "state machine", "optimization"],
    entrypoint: "max_profit_with_cooldown",
    signature: "prices",
    prompt:
      "Given daily stock prices, return the maximum profit from any number of buy-then-sell trades. You may hold at most one share at a time, and after selling you must rest for one full day before buying again.",
    constraints: [
      "The price list may be empty; the profit is then 0.",
      "You cannot buy while already holding a share.",
      "The day immediately after a sale is a mandatory cooldown — no buying that day."
    ],
    hints: [
      "Each day you are in one of three states: holding a share, just sold, or resting and free to buy.",
      "Buying is allowed from the resting state, while selling moves from holding into the just-sold state."
    ],
    solution:
      "Track three running values: the best profit while holding a share, just after selling, and while resting. Each day, selling adds today's price to the prior holding profit, buying subtracts today's price from the prior resting profit, and resting carries the better of staying rested or coming off a sale.",
    walkthrough:
      "The state is which of holding, sold, or rested you ended the day in — that is all the cooldown rule depends on. The transitions form a small machine, and because buying reads only the resting value (which excludes yesterday's sale), the one-day cooldown is enforced automatically.",
    followUps: [
      "How would the states change if the cooldown lasted two days?",
      "How would you adapt this to charge a fixed fee on every sale?"
    ],
    code: `def max_profit_with_cooldown(prices):
    if not prices:
        return 0
    hold = float("-inf")
    sold = 0
    rest = 0
    for price in prices:
        prev_sold = sold
        sold = hold + price
        hold = max(hold, rest - price)
        rest = max(rest, prev_sold)
    return max(sold, rest)
`,
    visibleTests: [
      { name: "profitable with cooldown", args: [[1, 2, 3, 0, 2]], expected: 3 },
      { name: "strictly falling", args: [[5, 4, 3, 2, 1]], expected: 0 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "single day", args: [[1]], expected: 0 },
      { name: "two day drop", args: [[2, 1]], expected: 0 },
      { name: "monotone rise", args: [[1, 2, 3, 4, 5]], expected: 4 },
      { name: "spike then dip", args: [[1, 4, 2]], expected: 3 },
      { name: "two trades", args: [[6, 1, 3, 2, 4, 7]], expected: 6 }
    ],
    time: "O(n)",
    space: "O(1)"
  }
];
