import type { BonusSeed } from "./types";

/**
 * Backtracking bonus problems. Concepts: recursion trees, subsets,
 * combinations, permutations, constraints, grid search. Every problem builds
 * partial solutions, explores choices, and undoes them on the way back up.
 * Each solution is a structurally distinct backtracking shape — distinct from
 * the guided set and from each other.
 */
export const bonus: BonusSeed[] = [
  {
    id: "backtracking-bonus-01",
    chapterId: "backtracking",
    title: "Subsets Of Size K",
    difficulty: "warmup",
    patterns: ["backtracking", "combinations", "recursion tree"],
    entrypoint: "subsets_of_size",
    signature: "nums, k",
    prompt:
      "Given a list of distinct integers and an integer k, return every subset that contains exactly k of the values. Each subset keeps the values in their original list order, and the list of subsets is sorted ascending.",
    constraints: [
      "The values in nums are distinct.",
      "If k is negative or larger than the list length, return an empty list.",
      "k may be 0; the only size-0 subset is the empty list."
    ],
    hints: [
      "Walk the list left to right, at each step deciding whether to include the current value.",
      "Carry a start index so a chosen value is never reused, and stop a branch once k values are chosen."
    ],
    solution:
      "Backtrack with a start index: at each call, try every value from start onward, append it, recurse from the next index, then pop it. Record a copy of the running selection whenever its length reaches k.",
    walkthrough:
      "The recursion tree branches on which value to add next. The start index guarantees combinations rather than permutations, and the length check prunes any branch that has already chosen k values. Popping after the recursive call restores state for the sibling choice.",
    followUps: [
      "How many size-k subsets exist for a list of length n?",
      "How would you generate subsets of every size instead of a fixed k?"
    ],
    code: `def subsets_of_size(nums, k):
    result = []
    chosen = []

    def backtrack(start):
        if len(chosen) == k:
            result.append(list(chosen))
            return
        for i in range(start, len(nums)):
            chosen.append(nums[i])
            backtrack(i + 1)
            chosen.pop()

    if 0 <= k <= len(nums):
        backtrack(0)
    return sorted(result)
`,
    visibleTests: [
      { name: "pairs from four", args: [[1, 2, 3, 4], 2], expected: [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]] },
      { name: "size zero", args: [[1, 2, 3], 0], expected: [[]] }
    ],
    hiddenTests: [
      { name: "k equals length", args: [[1, 2, 3], 3], expected: [[1, 2, 3]] },
      { name: "k too large", args: [[1, 2], 3], expected: [] },
      { name: "negative k", args: [[1, 2, 3], -1], expected: [] },
      { name: "single element", args: [[5], 1], expected: [[5]] },
      { name: "empty list size zero", args: [[], 0], expected: [[]] }
    ],
    time: "O(C(n, k) * k)",
    space: "O(k)"
  },
  {
    id: "backtracking-bonus-02",
    chapterId: "backtracking",
    title: "Letter Case Combinations",
    difficulty: "warmup",
    patterns: ["backtracking", "binary choice", "recursion tree"],
    entrypoint: "letter_case_combinations",
    signature: "text",
    prompt:
      "Given a string of letters and digits, return every string that can be formed by independently choosing lower or upper case for each letter. Digits are copied unchanged. Return the results sorted ascending.",
    constraints: [
      "The string may be empty; return a list holding just the empty string then.",
      "Digit characters offer no choice and are kept as-is.",
      "A string with no letters yields exactly one result: itself."
    ],
    hints: [
      "Process the string one position at a time, recursing on the remaining suffix.",
      "At a letter, branch twice — once lower case, once upper case; at a digit, take the single forced branch."
    ],
    solution:
      "Backtrack over character positions. At each letter, append the lower-case form and recurse, undo, then append the upper-case form and recurse; at a digit, append it and recurse with no branching. Record the joined string when every position is fixed.",
    walkthrough:
      "Each letter doubles the recursion tree while each digit passes straight through, so the leaves enumerate exactly the case variants. Popping the character after each recursive call returns the buffer to its earlier state for the alternative choice.",
    followUps: [
      "How many results does a string with L letters produce?",
      "How would you also allow toggling the case of nothing — i.e. include only the original string?"
    ],
    code: `def letter_case_combinations(text):
    result = []
    chars = []

    def backtrack(i):
        if i == len(text):
            result.append("".join(chars))
            return
        ch = text[i]
        if ch.isalpha():
            chars.append(ch.lower())
            backtrack(i + 1)
            chars.pop()
            chars.append(ch.upper())
            backtrack(i + 1)
            chars.pop()
        else:
            chars.append(ch)
            backtrack(i + 1)
            chars.pop()

    backtrack(0)
    return sorted(result)
`,
    visibleTests: [
      { name: "letter digit letter", args: ["a1b"], expected: ["A1B", "A1b", "a1B", "a1b"] },
      { name: "single letter", args: ["x"], expected: ["X", "x"] }
    ],
    hiddenTests: [
      { name: "empty string", args: [""], expected: [""] },
      { name: "only a digit", args: ["3"], expected: ["3"] },
      { name: "only digits", args: ["12"], expected: ["12"] },
      { name: "two letters", args: ["ab"], expected: ["AB", "Ab", "aB", "ab"] },
      { name: "already upper", args: ["Q"], expected: ["Q", "q"] }
    ],
    time: "O(2^L * n)",
    space: "O(n)"
  },
  {
    id: "backtracking-bonus-03",
    chapterId: "backtracking",
    title: "All Distinct Permutations",
    difficulty: "easy",
    patterns: ["backtracking", "permutations", "duplicate pruning"],
    entrypoint: "distinct_permutations",
    signature: "nums",
    prompt:
      "Given a list of integers that may contain duplicates, return every distinct ordering of its elements. Return the orderings sorted ascending, with no ordering repeated.",
    constraints: [
      "The input may contain repeated values; identical orderings must appear only once.",
      "An empty list has exactly one permutation: the empty list.",
      "Every output ordering uses each input element exactly once."
    ],
    hints: [
      "Sort the values first so equal values sit next to each other.",
      "Track which positions are used; skip a duplicate value when its identical predecessor has not been used in this branch."
    ],
    solution:
      "Sort the input, then backtrack placing one element per recursion level using a boolean used array. To avoid duplicate orderings, skip a value equal to its left neighbour whenever that neighbour is currently unused. Record a copy of the arrangement when it is full length.",
    walkthrough:
      "Sorting groups equal values so the duplicate test is local. The rule \"skip nums[i] if it equals nums[i-1] and nums[i-1] is unused\" forces equal values to be consumed strictly left to right, which picks exactly one representative ordering out of each set of identical ones.",
    followUps: [
      "Why does the duplicate test require the predecessor to be unused rather than used?",
      "How would you count the distinct permutations without listing them?"
    ],
    code: `def distinct_permutations(nums):
    ordered = sorted(nums)
    result = []
    used = [False] * len(ordered)
    current = []

    def backtrack():
        if len(current) == len(ordered):
            result.append(list(current))
            return
        for i in range(len(ordered)):
            if used[i]:
                continue
            if i > 0 and ordered[i] == ordered[i - 1] and not used[i - 1]:
                continue
            used[i] = True
            current.append(ordered[i])
            backtrack()
            current.pop()
            used[i] = False

    backtrack()
    return result
`,
    visibleTests: [
      {
        name: "three distinct",
        args: [[1, 2, 3]],
        expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
      },
      { name: "with a duplicate", args: [[1, 1, 2]], expected: [[1, 1, 2], [1, 2, 1], [2, 1, 1]] }
    ],
    hiddenTests: [
      { name: "empty list", args: [[]], expected: [[]] },
      { name: "single element", args: [[7]], expected: [[7]] },
      { name: "all identical", args: [[2, 2]], expected: [[2, 2]] },
      { name: "unsorted input", args: [[3, 1, 2]], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
      { name: "negatives", args: [[-1, 0]], expected: [[-1, 0], [0, -1]] }
    ],
    time: "O(n! * n)",
    space: "O(n)"
  },
  {
    id: "backtracking-bonus-04",
    chapterId: "backtracking",
    title: "Partition Into Equal Subsets",
    difficulty: "medium",
    patterns: ["backtracking", "constraints", "bin packing"],
    entrypoint: "can_partition_k_subsets",
    signature: "nums, k",
    prompt:
      "Given a list of positive integers and an integer k, return True if the list can be split into exactly k groups whose sums are all equal. Every value must land in exactly one group.",
    constraints: [
      "k must be at least 1; return False for k of 0 or less.",
      "If the total is not divisible by k, no equal split exists.",
      "An empty list splits into k empty groups, each summing to zero."
    ],
    hints: [
      "Each group must sum to total / k; if that division is not exact, fail immediately.",
      "Place values one at a time into k buckets, recursing forward and undoing a placement that leads nowhere."
    ],
    solution:
      "Compute the target sum total / k and reject impossible cases early. Sort values descending, then backtrack placing each value into some bucket whose running sum stays within target; recurse to the next value and undo on failure. Skip buckets with a duplicate running sum, and stop at the first empty bucket, to prune symmetric branches.",
    walkthrough:
      "The recursion tree branches on which bucket receives the current value. Two pruning rules tame it: never try two buckets that currently hold the same sum, and once an empty bucket has been tried, do not try further empty buckets — they are interchangeable. Descending order places large, hard-to-fit values first.",
    followUps: [
      "Why does trying only one empty bucket per step avoid missing solutions?",
      "How would the approach change if values could be negative?"
    ],
    code: `def can_partition_k_subsets(nums, k):
    total = sum(nums)
    if k <= 0 or total % k != 0:
        return False
    target = total // k
    ordered = sorted(nums, reverse=True)
    if ordered and ordered[0] > target:
        return False
    buckets = [0] * k

    def backtrack(i):
        if i == len(ordered):
            return True
        seen = set()
        for b in range(k):
            if buckets[b] in seen:
                continue
            if buckets[b] + ordered[i] <= target:
                seen.add(buckets[b])
                buckets[b] += ordered[i]
                if backtrack(i + 1):
                    return True
                buckets[b] -= ordered[i]
            if buckets[b] == 0:
                break
        return False

    return backtrack(0)
`,
    visibleTests: [
      { name: "splits into four", args: [[4, 3, 2, 3, 5, 2, 1], 4], expected: true },
      { name: "no equal split", args: [[1, 2, 3, 4], 3], expected: false }
    ],
    hiddenTests: [
      { name: "two equal halves", args: [[2, 2, 2, 2], 2], expected: true },
      { name: "k is zero", args: [[1, 1, 1], 0], expected: false },
      { name: "empty list", args: [[], 1], expected: true },
      { name: "empty list many groups", args: [[], 3], expected: true },
      { name: "single group", args: [[5], 1], expected: true },
      { name: "value exceeds target", args: [[10, 10], 3], expected: false }
    ],
    time: "O(k^n)",
    space: "O(n + k)"
  },
  {
    id: "backtracking-bonus-05",
    chapterId: "backtracking",
    title: "Count Simple Grid Paths",
    difficulty: "easy",
    patterns: ["backtracking", "grid search", "visited set"],
    entrypoint: "count_grid_paths",
    signature: "grid",
    prompt:
      "Given a grid of 0s (open) and 1s (blocked), count the simple paths from the top-left cell to the bottom-right cell. A path may step up, down, left, or right onto open cells and may not visit any cell twice.",
    constraints: [
      "An empty grid has no paths; return 0.",
      "If the start or destination cell is blocked, there are no paths.",
      "A path never revisits a cell it has already used."
    ],
    hints: [
      "Run a depth-first search, marking each cell visited as you enter it.",
      "After exploring all four neighbours from a cell, unmark it so other paths may use it."
    ],
    solution:
      "Depth-first search from the start cell, marking the current cell visited. From each cell, recurse into every open, unvisited orthogonal neighbour; when the destination is reached, increment the count. Unmark the cell after exploring it so it remains available for other routes.",
    walkthrough:
      "Marking on entry and unmarking on exit is the choose/un-choose pair: it keeps every path simple while still allowing a cell to belong to many different paths. Each path corresponds to one root-to-leaf branch of the recursion tree that lands on the destination.",
    followUps: [
      "Why must the visited mark be cleared on the way back up?",
      "How would you return the shortest such path length instead of the count?"
    ],
    code: `def count_grid_paths(grid):
    if not grid or not grid[0]:
        return 0
    rows, cols = len(grid), len(grid[0])
    if grid[0][0] == 1 or grid[rows - 1][cols - 1] == 1:
        return 0
    visited = [[False] * cols for _ in range(rows)]
    count = 0

    def backtrack(r, c):
        nonlocal count
        if r == rows - 1 and c == cols - 1:
            count += 1
            return
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and not visited[nr][nc] and grid[nr][nc] == 0:
                visited[nr][nc] = True
                backtrack(nr, nc)
                visited[nr][nc] = False

    visited[0][0] = True
    backtrack(0, 0)
    return count
`,
    visibleTests: [
      { name: "open three by three", args: [[[0, 0, 0], [0, 0, 0], [0, 0, 0]]], expected: 12 },
      { name: "one obstacle", args: [[[0, 1], [0, 0]]], expected: 1 }
    ],
    hiddenTests: [
      { name: "single open cell", args: [[[0]]], expected: 1 },
      { name: "destination unreachable", args: [[[0, 1], [1, 0]]], expected: 0 },
      { name: "start blocked", args: [[[1, 0], [0, 0]]], expected: 0 },
      { name: "empty grid", args: [[]], expected: 0 },
      { name: "corner detour", args: [[[0, 0], [1, 0]]], expected: 1 }
    ],
    time: "O(4^(r*c))",
    space: "O(r*c)"
  },
  {
    id: "backtracking-bonus-06",
    chapterId: "backtracking",
    title: "Restore IP Addresses",
    difficulty: "medium",
    patterns: ["backtracking", "string segmentation", "constraints"],
    entrypoint: "restore_ip_addresses",
    signature: "digits",
    prompt:
      "Given a string of at most 12 digits, return every valid IPv4 address that can be formed by inserting three dots. Each of the four parts is 0 to 255 and has no leading zero unless the part is exactly \"0\". Return the addresses sorted ascending.",
    constraints: [
      "The input is a string of digit characters of length at most 12.",
      "Every digit must be used; parts may not be reordered.",
      "A part longer than one character may not start with '0'.",
      "If the string is not all digits, or no valid address exists, return an empty list."
    ],
    hints: [
      "Build the address part by part, trying segments of length 1, 2, and 3 at each step.",
      "Stop a branch early when a segment has a leading zero or exceeds 255, or when four parts do not consume the whole string."
    ],
    solution:
      "Backtrack over four parts. At each step, try the next 1, 2, or 3 digits as a segment, accept it only if it is a legal octet, append it, and recurse. When four parts are placed, record the dotted join only if every digit was used. Pop each segment to explore the alternatives.",
    walkthrough:
      "The recursion has depth exactly four, one level per octet. Each level branches at most three ways on segment length, and the octet-validity test plus the use-every-digit check at depth four prune everything illegal. Since the input is capped at 12 digits, the whole search touches a constant number of states — hence O(1) time and space.",
    followUps: [
      "What is the maximum string length that can ever yield a valid address?",
      "How would you adapt this to IPv6, which has eight parts?"
    ],
    code: `def restore_ip_addresses(digits):
    result = []
    parts = []
    n = len(digits)

    def valid(seg):
        if len(seg) > 1 and seg[0] == "0":
            return False
        return 0 <= int(seg) <= 255

    def backtrack(start):
        if len(parts) == 4:
            if start == n:
                result.append(".".join(parts))
            return
        for length in (1, 2, 3):
            if start + length > n:
                break
            seg = digits[start:start + length]
            if valid(seg):
                parts.append(seg)
                backtrack(start + length)
                parts.pop()

    if digits.isdigit():
        backtrack(0)
    return sorted(result)
`,
    visibleTests: [
      { name: "two readings", args: ["25525511135"], expected: ["255.255.11.135", "255.255.111.35"] },
      { name: "all zeros", args: ["0000"], expected: ["0.0.0.0"] }
    ],
    hiddenTests: [
      { name: "empty string", args: [""], expected: [] },
      { name: "too short", args: ["123"], expected: [] },
      { name: "too long", args: ["999999999999"], expected: [] },
      { name: "all ones", args: ["1111"], expected: ["1.1.1.1"] },
      { name: "non digit", args: ["1a23"], expected: [] }
    ],
    time: "O(1)",
    space: "O(1)"
  },
  {
    id: "backtracking-bonus-07",
    chapterId: "backtracking",
    title: "Count N-Queens Arrangements",
    difficulty: "medium",
    patterns: ["backtracking", "constraints", "recursion tree"],
    entrypoint: "count_n_queens",
    signature: "n",
    prompt:
      "Return how many ways n queens can be placed on an n-by-n chessboard so that no two queens attack each other. Two queens attack if they share a row, a column, or a diagonal.",
    constraints: [
      "n is a non-negative integer.",
      "For n of 0, return 0 (no queens, no board).",
      "Exactly one queen is placed in each row."
    ],
    hints: [
      "Place one queen per row, so only the column choice matters at each row.",
      "Track occupied columns and both diagonal directions in sets to reject conflicting columns in O(1)."
    ],
    solution:
      "Backtrack row by row. For the current row, try each column not already attacked: a column is safe when it is in none of the used-columns set, the row-minus-column diagonal set, or the row-plus-column diagonal set. Record the three markers, recurse to the next row, then remove them. Count one arrangement each time all n rows are filled.",
    walkthrough:
      "Fixing one queen per row removes the row constraint entirely. The two diagonals through a cell are identified by the constant row - col and row + col, so three sets capture every attack line. Adding and removing the markers around the recursive call is the choose/un-choose step.",
    followUps: [
      "Why does row - col uniquely identify one diagonal direction?",
      "How would you return the actual board layouts instead of just the count?"
    ],
    code: `def count_n_queens(n):
    if n <= 0:
        return 0
    cols = set()
    diag1 = set()
    diag2 = set()
    count = 0

    def backtrack(row):
        nonlocal count
        if row == n:
            count += 1
            return
        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue
            cols.add(col)
            diag1.add(row - col)
            diag2.add(row + col)
            backtrack(row + 1)
            cols.remove(col)
            diag1.remove(row - col)
            diag2.remove(row + col)

    backtrack(0)
    return count
`,
    visibleTests: [
      { name: "four by four", args: [4], expected: 2 },
      { name: "one by one", args: [1], expected: 1 }
    ],
    hiddenTests: [
      { name: "zero board", args: [0], expected: 0 },
      { name: "two by two", args: [2], expected: 0 },
      { name: "three by three", args: [3], expected: 0 },
      { name: "five by five", args: [5], expected: 10 },
      { name: "six by six", args: [6], expected: 4 }
    ],
    time: "O(n!)",
    space: "O(n)"
  },
  {
    id: "backtracking-bonus-08",
    chapterId: "backtracking",
    title: "Phone Keypad Words",
    difficulty: "warmup",
    patterns: ["backtracking", "combinations", "recursion tree"],
    entrypoint: "keypad_letter_words",
    signature: "digits",
    prompt:
      "On a phone keypad, 2 maps to \"abc\", 3 to \"def\", 4 to \"ghi\", 5 to \"jkl\", 6 to \"mno\", 7 to \"pqrs\", 8 to \"tuv\", and 9 to \"wxyz\". Given a string of digits, return every letter string it could spell, one letter per digit, sorted ascending.",
    constraints: [
      "An empty digit string yields an empty list of words.",
      "If any character is not a keypad digit 2-9, return an empty list.",
      "The i-th letter of each word comes from the i-th digit."
    ],
    hints: [
      "Build words one position at a time, choosing a letter for the current digit.",
      "After recursing on each candidate letter, pop it so the next candidate can take its place."
    ],
    solution:
      "Backtrack over digit positions. At each position, loop through the letters mapped to that digit, append one, recurse to the next position, then pop it. When a letter has been chosen for every digit, record the joined word.",
    walkthrough:
      "The recursion tree fans out by the letter count of each digit, so its leaves are exactly the spellable words. The append-recurse-pop pattern means the shared character buffer is correct on every branch without copying it until a complete word is formed.",
    followUps: [
      "How many words does a string of digits with letter counts c1, c2, ... produce?",
      "How would you stop early once a target word length is exceeded?"
    ],
    code: `def keypad_letter_words(digits):
    mapping = {
        "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
        "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz",
    }
    if not digits or any(d not in mapping for d in digits):
        return []
    result = []
    letters = []

    def backtrack(i):
        if i == len(digits):
            result.append("".join(letters))
            return
        for ch in mapping[digits[i]]:
            letters.append(ch)
            backtrack(i + 1)
            letters.pop()

    backtrack(0)
    return sorted(result)
`,
    visibleTests: [
      {
        name: "two digits",
        args: ["23"],
        expected: ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]
      },
      { name: "single digit", args: ["2"], expected: ["a", "b", "c"] }
    ],
    hiddenTests: [
      { name: "empty digits", args: [""], expected: [] },
      { name: "four letter digit", args: ["9"], expected: ["w", "x", "y", "z"] },
      { name: "invalid digit one", args: ["10"], expected: [] },
      { name: "repeated digit", args: ["22"], expected: ["aa", "ab", "ac", "ba", "bb", "bc", "ca", "cb", "cc"] },
      { name: "non digit char", args: ["2x"], expected: [] }
    ],
    time: "O(4^n * n)",
    space: "O(n)"
  },
  {
    id: "backtracking-bonus-09",
    chapterId: "backtracking",
    title: "Count Latin Square Completions",
    difficulty: "hard",
    patterns: ["backtracking", "constraints", "grid search"],
    entrypoint: "count_latin_completions",
    signature: "grid",
    prompt:
      "An n-by-n grid holds values 1..n, with 0 marking a blank cell. Return how many ways the blanks can be filled so that every row and every column contains each value 1..n exactly once. If the grid is empty or its pre-filled values already break the rule, return 0.",
    constraints: [
      "A 0 marks a blank; every non-blank cell already holds a value in 1..n.",
      "If the pre-filled values repeat within a row or column, return 0.",
      "An empty grid returns 0; a fully filled valid grid counts as one completion."
    ],
    hints: [
      "First check the given numbers: a repeat in any row or column means zero completions.",
      "List the blank cells, then fill them in order, trying each value not yet used in that cell's row or column."
    ],
    solution:
      "Validate the pre-filled cells, rejecting any duplicate in a row or column. Collect the blank cells and the values already used per row and per column. Backtrack over the blanks in order: for each, try every value absent from both its row set and its column set, mark it, recurse, then unmark it. Count one completion each time all blanks are filled.",
    walkthrough:
      "The blank cells become a fixed list, so the recursion depth is the number of blanks. The per-row and per-column used-value sets make each candidate test O(1) and prune any branch that would repeat a value. Marking and unmarking around the recursive call is the choose/un-choose step that keeps the sets in sync.",
    followUps: [
      "How does ordering the blanks by fewest candidates first speed up the search?",
      "How would you return one valid completion instead of the total count?"
    ],
    code: `def count_latin_completions(grid):
    n = len(grid)
    if n == 0:
        return 0
    for row in grid:
        if len(row) != n:
            return 0
    for r in range(n):
        seen = set()
        for c in range(n):
            v = grid[r][c]
            if v != 0:
                if v in seen:
                    return 0
                seen.add(v)
    for c in range(n):
        seen = set()
        for r in range(n):
            v = grid[r][c]
            if v != 0:
                if v in seen:
                    return 0
                seen.add(v)

    blanks = [(r, c) for r in range(n) for c in range(n) if grid[r][c] == 0]
    rows_used = [set(v for v in grid[r] if v != 0) for r in range(n)]
    cols_used = [set(grid[r][c] for r in range(n) if grid[r][c] != 0) for c in range(n)]
    count = 0

    def backtrack(i):
        nonlocal count
        if i == len(blanks):
            count += 1
            return
        r, c = blanks[i]
        for v in range(1, n + 1):
            if v in rows_used[r] or v in cols_used[c]:
                continue
            rows_used[r].add(v)
            cols_used[c].add(v)
            backtrack(i + 1)
            rows_used[r].remove(v)
            cols_used[c].remove(v)

    backtrack(0)
    return count
`,
    visibleTests: [
      { name: "blank two by two", args: [[[0, 0], [0, 0]]], expected: 2 },
      { name: "forced by one clue", args: [[[1, 0], [0, 0]]], expected: 1 }
    ],
    hiddenTests: [
      { name: "blank three by three", args: [[[0, 0, 0], [0, 0, 0], [0, 0, 0]]], expected: 12 },
      { name: "already complete", args: [[[1, 2], [2, 1]]], expected: 1 },
      { name: "invalid clue row", args: [[[1, 1], [0, 0]]], expected: 0 },
      { name: "single blank cell", args: [[[0]]], expected: 1 },
      { name: "empty grid", args: [[]], expected: 0 }
    ],
    time: "O(n^b)",
    space: "O(n^2)"
  },
  {
    id: "backtracking-bonus-10",
    chapterId: "backtracking",
    title: "Count Target Sign Assignments",
    difficulty: "easy",
    patterns: ["backtracking", "binary choice", "counting"],
    entrypoint: "count_sign_assignments",
    signature: "nums, target",
    prompt:
      "Given a list of non-negative integers, you must place a '+' or a '-' in front of every value and add the results. Return how many of the 2^n sign assignments produce a sum equal to target.",
    constraints: [
      "Every value gets exactly one sign; none may be skipped.",
      "An empty list has one assignment (the empty sum, 0).",
      "Values are non-negative, but target may be negative."
    ],
    hints: [
      "At each value, branch twice: add it to the running sum, or subtract it.",
      "When every value has a sign, check whether the running sum equals the target."
    ],
    solution:
      "Backtrack over the values, carrying the running sum. At each value, recurse once adding it and once subtracting it. When the index passes the last value, the running sum is a complete assignment; increment the count if it equals the target.",
    walkthrough:
      "The recursion tree is a perfect binary tree of depth n: each level chooses one sign. The running sum is threaded through the calls so no separate undo is needed — each branch simply passes its own value. The leaves are the 2^n assignments, and the count tallies the matching ones.",
    followUps: [
      "How does this relate to splitting the values into a positive and a negative group?",
      "How would memoizing on (index, running sum) cut the running time?"
    ],
    code: `def count_sign_assignments(nums, target):
    count = 0

    def backtrack(i, running):
        nonlocal count
        if i == len(nums):
            if running == target:
                count += 1
            return
        backtrack(i + 1, running + nums[i])
        backtrack(i + 1, running - nums[i])

    backtrack(0, 0)
    return count
`,
    visibleTests: [
      { name: "five ones target three", args: [[1, 1, 1, 1, 1], 3], expected: 5 },
      { name: "single value hit", args: [[1], 1], expected: 1 }
    ],
    hiddenTests: [
      { name: "single value miss", args: [[1], 2], expected: 0 },
      { name: "empty list zero target", args: [[], 0], expected: 1 },
      { name: "empty list nonzero target", args: [[], 5], expected: 0 },
      { name: "two ones cancel", args: [[1, 1], 0], expected: 2 },
      { name: "zeros all match", args: [[0, 0], 0], expected: 4 }
    ],
    time: "O(2^n)",
    space: "O(n)"
  }
];
