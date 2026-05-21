import type { BonusSeed } from "./types";

/**
 * Two Pointers & Sliding Window bonus problems. Concepts: opposite pointers,
 * same-direction pointers, fixed windows, variable windows, palindromes. Each
 * seed drills one of those patterns on a fresh task, distinct from the guided
 * set (Closest Pair Sum, Trim Adjacent Pairs, Max Sum Under Limit, Longest
 * With Flips, Palindrome Edge Score, Sorted Squares Local) and from each other.
 */
export const bonus: BonusSeed[] = [
  {
    id: "two-pointers-sliding-window-bonus-01",
    chapterId: "two-pointers-sliding-window",
    title: "Container With Most Water",
    difficulty: "medium",
    patterns: ["two-pointers-sliding-window", "opposite pointers"],
    entrypoint: "max_water_area",
    signature: "heights",
    prompt:
      "Each value in the list is the height of a vertical line drawn at that index. Picking two lines, the water they trap is the shorter line's height times the index distance between them. Return the maximum area any pair of lines can hold.",
    constraints: [
      "A list with fewer than two lines holds no water; return 0 then.",
      "Heights are non-negative integers; a height of 0 contributes no area.",
      "Walk one pointer from each end inward — do not test every pair."
    ],
    hints: [
      "Start with the widest possible pair: one pointer at each end.",
      "The area is capped by the shorter line, so move the pointer at the shorter line inward — keeping the taller one is the only way the area can grow."
    ],
    solution:
      "Place a left pointer at the first line and a right pointer at the last. The area is the width between them times the shorter of the two heights. Record it, then advance whichever pointer sits on the shorter line, because moving the taller one can only shrink the width without lifting the height cap.",
    walkthrough:
      "Width shrinks by one on every step, so area can only improve if the height limit rises. Discarding the shorter line is safe: any pair still using that line would be narrower and no taller, so it cannot beat what was already recorded. One inward sweep therefore inspects every pair worth considering.",
    followUps: [
      "Why is it safe to discard the shorter line rather than the taller one?",
      "How would the answer change if equal heights let you move either pointer?"
    ],
    code: `def max_water_area(heights):
    left, right = 0, len(heights) - 1
    best = 0
    while left < right:
        height = min(heights[left], heights[right])
        best = max(best, height * (right - left))
        if heights[left] <= heights[right]:
            left += 1
        else:
            right -= 1
    return best
`,
    visibleTests: [
      { name: "classic case", args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { name: "two lines", args: [[1, 1]], expected: 1 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "single line", args: [[5]], expected: 0 },
      { name: "all zero", args: [[0, 0, 0]], expected: 0 },
      { name: "increasing", args: [[1, 2, 3, 4, 5]], expected: 6 },
      { name: "tall ends", args: [[6, 1, 1, 6]], expected: 18 },
      { name: "peak in middle", args: [[2, 9, 2]], expected: 4 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "two-pointers-sliding-window-bonus-02",
    chapterId: "two-pointers-sliding-window",
    title: "Two Sum In Sorted Array",
    difficulty: "easy",
    patterns: ["two-pointers-sliding-window", "opposite pointers", "sorted array"],
    entrypoint: "two_sum_sorted",
    signature: "nums, target",
    prompt:
      "Given a list sorted in non-decreasing order, return the indices [i, j] of two distinct positions whose values sum to target. If no such pair exists, return [-1, -1]. If several pairs work, any one is accepted by the tests below.",
    constraints: [
      "The list is sorted in non-decreasing order.",
      "The two indices must be distinct (i is left of j).",
      "Return [-1, -1] when no pair sums to the target."
    ],
    hints: [
      "Start a pointer at each end and look at the sum of those two values.",
      "If the sum is too small move the left pointer up; if too large move the right pointer down."
    ],
    solution:
      "Place a left pointer at the start and a right pointer at the end. Because the list is sorted, a sum below target can only grow by advancing left, and a sum above target can only shrink by retreating right. Stop when the pointers cross.",
    walkthrough:
      "Sortedness makes the sum monotonic with respect to each pointer, so every move eliminates exactly one value that can no longer be part of any answer. That is why one linear pass suffices instead of checking all pairs.",
    followUps: [
      "Why does this fail if the input is not sorted, and what would you do instead?",
      "How would you return every distinct pair that sums to the target?"
    ],
    code: `def two_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:
        total = nums[left] + nums[right]
        if total == target:
            return [left, right]
        if total < target:
            left += 1
        else:
            right -= 1
    return [-1, -1]
`,
    visibleTests: [
      { name: "pair found", args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { name: "no pair", args: [[1, 2], 100], expected: [-1, -1] }
    ],
    hiddenTests: [
      { name: "middle pair", args: [[1, 3, 4, 6, 8], 10], expected: [2, 3] },
      { name: "negatives", args: [[-3, -1, 2, 4], 1], expected: [0, 3] },
      { name: "zeros", args: [[0, 0], 0], expected: [0, 1] },
      { name: "single element", args: [[5], 5], expected: [-1, -1] },
      { name: "duplicates", args: [[1, 2, 3, 4, 4], 8], expected: [3, 4] }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "two-pointers-sliding-window-bonus-03",
    chapterId: "two-pointers-sliding-window",
    title: "Remove Element In Place",
    difficulty: "easy",
    patterns: ["two-pointers-sliding-window", "same-direction pointers"],
    entrypoint: "remove_element",
    signature: "nums, val",
    prompt:
      "Compact the list in place so that every occurrence of val is dropped and the surviving values fill the front of the list in their original order. Return the count of surviving values; whatever sits past that count does not matter.",
    constraints: [
      "The list is not sorted, so equal values need not be adjacent.",
      "An empty list yields a count of 0.",
      "Compact with a single forward pass and a write pointer — do not build a new list or call remove."
    ],
    hints: [
      "Keep a write pointer for the next slot a surviving value belongs in; it starts at 0.",
      "A read pointer scans every value; when the read value is not val, copy it to the write slot and advance the write pointer."
    ],
    solution:
      "Start a write pointer at 0. Sweep a read pointer across the list; whenever the read value differs from val, copy it into the write slot and advance the write pointer. Values equal to val are simply skipped, so they are overwritten by later survivors. The final write pointer is the count of values kept.",
    walkthrough:
      "The write pointer never moves faster than the read pointer, so a slot is only overwritten after its value has already been read. Skipping a matched value leaves the write pointer parked, ready to receive the next survivor — that is how the gap left by removed values is closed.",
    followUps: [
      "Why is it safe to overwrite nums[write] before the read pointer has passed it?",
      "If you only needed the count and not the compaction, how would the code simplify?"
    ],
    code: `def remove_element(nums, val):
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            nums[write] = nums[read]
            write += 1
    return write
`,
    visibleTests: [
      { name: "removes threes", args: [[3, 2, 2, 3], 3], expected: 2 },
      { name: "scattered target", args: [[0, 1, 2, 2, 3, 0, 4, 2], 2], expected: 5 }
    ],
    hiddenTests: [
      { name: "empty", args: [[], 1], expected: 0 },
      { name: "no match", args: [[1, 2, 3], 9], expected: 3 },
      { name: "all match", args: [[4, 4, 4], 4], expected: 0 },
      { name: "single kept", args: [[7], 2], expected: 1 },
      { name: "single removed", args: [[2], 2], expected: 0 },
      { name: "negatives", args: [[-1, 0, -1, 5], -1], expected: 2 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "two-pointers-sliding-window-bonus-04",
    chapterId: "two-pointers-sliding-window",
    title: "Valid Palindrome Ignoring Punctuation",
    difficulty: "easy",
    patterns: ["two-pointers-sliding-window", "opposite pointers", "palindromes"],
    entrypoint: "is_loose_palindrome",
    signature: "text",
    prompt:
      "Return True if the string is a palindrome when only letters and digits are considered and letter case is ignored; otherwise return False.",
    constraints: [
      "Comparison is case-insensitive.",
      "Characters that are not letters or digits are skipped, not compared.",
      "An empty string, or one with no alphanumeric characters, counts as a palindrome."
    ],
    hints: [
      "Run one pointer from each end toward the middle.",
      "If a pointer lands on a non-alphanumeric character, just advance that pointer and re-check before comparing."
    ],
    solution:
      "Walk a left and a right pointer inward. Skip any character that is not alphanumeric on either side. When both pointers rest on alphanumeric characters, compare them case-insensitively; a mismatch fails immediately.",
    walkthrough:
      "Skipping irrelevant characters in the pointer loop avoids building a cleaned copy of the string. Each pointer only ever moves inward, so the scan stays linear even with many punctuation characters.",
    followUps: [
      "How would the logic differ if you first built a filtered, lower-cased string?",
      "How would you allow at most one mismatched pair and still return True?"
    ],
    code: `def is_loose_palindrome(text):
    left, right = 0, len(text) - 1
    while left < right:
        if not text[left].isalnum():
            left += 1
            continue
        if not text[right].isalnum():
            right -= 1
            continue
        if text[left].lower() != text[right].lower():
            return False
        left += 1
        right -= 1
    return True
`,
    visibleTests: [
      { name: "classic phrase", args: ["A man, a plan, a canal: Panama"], expected: true },
      { name: "not a palindrome", args: ["race a car"], expected: false }
    ],
    hiddenTests: [
      { name: "empty", args: [""], expected: true },
      { name: "single letter", args: ["a"], expected: true },
      { name: "only punctuation", args: [".,"], expected: true },
      { name: "letter digit mismatch", args: ["0P"], expected: false },
      { name: "mixed case phrase", args: ["Was it a car or a cat I saw?"], expected: true }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "two-pointers-sliding-window-bonus-05",
    chapterId: "two-pointers-sliding-window",
    title: "Fixed Window Averages",
    difficulty: "warmup",
    patterns: ["two-pointers-sliding-window", "fixed window"],
    entrypoint: "window_averages",
    signature: "nums, k",
    prompt:
      "Return a list of the averages of every contiguous window of length k. The result has len(nums) - k + 1 entries. If k is not a valid window length, return an empty list.",
    constraints: [
      "Return an empty list when k is 0, negative, or larger than the list length.",
      "Each average is a float (use true division).",
      "Slide the window in one pass — do not re-sum each window from scratch."
    ],
    hints: [
      "Compute the sum of the first k values once to seed the window.",
      "To slide the window one step, add the entering value and subtract the leaving value."
    ],
    solution:
      "Sum the first k values to seed a running window total and record its average. Then slide: for each new right index, add the entering value and subtract the value k positions back, recording the average each time.",
    walkthrough:
      "A fixed-size window means exactly one value enters and one leaves per step, so the running sum updates in constant time. Recomputing each window would cost O(n*k); the rolling sum makes it O(n).",
    followUps: [
      "How would you return the maximum window average instead of every average?",
      "How would you adapt this to report window sums rather than averages?"
    ],
    code: `def window_averages(nums, k):
    if k <= 0 or k > len(nums):
        return []
    window = sum(nums[:k])
    out = [window / k]
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]
        out.append(window / k)
    return out
`,
    visibleTests: [
      { name: "windows of two", args: [[1, 2, 3, 4, 5], 2], expected: [1.5, 2.5, 3.5, 4.5] },
      { name: "whole array", args: [[4, 4, 4], 3], expected: [4.0] }
    ],
    hiddenTests: [
      { name: "k too large", args: [[1, 2], 5], expected: [] },
      { name: "empty list", args: [[], 2], expected: [] },
      { name: "k is zero", args: [[1, 2, 3], 0], expected: [] },
      { name: "k of one", args: [[2, 2, 2, 2], 1], expected: [2.0, 2.0, 2.0, 2.0] },
      { name: "negatives", args: [[-2, 0, 2, 4], 2], expected: [-1.0, 1.0, 3.0] }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "two-pointers-sliding-window-bonus-06",
    chapterId: "two-pointers-sliding-window",
    title: "Longest Substring Without Repeats",
    difficulty: "medium",
    patterns: ["two-pointers-sliding-window", "variable window"],
    entrypoint: "longest_unique_substring",
    signature: "text",
    prompt:
      "Return the length of the longest contiguous substring that contains no repeated character.",
    constraints: [
      "The string may be empty; the answer is then 0.",
      "Only contiguous substrings count, not subsequences.",
      "Aim for a single pass over the string."
    ],
    hints: [
      "Grow a window to the right and keep the set of characters currently inside it.",
      "When the new character is already in the window, shrink from the left until the duplicate is gone."
    ],
    solution:
      "Maintain a variable-size window with a set of its characters. Extend the right edge one character at a time; if that character already sits in the window, drop characters from the left until it does not. After each extension, the window holds a duplicate-free substring, so track its largest width.",
    walkthrough:
      "The left pointer only ever moves forward, so although there is an inner shrink loop each character is added and removed at most once, keeping the whole scan linear.",
    followUps: [
      "How would you also return the substring itself, not just its length?",
      "How could a dictionary of last-seen indices let the left pointer jump instead of creep?"
    ],
    code: `def longest_unique_substring(text):
    seen = set()
    left = 0
    best = 0
    for right, ch in enumerate(text):
        while ch in seen:
            seen.remove(text[left])
            left += 1
        seen.add(ch)
        best = max(best, right - left + 1)
    return best
`,
    visibleTests: [
      { name: "repeats break it", args: ["abcabcbb"], expected: 3 },
      { name: "all same", args: ["bbbbb"], expected: 1 }
    ],
    hiddenTests: [
      { name: "empty", args: [""], expected: 0 },
      { name: "single", args: ["a"], expected: 1 },
      { name: "all distinct", args: ["abcdef"], expected: 6 },
      { name: "duplicate spans window", args: ["pwwkew"], expected: 3 },
      { name: "shrink past one char", args: ["dvdf"], expected: 3 }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "two-pointers-sliding-window-bonus-07",
    chapterId: "two-pointers-sliding-window",
    title: "Shortest Subarray At Least Target",
    difficulty: "medium",
    patterns: ["two-pointers-sliding-window", "variable window"],
    entrypoint: "min_window_for_sum",
    signature: "nums, target",
    prompt:
      "All values are positive. Return the length of the shortest contiguous subarray whose sum is greater than or equal to target. If no subarray qualifies, return 0.",
    constraints: [
      "All values in the list are positive integers.",
      "Return 0 when even the sum of the whole list is below the target.",
      "The list may be empty; return 0 then."
    ],
    hints: [
      "Expand a window to the right, adding each value to a running sum.",
      "Whenever the running sum reaches the target, record the width and shrink from the left to look for something shorter."
    ],
    solution:
      "Grow the window by moving the right edge and adding values to a running sum. Each time the sum reaches the target, record the current width as a candidate answer, then subtract from the left to shrink the window while it still qualifies.",
    walkthrough:
      "Because every value is positive, removing a left value strictly lowers the sum, so the shrink loop is safe and finds the tightest valid window ending at each right index. Both pointers advance only forward, giving a linear scan.",
    followUps: [
      "Why does the positive-values assumption matter for the shrink step?",
      "How would you approach this if values could be negative?"
    ],
    code: `def min_window_for_sum(nums, target):
    left = 0
    total = 0
    best = len(nums) + 1
    for right in range(len(nums)):
        total += nums[right]
        while total >= target:
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return best if best <= len(nums) else 0
`,
    visibleTests: [
      { name: "tight window", args: [[2, 3, 1, 2, 4, 3], 7], expected: 2 },
      { name: "impossible", args: [[1, 1, 1, 1], 10], expected: 0 }
    ],
    hiddenTests: [
      { name: "empty", args: [[], 3], expected: 0 },
      { name: "single suffices", args: [[5], 5], expected: 1 },
      { name: "whole array needed", args: [[1, 2, 3, 4], 10], expected: 4 },
      { name: "exact pair", args: [[4, 4], 4], expected: 1 },
      { name: "big value at end", args: [[1, 1, 1, 7], 7], expected: 1 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "two-pointers-sliding-window-bonus-08",
    chapterId: "two-pointers-sliding-window",
    title: "Count Pairs Below A Threshold",
    difficulty: "medium",
    patterns: ["two-pointers-sliding-window", "opposite pointers", "sorted array"],
    entrypoint: "count_pairs_below",
    signature: "nums, threshold",
    prompt:
      "Return how many unordered pairs of distinct positions have a value sum strictly less than threshold.",
    constraints: [
      "Each unordered pair of distinct indices is counted at most once.",
      "Use a strict comparison: a sum equal to the threshold does not count.",
      "An empty or single-element list yields a count of 0."
    ],
    hints: [
      "Sort the values first so a pair's sum behaves predictably as pointers move.",
      "With a left and right pointer, if their sum is below the threshold then every value between them also pairs with the left value."
    ],
    solution:
      "Sort the values. Put a left pointer at the start and a right pointer at the end. If their sum is below the threshold, then left paired with each index up to right all qualify, so add that count and advance left; otherwise the sum is too big, so retreat right.",
    walkthrough:
      "Sorting lets one comparison settle a whole block of pairs at once: when nums[left] + nums[right] is small enough, so is every pair using a value at or below the right pointer. That batching turns an O(n^2) pair check into a single linear sweep after the sort.",
    followUps: [
      "What dominates the running time once you include the sort?",
      "How would you instead count pairs whose sum is at least the threshold?"
    ],
    code: `def count_pairs_below(nums, threshold):
    values = sorted(nums)
    left, right = 0, len(values) - 1
    count = 0
    while left < right:
        if values[left] + values[right] < threshold:
            count += right - left
            left += 1
        else:
            right -= 1
    return count
`,
    visibleTests: [
      { name: "small list", args: [[1, 2, 3, 4], 5], expected: 2 },
      { name: "all pairs qualify", args: [[1, 1, 1], 3], expected: 3 }
    ],
    hiddenTests: [
      { name: "empty", args: [[], 5], expected: 0 },
      { name: "single", args: [[10], 5], expected: 0 },
      { name: "equal sum excluded", args: [[5, 5], 5], expected: 0 },
      { name: "negatives", args: [[-2, 0, 3, 5], 4], expected: 4 },
      { name: "every pair under", args: [[1, 2, 3, 4, 5, 6], 7], expected: 6 }
    ],
    time: "O(n log n)",
    space: "O(n)"
  },
  {
    id: "two-pointers-sliding-window-bonus-09",
    chapterId: "two-pointers-sliding-window",
    title: "Length After Removing Sorted Duplicates",
    difficulty: "easy",
    patterns: ["two-pointers-sliding-window", "same-direction pointers", "sorted array"],
    entrypoint: "dedupe_sorted_length",
    signature: "nums",
    prompt:
      "Given a list sorted in non-decreasing order, compact it so each distinct value appears once at the front, and return the count of distinct values. The values after that count do not matter.",
    constraints: [
      "The input list is sorted in non-decreasing order.",
      "An empty list yields a count of 0.",
      "Compact in a single pass with a write pointer — do not allocate a set."
    ],
    hints: [
      "Keep a write pointer for the position just past the last distinct value kept.",
      "A read pointer scans ahead; copy a value forward only when it differs from the last kept value."
    ],
    solution:
      "Treat index 0 as already kept and start the write pointer at 1. Scan a read pointer from index 1; whenever the read value differs from the value just before the write pointer, copy it to the write slot and advance the write pointer. The final write pointer is the distinct count.",
    walkthrough:
      "Because the list is sorted, equal values are adjacent, so comparing each value to the most recently kept one is enough to detect duplicates. The write pointer trails the read pointer, so kept values are never overwritten before they are read.",
    followUps: [
      "How would you allow each value to appear at most twice instead of once?",
      "Why does this approach rely on the input being sorted?"
    ],
    code: `def dedupe_sorted_length(nums):
    if not nums:
        return 0
    write = 1
    for read in range(1, len(nums)):
        if nums[read] != nums[write - 1]:
            nums[write] = nums[read]
            write += 1
    return write
`,
    visibleTests: [
      { name: "some duplicates", args: [[1, 1, 2, 2, 3]], expected: 3 },
      { name: "already distinct", args: [[1, 2, 3]], expected: 3 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "single", args: [[7]], expected: 1 },
      { name: "all equal", args: [[4, 4, 4]], expected: 1 },
      { name: "negatives with repeats", args: [[-3, -3, -1, 0, 0]], expected: 3 },
      { name: "two distinct", args: [[1, 1, 1, 2]], expected: 2 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "two-pointers-sliding-window-bonus-10",
    chapterId: "two-pointers-sliding-window",
    title: "Merge Two Sorted Lists",
    difficulty: "easy",
    patterns: ["two-pointers-sliding-window", "same-direction pointers", "sorted array"],
    entrypoint: "merge_sorted",
    signature: "a, b",
    prompt:
      "Given two lists each sorted in non-decreasing order, return a single sorted list containing all of their values.",
    constraints: [
      "Both inputs are individually sorted in non-decreasing order.",
      "Either or both lists may be empty.",
      "Merge with a pointer into each list — do not concatenate and sort."
    ],
    hints: [
      "Keep one index into each list and compare the values they point at.",
      "Append the smaller value and advance only that list's pointer; when one list runs out, append the rest of the other."
    ],
    solution:
      "Advance an index through each list. At every step append the smaller of the two pointed-at values and move that list's pointer forward. Once one list is exhausted, append whatever remains of the other list, which is already sorted.",
    walkthrough:
      "The two pointers move independently but always forward, so each value is appended exactly once. Comparing only the two front values works because everything behind each pointer is already placed and everything ahead is no smaller.",
    followUps: [
      "How would you merge the two lists in place if b had room appended to a?",
      "How does this generalise to merging k sorted lists efficiently?"
    ],
    code: `def merge_sorted(a, b):
    i, j = 0, 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i])
            i += 1
        else:
            out.append(b[j])
            j += 1
    out.extend(a[i:])
    out.extend(b[j:])
    return out
`,
    visibleTests: [
      { name: "interleaved", args: [[1, 3, 5], [2, 4, 6]], expected: [1, 2, 3, 4, 5, 6] },
      { name: "one empty", args: [[], [1, 2]], expected: [1, 2] }
    ],
    hiddenTests: [
      { name: "both empty", args: [[], []], expected: [] },
      { name: "all equal", args: [[1, 1], [1, 1]], expected: [1, 1, 1, 1] },
      { name: "one runs out early", args: [[5], [1, 2, 3]], expected: [1, 2, 3, 5] },
      { name: "negatives", args: [[-5, 0], [-3, 2]], expected: [-5, -3, 0, 2] },
      { name: "second empty", args: [[1, 2], []], expected: [1, 2] }
    ],
    time: "O(n + m)",
    space: "O(n + m)"
  },
  {
    id: "two-pointers-sliding-window-bonus-11",
    chapterId: "two-pointers-sliding-window",
    title: "Longest Subarray Within A Sum Limit",
    difficulty: "medium",
    patterns: ["two-pointers-sliding-window", "variable window"],
    entrypoint: "longest_within_limit",
    signature: "nums, limit",
    prompt:
      "Every value is a positive integer. Return the length of the longest contiguous subarray whose values sum to at most limit. If even a single value exceeds limit, the answer is 0.",
    constraints: [
      "All values in the list are positive integers.",
      "The list may be empty; return 0 then.",
      "A subarray summing to exactly limit is allowed and may be the longest."
    ],
    hints: [
      "Extend a window one value to the right at a time, adding that value to a running sum.",
      "If the running sum ever passes limit, drop exactly one value from the left so the window length is preserved while you keep scanning."
    ],
    solution:
      "Slide a window across the list with a running sum. After adding each new right-hand value, if the sum exceeds limit, remove the leftmost value and advance the left edge — one removal is enough because the window only grew by one. After each step the window is the longest valid one ending here, so track its width.",
    walkthrough:
      "Because all values are positive, adding a value can push the sum over limit by at most one value's worth, so a single left drop restores validity. The left edge never moves backward, so the window width is non-decreasing across the scan and its peak is the answer.",
    followUps: [
      "Why does one left removal suffice here, when a target-sum problem might need a shrink loop?",
      "How would you also return the actual subarray, not just its length?"
    ],
    code: `def longest_within_limit(nums, limit):
    left = 0
    total = 0
    best = 0
    for right in range(len(nums)):
        total += nums[right]
        if total > limit:
            total -= nums[left]
            left += 1
        best = max(best, right - left + 1)
    return best
`,
    visibleTests: [
      { name: "trims to fit", args: [[1, 2, 1, 3, 1], 5], expected: 3 },
      { name: "whole array fits", args: [[1, 1, 1], 10], expected: 3 }
    ],
    hiddenTests: [
      { name: "empty", args: [[], 5], expected: 0 },
      { name: "single value over", args: [[8], 5], expected: 0 },
      { name: "single value fits", args: [[4], 5], expected: 1 },
      { name: "every value over", args: [[6, 7, 8], 5], expected: 0 },
      { name: "exact limit at end", args: [[5, 1, 2, 2], 5], expected: 3 },
      { name: "all equal", args: [[2, 2, 2, 2], 6], expected: 3 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "two-pointers-sliding-window-bonus-12",
    chapterId: "two-pointers-sliding-window",
    title: "Sort A Binary Array",
    difficulty: "warmup",
    patterns: ["two-pointers-sliding-window", "opposite pointers"],
    entrypoint: "sort_binary_array",
    signature: "bits",
    prompt:
      "The input is a list containing only 0s and 1s. Return a new list with all 0s before all 1s, sorted by swapping from both ends.",
    constraints: [
      "Every value in the list is either 0 or 1.",
      "The list may be empty; return an empty list then.",
      "Use opposite-end pointers — do not call sort or count the values."
    ],
    hints: [
      "Put a pointer at each end: the left should end on 0s, the right on 1s.",
      "When the left points at a 1 and the right at a 0, swap them; otherwise advance whichever pointer is already correct."
    ],
    solution:
      "Copy the list and place a left pointer at the start and a right pointer at the end. Advance left while it sees a 0 and retreat right while it sees a 1. When left holds a 1 and right holds a 0, swap them and step both inward.",
    walkthrough:
      "Each pointer stops only on a misplaced value, so every swap fixes two positions at once. The pointers meet after every 0 is left of every 1, which is the unique sorted arrangement of a binary list.",
    followUps: [
      "How would you extend this to three distinct values (the Dutch national flag problem)?",
      "Could you instead count the 0s and rebuild the list, and what would that cost?"
    ],
    code: `def sort_binary_array(bits):
    out = list(bits)
    left, right = 0, len(out) - 1
    while left < right:
        if out[left] == 0:
            left += 1
        elif out[right] == 1:
            right -= 1
        else:
            out[left], out[right] = out[right], out[left]
            left += 1
            right -= 1
    return out
`,
    visibleTests: [
      { name: "mixed bits", args: [[0, 1, 0, 1, 1, 0]], expected: [0, 0, 0, 1, 1, 1] },
      { name: "already sorted", args: [[0, 0, 1, 1]], expected: [0, 0, 1, 1] }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: [] },
      { name: "single zero", args: [[0]], expected: [0] },
      { name: "single one", args: [[1]], expected: [1] },
      { name: "all ones", args: [[1, 1, 1]], expected: [1, 1, 1] },
      { name: "fully reversed", args: [[1, 0, 1, 0, 1, 0, 1, 0]], expected: [0, 0, 0, 0, 1, 1, 1, 1] }
    ],
    time: "O(n)",
    space: "O(n)"
  }
];
