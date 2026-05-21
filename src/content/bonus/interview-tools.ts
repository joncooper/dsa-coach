import type { BonusSeed } from "./types";

/**
 * Interview Tools + Mixed Review bonus problems. This is the synthesis
 * chapter: each problem is a real, approachable interview question drawn
 * from a different earlier family (two pointers, hashing, sliding window,
 * stacks, graphs, binary search). The prompts deliberately do not name
 * the pattern — diagnosing it is the exercise.
 */
export const bonus: BonusSeed[] = [
  {
    id: "interview-tools-bonus-01",
    chapterId: "interview-tools",
    title: "Reverse Vowels In Place",
    difficulty: "easy",
    patterns: ["interview-tools", "two-pointers", "in-place rearrange"],
    entrypoint: "reverse_vowels",
    signature: "text",
    prompt:
      "Given a string, reverse only its vowels and leave every other character exactly where it is. Vowels are a, e, i, o, u in either case. For example \"basket\" becomes \"beskat\" — the e and a swap, the consonants do not move.",
    constraints: [
      "The input may be the empty string; return an empty string then.",
      "A vowel is one of a, e, i, o, u, and the check is case-insensitive.",
      "Non-vowel characters keep their original positions; only vowels are reordered."
    ],
    hints: [
      "Put a marker at each end of the string and walk the two markers toward each other.",
      "Advance a marker past any consonant; only when both markers sit on vowels do you swap them and step both inward."
    ],
    solution:
      "Hold one index at each end of a mutable character list. Advance the left index until it lands on a vowel and the right index until it lands on a vowel, swap those two characters, then move both inward. Stop when the indices meet.",
    walkthrough:
      "The diagnosis is 'converging indices from both ends'. Consonants are skipped, so only vowel positions ever pair up; each swap fixes the outermost unmatched vowel pair, and because the two indices only ever move inward the whole rearrangement is one linear pass.",
    followUps: [
      "How would you instead reverse only the consonants and leave the vowels fixed?",
      "What changes if you had to reverse vowels within each whitespace-separated word independently?"
    ],
    code: `def reverse_vowels(text):
    vowels = set("aeiouAEIOU")
    chars = list(text)
    left, right = 0, len(chars) - 1
    while left < right:
        if chars[left] not in vowels:
            left += 1
        elif chars[right] not in vowels:
            right -= 1
        else:
            chars[left], chars[right] = chars[right], chars[left]
            left += 1
            right -= 1
    return "".join(chars)
`,
    visibleTests: [
      { name: "swap two vowels", args: ["basket"], expected: "beskat" },
      { name: "vowels reorder", args: ["hello"], expected: "holle" }
    ],
    hiddenTests: [
      { name: "empty", args: [""], expected: "" },
      { name: "no vowels", args: ["rhythm"], expected: "rhythm" },
      { name: "single vowel", args: ["e"], expected: "e" },
      { name: "all vowels", args: ["aeiou"], expected: "uoiea" },
      { name: "mixed case preserved", args: ["AEIOU"], expected: "UOIEA" },
      { name: "adjacent vowels", args: ["queue"], expected: "qeueu" },
      { name: "palindromic vowels", args: ["racecar"], expected: "racecar" }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "interview-tools-bonus-02",
    chapterId: "interview-tools",
    title: "The Unpaired Number",
    difficulty: "easy",
    patterns: ["interview-tools", "hashing", "sets"],
    entrypoint: "unpaired_number",
    signature: "nums",
    prompt:
      "Every value in the list appears exactly twice, except for one value that appears exactly once. Return that unpaired value.",
    constraints: [
      "Exactly one value appears an odd number of times; all others appear twice.",
      "The list is never empty.",
      "Values may be negative and may appear in any order."
    ],
    hints: [
      "A value that arrives a second time can cancel its first appearance.",
      "Track which values are currently unmatched; add a value when first seen, remove it when seen again."
    ],
    solution:
      "Scan the list keeping a set of values seen an odd number of times: add a value when it is new, remove it when it reappears. Exactly one value remains at the end.",
    walkthrough:
      "The diagnosis here is 'pairing' — a set that toggles membership cancels every matched pair, so only the lone value survives. Recognising that membership-toggle, not counting, is enough keeps it to one pass and one set.",
    followUps: [
      "How would you solve this with O(1) extra space using the XOR operator?",
      "What changes if two values could be unpaired instead of one?"
    ],
    code: `def unpaired_number(nums):
    unmatched = set()
    for value in nums:
        if value in unmatched:
            unmatched.discard(value)
        else:
            unmatched.add(value)
    return next(iter(unmatched))
`,
    visibleTests: [
      { name: "lone in middle", args: [[4, 1, 2, 1, 2]], expected: 4 },
      { name: "lone first", args: [[7, 3, 3]], expected: 7 }
    ],
    hiddenTests: [
      { name: "single element", args: [[9]], expected: 9 },
      { name: "negatives", args: [[-5, 2, 2, -5, -8]], expected: -8 },
      { name: "lone is zero", args: [[0, 6, 6]], expected: 0 },
      { name: "lone last", args: [[1, 1, 2, 2, 5]], expected: 5 },
      { name: "larger list", args: [[3, 3, 9, 9, 4, 7, 7]], expected: 4 }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "interview-tools-bonus-03",
    chapterId: "interview-tools",
    title: "Longest Run Of At Most Two Values",
    difficulty: "medium",
    patterns: ["interview-tools", "two-pointers-sliding-window", "variable window"],
    entrypoint: "longest_two_value_run",
    signature: "nums",
    prompt:
      "Return the length of the longest contiguous subarray that contains at most two distinct values.",
    constraints: [
      "The list may be empty; the answer is then 0.",
      "The subarray must be contiguous, not a subsequence.",
      "A subarray with one or two distinct values is allowed; three or more is not."
    ],
    hints: [
      "Grow a window on the right and keep a count of how many of each value it holds.",
      "When the window holds three distinct values, shrink it from the left until only two remain."
    ],
    solution:
      "Slide a variable window while a frequency map tracks the values inside it. Each time a third distinct value appears, drop values from the left until one of them disappears. The widest valid window is the answer.",
    walkthrough:
      "The diagnosis is 'variable window with a constraint'. The constraint — at most two distinct keys in the map — is repaired by shrinking from the left, and because each index enters and leaves once the scan stays linear.",
    followUps: [
      "How would you generalise this to at most k distinct values?",
      "What if you needed the subarray itself, not just its length?"
    ],
    code: `def longest_two_value_run(nums):
    counts = {}
    left = 0
    best = 0
    for right, value in enumerate(nums):
        counts[value] = counts.get(value, 0) + 1
        while len(counts) > 2:
            counts[nums[left]] -= 1
            if counts[nums[left]] == 0:
                del counts[nums[left]]
            left += 1
        best = max(best, right - left + 1)
    return best
`,
    visibleTests: [
      { name: "three distinct values", args: [[1, 2, 1, 2, 3]], expected: 4 },
      { name: "all the same", args: [[5, 5, 5, 5]], expected: 4 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "single", args: [[8]], expected: 1 },
      { name: "exactly two", args: [[1, 1, 2, 2]], expected: 4 },
      { name: "window at end", args: [[4, 5, 6, 7, 7]], expected: 3 },
      { name: "alternating", args: [[9, 8, 9, 8, 9]], expected: 5 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "interview-tools-bonus-04",
    chapterId: "interview-tools",
    title: "Balanced Brackets",
    difficulty: "medium",
    patterns: ["interview-tools", "stacks-queues", "stack"],
    entrypoint: "is_balanced",
    signature: "text",
    prompt:
      "A string contains only the bracket characters (), [], and {}. Return True if every bracket is closed by the matching type in the correct order, and False otherwise.",
    constraints: [
      "The empty string is balanced; return True then.",
      "A closing bracket must match the most recently opened, still-open bracket.",
      "The input contains only the six bracket characters."
    ],
    hints: [
      "Opening brackets must be remembered so the matching close can be checked later.",
      "The most recently opened bracket is the first that must be closed — that ordering is the clue."
    ],
    solution:
      "Push every opening bracket onto a stack. On a closing bracket, pop the stack and confirm it is the matching opener; fail if the stack is empty. The string is balanced only if the stack is empty at the end.",
    walkthrough:
      "Nesting means the last opener must close first — last in, first out — which is exactly a stack. A mismatch, an unexpected close, or leftover openers each signal an imbalance.",
    followUps: [
      "How would you also return the index of the first offending bracket?",
      "What changes if other, non-bracket characters were allowed in the string?"
    ],
    code: `def is_balanced(text):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in text:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack
`,
    visibleTests: [
      { name: "nested ok", args: ["{[()]}"], expected: true },
      { name: "wrong order", args: ["(]"], expected: false }
    ],
    hiddenTests: [
      { name: "empty", args: [""], expected: true },
      { name: "single open", args: ["("], expected: false },
      { name: "single close", args: [")"], expected: false },
      { name: "interleaved valid", args: ["()[]{}"], expected: true },
      { name: "crossed pairs", args: ["([)]"], expected: false }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "interview-tools-bonus-05",
    chapterId: "interview-tools",
    title: "Count Islands",
    difficulty: "medium",
    patterns: ["interview-tools", "trees-graphs", "DFS", "connected components"],
    entrypoint: "count_islands",
    signature: "grid",
    prompt:
      "A grid contains 0s (water) and 1s (land). An island is a group of 1s connected horizontally or vertically. Return the number of distinct islands.",
    constraints: [
      "The grid may be empty; return 0 then.",
      "Cells touching only diagonally are not connected.",
      "The grid is rectangular: every row has the same length."
    ],
    hints: [
      "Scan every cell; each unvisited piece of land starts a new island.",
      "From a starting land cell, reach all connected land and mark it so it is not counted twice."
    ],
    solution:
      "Walk every cell. When an unvisited land cell is found, increment the island count and flood it — visiting all four-directionally connected land — sinking each cell to water so it is never revisited.",
    walkthrough:
      "Each island is one connected component of the land graph. Starting a flood fill only on still-unvisited land, and sinking what it reaches, guarantees every island is counted exactly once.",
    followUps: [
      "How would you return the size of the largest island instead of the count?",
      "What if diagonal neighbours also counted as connected?"
    ],
    code: `def count_islands(grid):
    if not grid or not grid[0]:
        return 0
    rows, cols = len(grid), len(grid[0])

    def sink(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == 0:
            return
        grid[r][c] = 0
        sink(r + 1, c)
        sink(r - 1, c)
        sink(r, c + 1)
        sink(r, c - 1)

    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                islands += 1
                sink(r, c)
    return islands
`,
    visibleTests: [
      {
        name: "two islands",
        args: [[[1, 1, 0], [0, 0, 0], [0, 1, 1]]],
        expected: 2
      },
      {
        name: "all water",
        args: [[[0, 0], [0, 0]]],
        expected: 0
      }
    ],
    hiddenTests: [
      { name: "empty grid", args: [[]], expected: 0 },
      { name: "single land cell", args: [[[1]]], expected: 1 },
      {
        name: "one big island",
        args: [[[1, 1, 1], [1, 1, 1]]],
        expected: 1
      },
      {
        name: "diagonal not connected",
        args: [[[1, 0], [0, 1]]],
        expected: 2
      },
      {
        name: "u-shaped island",
        args: [[[1, 0, 1], [1, 0, 1], [1, 1, 1]]],
        expected: 1
      }
    ],
    time: "O(r * c)",
    space: "O(r * c)"
  },
  {
    id: "interview-tools-bonus-06",
    chapterId: "interview-tools",
    title: "Peak Element Index",
    difficulty: "medium",
    patterns: ["interview-tools", "binary-search", "halving search"],
    entrypoint: "peak_index",
    signature: "nums",
    prompt:
      "A peak is an element strictly greater than each of its immediate neighbours; positions off either end of the list count as negative infinity. The list never has two equal adjacent values, so a peak always exists. Return the index of any one peak. Aim for a search that runs in better than linear time.",
    constraints: [
      "The list has at least one element.",
      "No two adjacent elements are equal, which guarantees at least one peak.",
      "If several peaks exist, returning the index of any one of them is accepted."
    ],
    hints: [
      "Inspect the middle element and compare it with its right neighbour.",
      "If the middle is smaller than its right neighbour, a peak must lie strictly to the right; otherwise a peak lies at the middle or to its left."
    ],
    solution:
      "Keep a low and high bound around the answer. At each midpoint, compare it with the next element: if the slope rises, discard the left half by moving low past the midpoint; if it falls or is flat at the end, keep the midpoint and discard the right. The bounds converge on a peak.",
    walkthrough:
      "The diagnosis is 'halve the search range each step'. An upward slope at the midpoint always has a peak somewhere above it, and a downward slope always has one at or below it, so half the indices can be dropped every iteration — a logarithmic search rather than a scan.",
    followUps: [
      "How does the argument change if equal adjacent values were allowed?",
      "How would you find a peak in a 2-D grid instead of a 1-D list?"
    ],
    code: `def peak_index(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < nums[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo
`,
    visibleTests: [
      { name: "peak in middle", args: [[1, 3, 2]], expected: 1 },
      { name: "strictly increasing", args: [[1, 2, 3, 4, 5]], expected: 4 }
    ],
    hiddenTests: [
      { name: "single element", args: [[7]], expected: 0 },
      { name: "two ascending", args: [[1, 2]], expected: 1 },
      { name: "two descending", args: [[2, 1]], expected: 0 },
      { name: "strictly decreasing", args: [[5, 4, 3, 2, 1]], expected: 0 },
      { name: "peak then valley then peak", args: [[1, 2, 1, 3, 5, 6, 4]], expected: 5 },
      { name: "negative values", args: [[-9, -3, -7]], expected: 1 }
    ],
    time: "O(log n)",
    space: "O(1)"
  }
];
