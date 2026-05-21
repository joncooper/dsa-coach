import type { BonusSeed } from "./types";

/**
 * Arrays & Strings bonus problems. Concepts: indexing, prefix sums, string
 * scans, in-place thinking, array transforms. Each seed drills one of those
 * patterns on a fresh task — distinct from the guided set and from each other.
 */
export const bonus: BonusSeed[] = [
  {
    id: "arrays-strings-bonus-01",
    chapterId: "arrays-strings",
    title: "Reverse Words",
    difficulty: "warmup",
    patterns: ["arrays-strings", "string scan", "tokenizing"],
    entrypoint: "reverse_words",
    signature: "text",
    prompt:
      "Given a string of words separated by spaces, return a string with the words in reverse order. Collapse any run of spaces to a single space and drop leading and trailing spaces.",
    constraints: [
      "The string may be empty or contain only spaces; return an empty string then.",
      "Multiple spaces between words count as one separator.",
      "No leading or trailing spaces appear in the result."
    ],
    hints: [
      "Splitting on whitespace with no argument already discards empty pieces.",
      "Reverse the list of words, then join the pieces back with one space."
    ],
    solution:
      "Split the text into words on runs of whitespace, reverse that list, and join it back together with a single space.",
    walkthrough:
      "Argument-free split treats any whitespace run as one delimiter and yields no empty tokens, so leading, trailing, and repeated spaces vanish. Reversing the token list and joining with one space rebuilds the sentence cleanly.",
    followUps: [
      "How would you reverse the words in place if the input were a list of characters?",
      "What changes if you must preserve the original spacing exactly?"
    ],
    code: `def reverse_words(text):
    words = text.split()
    words.reverse()
    return " ".join(words)
`,
    visibleTests: [
      { name: "four words", args: ["the sky is blue"], expected: "blue is sky the" },
      { name: "padded spaces", args: ["  hello   world  "], expected: "world hello" }
    ],
    hiddenTests: [
      { name: "empty", args: [""], expected: "" },
      { name: "only spaces", args: ["   "], expected: "" },
      { name: "single word", args: ["single"], expected: "single" },
      { name: "five words", args: ["a b c d e"], expected: "e d c b a" },
      { name: "trailing space", args: ["trailing space "], expected: "space trailing" }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "arrays-strings-bonus-02",
    chapterId: "arrays-strings",
    title: "Running Range Width",
    difficulty: "easy",
    patterns: ["arrays-strings", "prefix state", "running min max"],
    entrypoint: "running_range_width",
    signature: "nums",
    prompt:
      "Return a new list where each position holds the difference between the largest and smallest value seen up to and including that position.",
    constraints: [
      "The input list may be empty; return an empty list then.",
      "The first position is always 0 because one value spans no range.",
      "Values may be negative."
    ],
    hints: [
      "Carry two running values: the smallest and the largest seen so far.",
      "Update both bounds with the current value before recording their difference."
    ],
    solution:
      "Scan once while tracking the running minimum and running maximum of the prefix consumed so far, appending their difference at every index.",
    walkthrough:
      "The state is two numbers: the lowest and highest value of the prefix already seen. Each step folds the current value into both bounds, then records the gap. One pass keeps it linear.",
    followUps: [
      "How would you also return the index where the widest range first appeared?",
      "What if the range should only consider the last k values?"
    ],
    code: `def running_range_width(nums):
    out = []
    lo = hi = None
    for value in nums:
        if lo is None:
            lo = hi = value
        else:
            lo = min(lo, value)
            hi = max(hi, value)
        out.append(hi - lo)
    return out
`,
    visibleTests: [
      { name: "widening", args: [[4, 2, 7, 1]], expected: [0, 2, 5, 6] },
      { name: "steady climb", args: [[1, 2, 3, 4]], expected: [0, 1, 2, 3] }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: [] },
      { name: "single", args: [[5]], expected: [0] },
      { name: "all equal", args: [[3, 3, 3]], expected: [0, 0, 0] },
      { name: "all negative", args: [[-2, -5, -1]], expected: [0, 3, 4] },
      { name: "two values", args: [[10, 1]], expected: [0, 9] }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "arrays-strings-bonus-03",
    chapterId: "arrays-strings",
    title: "Move Zeros To End",
    difficulty: "easy",
    patterns: ["arrays-strings", "in-place thinking", "two write pointers"],
    entrypoint: "move_zeros",
    signature: "nums",
    prompt:
      "Return a new list with every zero moved to the end, while every non-zero value keeps its original relative order.",
    constraints: [
      "The input list may be empty; return an empty list then.",
      "The relative order of the non-zero values must not change.",
      "Non-zero values may be negative."
    ],
    hints: [
      "Use a write index that only advances when you place a non-zero value.",
      "After copying every non-zero value forward, fill the remaining tail with zeros."
    ],
    solution:
      "Sweep the list with a write pointer that copies each non-zero value into the next free slot, then pad the rest of the result with zeros.",
    walkthrough:
      "The write pointer marks how many non-zero values have been placed. Reading left to right and copying only non-zero values preserves their order; the leftover positions, by count, must all be zeros.",
    followUps: [
      "How would you do this truly in place by swapping instead of copying?",
      "What changes if zeros should move to the front instead?"
    ],
    code: `def move_zeros(nums):
    result = list(nums)
    write = 0
    for read in range(len(result)):
        if result[read] != 0:
            result[write] = result[read]
            write += 1
    for i in range(write, len(result)):
        result[i] = 0
    return result
`,
    visibleTests: [
      { name: "scattered zeros", args: [[0, 1, 0, 3, 12]], expected: [1, 3, 12, 0, 0] },
      { name: "interleaved", args: [[1, 0, 2, 0, 3]], expected: [1, 2, 3, 0, 0] }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: [] },
      { name: "single zero", args: [[0]], expected: [0] },
      { name: "no zeros", args: [[1, 2, 3]], expected: [1, 2, 3] },
      { name: "all zeros", args: [[0, 0, 0]], expected: [0, 0, 0] },
      { name: "negatives", args: [[-1, 0, -2]], expected: [-1, -2, 0] }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "arrays-strings-bonus-04",
    chapterId: "arrays-strings",
    title: "Count Equilibrium Indices",
    difficulty: "medium",
    patterns: ["arrays-strings", "prefix sums", "iteration"],
    entrypoint: "count_equilibrium_indices",
    signature: "nums",
    prompt:
      "An equilibrium index is a position where the sum of all values strictly to its left equals the sum of all values strictly to its right. Return how many equilibrium indices the list has.",
    constraints: [
      "An empty list has no indices; return 0.",
      "For an edge index the missing side counts as a sum of zero.",
      "Values may be negative, so several indices can qualify."
    ],
    hints: [
      "The right sum equals the total minus the left sum minus the current value.",
      "Carry the left sum as you scan so each index is checked in constant time."
    ],
    solution:
      "Compute the total once, then scan left to right tracking the left sum; at each index the right sum is total minus left minus the current value, and a match increments the count.",
    walkthrough:
      "Knowing the grand total turns the right-hand sum into a constant-time expression. A single pass with one running left sum tests every index, counting each one where the two sides agree.",
    followUps: [
      "How would you return the indices themselves instead of just the count?",
      "What breaks if you forget to exclude the current value from both sides?"
    ],
    code: `def count_equilibrium_indices(nums):
    total = sum(nums)
    left = 0
    count = 0
    for value in nums:
        right = total - left - value
        if left == right:
            count += 1
        left += value
    return count
`,
    visibleTests: [
      { name: "one equilibrium", args: [[2, 3, -1, 8, 4]], expected: 1 },
      { name: "centre of three", args: [[1, 1, 1]], expected: 1 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "single", args: [[5]], expected: 1 },
      { name: "all zeros", args: [[0, 0, 0]], expected: 3 },
      { name: "negatives", args: [[-1, -1, -1, 0, 1, 1]], expected: 1 },
      { name: "none", args: [[1, 2, 3]], expected: 0 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "arrays-strings-bonus-05",
    chapterId: "arrays-strings",
    title: "Most Frequent Character",
    difficulty: "easy",
    patterns: ["arrays-strings", "string scan", "frequency map"],
    entrypoint: "most_frequent_character",
    signature: "text",
    prompt:
      "Return the character that occurs most often in the string. If several characters tie for the highest count, return the one that appears earliest in the string. Return None for an empty string.",
    constraints: [
      "The string may be empty; return None then.",
      "Ties are broken by earliest first appearance in the string.",
      "Any character, including spaces and symbols, is eligible."
    ],
    hints: [
      "First count every character with a single pass into a frequency map.",
      "Then scan the string again so the earliest character naturally wins ties."
    ],
    solution:
      "Count all characters into a frequency map, then walk the string in order and keep the first character whose count exceeds the best seen so far.",
    walkthrough:
      "Counting first gives every character's total. Re-scanning in original order and using a strict greater-than comparison means a later character can never displace an equally frequent earlier one, so ties resolve to the earliest.",
    followUps: [
      "How would you return the least frequent character instead?",
      "What if you needed every character tied for the maximum count?"
    ],
    code: `def most_frequent_character(text):
    counts = Counter(text)
    best = None
    best_count = 0
    for ch in text:
        if counts[ch] > best_count:
            best = ch
            best_count = counts[ch]
    return best
`,
    visibleTests: [
      { name: "clear winner", args: ["aabbbc"], expected: "b" },
      { name: "tie picks earliest", args: ["abcabc"], expected: "a" }
    ],
    hiddenTests: [
      { name: "empty", args: [""], expected: null },
      { name: "single", args: ["x"], expected: "x" },
      { name: "all equal", args: ["zzz"], expected: "z" },
      { name: "long word", args: ["mississippi"], expected: "i" },
      { name: "with spaces", args: ["a a b"], expected: "a" }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "arrays-strings-bonus-06",
    chapterId: "arrays-strings",
    title: "Plus One",
    difficulty: "easy",
    patterns: ["arrays-strings", "array transform", "carry propagation"],
    entrypoint: "plus_one",
    signature: "digits",
    prompt:
      "A non-negative integer is given as a list of decimal digits, most significant digit first. Return the digit list of that integer plus one.",
    constraints: [
      "Each element is a single digit from 0 to 9.",
      "The result may need one more digit than the input, as 9 becomes 1 and 0.",
      "The input has at least one digit."
    ],
    hints: [
      "Walk the digits from the last one toward the first, like adding by hand.",
      "A digit below 9 just increments and stops; a 9 becomes 0 and carries left."
    ],
    solution:
      "Scan from the least significant digit: increment the first digit under 9 and return, otherwise set 9s to 0 and carry; if the carry survives the whole list, prepend a leading 1.",
    walkthrough:
      "Adding one only ripples while it hits 9s. The first digit below 9 absorbs the carry and the rest of the number is unchanged. If every digit was a 9, they all roll to 0 and a new leading 1 is needed.",
    followUps: [
      "How would you generalise this to add an arbitrary integer instead of one?",
      "What changes if the digits were stored least significant first?"
    ],
    code: `def plus_one(digits):
    result = list(digits)
    for i in range(len(result) - 1, -1, -1):
        if result[i] < 9:
            result[i] += 1
            return result
        result[i] = 0
    return [1] + result
`,
    visibleTests: [
      { name: "no carry", args: [[1, 2, 3]], expected: [1, 2, 4] },
      { name: "all nines", args: [[9, 9, 9]], expected: [1, 0, 0, 0] }
    ],
    hiddenTests: [
      { name: "single nine", args: [[9]], expected: [1, 0] },
      { name: "single zero", args: [[0]], expected: [1] },
      { name: "partial carry", args: [[1, 9, 9]], expected: [2, 0, 0] },
      { name: "long no carry", args: [[4, 3, 2, 1]], expected: [4, 3, 2, 2] },
      { name: "carry once", args: [[8, 9]], expected: [9, 0] }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "arrays-strings-bonus-07",
    chapterId: "arrays-strings",
    title: "First Unique Character Index",
    difficulty: "easy",
    patterns: ["arrays-strings", "string scan", "two pass"],
    entrypoint: "first_unique_index",
    signature: "text",
    prompt:
      "Return the index of the first character in the string that appears exactly once. If every character repeats, or the string is empty, return -1.",
    constraints: [
      "The string may be empty; return -1 then.",
      "A character is unique only if its total count in the string is exactly one.",
      "Return the smallest qualifying index."
    ],
    hints: [
      "One pass counts how many times each character occurs.",
      "A second pass over the string returns the first index whose character has count one."
    ],
    solution:
      "Count every character in one pass, then scan the string in order and return the index of the first character whose count is exactly one.",
    walkthrough:
      "Uniqueness depends on a character's total count, which is only known after a full pass. The second pass visits indices left to right, so the first character with count one is also the earliest such index.",
    followUps: [
      "How would you return the first unique character if the input were a stream you could not revisit?",
      "What changes if you need the last unique character instead?"
    ],
    code: `def first_unique_index(text):
    counts = Counter(text)
    for index, ch in enumerate(text):
        if counts[ch] == 1:
            return index
    return -1
`,
    visibleTests: [
      { name: "unique at start", args: ["leetcode"], expected: 0 },
      { name: "unique in middle", args: ["swiss"], expected: 1 }
    ],
    hiddenTests: [
      { name: "empty", args: [""], expected: -1 },
      { name: "single", args: ["x"], expected: 0 },
      { name: "all repeat", args: ["aabb"], expected: -1 },
      { name: "every char twice", args: ["abcabc"], expected: -1 },
      { name: "unique at end", args: ["aabbc"], expected: 4 }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "arrays-strings-bonus-08",
    chapterId: "arrays-strings",
    title: "Range Sum Queries",
    difficulty: "medium",
    patterns: ["arrays-strings", "prefix sums", "indexing"],
    entrypoint: "range_sum_queries",
    signature: "nums, queries",
    prompt:
      "Given a list of integers and a list of [lo, hi] index pairs, return a list answering each query with the sum of nums[lo] through nums[hi], inclusive of both ends.",
    constraints: [
      "Each query is a pair [lo, hi] with 0 <= lo <= hi < len(nums).",
      "The query list may be empty; return an empty list then.",
      "Values may be negative."
    ],
    hints: [
      "Build a prefix-sum array once so any range sum is a single subtraction.",
      "With a prefix array padded by a leading zero, the sum of lo..hi is prefix[hi + 1] - prefix[lo]."
    ],
    solution:
      "Precompute a prefix-sum array with a leading zero, then answer each query in constant time as prefix[hi + 1] minus prefix[lo].",
    walkthrough:
      "The prefix array stores the running total of every prefix. The sum of a range is the total up to its end minus the total before its start, so every query becomes one subtraction after a single setup pass.",
    followUps: [
      "How would you support updates to the underlying values between queries?",
      "What is the cost trade-off versus summing each range directly?"
    ],
    code: `def range_sum_queries(nums, queries):
    prefix = [0]
    for value in nums:
        prefix.append(prefix[-1] + value)
    answers = []
    for lo, hi in queries:
        answers.append(prefix[hi + 1] - prefix[lo])
    return answers
`,
    visibleTests: [
      { name: "several ranges", args: [[1, 2, 3, 4, 5], [[0, 2], [1, 3], [0, 4], [2, 2]]], expected: [6, 9, 15, 3] },
      { name: "two queries", args: [[5, 5], [[0, 1], [1, 1]]], expected: [10, 5] }
    ],
    hiddenTests: [
      { name: "no queries", args: [[1, 2, 3], []], expected: [] },
      { name: "single value", args: [[3], [[0, 0]]], expected: [3] },
      { name: "whole negative", args: [[-1, -2, -3], [[0, 2]]], expected: [-6] },
      { name: "single element ranges", args: [[5, 5], [[0, 0], [1, 1]]], expected: [5, 5] },
      { name: "repeated query", args: [[2, 4, 6], [[1, 2], [1, 2]]], expected: [10, 10] }
    ],
    time: "O(n + q)",
    space: "O(n)"
  },
  {
    id: "arrays-strings-bonus-09",
    chapterId: "arrays-strings",
    title: "Dedupe Sorted Array",
    difficulty: "warmup",
    patterns: ["arrays-strings", "in-place thinking", "adjacent compare"],
    entrypoint: "dedupe_sorted",
    signature: "nums",
    prompt:
      "Given a list of integers already sorted in non-decreasing order, return a new list with consecutive duplicates removed so each value appears once.",
    constraints: [
      "The input list may be empty; return an empty list then.",
      "The input is sorted, so equal values are always adjacent.",
      "Values may be negative."
    ],
    hints: [
      "Because the list is sorted, a duplicate is always equal to the value just before it.",
      "Append a value to the result only when it differs from the last value already appended."
    ],
    solution:
      "Walk the sorted list and append a value to the result only when it differs from the most recently appended value, which collapses each run of equal values to one.",
    walkthrough:
      "Sorting guarantees identical values sit next to each other. Comparing each value against the tail of the result rejects repeats and keeps the first occurrence of every distinct value, in order.",
    followUps: [
      "How would you keep at most two copies of each value instead of one?",
      "What approach would you need if the input were not sorted?"
    ],
    code: `def dedupe_sorted(nums):
    result = []
    for value in nums:
        if not result or value != result[-1]:
            result.append(value)
    return result
`,
    visibleTests: [
      { name: "runs collapse", args: [[1, 1, 2, 2, 3]], expected: [1, 2, 3] },
      { name: "long run", args: [[7, 7, 7, 8]], expected: [7, 8] }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: [] },
      { name: "single", args: [[5]], expected: [5] },
      { name: "all equal", args: [[1, 1, 1]], expected: [1] },
      { name: "already unique", args: [[1, 2, 3]], expected: [1, 2, 3] },
      { name: "negatives", args: [[-2, -2, -1, 0, 0]], expected: [-2, -1, 0] }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "arrays-strings-bonus-10",
    chapterId: "arrays-strings",
    title: "Matrix Diagonal Sum",
    difficulty: "easy",
    patterns: ["arrays-strings", "indexing", "2D traversal"],
    entrypoint: "diagonal_sum",
    signature: "matrix",
    prompt:
      "Given a square matrix of integers, return the sum of the values on its two diagonals. If the matrix has an odd size, the centre element lies on both diagonals but must be counted only once.",
    constraints: [
      "The matrix is square: every row has the same length as the number of rows.",
      "A 1-by-1 matrix has a single element on both diagonals counted once.",
      "Values may be negative."
    ],
    hints: [
      "Row i contributes matrix[i][i] on the main diagonal and matrix[i][n-1-i] on the anti-diagonal.",
      "When n is odd, both diagonals meet at the centre cell, so subtract it once."
    ],
    solution:
      "For each row add both the main-diagonal cell and the anti-diagonal cell; when the size is odd, subtract the centre cell once because it was counted twice.",
    walkthrough:
      "The main diagonal uses index [i][i] and the anti-diagonal uses [i][n-1-i]. These coincide only at the centre of an odd-sized matrix, so a single subtraction there corrects the double count.",
    followUps: [
      "How would you sum only the anti-diagonal?",
      "What changes if the matrix is rectangular rather than square?"
    ],
    code: `def diagonal_sum(matrix):
    n = len(matrix)
    total = 0
    for i in range(n):
        total += matrix[i][i]
        total += matrix[i][n - 1 - i]
    if n % 2 == 1:
        total -= matrix[n // 2][n // 2]
    return total
`,
    visibleTests: [
      { name: "three by three", args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: 25 },
      { name: "two by two", args: [[[1, 2], [3, 4]]], expected: 10 }
    ],
    hiddenTests: [
      { name: "single cell", args: [[[5]]], expected: 5 },
      { name: "four by four", args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]], expected: 68 },
      { name: "negatives", args: [[[-1, 0, -1], [0, -2, 0], [-1, 0, -1]]], expected: -6 },
      { name: "all zeros", args: [[[0, 0], [0, 0]]], expected: 0 },
      { name: "odd centre once", args: [[[2, 0, 2], [0, 9, 0], [2, 0, 2]]], expected: 17 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "arrays-strings-bonus-11",
    chapterId: "arrays-strings",
    title: "Longest Mountain",
    difficulty: "medium",
    patterns: ["arrays-strings", "array scan", "two-sided expansion"],
    entrypoint: "longest_mountain",
    signature: "nums",
    prompt:
      "A mountain is a contiguous run that strictly rises to a single peak and then strictly falls, with at least one step up and one step down. Return the length of the longest mountain, or 0 if there is none.",
    constraints: [
      "A mountain needs length at least 3 (rise, peak, fall).",
      "Plateaus break a mountain because the rise and fall must be strict.",
      "The list may be empty or have no mountain; return 0 then."
    ],
    hints: [
      "A peak is an index strictly greater than both of its neighbours.",
      "From a peak, walk left while values keep rising and right while they keep falling, then measure the span."
    ],
    solution:
      "Find each peak, expand left along the strictly increasing slope and right along the strictly decreasing slope, record the span, and resume scanning just past the mountain's end.",
    walkthrough:
      "Every mountain has exactly one peak. Anchoring on peaks and expanding outward measures the full rise-and-fall span; jumping the scan to the foot of each mountain keeps the whole pass linear.",
    followUps: [
      "How would you return the start index of the longest mountain too?",
      "What changes if equal adjacent values are allowed on the slopes?"
    ],
    code: `def longest_mountain(nums):
    n = len(nums)
    best = 0
    i = 1
    while i < n - 1:
        if nums[i - 1] < nums[i] > nums[i + 1]:
            left = i - 1
            while left > 0 and nums[left - 1] < nums[left]:
                left -= 1
            right = i + 1
            while right < n - 1 and nums[right] > nums[right + 1]:
                right += 1
            best = max(best, right - left + 1)
            i = right + 1
        else:
            i += 1
    return best
`,
    visibleTests: [
      { name: "mountain after dip", args: [[2, 1, 4, 7, 3, 2, 5]], expected: 5 },
      { name: "tiny mountain", args: [[0, 1, 0]], expected: 3 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "single", args: [[1]], expected: 0 },
      { name: "no descent", args: [[1, 2, 3]], expected: 0 },
      { name: "plateau peak", args: [[0, 2, 2, 2, 0]], expected: 0 },
      { name: "long mountain", args: [[5, 0, 3, 8, 5, 2, 1]], expected: 6 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "arrays-strings-bonus-12",
    chapterId: "arrays-strings",
    title: "Maximum Subarray Sum",
    difficulty: "medium",
    patterns: ["arrays-strings", "running state", "prefix sums"],
    entrypoint: "max_subarray_sum",
    signature: "nums",
    prompt:
      "Return the largest sum obtainable from any contiguous non-empty run of values in the list.",
    constraints: [
      "The list has at least one element.",
      "The chosen run must be non-empty, so an all-negative list returns its largest single value.",
      "Values may be negative."
    ],
    hints: [
      "At each index decide whether to extend the current run or to start a fresh one there.",
      "Track the best run ending at the current index, and the best run seen anywhere."
    ],
    solution:
      "Sweep the list keeping the best sum of a run ending at the current index — either the current value alone or that value added to the previous best — and track the overall maximum.",
    walkthrough:
      "A run ending here is worth extending only if the previous best run was positive; otherwise the value alone is better. Comparing the current value with the previous best plus the value captures that choice in constant work per index.",
    followUps: [
      "How would you also return the start and end indices of the best run?",
      "What changes if an empty run with sum 0 were allowed?"
    ],
    code: `def max_subarray_sum(nums):
    best = nums[0]
    current = nums[0]
    for value in nums[1:]:
        current = max(value, current + value)
        best = max(best, current)
    return best
`,
    visibleTests: [
      { name: "mixed signs", args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { name: "all positive", args: [[1, 2, 3, 4]], expected: 10 }
    ],
    hiddenTests: [
      { name: "single", args: [[5]], expected: 5 },
      { name: "all negative", args: [[-1, -2, -3]], expected: -1 },
      { name: "single negative", args: [[-7]], expected: -7 },
      { name: "alternating", args: [[2, -1, 2, -1, 2]], expected: 4 },
      { name: "dip then climb", args: [[-3, -1, 4, 5]], expected: 9 }
    ],
    time: "O(n)",
    space: "O(1)"
  }
];
