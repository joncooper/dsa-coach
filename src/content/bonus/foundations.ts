import type { BonusSeed } from "./types";

/**
 * Foundations bonus problems. Concepts: Big O, edge cases, recursion,
 * iteration, test design. Small, single-idea problems that drill a clean
 * invariant — distinct from the guided set and from each other.
 */
export const bonus: BonusSeed[] = [
  {
    id: "foundations-bonus-01",
    chapterId: "foundations",
    title: "Running Maximum",
    difficulty: "warmup",
    patterns: ["foundations", "iteration", "prefix state"],
    entrypoint: "running_maximum",
    signature: "nums",
    prompt:
      "Given a list of integers, return a new list where each position holds the maximum of all values seen up to and including that position.",
    constraints: [
      "The input list may be empty; return an empty list then.",
      "Values may be negative.",
      "Do not use a nested loop — one pass is enough."
    ],
    hints: [
      "Carry one running value: the best number seen so far.",
      "Before appending, update the running maximum with the current value."
    ],
    solution:
      "Scan once while keeping the largest value seen so far. Append that running maximum at every index.",
    walkthrough:
      "The state is a single number: the maximum of the prefix already consumed. Each step compares it with the current value, then records it. That keeps the pass linear.",
    followUps: [
      "How would you also return the index where each running maximum first appeared?",
      "What changes if you need the running minimum instead?"
    ],
    code: `def running_maximum(nums):
    out = []
    best = None
    for value in nums:
        best = value if best is None else max(best, value)
        out.append(best)
    return out
`,
    visibleTests: [
      { name: "rises and plateaus", args: [[3, 1, 4, 1, 5, 9, 2]], expected: [3, 3, 4, 4, 5, 9, 9] },
      { name: "all decreasing", args: [[4, 3, 2, 1]], expected: [4, 4, 4, 4] }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: [] },
      { name: "single", args: [[5]], expected: [5] },
      { name: "all negative", args: [[-1, -3, -2]], expected: [-1, -1, -1] },
      { name: "all equal", args: [[2, 2, 2]], expected: [2, 2, 2] },
      { name: "strictly increasing", args: [[1, 2, 3, 4]], expected: [1, 2, 3, 4] }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "foundations-bonus-02",
    chapterId: "foundations",
    title: "Is Sorted Ascending",
    difficulty: "warmup",
    patterns: ["foundations", "iteration", "edge cases"],
    entrypoint: "is_sorted_ascending",
    signature: "nums",
    prompt:
      "Return True if the list is sorted in non-decreasing order (equal neighbours are allowed), and False otherwise.",
    constraints: [
      "An empty list and a single-element list are considered sorted.",
      "Equal adjacent values do not break the order.",
      "Return as soon as the answer is known."
    ],
    hints: [
      "Compare each element with the one immediately before it.",
      "The first time a value is smaller than its predecessor, you can stop."
    ],
    solution:
      "Walk adjacent pairs. If any element is strictly smaller than the one before it, return False; otherwise return True.",
    walkthrough:
      "Sortedness is a property of every adjacent pair, so one pass over pairs settles it. The early return on the first violation avoids wasted work.",
    followUps: [
      "How would you check for strictly increasing order instead?",
      "Could you answer this without indexing, using zip?"
    ],
    code: `def is_sorted_ascending(nums):
    for i in range(1, len(nums)):
        if nums[i] < nums[i - 1]:
            return False
    return True
`,
    visibleTests: [
      { name: "sorted with duplicates", args: [[1, 2, 2, 3]], expected: true },
      { name: "out of order", args: [[1, 3, 2]], expected: false }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: true },
      { name: "single", args: [[7]], expected: true },
      { name: "all equal", args: [[5, 5, 5]], expected: true },
      { name: "drop at end", args: [[1, 2, 3, 0]], expected: false },
      { name: "negatives sorted", args: [[-3, -1, 0, 2]], expected: true }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "foundations-bonus-03",
    chapterId: "foundations",
    title: "Second Largest Value",
    difficulty: "easy",
    patterns: ["foundations", "iteration", "running state"],
    entrypoint: "second_largest",
    signature: "nums",
    prompt:
      "Return the second largest distinct value in the list. If there are fewer than two distinct values, return None.",
    constraints: [
      "Duplicates of the largest value do not count as the second largest.",
      "Return None when the list has fewer than two distinct values.",
      "Solve it in a single pass without sorting."
    ],
    hints: [
      "Track two values: the largest and the second largest seen so far.",
      "A new value can replace the largest, push into second place, or be ignored."
    ],
    solution:
      "Keep the top two distinct values while scanning. A larger value shifts the old largest into second place; a value between them updates second only.",
    walkthrough:
      "Two running variables capture the answer. The tricky case is equality: a value equal to the current largest must not become the second largest, so distinctness is checked explicitly.",
    followUps: [
      "How would you generalise this to the k-th largest distinct value?",
      "What is the trade-off versus sorting the list first?"
    ],
    code: `def second_largest(nums):
    first = None
    second = None
    for value in nums:
        if first is None or value > first:
            first, second = value, first
        elif value != first and (second is None or value > second):
            second = value
    return second
`,
    visibleTests: [
      { name: "clear runner up", args: [[3, 1, 4, 1, 5]], expected: 4 },
      { name: "only one distinct", args: [[5, 5, 5]], expected: null }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: null },
      { name: "single", args: [[7]], expected: null },
      { name: "two values", args: [[2, 1]], expected: 1 },
      { name: "duplicate largest", args: [[10, 10, 9, 8]], expected: 9 },
      { name: "all negative", args: [[-1, -2, -3]], expected: -2 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "foundations-bonus-04",
    chapterId: "foundations",
    title: "Factorial",
    difficulty: "warmup",
    patterns: ["foundations", "recursion", "base case"],
    entrypoint: "factorial",
    signature: "n",
    prompt:
      "Return n factorial (the product of every integer from 1 to n) using recursion. By definition the factorial of 0 is 1.",
    constraints: [
      "The input n is a non-negative integer.",
      "factorial(0) must return 1.",
      "Use recursion, not a loop."
    ],
    hints: [
      "The base case is the smallest n where the answer is known without recursion.",
      "For larger n, multiply n by the factorial of n minus one."
    ],
    solution:
      "Define the base case factorial(0) = factorial(1) = 1, then return n times factorial(n - 1) for larger n.",
    walkthrough:
      "Each recursive call shrinks n by one toward the base case, so the recursion always terminates. The product is assembled as the calls unwind.",
    followUps: [
      "How deep does the call stack get for input n?",
      "How would you write the same function iteratively?"
    ],
    code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
`,
    visibleTests: [
      { name: "five", args: [5], expected: 120 },
      { name: "zero", args: [0], expected: 1 }
    ],
    hiddenTests: [
      { name: "one", args: [1], expected: 1 },
      { name: "three", args: [3], expected: 6 },
      { name: "four", args: [4], expected: 24 },
      { name: "six", args: [6], expected: 720 },
      { name: "ten", args: [10], expected: 3628800 }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "foundations-bonus-05",
    chapterId: "foundations",
    title: "Count Vowels",
    difficulty: "warmup",
    patterns: ["foundations", "string scans", "iteration"],
    entrypoint: "count_vowels",
    signature: "text",
    prompt:
      "Return how many characters in the string are vowels. Count a, e, i, o, and u in either upper or lower case.",
    constraints: [
      "The string may be empty.",
      "Counting is case-insensitive.",
      "Only a, e, i, o, u count as vowels (y does not)."
    ],
    hints: [
      "Put the five vowels in a set for constant-time membership checks.",
      "Lower-case each character before testing it so case does not matter."
    ],
    solution:
      "Scan the string once, lower-casing each character and incrementing a counter when it is one of the five vowels.",
    walkthrough:
      "A set of vowels makes each membership test constant time, so the whole scan is linear. Lower-casing folds the upper and lower case forms together.",
    followUps: [
      "How would you also report which vowel was most common?",
      "What changes if y should count as a vowel?"
    ],
    code: `def count_vowels(text):
    vowels = set("aeiou")
    count = 0
    for ch in text:
        if ch.lower() in vowels:
            count += 1
    return count
`,
    visibleTests: [
      { name: "simple word", args: ["hello"], expected: 2 },
      { name: "mixed case", args: ["Programming"], expected: 3 }
    ],
    hiddenTests: [
      { name: "empty", args: [""], expected: 0 },
      { name: "no vowels", args: ["rhythm"], expected: 0 },
      { name: "all vowels upper", args: ["AEIOU"], expected: 5 },
      { name: "repeated vowels", args: ["queue"], expected: 4 },
      { name: "y is not a vowel", args: ["yyy"], expected: 0 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "foundations-bonus-06",
    chapterId: "foundations",
    title: "Greatest Common Divisor",
    difficulty: "easy",
    patterns: ["foundations", "recursion", "integer math"],
    entrypoint: "gcd",
    signature: "a, b",
    prompt:
      "Return the greatest common divisor of two non-negative integers using the recursive Euclidean algorithm.",
    constraints: [
      "Both inputs are non-negative integers, not both zero.",
      "gcd(x, 0) equals x.",
      "Use the remainder operation, not repeated subtraction."
    ],
    hints: [
      "When the second number is zero, the first number is the answer.",
      "Otherwise recurse with (b, a mod b) — the remainder shrinks the problem fast."
    ],
    solution:
      "Apply Euclid's rule: gcd(a, b) equals gcd(b, a mod b), with the base case gcd(a, 0) = a.",
    walkthrough:
      "Each call replaces the pair with a strictly smaller remainder, so the recursion reaches the zero base case quickly — far faster than subtracting one at a time.",
    followUps: [
      "Why does the remainder version run in logarithmic time?",
      "How would you extend this to the least common multiple?"
    ],
    code: `def gcd(a, b):
    if b == 0:
        return a
    return gcd(b, a % b)
`,
    visibleTests: [
      { name: "common factor six", args: [12, 18], expected: 6 },
      { name: "coprime", args: [17, 5], expected: 1 }
    ],
    hiddenTests: [
      { name: "multiple", args: [100, 10], expected: 10 },
      { name: "zero first", args: [0, 7], expected: 7 },
      { name: "zero second", args: [7, 0], expected: 7 },
      { name: "shared twelve", args: [48, 36], expected: 12 },
      { name: "equal values", args: [13, 13], expected: 13 }
    ],
    time: "O(log n)",
    space: "O(log n)"
  },
  {
    id: "foundations-bonus-07",
    chapterId: "foundations",
    title: "First Negative Index",
    difficulty: "warmup",
    patterns: ["foundations", "iteration", "first occurrence"],
    entrypoint: "first_negative_index",
    signature: "nums",
    prompt:
      "Return the index of the first negative number in the list. If the list contains no negative number, return -1.",
    constraints: [
      "The list may be empty; return -1 then.",
      "Zero is not negative.",
      "Return the earliest qualifying index."
    ],
    hints: [
      "Walk the list with both the index and the value available.",
      "Return immediately on the first value below zero."
    ],
    solution:
      "Scan with enumerate and return the index as soon as a value is strictly less than zero; return -1 if the scan finishes.",
    walkthrough:
      "Because only the first occurrence matters, the first qualifying index is final — there is no need to look further once it is found.",
    followUps: [
      "How would you return the last negative index instead?",
      "What if you needed every negative index, not just the first?"
    ],
    code: `def first_negative_index(nums):
    for index, value in enumerate(nums):
        if value < 0:
            return index
    return -1
`,
    visibleTests: [
      { name: "negative in middle", args: [[3, 1, -2, 5]], expected: 2 },
      { name: "no negatives", args: [[1, 2, 3]], expected: -1 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: -1 },
      { name: "single negative", args: [[-9]], expected: 0 },
      { name: "zero is not negative", args: [[0, 0, -1]], expected: 2 },
      { name: "negative first", args: [[-1, -2]], expected: 0 },
      { name: "all positive", args: [[5, 4, 3, 2, 1]], expected: -1 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "foundations-bonus-08",
    chapterId: "foundations",
    title: "Sum Of Even Indices",
    difficulty: "easy",
    patterns: ["foundations", "indexing", "iteration"],
    entrypoint: "sum_even_indices",
    signature: "nums",
    prompt:
      "Return the sum of the values stored at even indices (0, 2, 4, ...) of the list. Index parity is what matters, not the values.",
    constraints: [
      "The list may be empty; the sum is then zero.",
      "Index 0 counts as even.",
      "Values may be negative."
    ],
    hints: [
      "Step through indices two at a time starting from zero.",
      "A range with a step of 2 visits exactly the even indices."
    ],
    solution:
      "Iterate indices 0, 2, 4, ... with a stride-2 range and accumulate the value found at each into a running total.",
    walkthrough:
      "Driving the loop by index rather than by value lets the stride select even positions directly, so no parity test is needed inside the loop.",
    followUps: [
      "How would you return the odd-index sum in the same pass?",
      "Could you do this without an explicit index variable?"
    ],
    code: `def sum_even_indices(nums):
    total = 0
    for index in range(0, len(nums), 2):
        total += nums[index]
    return total
`,
    visibleTests: [
      { name: "five values", args: [[10, 20, 30, 40, 50]], expected: 90 },
      { name: "four values", args: [[1, 2, 3, 4]], expected: 4 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "single", args: [[7]], expected: 7 },
      { name: "two values", args: [[1, 100]], expected: 1 },
      { name: "negatives", args: [[-1, -1, -1, -1, -1]], expected: -3 },
      { name: "three values", args: [[5, 5, 5]], expected: 10 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "foundations-bonus-09",
    chapterId: "foundations",
    title: "Count Distinct Values",
    difficulty: "warmup",
    patterns: ["foundations", "test design", "iteration"],
    entrypoint: "count_distinct",
    signature: "nums",
    prompt:
      "Return how many distinct values appear in the list. Repeated values are counted only once.",
    constraints: [
      "The list may be empty; return 0 then.",
      "Negative values and zero are ordinary values.",
      "Order does not affect the answer."
    ],
    hints: [
      "A set automatically discards values it has already stored.",
      "After adding every value, the size of the set is the answer."
    ],
    solution:
      "Insert every value into a set, which keeps only one copy of each, then return the size of the set.",
    walkthrough:
      "A set collapses duplicates for free, so the count of distinct values is simply its final length after one pass.",
    followUps: [
      "How would you find values that appear exactly once?",
      "What is the memory cost when every value is unique?"
    ],
    code: `def count_distinct(nums):
    seen = set()
    for value in nums:
        seen.add(value)
    return len(seen)
`,
    visibleTests: [
      { name: "repeats collapse", args: [[1, 2, 2, 3, 3, 3]], expected: 3 },
      { name: "all unique", args: [[1, 2, 3, 4]], expected: 4 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "single", args: [[7]], expected: 1 },
      { name: "all equal", args: [[5, 5, 5]], expected: 1 },
      { name: "negatives and zero", args: [[-1, -1, 0, 0]], expected: 2 },
      { name: "interleaved", args: [[9, 8, 9, 8, 7]], expected: 3 }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "foundations-bonus-10",
    chapterId: "foundations",
    title: "Nth Fibonacci Number",
    difficulty: "easy",
    patterns: ["foundations", "iteration", "running state"],
    entrypoint: "nth_fibonacci",
    signature: "n",
    prompt:
      "Return the n-th Fibonacci number, where Fibonacci 0 is 0, Fibonacci 1 is 1, and each later number is the sum of the previous two.",
    constraints: [
      "The input n is a non-negative integer.",
      "nth_fibonacci(0) returns 0 and nth_fibonacci(1) returns 1.",
      "Use iteration so the running time stays linear."
    ],
    hints: [
      "Only the last two numbers are needed to produce the next one.",
      "Update the pair of values together n times."
    ],
    solution:
      "Hold the two most recent Fibonacci numbers and roll them forward n times; the first of the pair is the answer.",
    walkthrough:
      "Two variables are the entire state. Each iteration advances them by one Fibonacci step, so after n steps the running value is the n-th number — linear time, constant space.",
    followUps: [
      "Why is the naive two-call recursion exponential here?",
      "How would you return the whole sequence up to n?"
    ],
    code: `def nth_fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
`,
    visibleTests: [
      { name: "seventh", args: [7], expected: 13 },
      { name: "base one", args: [1], expected: 1 }
    ],
    hiddenTests: [
      { name: "base zero", args: [0], expected: 0 },
      { name: "second", args: [2], expected: 1 },
      { name: "third", args: [3], expected: 2 },
      { name: "tenth", args: [10], expected: 55 },
      { name: "twelfth", args: [12], expected: 144 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "foundations-bonus-11",
    chapterId: "foundations",
    title: "Pivot Index",
    difficulty: "easy",
    patterns: ["foundations", "prefix sums", "iteration"],
    entrypoint: "pivot_index",
    signature: "nums",
    prompt:
      "Return the leftmost index where the sum of all values to its left equals the sum of all values to its right. The pivot value itself is in neither sum. Return -1 if no such index exists.",
    constraints: [
      "An empty list has no pivot; return -1.",
      "For an edge index, the missing side counts as a sum of zero.",
      "Return the smallest qualifying index."
    ],
    hints: [
      "The right sum equals the total minus the left sum minus the current value.",
      "Carry the left sum as you scan so you never recompute it."
    ],
    solution:
      "Compute the total once. Scan left to right tracking the left sum; at each index check whether left equals total minus left minus the current value.",
    walkthrough:
      "Knowing the total turns the right-hand sum into a constant-time expression, so a single pass with one running left sum decides every index.",
    followUps: [
      "How would the answer change if you wanted the rightmost pivot?",
      "What breaks if you forget to exclude the pivot value itself?"
    ],
    code: `def pivot_index(nums):
    total = sum(nums)
    left = 0
    for index, value in enumerate(nums):
        if left == total - left - value:
            return index
        left += value
    return -1
`,
    visibleTests: [
      { name: "pivot in middle", args: [[1, 7, 3, 6, 5, 6]], expected: 3 },
      { name: "no pivot", args: [[1, 2, 3]], expected: -1 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: -1 },
      { name: "single element", args: [[5]], expected: 0 },
      { name: "pivot at start", args: [[2, 1, -1]], expected: 0 },
      { name: "all zeros", args: [[0, 0, 0]], expected: 0 },
      { name: "negatives", args: [[-1, -1, -1, 0, 1, 1]], expected: 0 }
    ],
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "foundations-bonus-12",
    chapterId: "foundations",
    title: "Collatz Step Count",
    difficulty: "easy",
    patterns: ["foundations", "iteration", "Big O"],
    entrypoint: "collatz_steps",
    signature: "n",
    prompt:
      "Starting from a positive integer, repeatedly halve it when it is even or triple it and add one when it is odd. Return how many steps it takes to reach 1.",
    constraints: [
      "The input n is a positive integer (at least 1).",
      "collatz_steps(1) is 0 because no steps are needed.",
      "Each transform counts as exactly one step."
    ],
    hints: [
      "Loop until the number becomes 1, counting iterations.",
      "Check parity each step to decide whether to halve or to apply 3n + 1."
    ],
    solution:
      "Run a loop that updates the number — halving it when even, applying 3n + 1 when odd — and count iterations until it reaches 1.",
    walkthrough:
      "The loop variable is the current number; the count is the answer. The termination condition is reaching 1, which the Collatz process is observed to do for every tested input.",
    followUps: [
      "Why is it hard to put a clean Big O bound on this loop?",
      "How would you cache results to speed up many queries?"
    ],
    code: `def collatz_steps(n):
    steps = 0
    while n != 1:
        if n % 2 == 0:
            n //= 2
        else:
            n = 3 * n + 1
        steps += 1
    return steps
`,
    visibleTests: [
      { name: "three", args: [3], expected: 7 },
      { name: "already one", args: [1], expected: 0 }
    ],
    hiddenTests: [
      { name: "two", args: [2], expected: 1 },
      { name: "six", args: [6], expected: 8 },
      { name: "seven", args: [7], expected: 16 },
      { name: "power of two", args: [16], expected: 4 },
      { name: "nine", args: [9], expected: 19 }
    ],
    time: "O(varies)",
    space: "O(1)"
  }
];
