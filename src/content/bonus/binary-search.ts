import type { BonusSeed } from "./types";

/**
 * Binary Search bonus problems. Concepts: lower bound, upper bound, rotated
 * arrays, answer-space search with a monotonic predicate, integer math, and
 * 2D search. Every problem is decided by a sorted array, a boundary, or a
 * monotone predicate — distinct from the guided set and from each other.
 */
export const bonus: BonusSeed[] = [
  {
    id: "binary-search-bonus-01",
    chapterId: "binary-search",
    title: "Classic Binary Search",
    difficulty: "warmup",
    patterns: ["binary-search", "sorted array"],
    entrypoint: "binary_search",
    signature: "nums, target",
    prompt:
      "Given a list of integers sorted in strictly increasing order, return the index of target. If target is not present, return -1.",
    constraints: [
      "The list is sorted in strictly increasing order with no duplicates.",
      "The list may be empty; return -1 then.",
      "Do not scan linearly — the running time must be logarithmic."
    ],
    hints: [
      "Keep an inclusive range [left, right] of indices that might still hold the target.",
      "Compare the middle value with the target and discard the half that cannot contain it."
    ],
    solution:
      "Maintain an inclusive window [left, right]. Look at the middle index: if it equals the target, return it; if it is too small, move left past mid; otherwise move right before mid. Stop when the window is empty.",
    walkthrough:
      "Each comparison halves the candidate range, because a sorted array tells you which side the target must be on. When left passes right the window is empty and the target is absent.",
    followUps: [
      "Why is computing mid as left + (right - left) // 2 safer than (left + right) // 2 in languages with fixed-width integers?",
      "How would you adapt this if the array were sorted in decreasing order?"
    ],
    code: `def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
`,
    visibleTests: [
      { name: "found in middle", args: [[1, 3, 5, 7, 9], 5], expected: 2 },
      { name: "absent", args: [[1, 3, 5, 7, 9], 6], expected: -1 }
    ],
    hiddenTests: [
      { name: "empty", args: [[], 4], expected: -1 },
      { name: "single match", args: [[8], 8], expected: 0 },
      { name: "single miss", args: [[8], 3], expected: -1 },
      { name: "first element", args: [[2, 4, 6, 8], 2], expected: 0 },
      { name: "last element", args: [[2, 4, 6, 8], 8], expected: 3 },
      { name: "below all", args: [[5, 6, 7], 1], expected: -1 },
      { name: "above all", args: [[5, 6, 7], 9], expected: -1 },
      { name: "negatives", args: [[-9, -4, 0, 3], -4], expected: 1 }
    ],
    time: "O(log n)",
    space: "O(1)"
  },
  {
    id: "binary-search-bonus-02",
    chapterId: "binary-search",
    title: "Upper Bound Index",
    difficulty: "easy",
    patterns: ["binary-search", "boundary", "upper bound"],
    entrypoint: "upper_bound",
    signature: "nums, target",
    prompt:
      "Given a list of integers sorted in non-decreasing order, return the index of the first element strictly greater than target. If every element is less than or equal to target, return the length of the list.",
    constraints: [
      "The list is sorted in non-decreasing order and may contain duplicates.",
      "The list may be empty; return 0 then.",
      "The answer is in the range 0 to len(nums) inclusive."
    ],
    hints: [
      "Use a half-open range [left, right) over insertion positions, not over existing indices.",
      "When the middle value is still less than or equal to target, the answer is strictly to the right."
    ],
    solution:
      "Search the half-open range [0, len(nums)] for the first position whose value exceeds target. When nums[mid] <= target the answer lies after mid, so move left to mid + 1; otherwise pull right down to mid. The collapsed range is the answer.",
    walkthrough:
      "The predicate 'value > target' is false on a prefix and true on the rest, so it flips exactly once. Binary search converges on that flip point, which is the count of elements <= target.",
    followUps: [
      "How would you reuse this to count exactly how many elements equal target?",
      "What is the relationship between this upper bound and a lower bound search?"
    ],
    code: `def upper_bound(nums, target):
    left, right = 0, len(nums)
    while left < right:
        mid = (left + right) // 2
        if nums[mid] <= target:
            left = mid + 1
        else:
            right = mid
    return left
`,
    visibleTests: [
      { name: "after duplicates", args: [[1, 2, 2, 2, 5], 2], expected: 4 },
      { name: "past the end", args: [[1, 2, 3], 9], expected: 3 }
    ],
    hiddenTests: [
      { name: "empty", args: [[], 4], expected: 0 },
      { name: "before all", args: [[4, 5, 6], 1], expected: 0 },
      { name: "single equal", args: [[7], 7], expected: 1 },
      { name: "single greater", args: [[7], 2], expected: 0 },
      { name: "single smaller", args: [[7], 9], expected: 1 },
      { name: "all equal target", args: [[3, 3, 3], 3], expected: 3 },
      { name: "between values", args: [[1, 3, 5, 7], 4], expected: 2 },
      { name: "target absent low", args: [[2, 4, 6], 3], expected: 1 }
    ],
    time: "O(log n)",
    space: "O(1)"
  },
  {
    id: "binary-search-bonus-03",
    chapterId: "binary-search",
    title: "Count Target Occurrences",
    difficulty: "easy",
    patterns: ["binary-search", "boundary", "lower bound"],
    entrypoint: "count_occurrences",
    signature: "nums, target",
    prompt:
      "Given a list of integers sorted in non-decreasing order, return how many times target appears. The answer must be computed in logarithmic time.",
    constraints: [
      "The list is sorted in non-decreasing order and may contain duplicates.",
      "The list may be empty; return 0 then.",
      "Do not scan the list linearly to tally matches."
    ],
    hints: [
      "The matching values, if any, form one contiguous block.",
      "Find the first index that is at least target and the first index that is strictly greater than target; subtract."
    ],
    solution:
      "Run two boundary searches with a shared helper that finds the first index whose value is at least a given key. The first index at least target and the first index at least target + 1 bracket the block of matches; their difference is the count.",
    walkthrough:
      "Equal values in a sorted list are contiguous. The lower bound of target is where the block starts and the lower bound of target + 1 is where it ends, so the gap between them is exactly the number of matches.",
    followUps: [
      "Why does searching for target + 1 give the same result as an upper-bound search for target?",
      "How would this change if the values were floating-point numbers?"
    ],
    code: `def count_occurrences(nums, target):
    def first_at_least(key):
        left, right = 0, len(nums)
        while left < right:
            mid = (left + right) // 2
            if nums[mid] < key:
                left = mid + 1
            else:
                right = mid
        return left

    return first_at_least(target + 1) - first_at_least(target)
`,
    visibleTests: [
      { name: "three copies", args: [[1, 2, 2, 2, 3], 2], expected: 3 },
      { name: "absent", args: [[1, 2, 3, 4], 5], expected: 0 }
    ],
    hiddenTests: [
      { name: "empty", args: [[], 1], expected: 0 },
      { name: "single match", args: [[4], 4], expected: 1 },
      { name: "single miss", args: [[4], 7], expected: 0 },
      { name: "all equal target", args: [[6, 6, 6, 6], 6], expected: 4 },
      { name: "at the front", args: [[2, 2, 5, 9], 2], expected: 2 },
      { name: "at the end", args: [[1, 4, 8, 8], 8], expected: 2 },
      { name: "gap value absent", args: [[1, 3, 5, 7], 4], expected: 0 },
      { name: "negatives", args: [[-3, -3, -1, 0], -3], expected: 2 }
    ],
    time: "O(log n)",
    space: "O(1)"
  },
  {
    id: "binary-search-bonus-04",
    chapterId: "binary-search",
    title: "Find Peak Element",
    difficulty: "medium",
    patterns: ["binary-search", "peak finding"],
    entrypoint: "find_peak_element",
    signature: "nums",
    prompt:
      "A peak is an element strictly greater than both of its neighbours; positions just past either end count as negative infinity. Given a list where no two adjacent values are equal, return the index of any peak.",
    constraints: [
      "No two adjacent elements are equal, so a peak always exists.",
      "The list has at least one element.",
      "Treat the space beyond either end as smaller than every element."
    ],
    hints: [
      "You do not need a sorted array — compare the middle element with its right neighbour.",
      "If the middle is smaller than its right neighbour an uphill slope means a peak lies to the right."
    ],
    solution:
      "Keep an inclusive range and compare nums[mid] with nums[mid + 1]. If the slope rises, a peak must exist to the right, so move left past mid; otherwise a peak is at mid or to its left, so pull right down to mid. The range collapses onto a peak.",
    walkthrough:
      "Whichever direction goes uphill must eventually reach a peak, because the ends act as negative infinity. Halving the range toward the uphill side guarantees a peak inside the remaining window.",
    followUps: [
      "Why is a peak guaranteed even though the array is not sorted?",
      "How would you find the global maximum instead, and why does that need a full scan?"
    ],
    code: `def find_peak_element(nums):
    left, right = 0, len(nums) - 1
    while left < right:
        mid = (left + right) // 2
        if nums[mid] < nums[mid + 1]:
            left = mid + 1
        else:
            right = mid
    return left
`,
    visibleTests: [
      { name: "peak on the right", args: [[1, 2, 3, 1]], expected: 2 },
      { name: "peak among two humps", args: [[1, 2, 1, 3, 5, 6, 4]], expected: 5 }
    ],
    hiddenTests: [
      { name: "single", args: [[9]], expected: 0 },
      { name: "two ascending", args: [[1, 2]], expected: 1 },
      { name: "two descending", args: [[2, 1]], expected: 0 },
      { name: "strictly increasing", args: [[1, 2, 3, 4]], expected: 3 },
      { name: "strictly decreasing", args: [[4, 3, 2, 1]], expected: 0 },
      { name: "peak in middle", args: [[1, 5, 2]], expected: 1 },
      { name: "negatives", args: [[-5, -2, -3]], expected: 1 }
    ],
    time: "O(log n)",
    space: "O(1)"
  },
  {
    id: "binary-search-bonus-05",
    chapterId: "binary-search",
    title: "Minimum In Rotated Array",
    difficulty: "medium",
    patterns: ["binary-search", "rotated sorted array"],
    entrypoint: "find_min_rotated",
    signature: "nums",
    prompt:
      "A list sorted in increasing order with distinct values has been rotated at an unknown pivot. Return its smallest element.",
    constraints: [
      "All values are distinct.",
      "The list has at least one element.",
      "The list may not be rotated at all, in which case the first element is smallest."
    ],
    hints: [
      "Compare the middle value with the value at the right end of the current range.",
      "If the middle is greater than the rightmost value, the rotation point and the minimum lie to its right."
    ],
    solution:
      "Keep a range [left, right]. Compare nums[mid] with nums[right]: if nums[mid] is larger, the unsorted drop is to the right so move left to mid + 1; otherwise the minimum is at mid or to its left so pull right to mid. The range collapses on the minimum.",
    walkthrough:
      "The rotation splits the array into two sorted runs. Comparing against the right end reveals which run mid sits in, and the minimum is the start of the second run, so each step discards the run that cannot contain it.",
    followUps: [
      "Why is comparing against the right end more robust than comparing against the left end?",
      "How does the logic need to change if duplicate values are allowed?"
    ],
    code: `def find_min_rotated(nums):
    left, right = 0, len(nums) - 1
    while left < right:
        mid = (left + right) // 2
        if nums[mid] > nums[right]:
            left = mid + 1
        else:
            right = mid
    return nums[left]
`,
    visibleTests: [
      { name: "rotated", args: [[4, 5, 6, 7, 0, 1, 2]], expected: 0 },
      { name: "rotated small", args: [[3, 1, 2]], expected: 1 }
    ],
    hiddenTests: [
      { name: "single", args: [[5]], expected: 5 },
      { name: "two rotated", args: [[2, 1]], expected: 1 },
      { name: "two sorted", args: [[1, 2]], expected: 1 },
      { name: "not rotated", args: [[1, 2, 3, 4, 5]], expected: 1 },
      { name: "rotated by one", args: [[5, 1, 2, 3, 4]], expected: 1 },
      { name: "minimum at end position", args: [[2, 3, 4, 5, 1]], expected: 1 },
      { name: "negatives", args: [[0, 1, -3, -2, -1]], expected: -3 }
    ],
    time: "O(log n)",
    space: "O(1)"
  },
  {
    id: "binary-search-bonus-06",
    chapterId: "binary-search",
    title: "Search A 2D Matrix",
    difficulty: "medium",
    patterns: ["binary-search", "matrix"],
    entrypoint: "search_matrix",
    signature: "matrix, target",
    prompt:
      "A matrix has each row sorted left to right, and the first value of every row is greater than the last value of the row above it. Return True if target appears in the matrix, otherwise False.",
    constraints: [
      "Every row has the same length; the matrix may have zero rows or zero columns.",
      "Reading the rows back to back yields one fully sorted sequence.",
      "Aim for logarithmic time in the total number of cells."
    ],
    hints: [
      "Because the rows chain together, the whole matrix behaves like one sorted list of length rows times columns.",
      "Map a flat index i to the cell at row i // columns and column i % columns."
    ],
    solution:
      "Treat the matrix as a virtual sorted array of length rows * columns. Binary search the flat index range; convert each midpoint to a (row, column) pair with integer division and modulo, then compare that cell with target.",
    walkthrough:
      "The chaining guarantee means flattening the matrix row by row produces a sorted array. Index arithmetic recovers the real cell from a flat position, so a single binary search over flat indices suffices.",
    followUps: [
      "How would the approach change if only each row were sorted, with no relation between rows?",
      "What is the time complexity of a staircase search that starts from a corner instead?"
    ],
    code: `def search_matrix(matrix, target):
    if not matrix or not matrix[0]:
        return False
    rows, cols = len(matrix), len(matrix[0])
    left, right = 0, rows * cols - 1
    while left <= right:
        mid = (left + right) // 2
        value = matrix[mid // cols][mid % cols]
        if value == target:
            return True
        if value < target:
            left = mid + 1
        else:
            right = mid - 1
    return False
`,
    visibleTests: [
      {
        name: "present",
        args: [[[1, 3, 5], [7, 9, 11], [13, 15, 17]], 9],
        expected: true
      },
      {
        name: "absent",
        args: [[[1, 3, 5], [7, 9, 11], [13, 15, 17]], 8],
        expected: false
      }
    ],
    hiddenTests: [
      { name: "empty matrix", args: [[], 1], expected: false },
      { name: "empty row", args: [[[]], 1], expected: false },
      { name: "single cell match", args: [[[4]], 4], expected: true },
      { name: "single cell miss", args: [[[4]], 9], expected: false },
      { name: "first cell", args: [[[1, 2], [3, 4]], 1], expected: true },
      { name: "last cell", args: [[[1, 2], [3, 4]], 4], expected: true },
      { name: "below all", args: [[[5, 6], [7, 8]], 1], expected: false },
      { name: "above all", args: [[[5, 6], [7, 8]], 99], expected: false },
      { name: "single row", args: [[[2, 4, 6, 8]], 6], expected: true }
    ],
    time: "O(log (m*n))",
    space: "O(1)"
  },
  {
    id: "binary-search-bonus-07",
    chapterId: "binary-search",
    title: "Minimum Eating Speed",
    difficulty: "medium",
    patterns: ["binary-search", "answer search", "feasibility"],
    entrypoint: "min_eating_speed",
    signature: "piles, hours",
    prompt:
      "There are piles of bananas with given sizes. At a chosen integer speed the eater finishes one pile per hour, eating that speed many bananas and stopping early when a pile runs out. Return the smallest speed that clears every pile within hours hours.",
    constraints: [
      "There are at least as many available hours as there are piles.",
      "Each pile size is a positive integer.",
      "A larger speed never needs more hours, so feasibility is monotonic."
    ],
    hints: [
      "Hours needed for one pile at a given speed is the pile size divided by speed, rounded up.",
      "Binary search the speed between 1 and the largest pile, checking total hours against the limit."
    ],
    solution:
      "Search the speed range [1, max(piles)]. For a candidate speed, sum the ceiling of each pile divided by the speed; if that total fits within hours the speed works, so try smaller speeds, otherwise try larger ones. Return the smallest workable speed.",
    walkthrough:
      "Total hours falls monotonically as speed rises, so 'fits within the hour budget' is false for slow speeds and true for fast ones. Binary search finds the single crossover, which is the minimum speed.",
    followUps: [
      "Why can the search lower bound be 1 rather than 0?",
      "How would fractional eating speeds change the structure of the search?"
    ],
    code: `def min_eating_speed(piles, hours):
    def hours_needed(speed):
        return sum((pile + speed - 1) // speed for pile in piles)

    left, right = 1, max(piles)
    while left < right:
        mid = (left + right) // 2
        if hours_needed(mid) <= hours:
            right = mid
        else:
            left = mid + 1
    return left
`,
    visibleTests: [
      { name: "moderate budget", args: [[3, 6, 7, 11], 8], expected: 4 },
      { name: "tight budget", args: [[30, 11, 23, 4, 20], 5], expected: 30 }
    ],
    hiddenTests: [
      { name: "single pile exact hours", args: [[10], 10], expected: 1 },
      { name: "single pile one hour", args: [[10], 1], expected: 10 },
      { name: "loose budget", args: [[30, 11, 23, 4, 20], 6], expected: 23 },
      { name: "all equal piles", args: [[4, 4, 4, 4], 4], expected: 4 },
      { name: "ones", args: [[1, 1, 1], 3], expected: 1 },
      { name: "one big pile padded", args: [[1, 1, 100], 4], expected: 50 },
      { name: "abundant hours", args: [[5, 8, 6], 100], expected: 1 }
    ],
    time: "O(n log m)",
    space: "O(1)"
  },
  {
    id: "binary-search-bonus-08",
    chapterId: "binary-search",
    title: "Split Array Largest Sum",
    difficulty: "medium",
    patterns: ["binary-search", "answer search", "feasibility"],
    entrypoint: "split_array_min_largest",
    signature: "nums, k",
    prompt:
      "Split the list into exactly k non-empty contiguous parts. Each part has a sum. Return the smallest possible value of the largest part sum.",
    constraints: [
      "All values are non-negative integers.",
      "k is at least 1 and at most the length of the list.",
      "The parts must be contiguous and together cover the whole list."
    ],
    hints: [
      "Guess a cap on the part sum, then greedily count how many parts that cap forces.",
      "Binary search the cap between the largest single value and the total sum."
    ],
    solution:
      "Search the cap range [max(nums), sum(nums)]. For a candidate cap, sweep left to right starting a new part whenever adding the next value would exceed the cap, and count the parts. If the count is at most k the cap is achievable, so try smaller caps; otherwise try larger ones.",
    walkthrough:
      "A larger cap never needs more parts, so 'this cap can be done with at most k parts' is monotonic. The smallest cap that still keeps the part count within k is the answer the binary search converges to.",
    followUps: [
      "Why must the lower bound be the maximum element rather than zero?",
      "How does this relate to the dynamic-programming solution, and which scales better?"
    ],
    code: `def split_array_min_largest(nums, k):
    def parts_needed(cap):
        parts, current = 1, 0
        for value in nums:
            if current + value > cap:
                parts += 1
                current = value
            else:
                current += value
        return parts

    left, right = max(nums), sum(nums)
    while left < right:
        mid = (left + right) // 2
        if parts_needed(mid) <= k:
            right = mid
        else:
            left = mid + 1
    return left
`,
    visibleTests: [
      { name: "three parts", args: [[7, 2, 5, 10, 8], 2], expected: 18 },
      { name: "two parts", args: [[1, 2, 3, 4, 5], 2], expected: 9 }
    ],
    hiddenTests: [
      { name: "one part is whole sum", args: [[1, 4, 4], 1], expected: 9 },
      { name: "k equals length", args: [[1, 4, 4], 3], expected: 4 },
      { name: "single element", args: [[9], 1], expected: 9 },
      { name: "all equal", args: [[5, 5, 5, 5], 2], expected: 10 },
      { name: "zeros present", args: [[0, 0, 0, 7], 2], expected: 7 },
      { name: "many small parts", args: [[2, 3, 1, 2, 4, 3], 3], expected: 6 },
      { name: "max dominates", args: [[1, 1, 1, 20], 2], expected: 20 }
    ],
    time: "O(n log S)",
    space: "O(1)"
  },
  {
    id: "binary-search-bonus-09",
    chapterId: "binary-search",
    title: "Cube Root Floor",
    difficulty: "easy",
    patterns: ["binary-search", "answer search", "integer math"],
    entrypoint: "cube_root_floor",
    signature: "n",
    prompt:
      "Given a non-negative integer n, return the greatest integer x such that x cubed is less than or equal to n. Do not use floating-point arithmetic.",
    constraints: [
      "The input n is a non-negative integer.",
      "cube_root_floor(0) must return 0.",
      "Use only integer operations — no floating-point roots or powers."
    ],
    hints: [
      "Search the answer space of candidate roots, not an array.",
      "The cube function is increasing, so 'x cubed is at most n' is true on a prefix of candidates."
    ],
    solution:
      "Binary search candidate roots in [0, n]. For each midpoint compare mid cubed with n: if it does not exceed n the midpoint is feasible so record it and search higher, otherwise search lower. The last feasible midpoint is the floor of the cube root.",
    walkthrough:
      "Cubing is monotonically increasing for non-negative integers, so the candidates split cleanly into 'cube fits' and 'cube too big'. Integer multiplication keeps the comparison exact, avoiding floating-point rounding errors.",
    followUps: [
      "Why can floating-point math give the wrong answer for large perfect cubes?",
      "How would you generalise this to an integer k-th root?"
    ],
    code: `def cube_root_floor(n):
    left, right = 0, n
    answer = 0
    while left <= right:
        mid = (left + right) // 2
        if mid * mid * mid <= n:
            answer = mid
            left = mid + 1
        else:
            right = mid - 1
    return answer
`,
    visibleTests: [
      { name: "perfect cube", args: [27], expected: 3 },
      { name: "not a cube", args: [30], expected: 3 }
    ],
    hiddenTests: [
      { name: "zero", args: [0], expected: 0 },
      { name: "one", args: [1], expected: 1 },
      { name: "just below eight", args: [7], expected: 1 },
      { name: "eight", args: [8], expected: 2 },
      { name: "just below sixty four", args: [63], expected: 3 },
      { name: "large perfect cube", args: [1000000], expected: 100 },
      { name: "large non cube", args: [999999], expected: 99 }
    ],
    time: "O(log n)",
    space: "O(1)"
  },
  {
    id: "binary-search-bonus-10",
    chapterId: "binary-search",
    title: "Search In Infinite Array",
    difficulty: "easy",
    patterns: ["binary-search", "exponential search"],
    entrypoint: "search_unknown_size",
    signature: "nums, target",
    prompt:
      "Given a list sorted in strictly increasing order whose length you are asked to treat as unknown, return the index of target, or -1. First find a bound that contains the target, then search inside it.",
    constraints: [
      "The list is sorted in strictly increasing order with no duplicates.",
      "The list may be empty; return -1 then.",
      "Pretend the length is unknown — discover a search bound by doubling instead of reading it directly."
    ],
    hints: [
      "Start with a tiny range and double its high end until it reaches past the target or past the list.",
      "Once the target is bracketed, run an ordinary binary search inside that range."
    ],
    solution:
      "Grow a high index from 1, doubling it while the value there still exists and is less than target. That gives a window whose size is on the order of the target position. Then binary search the bracketed range [low, high] normally.",
    walkthrough:
      "Doubling reaches an index past the target in a logarithmic number of steps, so the located bound is at most twice the target index. The follow-up binary search over that bound is also logarithmic, keeping the total logarithmic in the answer position.",
    followUps: [
      "Why is exponential probing logarithmic in the target's position rather than in the array length?",
      "How would you handle an interface where reading out of bounds raises an error instead of being checkable?"
    ],
    code: `def search_unknown_size(nums, target):
    n = len(nums)
    if n == 0:
        return -1
    low, high = 0, 1
    while high < n and nums[high] < target:
        low = high
        high *= 2
    if high >= n:
        high = n - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
`,
    visibleTests: [
      { name: "found far in", args: [[1, 3, 5, 7, 9, 11, 13, 15], 13], expected: 6 },
      { name: "absent", args: [[1, 3, 5, 7, 9], 8], expected: -1 }
    ],
    hiddenTests: [
      { name: "empty", args: [[], 4], expected: -1 },
      { name: "single match", args: [[6], 6], expected: 0 },
      { name: "single miss", args: [[6], 2], expected: -1 },
      { name: "first element", args: [[2, 4, 6, 8, 10], 2], expected: 0 },
      { name: "last element", args: [[2, 4, 6, 8, 10], 10], expected: 4 },
      { name: "below all", args: [[5, 6, 7, 8], 1], expected: -1 },
      { name: "above all", args: [[5, 6, 7, 8], 99], expected: -1 },
      { name: "second element", args: [[1, 2, 3, 4, 5, 6, 7], 2], expected: 1 }
    ],
    time: "O(log p)",
    space: "O(1)"
  }
];
