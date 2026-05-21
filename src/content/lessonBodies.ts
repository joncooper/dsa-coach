/**
 * Lesson content for each chapter. `lessonBodies` holds the prose with
 * embedded interactive blocks (`:::quiz`, `:::fill`, `:::callout`) parsed by
 * `LessonContent.tsx`. Each body satisfies the validator: it includes the nine
 * required `## ` section headings and is at least 850 words long.
 * `lessonMeta` holds the short metadata shown in the lesson sidebar.
 */
export interface LessonMeta {
  /** Short "Learning Goals" phrases shown in the lesson sidebar. */
  objectives: string[];
  /** One-line descriptions of the two worked examples. */
  workedExamples: string[];
  /** Short pitfall reminders. */
  pitfalls: string[];
}

export const lessonMeta: Record<string, LessonMeta> = {
  "foundations": {
    objectives: [
      "Write a loop invariant before writing the loop",
      "Estimate Big O by counting how work scales with input",
      "Handle empty, singleton, and boundary inputs",
      "Turn a recursive idea into a base case plus a recursive case"
    ],
    workedExamples: [
      "Sum Positive Readings: a single-pass accumulate with a strict predicate.",
      "First Repeated Index: a seen-set membership check ordered before the insert."
    ],
    pitfalls: [
      "Confusing the value with its index in the return statement.",
      "Treating zero as positive when the prompt says strictly positive.",
      "Recording a value in the seen-set before checking membership.",
      "Calling a halving loop O(n) when it is O(log n)."
    ]
  },
  "arrays-strings": {
    objectives: [
      "Build a running prefix summary to avoid rescanning",
      "Choose a scan direction, or use two passes when both sides matter",
      "Construct strings with a list and join, never += in a loop",
      "Reason precisely about index boundaries"
    ],
    workedExamples: [
      "Product Except Self: a prefix pass then a suffix pass, no division.",
      "Compress Runs: flush-on-boundary with a running character and run length."
    ],
    pitfalls: [
      "Using division for product-except-self and crashing on zeros.",
      "Forgetting to flush the final run when compressing a string.",
      "Off-by-one errors between a forward and a backward pass.",
      "Building output strings with repeated += inside a loop."
    ]
  },
  "two-pointers-sliding-window": {
    objectives: [
      "Spot prompts about contiguous subarrays and substrings",
      "Move each pointer in one direction only",
      "Maintain a window summary that updates in O(1)",
      "Expand, repair, then record in the correct order"
    ],
    workedExamples: [
      "Longest With Flips: a window holding at most k zeros, repaired on overflow.",
      "Closest Pair Sum: opposite-end pointers converging on a sorted array."
    ],
    pitfalls: [
      "Using a sliding window when negative values break sum monotonicity.",
      "Recording the answer before the window is repaired back to valid.",
      "Computing window length as right - left instead of right - left + 1.",
      "Counting the wrong quantity inside the window."
    ]
  },
  "hashing": {
    objectives: [
      "Use a set for membership and a map for counts or indexes",
      "Choose a canonical, hashable key for grouping",
      "Combine prefix sums with a hash map for subarray counts",
      "Trade O(n) memory for O(1) expected lookups"
    ],
    workedExamples: [
      "Count Target Sum Subarrays: prefix sums plus a map of prefix counts.",
      "Anagram Bucket Sizes: sorted-letters signatures as canonical keys."
    ],
    pitfalls: [
      "Forgetting to seed the prefix-count map with {0: 1}.",
      "Updating the count map before performing the lookup.",
      "Using a mutable list or dict as a hash key.",
      "Returning groups when the prompt only asks for group sizes."
    ]
  },
  "linked-lists": {
    objectives: [
      "Walk a list knowing exactly which node each pointer holds",
      "Use a dummy head for operations that may change the head",
      "Use slow and fast pointers to measure structure in one pass",
      "Save references before rewiring a next pointer"
    ],
    workedExamples: [
      "Remove List Value: a dummy head makes head removal an ordinary case.",
      "Middle List Value: slow-by-one and fast-by-two pointers in one pass."
    ],
    pitfalls: [
      "Returning the original head after it was removed.",
      "Advancing the cursor after a removal, skipping the next node.",
      "Dereferencing head.val before checking for an empty list.",
      "Comparing node objects when you meant to compare values."
    ]
  },
  "stacks-queues": {
    objectives: [
      "Choose stack or queue by whether newest or oldest matters",
      "Maintain a monotonic stack and its ordering invariant",
      "Use a queue for time-based streaming windows",
      "Validate matched delimiters with a stack"
    ],
    workedExamples: [
      "Warmer Day Waits: a decreasing monotonic stack of unresolved indexes.",
      "Recent Event Counts: a queue that expires events older than the window."
    ],
    pitfalls: [
      "Using a stack when expiry depends on age, not recency.",
      "Treating an equal value as strictly greater in a monotonic stack.",
      "Forgetting to give a default answer to items left on the stack.",
      "Using list.pop(0) as a queue and turning O(n) into O(n squared)."
    ]
  },
  "trees-graphs": {
    objectives: [
      "Walk a tree recursively with clear returned state",
      "Choose DFS for paths and components, BFS for shortest distance",
      "Carry a visited set through every graph traversal",
      "Convert grids and edge lists into a traversable shape"
    ],
    workedExamples: [
      "Tree Has Path Sum: depth-first recursion that accepts only at a leaf.",
      "Shortest Edge Path: BFS over an adjacency map with visited-on-enqueue."
    ],
    pitfalls: [
      "Accepting a path sum at an internal node instead of a leaf.",
      "Miscounting isolated nodes as connected components.",
      "Using DFS for shortest unweighted paths and returning a longer one.",
      "Marking a node visited on dequeue instead of on enqueue."
    ]
  },
  "heaps": {
    objectives: [
      "Push and pop with heapq, smallest at the top",
      "Simulate a max-heap by negating values",
      "Solve top-k without sorting the whole input",
      "Maintain a running median with two balanced heaps"
    ],
    workedExamples: [
      "Top K Scores: a size-k min-heap evicting the smallest of the best.",
      "Running Medians: a max-heap and a min-heap kept within one in size."
    ],
    pitfalls: [
      "Sorting the entire input when k is small.",
      "Forgetting tie-breakers in a k-way merge.",
      "Mutating a caller-owned list with heapify.",
      "Letting the two median heaps drift in size by more than one."
    ]
  },
  "greedy": {
    objectives: [
      "Spot when sorting exposes a safe local choice",
      "Apply the earliest-finish rule to interval scheduling",
      "Track a farthest-reach frontier for jump and coverage problems",
      "Defend each greedy choice with an exchange argument"
    ],
    workedExamples: [
      "Max Compatible Meetings: sort by end time and take each compatible meeting.",
      "Can Reach End: a single-pass farthest-reachable-index invariant."
    ],
    pitfalls: [
      "Sorting by start time when the proof needs end time.",
      "Using shortest interval instead of earliest-ending interval.",
      "Updating the reach frontier after the blocked-index check.",
      "Calling a heuristic greedy without an exchange argument."
    ]
  },
  "binary-search": {
    objectives: [
      "Implement the half-open while left < right template",
      "Find a lower bound for a target value",
      "Binary search a monotonic predicate over an answer space",
      "Avoid infinite loops and missed boundaries"
    ],
    workedExamples: [
      "Lower Bound: the first index whose value is at least the target.",
      "Ship Capacity: binary search the smallest feasible capacity."
    ],
    pitfalls: [
      "Confusing value search with insertion-point search.",
      "Writing left = mid instead of left = mid + 1, causing an infinite loop.",
      "Choosing answer-space bounds that exclude the true answer.",
      "Applying binary search to a non-monotonic predicate."
    ]
  },
  "backtracking": {
    objectives: [
      "Structure recursion around a choice point",
      "Prune infeasible branches as early as possible",
      "Skip duplicate answers when the input has duplicates",
      "Mutate a shared path and undo it after each recursive call"
    ],
    workedExamples: [
      "Generate Parentheses: open and close choices constrained by counts.",
      "Combination Sum Exact: sorted candidates with same-depth duplicate skipping."
    ],
    pitfalls: [
      "Appending the live path object instead of a snapshot copy.",
      "Skipping duplicates across depths instead of only among siblings.",
      "Forgetting the undo step after the recursive call.",
      "Confusing reuse-allowed with use-each-once recursion."
    ]
  },
  "dynamic-programming": {
    objectives: [
      "State, in one sentence, what dp[i] means",
      "Write a recurrence over strictly smaller subproblems",
      "Choose between top-down memoisation and bottom-up tabulation",
      "Reduce space when the recurrence looks back only a few steps"
    ],
    workedExamples: [
      "Coin Change Min: dp[x] is the fewest coins to make amount x.",
      "Grid Paths With Blocks: dp[r][c] sums paths from above and from the left."
    ],
    pitfalls: [
      "Defining the state only after writing the loops.",
      "Using one value as both a valid answer and an impossible sentinel.",
      "Updating a 1D table in the direction that reads stale values.",
      "Forgetting that choosing nothing can be a valid option."
    ]
  },
  "interview-tools": {
    objectives: [
      "Map a prompt's structural features to a pattern family",
      "State complexity in terms of named input dimensions",
      "Compare valid approaches by their tradeoffs",
      "Narrate what you ruled out and why while solving"
    ],
    workedExamples: [
      "Choose Pattern Label: matching feature words to the right pattern family.",
      "Growth Label: reading empirical complexity from doubling measurements."
    ],
    pitfalls: [
      "Choosing the most recently studied pattern over the strongest signal.",
      "Skipping the brute-force baseline before optimising.",
      "Stating O(n) without naming what n actually counts.",
      "Treating a passing sample as proof of correctness."
    ]
  }
};

export const lessonBodies: Record<string, string> = {
  "foundations": foundationsBody(),
  "arrays-strings": arraysStringsBody(),
  "two-pointers-sliding-window": twoPointersBody(),
  "hashing": hashingBody(),
  "linked-lists": linkedListsBody(),
  "stacks-queues": stacksQueuesBody(),
  "trees-graphs": treesGraphsBody(),
  "heaps": heapsBody(),
  "greedy": greedyBody(),
  "binary-search": binarySearchBody(),
  "backtracking": backtrackingBody(),
  "dynamic-programming": dpBody(),
  "interview-tools": interviewToolsBody()
};

function foundationsBody(): string {
  return `# Foundations

Before any pattern, three habits decide whether you solve an interview problem cleanly: **read the input carefully, name the state you are tracking, and count how the work scales with the input size**. This module builds those habits on small, almost-too-easy problems so that when the harder modules arrive, you are not learning fundamentals at the same time as a new technique.

## Learning Goals

By the end of this lesson you will be able to:

- Read a problem prompt and state, in one sentence, exactly what your variable will mean after each step. That sentence is called a **loop invariant**.
- Estimate the runtime of a loop or a recursion by counting how many times the inner work runs as the input grows. The shorthand for this is **Big O notation**.
- Identify the edge cases that punish vague code: empty input, a single element, all-equal elements, and the boundary at the very first or very last index.
- Convert a recursive idea into a base case plus a recursive case without leaving an infinite call.

::: callout key
A foundation problem is not "easy" because the code is short. It is easy if you can write the invariant before you write the loop. If you cannot, you are guessing.
:::

## Pattern Recognition Signals

A foundations problem usually announces itself with one or more of these traits:

- The prompt asks for a **single aggregate**: a sum, a count, a maximum, a first index, or a yes/no answer.
- The input is a small list, a string, a single integer, or a fixed-size grid. There is no rich data structure.
- The constraints are tiny ("n up to 1000") but the prompt examples sneak in an empty list, a single value, or a value at the boundary.
- The natural brute-force solution is already fast enough. The interviewer is checking that you write it correctly, not that you optimise it.

::: quiz
**Q:** You see the prompt "Return the index of the first element greater than 100, or -1 if none exists." Which trait pegs this as a foundations problem?
- It is a graph problem in disguise
* It asks for a single value, the input is one list, and brute force is already linear
- It must use binary search because of the comparison
- It must use a hash map because of the lookup
> A single linear scan is enough. The interviewer is checking that you handle the "none exists" case and the empty list, not that you reach for a fancier tool.
:::

## Mental Model

Treat every foundations problem as four small jobs in order:

1. **Restate the result.** Out loud or on paper, finish this sentence: "Given _____, return _____ such that _____." If you cannot finish it, you do not understand the problem yet.
2. **Name the state.** Decide what variables you will maintain. For each variable, write what it means after the loop processes index \`i\`. A good invariant reads like a contract: "After the loop body for index \`i\` runs, \`total\` is the sum of every positive value at indexes 0..i."
3. **Handle empty and singleton inputs.** A function that crashes on \`[]\` or \`[0]\` fails the interview before you optimise anything.
4. **Count operations.** Before you submit, ask: if the input doubled, would the work double, quadruple, or stay the same?

::: callout tip
Write the invariant as a comment above the loop. If the comment is true before the first iteration and true after every iteration, the code is correct. This is more reliable than mentally simulating the code.
:::

## Worked Example 1

**Sum Positive Readings.** Given a list of integer sensor readings, return the sum of only the readings strictly greater than zero. Zero and negative readings do not contribute.

Input: \`[3, -2, 7, 0, -5]\`. Expected output: \`10\`.

Invariant: after processing index \`i\`, \`total\` is the sum of positive values in \`readings[0..i]\`.

::: steps
| Step | Index | Value | Predicate \`v > 0\` | total after step |
|------|-------|-------|---------------------|------------------|
| init | -     | -     | -                   | 0                |
| 1    | 0     | 3     | true                | 3                |
| 2    | 1     | -2    | false               | 3                |
| 3    | 2     | 7     | true                | 10               |
| 4    | 3     | 0     | false (not strict)  | 10               |
| 5    | 4     | -5    | false               | 10               |
:::

Final answer: \`10\`.

\`\`\`python-run
def sum_positive_readings(readings):
    total = 0
    for value in readings:
        if value > 0:
            total += value
    return total

print(sum_positive_readings([3, -2, 7, 0, -5]))  # try editing the list
\`\`\`

::: callout warning
Notice the predicate is \`> 0\`, not \`>= 0\`. The prompt said "positive", and zero is not positive. One word in the prompt decides one character of the code.
:::

## Worked Example 2

**First Repeated Index.** Return the first index whose value already appeared earlier in the array; return \`-1\` if every value is new when visited.

Input: \`[5, 1, 4, 1, 9]\`. Expected output: \`3\` (the second \`1\`).

Invariant: before checking index \`i\`, the set \`seen\` contains exactly the values at indexes \`0..i-1\`.

::: steps
| Step | i | value | seen before check | repeat? | return |
|------|---|-------|-------------------|---------|--------|
| 1 | 0 | 5 | {}              | no  | continue |
| 2 | 1 | 1 | {5}             | no  | continue |
| 3 | 2 | 4 | {5, 1}          | no  | continue |
| 4 | 3 | 1 | {5, 1, 4}       | yes | **3** |
:::

::: fill
The check at index \`i\` must happen **{{before}}** adding the current value to \`seen\`, otherwise the value at index \`i\` would match itself.
> Always test the membership question before recording the new evidence.
:::

\`\`\`python-run
def first_repeated_index(values):
    seen = set()
    for i, value in enumerate(values):
        if value in seen:
            return i
        seen.add(value)
    return -1

print(first_repeated_index([5, 1, 4, 1, 9]))  # try a list with no repeats
\`\`\`

## Implementation Checklist

Before you click "Run":

- Read the prompt twice. Underline every word that changes behaviour: *positive*, *strictly*, *first*, *unique*, *return -1 when...*
- Write the invariant as a one-line comment above the loop.
- Trace one empty input and one single-element input on paper. Did the function crash, return wrong, or return right?
- Confirm the return type. Many bugs are returning a value when the prompt asked for an index, or returning \`None\` when the prompt asked for \`-1\`.
- Count operations: O(1), O(log n), O(n), O(n²)? Be ready to justify out loud.

## Common Mistakes

- Confusing "the value" with "the index". The prompt almost always asks for one or the other; mixing them silently flips the answer.
- Treating zero as positive (or as negative). Zero is its own thing. Read the predicate carefully.
- Adding the current value to a \`seen\` set before checking it, which makes every value look like a repeat of itself.
- Writing a function that returns the right answer for \`[1, 2, 3]\` but raises \`IndexError\` on \`[]\` because of a hidden \`values[0]\` access.
- Calling a halving loop "O(n)" because it has a loop. Each iteration of \`n //= 2\` cuts the work in half; that is O(log n).

::: quiz
**Q:** A function does \`n = n // 2\` inside a \`while n > 0\` loop. What is its time complexity in terms of the input value \`n\`?
- O(1)
- O(n)
* O(log n)
- O(n log n)
> Each iteration cuts \`n\` roughly in half, so the loop runs about log₂(n) times before it stops.
:::

## Complexity Notes

Most foundations solutions are **O(n) time and O(1) space**: one pass through the input, a handful of running variables.

Two common variations:

- A \`seen\` set or counter pushes space to **O(n)** because in the worst case every value is unique. Lookups are still O(1) expected because hashing distributes the keys.
- A halving loop like \`n //= 2\` runs **O(log n)** times. So does a loop that doubles a value until it exceeds \`n\`.

Quadratic foundations solutions exist (a nested loop comparing every pair), and they are usually wrong-shape for the interview: the prompt is asking you to find the linear improvement.

## Practice Path

Work the four guided problems in this order: **Sum Positive Readings** (warm-up scan), **First Repeated Index** (introducing \`seen\` sets), **Safe Window Count** (introducing a fixed window of size k), and **Longest True Run** (introducing local state that resets on a break).

After the guided problems, attempt two bonus drills without opening hints. The goal is not raw speed; it is writing the invariant down before the loop. If you can do that consistently, every later module gets easier, because every later pattern is just a richer invariant over a richer state.
`;
}

function arraysStringsBody(): string {
  return `# Arrays & Strings

An array is an ordered sequence with **random access**: index \`i\` lands in one step. A string is the same idea, just with characters instead of numbers. Most "easy" array problems are really tests of two skills: **keeping a running summary of the prefix you have already scanned**, and **deciding the direction to scan in so the answer is built once, not patched repeatedly**.

This module makes those two skills explicit so you stop solving each problem from scratch.

## Learning Goals

- Build and use a **prefix summary**: a running value (or array) that summarises everything left of the current index, so you do not rescan it.
- Choose between left-to-right and right-to-left scanning, and recognise when you need both passes.
- Construct strings safely by appending to a list and joining at the end, rather than concatenating in a loop.
- Reason about index boundaries: when does \`i + 1\` go out of range, when is the **last index** different from \`len(arr) - 1\` (after deletions, for example).

## Pattern Recognition Signals

- The prompt asks for a **transformed array of the same length** (e.g., "for each index, return the product of all other elements"). That shape almost always wants a prefix pass and a suffix pass.
- The prompt asks for a **compressed or normalised string** ("aaabb" → "a3b2"). A running character + run-length is the state.
- The prompt says "in place" or constrains extra memory. That signals you must reuse the input array.
- Order is meaningful and **sorting would destroy** the relationship you are reasoning about.

::: quiz
**Q:** "Return an array where the i-th element is the product of all numbers in the input except nums[i]." What is the cheapest extra-space approach that avoids division?
- One pass keeping a running total
* Two passes — once building prefix products left-to-right, once multiplying suffix products right-to-left
- A nested loop comparing every pair
- A hash map of value to product
> A prefix pass writes the product of everything to the left; a suffix pass multiplies in the product of everything to the right. Each element is touched twice, O(n) total.
:::

## Mental Model

Three jobs cover almost every array/string problem in this module:

1. **Decide what to remember.** Is the answer for position \`i\` a function of the prefix \`0..i-1\`, the suffix \`i+1..n-1\`, or both? Name that information.
2. **Pick a direction.** If the answer needs only the prefix, scan left to right and keep the running summary. If it needs the suffix, scan right to left. If it needs both, do two passes.
3. **Write to the right place.** If you are transforming the array, decide whether you write into a new array, into the input array, or into a list you will join into a string at the end. In-place writes are tempting but easy to corrupt; do them only when the memory constraint demands it.

::: callout key
A prefix summary turns most "for each index, compute something about the rest of the array" problems from O(n²) into O(n). The summary holds the work you would otherwise repeat.
:::

## Worked Example 1

**Product Except Self (Local).** Given \`nums\`, return an array \`output\` where \`output[i]\` is the product of every element of \`nums\` except \`nums[i]\`. You may not use division.

Input: \`[1, 2, 3, 4]\`. Expected: \`[24, 12, 8, 6]\`.

The plan is two passes. Pass 1 writes the prefix product into \`output[i]\` (the product of elements strictly to the left). Pass 2 walks right-to-left, multiplying \`output[i]\` by the running suffix product.

::: steps
| Pass | i | running | output |
|------|---|---------|--------|
| init | -    | -       | [1, _, _, _] |
| L→R  | 1    | prefix=1 → 1 | [1, 1, _, _] |
| L→R  | 2    | prefix=1·2 → 2 | [1, 1, 2, _] |
| L→R  | 3    | prefix=2·3 → 6 | [1, 1, 2, 6] |
| R→L  | 3    | suffix=1 | output[3] · 1 = 6; suffix ← 4 |
| R→L  | 2    | suffix=4 | output[2] · 4 = 8; suffix ← 12 |
| R→L  | 1    | suffix=12 | output[1] · 12 = 12; suffix ← 24 |
| R→L  | 0    | suffix=24 | output[0] · 24 = 24 |
:::

Final: \`[24, 12, 8, 6]\`.

\`\`\`python-run
def product_except_self_local(nums):
    n = len(nums)
    output = [1] * n
    prefix = 1
    for i in range(n):
        output[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        output[i] *= suffix
        suffix *= nums[i]
    return output

print(product_except_self_local([1, 2, 3, 4]))  # try adding a 0 to the list
\`\`\`

::: callout warning
The order inside each pass matters. In the left-to-right pass, \`output[i] = prefix\` is written **before** \`prefix *= nums[i]\`, so position \`i\` records the product strictly to its left. Flipping those two lines includes the current element and breaks the result.
:::

## Worked Example 2

**Compress Runs.** Replace each run of identical characters with the character followed by its run length. \`"aaabb"\` becomes \`"a3b2"\`. A single character becomes that character followed by \`1\`.

The running state is two values: the current character being counted, and the length of the current run. When the character changes, flush the previous run to a list of parts, then start a new run. At the very end, flush the final run.

::: fill
After scanning \`"a"\`, \`"a"\`, \`"a"\`, \`"b"\`, the parts list should contain **{{a3|"a3"}}**, the current character is **{{b}}**, and the current run length is **{{1}}**.
> Flushing happens at the boundary, not on the new character itself. The new run starts with length 1.
:::

\`\`\`python-run
def compress_runs(text):
    if not text:
        return ""
    parts = []
    current = text[0]
    run = 1
    for ch in text[1:]:
        if ch == current:
            run += 1
        else:
            parts.append(f"{current}{run}")
            current = ch
            run = 1
    parts.append(f"{current}{run}")
    return "".join(parts)

print(compress_runs("aaabb"))  # try "abcabc" or a single letter
\`\`\`

::: callout tip
"Build a list of parts, then \`"".join(parts)\` at the end" is the standard Python idiom. Repeated string concatenation with \`+=\` allocates a new string every iteration and silently turns linear work into quadratic work.
:::

## Implementation Checklist

- Name what the prefix (or suffix) summary holds at each step. If you cannot, the indexing will drift.
- Decide whether the output is a new array of the same size, a reduced array, a string, or a single value.
- For string output, use a list and \`"".join\` at the end. Do not \`+=\` in a loop.
- Test the empty input, the single-element input, and an input where every value is equal.
- If the prompt forbids extra memory, prove the in-place plan by tracing a small case.

## Common Mistakes

- Using division to solve "product except self" and crashing on inputs that contain a zero.
- Forgetting to flush the final run when compressing a string, so the last character disappears.
- Off-by-one errors when the prefix pass uses \`range(n)\` but the suffix pass uses \`range(n - 1, -1, -1)\`. Always trace the boundary indexes by hand.
- Building strings with \`result += piece\` inside a loop. This is O(n²) on large inputs and a common interview red flag.
- Mutating the input array when the caller expects it untouched. If the prompt says "in place", do it. If it does not, do not.

## Complexity Notes

A single scan or a pair of scans is **O(n) time**. A nested scan to recompute the prefix at every position would be O(n²); the prefix summary is exactly what avoids that.

Space depends on the output. A transformed array of the same length is **O(n)** because you must store it. A compressed string is at most O(n). If the prompt asks you not to count the output toward space, prefix-based solutions can be **O(1) extra**.

## Practice Path

Begin with **Rotate Left (Local)** to lock in modular arithmetic on indexes. Move to **Compress Runs** for the flush-on-boundary pattern, then **Merge Sorted Unique** for two-input array walking, and finally **Product Except Self (Local)** for the prefix + suffix two-pass technique. Each one drills a different way of summarising what you have already seen so the next index can be answered in constant time.
`;
}

function twoPointersBody(): string {
  return `# Two Pointers & Sliding Window

Two pointers is a way to **replace a nested loop with a single pass** when the answer can be found by moving two indexes in a disciplined way. A sliding window is the most common shape of this idea: a *contiguous* slice of the input whose endpoints move so that the slice always satisfies some condition you care about.

The big payoff is converting O(n²) brute force into O(n).

## Learning Goals

- Recognise prompts that ask for a **contiguous** subarray or substring, and distinguish them from prompts that ask for any subset.
- Operate two indexes (\`left\` and \`right\`) such that each index only ever moves in one direction, so each element is examined at most twice.
- Maintain a window summary (sum, count of zeros, character frequencies, distinct count) that updates in constant time per move.
- Decide whether to **shrink** the window before or after expanding it, and why mixing those up is a common bug.

## Pattern Recognition Signals

- The prompt asks for a **maximum length**, **minimum length**, **count**, or **sum** of a contiguous subarray or substring.
- It includes a per-window condition: "at most k zeros", "all distinct characters", "sum at most limit".
- All values are non-negative, or all weights are positive — extending the window monotonically increases the running sum.
- A sorted input with a target sum or target relationship between two values.

::: callout warning
Sliding window does **not** work when values can be negative and you are maintaining a running sum. Extending the window might decrease the sum, breaking monotonicity. For those, you need prefix sums plus a hash map (the Hashing module).
:::

::: quiz
**Q:** "Find the longest contiguous subarray with at most two zeros." Which structure makes this O(n)?
- A nested loop trying every (left, right) pair
- Sort the array first
* A sliding window that tracks the count of zeros and shrinks when the count exceeds two
- A binary search over the answer length
> Two pointers, both moving rightward, each at most n times. Total work is O(n).
:::

## Mental Model

Every sliding window solution follows the same three-part rhythm:

1. **Expand.** Move \`right\` forward by one. Update the window summary to include \`nums[right]\`.
2. **Repair.** While the window is invalid, move \`left\` forward by one. Update the window summary to exclude \`nums[left]\`. Stop as soon as the window is valid again.
3. **Record.** With the window valid, update the best answer (length, count, whatever the prompt wants).

For two-pointer problems where the pointers move toward each other (sorted input, palindrome check), the rhythm is different: each iteration, one pointer moves based on a comparison, and they meet in the middle.

::: callout key
The proof that the work is O(n) is the same in both shapes: each pointer only moves in one direction and at most n steps in total. Total moves ≤ 2n.
:::

## Worked Example 1

**Longest With Flips.** You may flip up to \`k\` zeros to ones. Return the length of the longest contiguous run of ones that becomes possible.

Equivalently: find the longest window that contains **at most k zeros**.

Input: \`[1, 0, 1, 0, 1, 1, 0]\`, \`k = 2\`. Expected: \`6\`.

::: diagram array
values: 1 0 1 0 1 1 0
lo: 0
hi: 5
caption: The window spans left..right. Here it holds two zeros — the most k = 2 allows — for a length of 6.
:::

Trace, where \`zeros\` is the count of zeros currently inside the window \`[left..right]\` and \`best\` is the longest valid window length seen:

::: steps
| right | nums[right] | window     | zeros | action | best |
|-------|-------------|-----------|-------|--------|------|
| 0     | 1           | [1]       | 0     | valid  | 1 |
| 1     | 0           | [1,0]     | 1     | valid  | 2 |
| 2     | 1           | [1,0,1]   | 1     | valid  | 3 |
| 3     | 0           | [1,0,1,0] | 2     | valid  | 4 |
| 4     | 1           | [1,0,1,0,1] | 2   | valid  | 5 |
| 5     | 1           | [1,0,1,0,1,1] | 2 | valid  | 6 |
| 6     | 0           | zeros=3, shrink: move left until zeros≤2 (window becomes [1,0,1,1,0], left advanced past two zeros) | 2 | valid  | 6 |
:::

Final: \`6\`.

\`\`\`python-run
def longest_with_flips(nums, k):
    left = 0
    zeros = 0
    best = 0
    for right in range(len(nums)):
        if nums[right] == 0:
            zeros += 1
        while zeros > k:
            if nums[left] == 0:
                zeros -= 1
            left += 1
        best = max(best, right - left + 1)
    return best

print(longest_with_flips([1, 0, 1, 0, 1, 1, 0], 2))  # try changing k
\`\`\`

::: callout warning
The order inside the loop is: expand → repair → record. If you flip "repair" and "record", you read a stale window. The invariant is that **after the while loop, the window is valid**.
:::

## Worked Example 2

**Closest Pair Sum.** Given a **sorted** array and a target, return the pair of values whose sum is closest to the target. This is a different two-pointer shape: pointers start at the ends and move toward each other.

Input: sorted \`[1, 3, 6, 10, 13]\`, target \`12\`. Expected pair: \`(3, 10)\` (sum 13, distance 1) or \`(6, 6)\` (sum 12, distance 0 if duplicates existed).

Why does moving one pointer at a time work? If \`nums[left] + nums[right]\` is **too small**, increasing the sum requires moving \`left\` rightward (toward larger values). If it is too big, only moving \`right\` leftward helps. Either way, exactly one move is justified, and the opposite move would be wasted.

::: steps
| left | right | sum | distance to 12 | action | best |
|------|-------|-----|----------------|--------|------|
| 0    | 4     | 1 + 13 = 14 | 2 | sum too big, move right← | (1,13) |
| 0    | 3     | 1 + 10 = 11 | 1 | sum too small, move left→ | (1,10) |
| 1    | 3     | 3 + 10 = 13 | 1 | tie or move whichever | (3,10) |
| 2    | 3     | 6 + 10 = 16 | 4 | worse | (3,10) |
| stop |       |     |   |        |       |
:::

::: fill
The reason this pattern only works on a **{{sorted}}** input is that moving a pointer in one direction has a known, monotonic effect on the sum.
> Without sorted order, you cannot conclude which move will help.
:::

\`\`\`python-run
def closest_pair_sum(nums, target):
    left, right = 0, len(nums) - 1
    best = None
    best_dist = float("inf")
    while left < right:
        s = nums[left] + nums[right]
        d = abs(s - target)
        if d < best_dist:
            best_dist = d
            best = (nums[left], nums[right])
        if s < target:
            left += 1
        else:
            right -= 1
    return best

print(closest_pair_sum([1, 3, 6, 10, 13], 12))  # try a different target
\`\`\`

## Implementation Checklist

- Write down the **window validity rule** (e.g., "at most k zeros") in plain English before coding.
- Confirm the window summary updates in O(1) when an element enters or leaves.
- Decide the loop structure: \`for right in range(n)\` outside, \`while invalid\` inside.
- Update the answer at the right moment: after the repair, when the window is once again valid.
- Test \`k = 0\`, \`k\` larger than the array, and an array of all zeros.

## Common Mistakes

- Using a sliding window with negative values and a sum-based condition. Monotonicity breaks; switch patterns.
- Shrinking the window before adding the new \`right\` element to the summary, mixing the invariant up.
- Recording the answer before the window is valid again, accepting an illegal window.
- Off-by-one length calculation. The length of a window from \`left\` to \`right\` inclusive is \`right - left + 1\`, not \`right - left\`.
- Counting the wrong thing inside the window (e.g., counting characters to replace instead of counting zeros to flip).

::: quiz
**Q:** Inside a sliding-window loop, where should you read the new candidate answer (e.g., the current window length)?
- Before expanding the window
- Immediately after expanding, before any repair
* After the repair has restored the window's validity
- After the next iteration begins
> The window may be invalid after expansion. You repair first, then record.
:::

## Complexity Notes

A pure sliding window over an array is **O(n) time and O(1) extra space**. Each of \`left\` and \`right\` moves at most n times across the whole run.

If the window summary requires extra structure (e.g., a frequency map for "all distinct" problems), space becomes **O(k)** where k is the number of distinct values that fit in the window — usually a constant in interview problems.

The two-ends pointer shape is also O(n), because the two pointers together cross the array exactly once.

## Practice Path

Start with **Max Sum Under Limit** to anchor the basic expand-and-shrink loop. Move to **Longest With Flips** to introduce a per-window counter, then **Closest Pair Sum** to switch to the opposite-ends two-pointer shape, and finally **Palindrome Edge Score** to combine ideas. For each prompt, write the validity rule **before** you write the code.
`;
}

function hashingBody(): string {
  return `# Hashing

A hash set or hash map answers two questions in **expected O(1)**: "have I seen this before?" and "for this key, what is the associated value?" When a problem repeatedly asks one of those questions about earlier parts of the input, hashing turns an O(n²) scan into an O(n) one.

The skill is choosing the right **key**. The mechanics of \`set\` and \`dict\` are simple; deciding what to put in them is the whole problem.

## Learning Goals

- Use a hash **set** to record what values you have seen.
- Use a hash **map (dict)** to record counts, last index, or any "for each key, what do I know" relationship.
- Choose a canonical key for grouping: sorted letters of a word, a remainder modulo k, a tuple of \`(row, col)\`, etc.
- Combine hashing with **prefix sums** to count subarrays with a target sum, even when the input contains negative numbers.

## Pattern Recognition Signals

- The prompt asks **"is there a pair / triple / subarray that sums to X?"**.
- The prompt asks for **counts**: "how many subarrays have sum equal to k", "how many distinct values appear".
- It asks for **groupings**: "bucket these words by anagram", "group these strings by length".
- It asks about **memory of the past**: "first non-repeating character", "last index of each value".
- It involves a subarray sum but values can be negative — sliding window breaks, but prefix-sum + hash map does not.

::: callout key
A hash set or map is a deal: you spend O(n) memory in exchange for O(1) lookups against everything you have already seen. Use it when the problem keeps re-asking that question.
:::

## Mental Model

For each problem, ask three questions in order:

1. **What is the unit of information?** A single value? A pair? A prefix sum? A sorted-letters signature?
2. **What is the key?** The thing you can look up in O(1). The key must be **hashable** (immutable): an int, a string, or a tuple. Lists and dicts cannot be keys.
3. **What is the value (if any)?** Sometimes you only need membership (use a \`set\`). Sometimes you need a count (use \`dict[int, int]\`). Sometimes you need an index (\`dict[T, int]\`).

::: quiz
**Q:** You want to group these words so that all anagrams land in the same bucket: \`["eat", "tea", "tan", "ate", "nat", "bat"]\`. What key should you use?
- The original word
- The first letter
* The sorted-letters string (so \`"eat"\`, \`"tea"\`, \`"ate"\` all key as \`"aet"\`)
- The length of the word
> Sorting the letters gives a canonical signature; every anagram of the same multiset produces the same key.
:::

## Worked Example 1

**Count Target Sum Subarrays.** Given an integer array and a target \`k\`, count the number of contiguous subarrays whose sum equals \`k\`. Values can be negative.

The trick: let \`prefix[i]\` be the sum of \`nums[0..i-1]\`. The sum of the subarray from \`l\` to \`r\` (inclusive) equals \`prefix[r+1] - prefix[l]\`. So "subarray sum equals \`k\`" becomes "two prefix sums differ by \`k\`". For each new prefix \`p\`, we want to know **how many earlier prefixes equal \`p - k\`**. That is exactly a hash map's job.

Input: \`nums = [1, 2, 3, -2, 5]\`, \`k = 3\`. Expected count: 3 (the subarrays \`[1,2]\`, \`[3]\`, \`[3,-2,5,-3]\` — adjust to your actual prompt).

::: steps
| i | nums[i] | prefix after | look for (prefix - k) | count of that prefix so far | total |
|---|---------|--------------|------------------------|------------------------------|-------|
| init | -    | 0            | -                      | counts = {0: 1}              | 0 |
| 0    | 1    | 1            | 1 - 3 = -2             | counts[-2] = 0               | 0 |
| 1    | 2    | 3            | 3 - 3 = 0              | counts[0] = 1                | 1 |
| 2    | 3    | 6            | 6 - 3 = 3              | counts[3] = 1                | 2 |
| 3    | -2   | 4            | 4 - 3 = 1              | counts[1] = 1                | 3 |
| 4    | 5    | 9            | 9 - 3 = 6              | counts[6] = 1                | 4 |
:::

(Your tests will set the expected count for the exact input.)

\`\`\`python-run
def count_target_sum_subarrays(nums, k):
    counts = {0: 1}  # the empty prefix has sum 0
    prefix = 0
    total = 0
    for value in nums:
        prefix += value
        total += counts.get(prefix - k, 0)
        counts[prefix] = counts.get(prefix, 0) + 1
    return total

print(count_target_sum_subarrays([1, 2, 3, -2, 5], 3))  # try negatives and other k
\`\`\`

::: callout warning
The \`counts = {0: 1}\` initialisation is the most-missed line in this pattern. It lets a subarray that starts at index 0 be counted (its "earlier prefix" is the empty prefix, which has sum 0).
:::

::: callout warning
You must **read** \`counts.get(prefix - k, 0)\` **before** updating \`counts[prefix]\`. Otherwise a single element equal to \`k\` would count itself as a pair with itself.
:::

## Worked Example 2

**Anagram Bucket Sizes.** Given a list of words, count how many anagram groups exist and return the sizes of those groups sorted in ascending order.

The plan: the key is the sorted-letters signature of each word.

::: fill
For the words \`["eat", "tea", "tan", "ate", "nat", "bat"]\`, the keys are \`"aet"\`, \`"aet"\`, \`"ant"\`, \`"aet"\`, \`"ant"\`, \`"abt"\`. The bucket sizes are \`[1, 2, 3]\` after sorting, where \`1\` is from \`{{abt|"abt"}}\`, \`2\` is from \`"ant"\`, and \`3\` is from \`{{aet|"aet"}}\`.
> Sort the bucket sizes for deterministic output. The bucket key itself is hidden from the answer.
:::

\`\`\`python-run
def anagram_bucket_sizes(words):
    buckets = {}
    for word in words:
        key = "".join(sorted(word))
        buckets[key] = buckets.get(key, 0) + 1
    return sorted(buckets.values())

print(anagram_bucket_sizes(["eat", "tea", "tan", "ate", "nat", "bat"]))
\`\`\`

::: callout tip
Use \`collections.defaultdict(int)\` or \`collections.Counter\` if you prefer; the explicit \`get(... , 0) + 1\` is fine too and works without an import.
:::

## Implementation Checklist

- Name what your hash structure remembers. "\`counts[p]\` is the number of prefixes equal to \`p\` seen so far." If you cannot say this in one sentence, the indexing will break.
- Confirm your key is hashable. Tuples and frozensets are fine; lists, sets, and dicts are not.
- For prefix-sum patterns, **initialise** the map with the empty prefix entry (\`counts[0] = 1\`).
- Decide whether to update the map **before** or **after** the lookup. The order is the difference between counting a value as its own pair or not.
- Test inputs with duplicates, negatives, and zeros.

## Common Mistakes

- Forgetting to initialise the prefix-count map with \`{0: 1}\`, so subarrays starting at index 0 are missed.
- Updating the count map before doing the lookup, which makes each element count itself.
- Using a mutable object (list, dict) as a key.
- Storing the values themselves when only the count matters, wasting memory.
- Returning the buckets instead of their sizes when the prompt only asks for sizes.

::: quiz
**Q:** For "count the number of subarrays whose sum equals k" with negative values present, which pattern is correct?
- Sliding window with a running sum
- Sorting then binary search
* Prefix sum plus a hash map counting how many times each prefix sum has been seen
- A nested loop
> Sliding window's monotonicity fails when values can be negative. The prefix-sum-plus-map trick handles negatives because it reasons about pairs of prefix sums, not about extending a window.
:::

## Complexity Notes

A single pass with O(1) expected hash operations is **O(n) time**. The hash structure can hold up to one entry per element, so space is **O(n)**.

Canonicalising a string by sorting its letters costs **O(m log m)** per word, where \`m\` is the word length. For long words, a character-count tuple (length 26) is sometimes faster: O(m) per word.

## Practice Path

Run **First Unique Token** to lock in single-pass counting, then **Anagram Bucket Sizes** for canonical keys, **Longest Distinct Span** to combine hashing with a sliding window, and **Count Target Sum Subarrays** for the prefix-sum-plus-map trick. The last one is the one most interviewers care about, because it is the cleanest "negative-tolerant" subarray pattern.
`;
}

function linkedListsBody(): string {
  return `# Linked Lists

A **linked list** is a chain of small boxes (nodes). Each box holds a value and a pointer (called \`next\`) to the next box, or to nothing (\`None\` / \`null\`) at the end. Unlike an array, you cannot jump to "the 5th element" in one step. You can only walk forward from the head.

This module is about being precise with pointers: which nodes you still hold, which you have lost, and how to rewire \`next\` references without losing track of the rest of the list.

## Learning Goals

- Walk a linked list with a single pointer and know exactly what node it refers to at each step.
- Use a **dummy head** (a sentinel node) so that deleting the first real node looks the same as deleting any other.
- Use **slow and fast pointers** to find the middle of a list, detect a cycle, or measure structure in one pass.
- Rewire \`next\` references safely, saving the references you still need before you reassign.

## Pattern Recognition Signals

- The input is given as a \`head\` node, not an array. You can chase \`head.next.next…\` but you cannot do \`head[3]\`.
- The problem asks you to **delete**, **insert**, **merge**, or **reverse** nodes.
- It asks for the **middle** of the list, or "does this list have a cycle".
- The expected output is itself a linked list (often serialised to an array by the test harness).

::: callout key
The hardest bugs in linked-list code come from losing a reference you needed later. If you are about to write \`node.next = something_new\`, ask yourself: is the **old** \`node.next\` still reachable from somewhere I hold? If not, save it first.
:::

## Mental Model

Three rules cover almost every linked-list problem in this module:

1. **One pointer per role.** Use \`prev\` for the node just before the one you are inspecting, \`current\` for the node you are inspecting now, and (sometimes) \`next_node\` for what comes after \`current\`. Three named pointers cover most rewiring.
2. **Dummy node for any operation that might change the head.** Allocate \`dummy = ListNode(0, head)\`. Do the operation. Return \`dummy.next\`. This avoids a special case for the first node.
3. **Save before you rewire.** Before \`current.next = something_else\`, if you still need the old \`current.next\`, save it to a local variable first.

::: callout tip
Drawing arrows on paper, even for a 4-node list, will save you more time than re-running the test harness. Linked-list bugs are almost always visualisable.
:::

## Worked Example 1

**Remove List Value.** Given the head of a list and a target value, remove every node whose value equals the target. Return the new head.

Input: \`[2, 1, 2, 3]\` with target \`2\`. Expected output: \`[1, 3]\`.

The hard case is when the head itself equals the target, because removing the head changes the return value. A dummy head removes the special case:

::: diagram linked-list
values: 2 1 2 3
dummy: true
highlight: 0
caption: A dummy node sits before the real head. Removing the first node (value 2) is now just ordinary pointer rewiring.
:::

::: steps
| Step | prev points at | prev.next.val | action |
|------|----------------|----------------|--------|
| 1 | dummy | 2 | match: \`prev.next = prev.next.next\` → \`dummy -> 1 -> 2 -> 3\` (prev does **not** advance) |
| 2 | dummy | 1 | keep: \`prev = prev.next\` (now points at node 1) |
| 3 | node 1 | 2 | match: \`prev.next = prev.next.next\` → \`1 -> 3\` |
| 4 | node 1 | 3 | keep: \`prev = prev.next\` |
| 5 | node 3 | (next is None) | stop |
:::

Return \`dummy.next\`, which is \`[1, 3]\`.

\`\`\`python-run
def remove_list_value(head, target):
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next:
        if prev.next.val == target:
            prev.next = prev.next.next
        else:
            prev = prev.next
    return dummy.next

# ListNode is provided. Build a chain and read it back as a list:
def build(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

def to_list(node):
    out = []
    while node:
        out.append(node.val)
        node = node.next
    return out

print(to_list(remove_list_value(build([2, 1, 2, 3]), 2)))  # try other targets
\`\`\`

::: callout warning
When you remove a node, **do not advance** \`prev\`. The new \`prev.next\` could itself be a match. Advancing on a removal step would skip over consecutive matches.
:::

## Worked Example 2

**Middle List Value.** Return the middle value of the list in **one pass**. For even-length lists, return the second of the two middles.

Input: \`[10, 20, 30, 40]\`. Expected: \`30\` (the second middle).

The trick is two pointers: \`slow\` advances by one node per loop, \`fast\` advances by two. When \`fast\` reaches the end, \`slow\` is at the middle.

::: steps
| iter | slow | fast | comment |
|------|------|------|---------|
| start | 10 | 10 | both at head |
| 1     | 20 | 30 | slow + 1, fast + 2 |
| 2     | 30 | (None) | fast walked off the end → stop |
:::

Return \`slow.val\` = 30.

::: fill
For an odd-length list \`[10, 20, 30]\`, after one iteration slow is at \`20\` and fast is at \`30\`. After the next iteration fast would walk off the end, so the loop stops. The middle returned is **{{20}}**.
> For odd lengths there is a single middle; for even lengths the convention here returns the second of the two.
:::

\`\`\`python-run
def middle_list_value(head):
    slow = head
    fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow.val

def build(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

print(middle_list_value(build([10, 20, 30, 40])))  # try an odd-length list
\`\`\`

::: callout tip
The loop condition \`while fast and fast.next\` is the trick. \`fast\` could be \`None\` (even-length lists land here), or \`fast.next\` could be \`None\` (odd-length lists land here). You must check both, in this order, because \`None.next\` would crash.
:::

## Implementation Checklist

- Decide whether the operation might change the head. If yes, use a \`dummy\` sentinel.
- Name your pointers (\`prev\`, \`current\`, \`next_node\`) before you write the loop.
- Whenever you reassign \`x.next\`, ask whether anyone still needs the **old** \`x.next\`. If yes, save it first.
- Test the empty list (\`head = None\`), a single-node list, and a list where every node matches the operation.
- Return \`dummy.next\`, never the saved-original \`head\`, because the original head may have been removed.

## Common Mistakes

- Returning the original \`head\` instead of \`dummy.next\` after removing the first node.
- Advancing the cursor after a removal, which skips the next node.
- Crashing on an empty list because the code dereferences \`head.val\` before checking \`head is None\`.
- Comparing node objects when you meant to compare values (\`node1 == node2\` vs \`node1.val == node2.val\`).
- Running the fast/slow loop with \`while fast.next and fast.next.next\` and then forgetting an off-by-one when the list has two nodes.

::: quiz
**Q:** A list contains \`[1, 2, 2, 2, 3]\` and you remove every \`2\`. What happens if your code does \`prev = prev.next\` immediately after each removal?
* It skips removing the second and third \`2\` because each removal moves \`prev\` past a not-yet-checked node
- It crashes
- It returns the wrong type
- It works correctly
> On a removal, do not advance \`prev\`; the new \`prev.next\` is the node that was two steps away and may itself be a target.
:::

## Complexity Notes

Almost every linked-list operation in this module is **O(n) time** because there is no random access — you walk the chain.

Space is **O(1)** if you only manipulate \`next\` pointers. If you copy the list into an array (for example, to check if it is a palindrome by comparing it to its reverse), space becomes **O(n)**.

Recursive linked-list solutions also cost O(n) **stack space**, which matters on very long lists.

## Practice Path

Start with **List Sum** to anchor the basic walk-and-accumulate pattern. Move to **Remove List Value** for the dummy-head idiom, then **Middle List Value** for slow/fast, and finally **Merge Two Linked Lists** to combine all of the above into a real rewiring exercise.

When in doubt, slow down and draw arrows. Linked-list code that compiles but does the wrong thing is almost always one mis-drawn arrow.
`;
}

function stacksQueuesBody(): string {
  return `# Stacks & Queues

A **stack** holds items in last-in-first-out order: the last item pushed is the first one popped. A **queue** holds items in first-in-first-out order: items leave in the order they arrived. These two tiny rules drive a surprising variety of interview problems — anything involving nesting, undoing, or "what is the most recent unresolved item".

## Learning Goals

- Choose between stack and queue by asking whether the **most recent** or the **oldest** pending item matters first.
- Implement a **monotonic stack** that maintains an ordering invariant on its contents and uses it to answer next-greater / nearest-smaller questions in linear total time.
- Use a queue to maintain a streaming window where old items expire by age, not by position.
- Use a stack to validate matched delimiters and to simplify nested or hierarchical input.

## Pattern Recognition Signals

- **Stack**: matching brackets, nested expressions, "nearest previous greater", undo operations, evaluating an expression with precedence.
- **Queue**: streaming events with a time-based expiry, breadth-first traversal (covered in Trees & Graphs), maintaining a fixed-size sliding count.
- **Monotonic stack**: "for each index, find the next (or previous) index whose value is greater (or smaller) than this one".
- **Counter/multiset**: a small variation where you also need to know how many of each item is in the queue.

::: quiz
**Q:** "For each day's temperature, how many days until a warmer one?" Which structure resolves earlier items linearly?
- A min-heap
* A monotonic stack that holds indexes of days whose answer is still unknown
- A queue of days
- A hash map of temperature to index
> A decreasing stack of indexes: pop while the current temperature is warmer than the index on top, writing the distance for each popped index.
:::

## Mental Model

Three working metaphors cover the module:

1. **Pending work**: a stack remembers what you started and have not finished. Opening brackets are pending; closing them resolves the most recent one.
2. **Time-ordered window**: a queue remembers events still inside a time range. As time moves forward, the front expires.
3. **Monotonic ordering invariant**: a stack whose values are kept in monotonic order (always increasing or always decreasing). When a new value arrives that would break the order, everything on top that violates the rule is popped — and each pop produces a useful answer.

::: callout key
A monotonic stack is linear-total because each index is pushed once and popped once. Even though the inner pop loop is unbounded in the worst case, the amortised work is O(1) per index.
:::

## Worked Example 1

**Warmer Day Waits.** For each day in \`temps\`, return the number of days until a warmer temperature, or \`0\` if no warmer day exists.

Input: \`[73, 74, 75, 71, 69, 72, 76, 73]\`. Expected: \`[1, 1, 4, 2, 1, 1, 0, 0]\`.

The plan: walk left to right with a stack of **indexes** whose answer is not yet known. The stack stays in **decreasing order of temperature**. On each new day, while the day on top of the stack is colder, pop it and record the distance.

::: steps
| i | temp | stack before | action | answer so far |
|---|------|--------------|--------|----------------|
| 0 | 73   | []           | push 0 | [_,_,_,_,_,_,_,_] |
| 1 | 74   | [0]          | 74>73, pop 0 → ans[0]=1; push 1 | [1,_,_,_,_,_,_,_] |
| 2 | 75   | [1]          | 75>74, pop 1 → ans[1]=1; push 2 | [1,1,_,_,_,_,_,_] |
| 3 | 71   | [2]          | 71<75, push 3 | [1,1,_,_,_,_,_,_] |
| 4 | 69   | [2,3]        | 69<71, push 4 | [1,1,_,_,_,_,_,_] |
| 5 | 72   | [2,3,4]      | 72>69, pop 4 → ans[4]=1; 72>71, pop 3 → ans[3]=2; 72<75, push 5 | [1,1,_,2,1,_,_,_] |
| 6 | 76   | [2,5]        | 76>72, pop 5 → ans[5]=1; 76>75, pop 2 → ans[2]=4; push 6 | [1,1,4,2,1,1,_,_] |
| 7 | 73   | [6]          | 73<76, push 7 | same |
| end |   | [6,7]        | unresolved → 0 each | [1,1,4,2,1,1,0,0] |
:::

\`\`\`python-run
def warmer_day_waits(temps):
    answer = [0] * len(temps)
    stack = []  # indexes with unknown answer; temps[stack] is strictly decreasing
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            answer[j] = i - j
        stack.append(i)
    return answer

print(warmer_day_waits([73, 74, 75, 71, 69, 72, 76, 73]))  # try your own temps
\`\`\`

::: callout warning
The stack stores **indexes**, not temperatures. You need the index to compute the distance \`i - j\`. Forgetting this is the #1 way to break monotonic-stack code.
:::

## Worked Example 2

**Recent Event Counts.** Events arrive in non-decreasing timestamp order. For each event at time \`t\`, return the number of events that occurred in the inclusive range \`[t - window, t]\`.

Input timestamps: \`[1, 100, 3001, 3002]\`, window = \`3000\`. Expected: \`[1, 2, 3, 3]\`.

The queue holds timestamps still inside the window. On each new event:

1. Append the new timestamp.
2. While the front of the queue is older than \`current_time - window\`, pop it from the front.
3. The queue length is the answer for this event.

::: steps
| event | queue before | queue after | answer |
|-------|--------------|-------------|--------|
| 1     | []           | [1]         | 1 |
| 100   | [1]          | [1, 100]    | 2 |
| 3001  | [1, 100]     | [1, 100, 3001] (3001 - 3000 = 1; 1 ≥ 1 keeps it) | 3 |
| 3002  | [1, 100, 3001] | [100, 3001, 3002] (3002 - 3000 = 2; 1 < 2 expires) | 3 |
:::

::: fill
The reason we use a queue and not a stack here is that we want to expire **{{old|oldest}}** events first. A queue removes from the front, which holds the oldest item.
> Stacks expire newest; queues expire oldest.
:::

\`\`\`python-run
from collections import deque

class RecentCounter:
    def __init__(self, window):
        self.window = window
        self.q = deque()

    def ping(self, t):
        self.q.append(t)
        while self.q[0] < t - self.window:
            self.q.popleft()
        return len(self.q)

counter = RecentCounter(3000)
print([counter.ping(t) for t in [1, 100, 3001, 3002]])  # try a smaller window
\`\`\`

## Implementation Checklist

- Decide: most-recent-pending (stack) or oldest-pending (queue)?
- For monotonic stack: state the ordering invariant in one line ("stack values are strictly decreasing"). Match the pop condition to that invariant.
- Always check whether the structure is empty before peeking or popping.
- For queue-based windows: define the expiry condition precisely (\`< t - window\` vs \`<= t - window\` — read the prompt).
- Sketch a 3- or 4-element trace by hand before coding.

## Common Mistakes

- Using a stack when expiry depends on age, not position. The result is technically working code that quietly returns wrong answers.
- For monotonic stack, treating "equal temperature" as warmer. Read the prompt: usually strictly greater means strictly greater.
- Forgetting to record an answer of \`0\` (or \`-1\` or whatever the prompt says) for items left in the stack at the end.
- Using a Python list as a queue with \`pop(0)\` instead of \`deque.popleft()\`. \`pop(0)\` is O(n), turning a clean O(n) algorithm into O(n²).
- Confusing "next greater" (looking forward) with "previous greater" (looking backward). They are different stack scans.

::: quiz
**Q:** What is the amortised cost per element of a left-to-right monotonic stack scan over an n-element array?
- O(n)
* O(1)
- O(log n)
- O(n log n)
> Each index is pushed once and popped at most once. Total work is O(n), so per-element is amortised O(1) even though individual iterations may pop many items.
:::

## Complexity Notes

Stack-based scans where each index is pushed and popped at most once are **O(n) time** total and **O(n) space** for the stack in the worst case.

Queue-based windowing with O(1) front-pop (use \`collections.deque\`) is **O(n) total** because each event is enqueued and dequeued at most once.

A nested simulation with \`pop(0)\` on a list is **O(n²)** and is the most common reason a "linear" solution times out.

## Practice Path

Begin with **Balanced Brackets** (the canonical stack problem). Move to **Simplify Folder Steps** to combine stack with token parsing, then **Warmer Day Waits** for monotonic stack, and **Recent Event Counts** for queue-based windowing. Try to write the invariant ("stack contents are strictly decreasing", "queue holds events within window") before you write any code.
`;
}

function treesGraphsBody(): string {
  return `# Trees & Graphs

A **tree** is a connected, branching structure with one root. Each node has child nodes; there are no cycles. A **graph** generalises this: any node can connect to any other node, edges can be one-way (directed) or two-way (undirected), and cycles are possible.

The two big traversal techniques are **DFS** (depth-first search) and **BFS** (breadth-first search). Most tree and graph problems boil down to choosing one of those and tracking the right state along the way.

## Learning Goals

- Build and walk a tree recursively, knowing what state your recursive call returns.
- Choose **DFS** when the answer follows a path or component, and **BFS** when distance by edge count matters.
- Use a **visited set** in graph code to prevent re-entering nodes and avoid infinite loops.
- Convert grids and edge lists into the right data shape (adjacency list, neighbours of a cell) before traversing.

## Pattern Recognition Signals

- Input describes parents and children (a tree node with \`left\`/\`right\`), an edge list, a grid of cells, or a list of dependencies.
- The prompt asks for **shortest path in an unweighted graph** → BFS.
- The prompt asks for **connected components**, **reachability**, **does a cycle exist**, or **all paths** → DFS is usually simpler.
- The prompt asks about **levels** of a tree → BFS over the tree.
- Grid problems where neighbours are the four (or eight) adjacent cells.

::: callout key
DFS goes deep, then backtracks. BFS goes wide, expanding the frontier one step at a time. The first finds *a* path; the second finds the *shortest* unweighted path.
:::

## Mental Model

Three decisions cover most prompts:

1. **What is a node, and what are its neighbours?** For a tree, neighbours are \`node.left\` and \`node.right\`. For a graph, build an adjacency map from the edge list. For a grid, the four \`(dr, dc)\` offsets give neighbours.
2. **DFS or BFS?** If the question is "shortest path by edge count" or "all nodes at distance d", BFS. Otherwise, DFS.
3. **What state moves with the traversal?** A running depth, a running sum, the current path, a colour for cycle detection. Decide before writing the recursion.

::: callout tip
Recursive DFS is fine for trees of moderate depth. For very deep recursions, Python may hit its recursion limit; rewrite as an explicit stack if the tree could be unbalanced and 10,000 deep.
:::

## Worked Example 1

**Tree Has Path Sum (Local).** Given the root of a binary tree and a target integer, return \`True\` if some root-to-leaf path sums to exactly the target.

Tree:

::: diagram tree
levels: 5 4 8 11 _ 13 4 7 2 _ _ _ _ _ 1
caption: The binary tree for this example. A valid answer must end at a leaf.
:::

Target: \`22\`. Expected: \`True\` (path 5 → 4 → 11 → 2 sums to 22).

Plan: depth-first recursion. At each call, subtract the current node's value from the target. The base case is a **leaf**: return \`True\` only if the leaf value equals the remaining target.

::: steps
| call | node | remaining | leaf? | result |
|------|------|-----------|-------|--------|
| 1 | 5  | 22 | no | recurse left and right |
| 2 | 4  | 17 | no | recurse left |
| 3 | 11 | 13 | no | recurse left and right |
| 4 | 7  | 2  | yes | 7 ≠ 2 → False |
| 5 | 2  | 2  | yes | 2 == 2 → True |
| ↑ propagate True up | | | | |
:::

\`\`\`python-run
def tree_has_path_sum_local(root, target):
    if not root:
        return False
    remaining = target - root.val
    if not root.left and not root.right:
        return remaining == 0
    return (
        tree_has_path_sum_local(root.left, remaining)
        or tree_has_path_sum_local(root.right, remaining)
    )

# TreeNode(val, left, right) is provided. Build the tree from the diagram:
root = TreeNode(5,
    TreeNode(4, TreeNode(11, TreeNode(7), TreeNode(2))),
    TreeNode(8, TreeNode(13), TreeNode(4, None, TreeNode(1))))

print(tree_has_path_sum_local(root, 22))  # try 26 (5+8+13) or a missing sum
\`\`\`

::: callout warning
The match must be at a **leaf**, not at an interior node that happens to equal the remaining target. A path that ends mid-tree is not a valid root-to-leaf path.
:::

## Worked Example 2

**Shortest Edge Path.** Given an undirected graph and two nodes, return the length of the shortest path between them by edge count.

Edges: \`[(1,2), (2,3), (3,4), (1,5), (5,4)]\`. From \`1\` to \`4\`. Expected: \`2\` (path 1 → 5 → 4).

BFS guarantees that the first time you dequeue the goal, you have found the shortest path. The key is a **visited set**: nodes already enqueued never enter the queue again.

::: steps
| step | queue (node, dist) | popped | new neighbours | visited |
|------|--------------------|--------|----------------|---------|
| init | [(1,0)] | - | - | {1} |
| 1 | [(2,1),(5,1)] | 1 | 2, 5 | {1,2,5} |
| 2 | [(5,1),(3,2)] | 2 | 3 | {1,2,5,3} |
| 3 | [(3,2),(4,2)] | 5 | 4 | {1,2,5,3,4} |
| 4 | [(4,2)] | 3 | (no new) | same |
| 5 | (4,2) reached | 4 | done | return 2 |
:::

::: fill
We use **{{BFS|breadth-first search}}** rather than DFS because we need the shortest path by edge count, and BFS visits all nodes at distance d before any node at distance d+1.
> DFS could find *a* path but not necessarily the shortest one.
:::

\`\`\`python-run
from collections import deque

def shortest_edge_path(edges, start, goal):
    adj = {}
    for a, b in edges:
        adj.setdefault(a, []).append(b)
        adj.setdefault(b, []).append(a)
    if start == goal:
        return 0
    visited = {start}
    queue = deque([(start, 0)])
    while queue:
        node, dist = queue.popleft()
        for nb in adj.get(node, []):
            if nb == goal:
                return dist + 1
            if nb not in visited:
                visited.add(nb)
                queue.append((nb, dist + 1))
    return -1

edges = [(1, 2), (2, 3), (3, 4), (1, 5), (5, 4)]
print(shortest_edge_path(edges, 1, 4))  # try a different start/goal
\`\`\`

::: callout tip
Mark a node visited **at the moment you enqueue it**, not when you dequeue it. Otherwise the same node may end up in the queue many times.
:::

## Implementation Checklist

- Decide the data shape: tree node, adjacency map, or grid offsets.
- Decide DFS vs BFS based on the question. Shortest unweighted path → BFS. Everything else → DFS unless levels matter.
- Always carry a visited set in graph traversals. Without it, undirected edges turn into infinite loops immediately.
- For recursive DFS, write the **base case first**.
- For BFS, mark visited on enqueue, not on dequeue.

## Common Mistakes

- Returning \`True\` from "has path sum" at an internal node where the running remainder happens to equal the node value. The prompt requires a leaf.
- Counting an isolated node as not a component, or vice versa. A lone node with no edges is its own component.
- Using DFS for shortest unweighted paths and accidentally returning a longer one.
- Mutating a grid in place during DFS and forgetting to restore it for the next call (or, when the caller expects the grid unchanged, leaving it changed).
- For directed graphs, treating edges as bidirectional. Read the prompt for whether \`(a, b)\` means \`a → b\` or \`a — b\`.

::: quiz
**Q:** You are checking whether a directed graph contains a cycle. Which traversal helps and what extra state do you track per node?
- BFS with a single visited set
* DFS with three states per node: unvisited, in the current call stack, fully explored
- A heap of nodes by in-degree
- A single union-find
> The "in current call stack" colour distinguishes a cycle (re-entering a node on the current path) from a re-encounter of an already-explored sibling.
:::

## Complexity Notes

Tree traversal touches each node once: **O(n) time**, **O(h)** stack space for recursion where \`h\` is the tree height.

Graph traversal visits each vertex and each edge at most once: **O(V + E) time**, **O(V) space** for the visited set and the frontier.

Grid flood fill is **O(rows × cols)** time and space because every cell may be enqueued once.

## Practice Path

Start with **Tree Max Depth** to anchor recursion on a tree. Move to **Tree Has Path Sum** for state that flows down the recursion, then **Count Grid Islands** for DFS over a grid with visited marking, and **Shortest Edge Path** for BFS over an adjacency list. Each one isolates one decision: tree vs graph, DFS vs BFS, what state to carry.
`;
}

function heapsBody(): string {
  return `# Heaps

A **heap** (specifically a binary heap, the data structure behind Python's \`heapq\`) keeps a collection so that you can always read or remove the smallest element in **O(log n)** time. Inserts are also O(log n). It does **not** keep the rest sorted; it only guarantees fast access to the next minimum.

This makes a heap the right tool whenever the algorithm keeps asking, "what is the smallest (or largest) thing right now?"

## Learning Goals

- Use \`heapq\` to push and pop with the minimum at the top.
- Build a **max-heap** in Python by pushing negative values.
- Solve **top-k** problems efficiently without sorting the entire input.
- Merge several sorted streams in O(total log k) where k is the number of streams.
- Maintain a **running median** with two heaps.

## Pattern Recognition Signals

- "Find the k smallest" or "k largest" — and k is small compared to n.
- "Merge sorted streams" or "next event in a priority queue".
- "Stream of numbers; after each insertion report the median (or some other order statistic)".
- "Repeatedly grab the cheapest task / nearest point / shortest job".

::: quiz
**Q:** You have 10 million log entries and want the 100 most recent. Which approach is cheapest?
- Sort the entire array, then take the last 100
- Walk the array and append to a sorted list each time
* Maintain a min-heap of size 100, pushing each entry and popping when the heap exceeds 100
- A linked list
> O(n log k) where k = 100, versus O(n log n) for a full sort. The heap stays small.
:::

## Mental Model

A heap is a binary tree stored compactly in an array. The element at index \`i\` has children at \`2i+1\` and \`2i+2\`. In a min-heap, every parent is less than or equal to its children — so the smallest element is always at index 0.

::: diagram heap
levels: 1 3 8 5 12 9
caption: A min-heap. Each parent is at most its children, so the minimum (1) sits at index 0. Brackets show the array index.
:::

Three patterns cover most heap problems:

1. **Top-k by min-heap of size k.** Keep the k best so far. Push each new candidate; if the heap exceeds k, pop the smallest. At the end, the heap holds the top k.
2. **k-way merge.** Push one head from each sorted stream. Pop the smallest, then push the next item from the same stream. Repeat until done.
3. **Two heaps.** A max-heap for the lower half and a min-heap for the upper half. Their tops are the running median.

::: callout key
Python's \`heapq\` only does **min-heaps**. For a max-heap, push \`-value\` and negate again when reading. The order of operations is symmetric.
:::

## Worked Example 1

**Top K Scores.** Given a stream of integers, return the k largest values in any order at the end.

Plan: a **min-heap of size k**. While reading the stream, push each value. If the heap exceeds size k, pop the smallest. At the end the heap contains the k largest values.

Input: \`[7, 2, 9, 4, 11, 1, 6, 8]\`, k = 3. Expected (as a set): \`{11, 9, 8}\`.

::: steps
| value | heap after push | exceeds 3? | heap after pop |
|-------|------------------|------------|------------------|
| 7  | [7]          | no | [7] |
| 2  | [2, 7]       | no | [2, 7] |
| 9  | [2, 7, 9]    | no | [2, 7, 9] |
| 4  | [2, 7, 9, 4] | yes (4 elements) | pop 2 → [4, 7, 9] |
| 11 | [4, 7, 9, 11] | yes | pop 4 → [7, 9, 11] |
| 1  | [1, 7, 9, 11] | yes | pop 1 → [7, 9, 11] |
| 6  | [6, 7, 9, 11] | yes | pop 6 → [7, 9, 11] |
| 8  | [7, 8, 9, 11] | yes | pop 7 → [8, 9, 11] |
:::

Final heap (as a set): \`{8, 9, 11}\`.

\`\`\`python-run
import heapq

def top_k_scores(values, k):
    heap = []
    for v in values:
        heapq.heappush(heap, v)
        if len(heap) > k:
            heapq.heappop(heap)
    return list(heap)

print(top_k_scores([7, 2, 9, 4, 11, 1, 6, 8], 3))  # try changing k
\`\`\`

::: callout tip
The min-heap is "keeping the worst of the best at the top, so we know which one to evict next." That is the entire intuition.
:::

## Worked Example 2

**Running Medians (Local).** After each value in a stream, report the median of all values seen so far.

Plan: two heaps that split the stream into a lower half and an upper half.

- \`lower\` is a **max-heap** (so its top is the largest of the small values).
- \`upper\` is a **min-heap** (so its top is the smallest of the big values).
- Sizes are kept within 1 of each other.

If \`lower\` has more elements, the median is \`lower.top\`. If they are equal, the median is the average of the two tops.

Input stream: \`[5, 2, 8, 1, 9]\`. Expected medians after each insert: \`5, 3.5, 5, 3.5, 5\`.

::: fill
After inserting \`5\` and \`2\`, the lower (max) heap holds \`{{2}}\` and the upper (min) heap holds \`{5}\`. The median is the average of the two tops: \`(2 + 5) / 2 = {{3.5}}\`.
> Sizes are balanced, so the median is the average of the two tops.
:::

::: steps
| inserted | lower (max) | upper (min) | median |
|----------|-------------|-------------|--------|
| 5        | []          | [5]         | 5 (one side empty: take the non-empty top) |
| 2        | [2]         | [5]         | (2 + 5) / 2 = 3.5 |
| 8        | [2, 5]      | [8]         | 5 (lower is larger) |
| 1        | [2, 1]      | [5, 8]      | (2 + 5) / 2 = 3.5 |
| 9        | [5, 2, 1]   | [8, 9]      | 5 |
:::

\`\`\`python-run
import heapq

class RunningMedian:
    def __init__(self):
        self.lower = []  # max-heap via negation
        self.upper = []  # min-heap

    def add(self, x):
        if not self.lower or x <= -self.lower[0]:
            heapq.heappush(self.lower, -x)
        else:
            heapq.heappush(self.upper, x)
        # Rebalance so |sizes| differs by at most 1, lower never smaller.
        if len(self.lower) > len(self.upper) + 1:
            heapq.heappush(self.upper, -heapq.heappop(self.lower))
        elif len(self.upper) > len(self.lower):
            heapq.heappush(self.lower, -heapq.heappop(self.upper))

    def median(self):
        if len(self.lower) > len(self.upper):
            return -self.lower[0]
        return (-self.lower[0] + self.upper[0]) / 2

stream = RunningMedian()
medians = []
for x in [5, 2, 8, 1, 9]:
    stream.add(x)
    medians.append(stream.median())
print(medians)  # try a longer stream
\`\`\`

## Implementation Checklist

- For top-k, decide if you want the k **largest** (use a min-heap of size k) or the k **smallest** (use a max-heap of size k).
- For Python max-heaps, store \`-value\`. Convert back on read.
- For k-way merge, push tuples \`(value, stream_id, item_index)\` so ties are broken deterministically.
- For two-heap median, write the rebalance rule explicitly and test it with a small odd and even sequence.
- Test the empty stream, k larger than n, and a stream with duplicates.

## Common Mistakes

- Sorting the entire input when k is small. This is correct but slower than a heap.
- Forgetting tie-breakers in k-way merge. When two streams have equal heads, the heap may complain about comparing dictionaries or raise on unhashable types — push a tuple with a unique tie-breaker.
- Mutating a caller-owned list with \`heapify\`. \`heapify\` rearranges the list in place. If the caller expects the original order, copy first.
- Letting the two heaps for the median drift in size by more than 1. The median becomes wrong silently.
- Pushing onto the max-heap as \`value\` instead of \`-value\`. Python will treat it as a min-heap and the algorithm produces the wrong order.

::: quiz
**Q:** Python's \`heapq\` is a min-heap. How do you simulate a max-heap?
- Use a different module
- Sort the list in reverse before each push
* Push \`-value\` and negate again when reading
- Override \`__lt__\` globally
> Negating the value flips the comparison. The smallest negative is the largest positive, so the min-heap effectively returns the max.
:::

## Complexity Notes

A single push or pop is **O(log n)**. Building a heap by repeated pushes is O(n log n); using \`heapify\` on an existing list is O(n).

Top-k with a heap of size k is **O(n log k)**, much cheaper than the O(n log n) of sorting when k << n.

k-way merge of streams totalling N items is **O(N log k)** because the heap never holds more than k items.

Two-heap streaming median: **O(log n) per insertion**, O(1) per median read.

## Practice Path

Start with **Top K Scores** to lock in the size-k min-heap idiom. Move to **Merge Sorted Batches** for k-way merge, then **K Closest Points** for a heap with a custom key, and finally **Running Medians** for the two-heap dance. For each, name what is on top of the heap *before* writing the loop.
`;
}

function greedyBody(): string {
  return `# Greedy

A **greedy algorithm** makes the locally best choice at each step, never revisits earlier choices, and hopes that the result is globally optimal. The catch is that "hope" needs to be a **proof**. A greedy choice is only correct if you can argue that some optimal solution agrees with it — usually by an **exchange argument**: take any optimal solution, swap its choice for yours, and show the result is no worse.

If you cannot make that argument, you are guessing, and a counterexample will eventually show up.

## Learning Goals

- Identify when sorting the input by a specific key exposes the greedy choice.
- Apply the **earliest-finish** strategy for interval scheduling.
- Use the **farthest-reach** invariant for jumping or coverage problems.
- Write a one-line proof of why your greedy choice is safe.

## Pattern Recognition Signals

- "Maximum number of non-overlapping intervals" / "minimum rooms" / "minimum cost coverage" — almost always greedy after a sort.
- "Can you reach the end given the jumps you can take from each cell?" — single-pass farthest-reach.
- "Minimum number of resources to cover all demands" — sort demands, walk and assign.
- The problem has many possible orderings, but **one specific ordering** (by end time, by start time, by value/weight ratio) makes the choice obvious.

::: callout warning
Be suspicious of any greedy idea you cannot defend in one sentence. "Pick the smallest" is not a proof. "Picking the smallest cannot block any future feasible choice because ..." is a proof.
:::

## Mental Model

Three steps for every greedy problem:

1. **Propose a choice rule.** ("Always pick the meeting that ends earliest.")
2. **Write the proof.** ("Any optimal schedule can be modified to include the earliest-ending meeting without making it worse, because that meeting frees up the most future time.")
3. **Implement.** Usually: sort, then a single pass that takes the next choice that does not conflict with the running state.

::: callout key
"Greedy works" is rarely obvious. When in doubt, try a small counterexample by hand. If you cannot find one in a few minutes, your rule is probably safe. If you find one, the rule was wrong.
:::

## Worked Example 1

**Max Compatible Meetings.** Given a list of meetings \`(start, end)\`, return the maximum number of meetings you can attend (no two overlap).

Choice rule: **always pick the meeting with the earliest end time** among those that start at or after the most recent finish.

Why this is safe: of all meetings ending at-or-before some moment T, the one that ends earliest leaves the most room for future meetings. Any optimal schedule that picks a later-ending meeting can be improved (or kept the same) by swapping it for the earlier-ending one.

Input: \`[(1,4),(3,5),(0,6),(5,7),(3,8),(5,9),(6,10),(8,11),(8,12),(2,13),(12,14)]\`. Expected: 4.

Sort by end time:

::: steps
| meeting | start | end | running last_end | take? | new last_end |
|---------|-------|-----|------------------|-------|--------------|
| (1,4)   | 1 | 4 | -1 | yes | 4 |
| (3,5)   | 3 | 5 | 4  | no (3 < 4) | 4 |
| (0,6)   | 0 | 6 | 4  | no | 4 |
| (5,7)   | 5 | 7 | 4  | yes | 7 |
| (3,8)   | 3 | 8 | 7  | no | 7 |
| (5,9)   | 5 | 9 | 7  | no | 7 |
| (6,10)  | 6 | 10 | 7 | no | 7 |
| (8,11)  | 8 | 11 | 7 | yes | 11 |
| (8,12)  | 8 | 12 | 11 | no | 11 |
| (2,13)  | 2 | 13 | 11 | no | 11 |
| (12,14) | 12 | 14 | 11 | yes | 14 |
:::

Count = 4.

\`\`\`python-run
def max_compatible_meetings(meetings):
    meetings = sorted(meetings, key=lambda x: x[1])
    count = 0
    last_end = float("-inf")
    for start, end in meetings:
        if start >= last_end:
            count += 1
            last_end = end
    return count

meetings = [(1, 4), (3, 5), (0, 6), (5, 7), (3, 8), (5, 9), (6, 10), (8, 11)]
print(max_compatible_meetings(meetings))  # try editing the (start, end) pairs
\`\`\`

::: callout warning
Sorting by **start** time and taking the earliest-starting meeting first is a common wrong idea. A meeting that starts at 0 and ends at 100 wipes out the rest. Sort by **end**.
:::

## Worked Example 2

**Can Reach End (Local).** Given an array \`steps\` where \`steps[i]\` is the maximum number of indexes you can jump from index \`i\`, return \`True\` if you can reach the last index starting from index 0.

The only state that matters is the **farthest index reachable so far**. If at some index \`i\` the farthest reach is less than \`i\`, you cannot get to \`i\`, so the answer is \`False\`.

Input: \`[2, 3, 1, 1, 4]\`. Expected: \`True\`.

::: steps
| i | steps[i] | farthest before | farthest after | i > farthest_before? |
|---|----------|-----------------|----------------|------------------------|
| 0 | 2 | 0 | max(0, 0+2)=2 | no |
| 1 | 3 | 2 | max(2, 1+3)=4 | no |
| 2 | 1 | 4 | max(4, 2+1)=4 | no |
| 3 | 1 | 4 | max(4, 3+1)=4 | no |
| 4 | 4 | 4 | (no need)     | no, reached end |
:::

Return \`True\` because at no point did \`i\` exceed \`farthest_before\`.

::: fill
The invariant: at any step \`i\` you are processing, \`farthest\` is the maximum index you could have jumped to using only the **{{prefix|earlier|first i}}** indexes.
> If the loop reaches index \`i\` with \`farthest < i\`, the prefix could not reach \`i\`, so no path exists.
:::

\`\`\`python-run
def can_reach_end_local(steps):
    farthest = 0
    for i, jump in enumerate(steps):
        if i > farthest:
            return False
        farthest = max(farthest, i + jump)
    return True

print(can_reach_end_local([2, 3, 1, 1, 4]))  # try [3, 2, 1, 0, 4]
\`\`\`

## Implementation Checklist

- Write the choice rule in one English sentence.
- Write the proof (exchange argument) in one sentence.
- Sort by the key the proof needs. If sorting by another key gives a different answer, the rule was wrong.
- For interval problems, decide whether endpoints touching (e.g., one meeting ends at 5 and the next starts at 5) is allowed.
- Test an input where the rule "obviously" applies, then one where the rule is forced to skip.

## Common Mistakes

- Sorting by **start** when the proof needs **end** (or vice versa).
- Failing to handle ties consistently. Two meetings ending at the same time: which goes first? Usually it does not matter, but verify with a test.
- Using "shortest" instead of "ends earliest". They are not the same — a short meeting may start late and end after a longer one.
- For farthest-reach, updating reach **after** the check instead of before. Make sure your invariant matches the code order.
- Calling a heuristic "greedy" without a proof. If you cannot articulate the exchange argument, the algorithm probably has a counterexample.

::: quiz
**Q:** "Minimum number of meeting rooms required for a set of meetings." Which structure is cleanest?
- A 2D grid of times
- A queue of meetings sorted by start
* A min-heap of end times: for each meeting (sorted by start), if the smallest end-time on the heap is at-or-before the new start, pop it; then push the new end
- A hash map
> The heap top is the earliest-ending meeting that is still ongoing. Re-using its room is exactly the greedy choice.
:::

## Complexity Notes

Greedy interval and matching problems are typically **O(n log n)** because of the initial sort, plus an O(n) pass. Some scanning problems (farthest-reach, single-pass coverage) are **O(n)** with no sort.

Space is usually **O(1)** beyond the input.

## Practice Path

Start with **Max Compatible Meetings** (the canonical interval-scheduling problem). Move to **Can Reach End** for the farthest-reach scan, then **Assign Snacks** to practice greedy matching with two sorted arrays, and **Partition Labels** for combining interval reasoning with hashing. For each one, write your exchange argument in a comment before coding.
`;
}

function binarySearchBody(): string {
  return `# Binary Search

Binary search is the right tool whenever you can **decide** an answer cheaply but **construct** it expensively. It cuts the search space in half on every comparison, so it finds the answer in **O(log n)** decisions even when n is huge.

There are two flavours: searching for a value in a sorted array, and searching for the **smallest (or largest) value that satisfies a monotonic predicate** — the second flavour, called *binary search on the answer*, is the one that most often comes up in real problems.

## Learning Goals

- Implement the **canonical half-open binary search** using \`while left < right\`.
- Find a **lower bound** (the first index whose value is at least the target).
- Use binary search on an **answer space** (e.g., find the smallest capacity that ships all packages in D days).
- Avoid the classic off-by-one bugs: infinite loops, missed boundary, wrong return when no match exists.

## Pattern Recognition Signals

- The input is **sorted**, or sorted then rotated.
- The prompt asks for the **first**, **last**, **minimum feasible**, or **maximum feasible** value of something.
- A candidate answer is **easy to check** but the answer space is too big to enumerate.
- The predicate "is X feasible?" flips from false to true (or true to false) at exactly one boundary as X grows.

::: callout key
The key property is **monotonicity**: a predicate \`P(x)\` such that if \`P(x)\` is true and \`y >= x\`, then \`P(y)\` is also true. Binary search finds the smallest \`x\` where \`P(x)\` becomes true.
:::

## Mental Model

For value search in a sorted array, the invariant is: the answer (if it exists) is in \`[left, right)\` (half-open interval). Each iteration, you compute \`mid = (left + right) // 2\` and discard one half by moving either \`left\` or \`right\` so the invariant holds.

For answer-space search, the loop is the same — only now \`left\` and \`right\` are candidate **answers**, and the discard rule is "if this candidate is feasible, the answer is at most this; otherwise the answer is more than this."

::: callout tip
Half-open intervals (\`left < right\`, \`right = n\`) avoid the most common off-by-one bugs. After the loop, \`left == right\` and that is your answer (or your insertion point).
:::

## Worked Example 1

**Lower Bound (Local).** Given a sorted array and a target, return the smallest index \`i\` such that \`nums[i] >= target\`. If no such index exists, return \`len(nums)\`.

Input: \`[1, 3, 5, 7, 9]\`, target \`6\`. Expected: \`3\` (because \`nums[3] = 7\` is the first value at least 6).

::: steps
| iteration | left | right | mid | nums[mid] | comparison | action |
|-----------|------|-------|-----|-----------|------------|--------|
| 1 | 0 | 5 | 2 | 5 | 5 < 6 | left = mid + 1 = 3 |
| 2 | 3 | 5 | 4 | 9 | 9 >= 6 | right = mid = 4 |
| 3 | 3 | 4 | 3 | 7 | 7 >= 6 | right = mid = 3 |
| stop | 3 | 3 | - | - | - | return left = 3 |
:::

\`\`\`python-run
def lower_bound_local(nums, target):
    left, right = 0, len(nums)
    while left < right:
        mid = (left + right) // 2
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid
    return left

print(lower_bound_local([1, 3, 5, 7, 9], 6))  # try a target larger than every value
\`\`\`

::: callout warning
\`while left <= right\` is a different loop. It works with a different invariant (closed interval) and a different post-loop interpretation. Pick one style — half-open with \`left < right\` is the most robust — and stick to it.
:::

## Worked Example 2

**Ship Capacity (Local).** Packages weighing \`weights[i]\` must ship in **at most D days**. Each day you load packages in order until the day's capacity is reached. Find the **smallest capacity** that completes within D days.

This is binary search on the answer. The candidate answer space is capacities from \`max(weights)\` (necessary; one package must fit) to \`sum(weights)\` (always sufficient; one giant day). The predicate "capacity C can finish within D days" is monotonic: if a small C works, every larger C also works.

\`\`\`python-run
def ship_capacity_local(weights, days):
    def can_ship(capacity):
        used = 1
        load = 0
        for w in weights:
            if load + w > capacity:
                used += 1
                load = 0
            load += w
        return used <= days

    left, right = max(weights), sum(weights)
    while left < right:
        mid = (left + right) // 2
        if can_ship(mid):
            right = mid       # mid is feasible; answer is at most mid
        else:
            left = mid + 1    # mid is too small; answer is more than mid
    return left

print(ship_capacity_local([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5))  # try days = 1 or 10
\`\`\`

Trace on \`weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\`, \`days = 5\`. Expected smallest capacity: \`15\`.

::: steps
| iter | left | right | mid | can_ship(mid)? | action |
|------|------|-------|-----|----------------|--------|
| 1 | 10 | 55 | 32 | yes | right = 32 |
| 2 | 10 | 32 | 21 | yes | right = 21 |
| 3 | 10 | 21 | 15 | yes | right = 15 |
| 4 | 10 | 15 | 12 | no  | left = 13 |
| 5 | 13 | 15 | 14 | no  | left = 15 |
| stop | 15 | 15 | -  | -    | return 15 |
:::

::: fill
For an answer-space binary search, the lower bound of the search interval must be the smallest **{{feasible|possible|valid}}** candidate (or smaller), and the upper bound must be one that is always feasible. The loop then shrinks the interval until they meet.
> The bounds must bracket the true answer; otherwise the loop returns the wrong value.
:::

## Implementation Checklist

- Decide which flavour: value search (find an index) or answer-space search (find the minimum feasible value).
- Write the predicate or comparison explicitly.
- Confirm it is **monotonic**. If it is not, binary search does not apply.
- Pick the half-open style: \`left < right\`, return \`left\`.
- Initialise \`left\` and \`right\` so the answer is guaranteed to lie in \`[left, right)\`.
- Test the boundaries: target smaller than every value, target larger than every value, target equal to a value.

## Common Mistakes

- Confusing "find value" with "find insertion point". They differ by what you return when no exact match exists.
- Using \`mid = (left + right) // 2\` in a language where integer overflow is a risk. In Python, this is not an issue.
- Updating \`left = mid\` instead of \`left = mid + 1\` (or vice versa for \`right\`), which causes infinite loops.
- For answer-space search, choosing bounds that exclude the true answer — the loop returns the wrong value with no warning.
- Forgetting that the **predicate** must be checked, not the value. \`if nums[mid] == target\` is fine for value search but does not generalise.

::: quiz
**Q:** You are searching for the smallest capacity that ships everything in D days. The feasibility predicate \`can_ship(c)\` is monotonic (once true at some \`c\`, true for all larger). When \`can_ship(mid)\` is true, what should you do?
- left = mid + 1
* right = mid
- left = mid
- right = mid - 1
> When \`mid\` is feasible, the answer is **at most** \`mid\`. We keep \`mid\` as a candidate by setting \`right = mid\` (half-open interval).
:::

## Complexity Notes

Value search: **O(log n)** comparisons over an array of size n.

Answer-space search: **O(log R)** predicate evaluations, where R is the size of the answer range (\`right - left\` initially). Each predicate evaluation may itself be O(n), giving overall **O(n log R)**.

Space is **O(1)** unless the predicate uses extra memory.

## Practice Path

Begin with **Lower Bound (Local)** to internalise the half-open template. Move to **Search Rotated (Local)** for binary search over a rotated array, then **Integer Square Root** for a simple answer-space search, and finally **Ship Capacity (Local)** to combine answer-space search with a real-world predicate.
`;
}

function backtrackingBody(): string {
  return `# Backtracking

Backtracking is **recursion that explores choices and undoes them**. You build a partial solution by making one decision at a time, recursively try to extend it, and if the path fails (or after recording a success), you undo the last decision and try the next option.

It is the right tool when you need **all** solutions, or when no closed-form formula exists and you must enumerate possibilities with pruning.

## Learning Goals

- Structure a recursive function around a **choice point**: enumerate options, recurse, undo.
- **Prune** infeasible branches early so the search does not waste time on hopeless paths.
- Avoid duplicate answers when the input contains duplicate elements.
- Use **path mutation + undo** rather than copying the path into the recursive call.

## Pattern Recognition Signals

- "Generate **all** combinations / permutations / subsets / valid sequences."
- "Place N queens / solve Sudoku / find any path through this maze."
- Small input size (often n ≤ 10 or 12 because the answer space is exponential).
- The problem says "return them in any order" — the structure of the search matters more than the order of output.

::: callout key
A backtracking solution is a decision tree. Each node is a state (the current partial solution); each branch is a choice. The leaves are the answers (or dead ends).
:::

## Mental Model

A backtracking function has four parts:

1. **Base case.** When the partial solution is complete, record it and return.
2. **Pruning.** If the partial solution cannot be extended to a valid one, return early.
3. **Enumerate options.** Loop over the choices available from this state.
4. **Make, recurse, undo.** For each choice, apply it to the state, recurse, then undo it before trying the next.

::: callout tip
The "undo" step is the difference between backtracking and naive recursion. If you mutate a shared list and forget to undo, the next sibling branch sees corrupted state and produces wrong answers.
:::

## Worked Example 1

**Generate Parentheses (Local).** Given \`n\`, return all valid parenthesis strings of length \`2n\`.

Input: \`n = 3\`. Expected: \`["((()))", "(()())", "(())()", "()(())", "()()()"]\`.

Choice point: at each position, either add \`(\` or \`)\`. The pruning rules:

- You may add \`(\` while the count of \`(\` is less than \`n\`.
- You may add \`)\` while the count of \`)\` is less than the count of \`(\` (otherwise the string would become invalid).

Decision tree (top of the tree for \`n = 3\`):

\`\`\`text
            ""
           /  \\
          "("   X    (cannot start with ")")
         /   \\
       "(("   "()"
       / \\    / \\
     ...   ...
\`\`\`

\`\`\`python-run
def generate_parentheses_local(n):
    out = []
    path = []

    def recurse(opens, closes):
        if len(path) == 2 * n:
            out.append("".join(path))
            return
        if opens < n:
            path.append("(")
            recurse(opens + 1, closes)
            path.pop()
        if closes < opens:
            path.append(")")
            recurse(opens, closes + 1)
            path.pop()

    recurse(0, 0)
    return out

print(generate_parentheses_local(3))  # try n = 1, 2, or 4
\`\`\`

::: callout warning
Append the result with \`out.append("".join(path))\` (a snapshot), not \`out.append(path)\` (a live reference). If you append the live list, every entry in \`out\` ends up pointing at the same mutated list and you see empty strings at the end.
:::

## Worked Example 2

**Combination Sum Exact (Local).** Given an array of distinct positive integers and a target, return all unique combinations (sorted) that sum exactly to the target. Each candidate may be used at most once.

Input: \`candidates = [10, 1, 2, 7, 6, 1, 5]\`, target = 8. Expected combinations (sorted internally and lexicographically): \`[[1,1,6], [1,2,5], [1,7], [2,6]]\`.

The standard trick:

1. **Sort** the candidates so duplicates are adjacent.
2. At each depth, loop over candidates starting from the current index.
3. **Skip duplicates at the same depth**: \`if i > start and candidates[i] == candidates[i-1]: continue\`.
4. Prune: if \`candidates[i] > remaining\`, break (because the array is sorted).

\`\`\`python-run
def combination_sum_exact_local(candidates, target):
    candidates = sorted(candidates)
    out = []
    path = []

    def recurse(start, remaining):
        if remaining == 0:
            out.append(list(path))
            return
        for i in range(start, len(candidates)):
            v = candidates[i]
            if v > remaining:
                break
            if i > start and candidates[i] == candidates[i - 1]:
                continue
            path.append(v)
            recurse(i + 1, remaining - v)
            path.pop()

    recurse(0, target)
    return out

print(combination_sum_exact_local([10, 1, 2, 7, 6, 1, 5], 8))  # try a different target
\`\`\`

::: fill
We skip a candidate at index \`i\` when \`i > start\` and \`candidates[i] == candidates[i-1]\`. The condition \`i > start\` is essential because it allows the **{{first|same-depth-first}}** occurrence at this depth (which is needed) while skipping later duplicates.
> Without the \`i > start\` check, we would also block the legitimate first use at this recursion level and miss combinations.
:::

## Implementation Checklist

- Write the base case first. What does a "complete" partial solution look like?
- Write the prune conditions. The earlier you can detect a dead end, the faster the search.
- Decide whether to mutate a shared \`path\` (and \`pop\` to undo) or pass a new list each recursion. Mutating is faster and standard.
- For duplicates, sort first and skip equal siblings at the same depth.
- Snapshot the path when recording (\`list(path)\` or \`"".join(path)\`) so the answer is not a live alias.

## Common Mistakes

- Appending the live \`path\` list to the output and then mutating it. Every result becomes the empty list at the end.
- Skipping duplicates **across depths** instead of only at the same depth. This silently drops valid answers.
- Forgetting the **undo** step after the recursive call, so the next sibling sees corrupted state.
- Treating "candidates may be used multiple times" the same as "each used at most once". The first recurses with \`i\`, the second with \`i + 1\`.
- For grid search, forgetting to unmark a visited cell after the recursion returns, blocking future paths that legitimately reuse it.

::: quiz
**Q:** You are generating all permutations of \`[1, 1, 2]\`. To avoid duplicate permutations like \`[1, 1, 2]\` appearing twice, what is the right strategy?
- Use a set of strings
* Sort the input, then at each recursion depth skip a value if it equals the previous candidate at the same depth and the previous candidate was not used
- Always recurse on every value
- Skip values that appeared earlier in the original input
> The "previous at same depth + previous not used" check ensures duplicates are visited in a canonical order, eliminating the duplicate permutations.
:::

## Complexity Notes

Backtracking is **exponential** in the number of choices. For subsets of an n-element set, there are \`2^n\` answers; for permutations, \`n!\`. Pruning shrinks the constants but does not change the asymptotic class.

Space is **O(depth)** for the recursion stack plus the output. The path itself uses O(depth) for the in-progress partial solution.

::: callout warning
"My recursion was slow because n was 20" is not a bug — it is the nature of the problem. \`2^20 ≈ 10^6\` is fine; \`2^30 ≈ 10^9\` is not. Read the input bounds and choose a different technique if backtracking will not fit.
:::

## Practice Path

Start with **Subsets (Lexicographic)** to lock in the choose/don't-choose pattern. Move to **Generate Parentheses (Local)** for state-constrained pruning, then **Combination Sum Exact (Local)** for duplicate skipping, and finally **Word Path Exists (Local)** for grid DFS with mark/unmark. The undo step is the same in all of them.
`;
}

function dpBody(): string {
  return `# Dynamic Programming

Dynamic programming (DP) is a way to solve problems by **breaking them into smaller versions of themselves and reusing the answers**. Every time you would re-solve the same smaller question, DP looks it up instead. That single change converts many exponential brute-force solutions into linear or quadratic ones.

DP is famously confusing not because the technique is hard, but because the **state design** is hard. Once you have written a single, precise sentence saying what \`dp[i]\` means, the code follows almost automatically.

## Learning Goals

- Define a **state**: a single sentence of the form "\`dp[i]\` = the answer for the smaller subproblem characterised by \`i\`."
- Write a **recurrence**: an equation saying how \`dp[i]\` is built from previously-computed smaller states.
- Decide between **top-down memoisation** (recursion + cache) and **bottom-up tabulation** (fill the table in order).
- Reduce **space** from O(n) to O(1) when the recurrence only looks back a constant number of steps.

## Pattern Recognition Signals

- "Find the **minimum / maximum** cost / count / length of something."
- "Count the **number of ways** to do something."
- The brute-force recursion makes the **same call with the same arguments** many times.
- A choice at position \`i\` depends only on the optimal answers to smaller positions, not on the path that led there.

::: callout key
DP starts with a sentence, not with code. If you cannot say "\`dp[i]\` means …" in one breath, you are not ready to write the loop.
:::

## Mental Model

Three steps for every DP problem:

1. **State.** "\`dp[i]\` is the [thing the problem asks for] for the prefix / amount / position \`i\`." If the problem needs two indexes, the state is 2D: \`dp[i][j]\`.
2. **Recurrence.** Look at the last decision that produces \`dp[i]\`. There are usually only a few options. Express \`dp[i]\` as the best (or sum) over those options, each combined with a smaller already-known \`dp\` entry.
3. **Base case.** What is \`dp[0]\` (or \`dp[start]\`)? It is usually trivial — the answer for the empty prefix, the empty amount, the empty grid — but it must be correct because everything else depends on it.

::: callout tip
Top-down memoisation (write the recursion, decorate with \`@functools.lru_cache\`) is often the easiest first cut. If it works and is fast enough, you do not need to rewrite it bottom-up.
:::

## Worked Example 1

**Coin Change Min (Local).** Given coins of various denominations and a target amount, return the **fewest** coins needed to make exactly that amount. If it is impossible, return \`-1\`.

Input: \`coins = [1, 3, 4]\`, \`amount = 6\`. Expected: \`2\` (using 3 + 3).

State: **\`dp[x]\` = the minimum number of coins to make amount \`x\`**, or a sentinel like \`inf\` if impossible.

Recurrence: for each coin \`c\` and each amount \`x >= c\`, \`dp[x] = min(dp[x], 1 + dp[x - c])\`. We are saying: "if we use coin \`c\` as one of the coins, the rest of the amount is \`x - c\`, whose best answer we already know."

Base case: \`dp[0] = 0\`. Zero coins make amount zero.

Trace for \`amount = 6\`, sorted coins \`[1, 3, 4]\`:

::: steps
| x | dp[x] computation | dp[x] |
|---|---------------------|-------|
| 0 | base | 0 |
| 1 | 1 + dp[0] = 1 | 1 |
| 2 | 1 + dp[1] = 2 | 2 |
| 3 | min(1 + dp[2], 1 + dp[0]) = min(3, 1) = 1 | 1 |
| 4 | min(1 + dp[3], 1 + dp[1], 1 + dp[0]) = min(2, 2, 1) = 1 | 1 |
| 5 | min(1 + dp[4], 1 + dp[2], 1 + dp[1]) = min(2, 3, 2) = 2 | 2 |
| 6 | min(1 + dp[5], 1 + dp[3], 1 + dp[2]) = min(3, 2, 3) = 2 | **2** |
:::

\`\`\`python-run
def coin_change_min_local(coins, amount):
    INF = float("inf")
    dp = [INF] * (amount + 1)
    dp[0] = 0
    for x in range(1, amount + 1):
        for c in coins:
            if c <= x and dp[x - c] + 1 < dp[x]:
                dp[x] = dp[x - c] + 1
    return dp[amount] if dp[amount] != INF else -1

print(coin_change_min_local([1, 3, 4], 6))  # try coins [2, 5] and amount 3
\`\`\`

::: callout warning
Do not use \`0\` as both a valid answer ("zero coins for amount zero") and a sentinel for "not yet computed / impossible." That ambiguity quietly produces wrong answers. Use \`inf\` for impossible.
:::

## Worked Example 2

**Grid Paths With Blocks.** Given a grid where \`0\` is open and \`1\` is blocked, count the number of paths from the top-left to the bottom-right, moving only right or down.

State: \`dp[r][c]\` = number of paths from the top-left to cell \`(r, c)\`.

Recurrence: if cell \`(r, c)\` is blocked, \`dp[r][c] = 0\`. Otherwise, \`dp[r][c] = dp[r-1][c] + dp[r][c-1]\`, taking \`0\` for any out-of-range index.

Base case: \`dp[0][0] = 1\` if the start is open, else \`0\`.

Input grid (1 = blocked):

\`\`\`text
0 0 0
0 1 0
0 0 0
\`\`\`

Trace, filling row by row:

::: steps
| r,c | blocked? | from above | from left | dp[r][c] |
|-----|----------|------------|-----------|-----------|
| 0,0 | no | -    | -    | 1 |
| 0,1 | no | -    | 1    | 1 |
| 0,2 | no | -    | 1    | 1 |
| 1,0 | no | 1    | -    | 1 |
| 1,1 | yes| -    | -    | 0 |
| 1,2 | no | 1    | 0    | 1 |
| 2,0 | no | 1    | -    | 1 |
| 2,1 | no | 0    | 1    | 1 |
| 2,2 | no | 1    | 1    | **2** |
:::

::: fill
For \`dp[r][c]\` when both \`(r, c-1)\` and \`(r-1, c)\` are valid open cells, the recurrence is \`dp[r][c] = dp[r-1][c] + \`**{{dp[r][c-1]}}**.
> The number of paths to a cell is the sum of paths to the cell above and to the cell to its left.
:::

\`\`\`python-run
def grid_paths_with_blocks(grid):
    rows = len(grid)
    if not rows:
        return 0
    cols = len(grid[0])
    dp = [[0] * cols for _ in range(rows)]
    dp[0][0] = 1 if grid[0][0] == 0 else 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                dp[r][c] = 0
                continue
            if r == 0 and c == 0:
                continue
            from_above = dp[r-1][c] if r > 0 else 0
            from_left = dp[r][c-1] if c > 0 else 0
            dp[r][c] = from_above + from_left
    return dp[rows-1][cols-1]

grid = [[0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]]
print(grid_paths_with_blocks(grid))  # try moving or removing the 1
\`\`\`

::: callout tip
Because each row only depends on the previous row, you can shrink memory from \`O(rows * cols)\` to \`O(cols)\` by reusing a single row array. The trick is updating it left-to-right: \`dp[c] = dp[c] (old, from the previous row) + dp[c-1] (already updated)\`.
:::

## Implementation Checklist

- Write the state sentence: "\`dp[…]\` is the [answer thing] for the subproblem characterised by […]." If you cannot, do not code yet.
- Write the recurrence as math. Make sure every term refers to a strictly **smaller** state.
- Identify the base case(s) and make sure your loop or recursion handles them.
- Decide top-down (memoisation) or bottom-up (tabulation). Top-down is easier to write; bottom-up usually faster and easier to space-optimise.
- Trace a small input by hand. If your table values are off by even one, you misread the recurrence.

## Common Mistakes

- Defining state **after** writing the loop. The loop variables drift from the original intent and the recurrence breaks.
- Using the same value as both a valid answer and a sentinel for "impossible."
- For 1D DP, updating in the wrong direction so that you read already-updated values (rolling-array bugs).
- Forgetting that "choosing nothing" is a valid choice in many max-sum problems. The base case must encode it.
- Building a 2D table when 1D would suffice — wastes memory but does not give a wrong answer.

::: quiz
**Q:** You define \`dp[i]\` as "the maximum sum of a subset of \`nums[0..i-1]\` such that no two chosen elements are adjacent." What is the recurrence?
- dp[i] = max(dp[i-1], nums[i-1])
* dp[i] = max(dp[i-1], dp[i-2] + nums[i-1])
- dp[i] = dp[i-1] + nums[i-1]
- dp[i] = dp[i-1] + dp[i-2]
> Either we skip \`nums[i-1]\` (\`dp[i-1]\`) or we take it, in which case we cannot have taken \`nums[i-2]\` (\`dp[i-2] + nums[i-1]\`).
:::

## Complexity Notes

DP time is **number of states × cost of one transition**.

- 1D DP with O(1) transitions: O(n).
- 1D DP with O(k) transitions (e.g., loop over coin denominations): O(n × k).
- 2D DP with O(1) transitions: O(rows × cols).

Space is the number of states, but for recurrences that only look back a constant number of steps, you can shrink to **O(1) or O(min(rows, cols))** with rolling variables or a single row.

## Practice Path

Start with **Climb With Blocks** (1D DP, the cleanest possible recurrence). Move to **Max Non-Adjacent (Local)** for the take-or-skip pattern, then **Coin Change Min (Local)** for unbounded-choice DP, and finally **Grid Paths With Blocks** for 2D. Write your state sentence in a comment above every DP function.
`;
}

function interviewToolsBody(): string {
  return `# Interview Tools + Mixed Review

The previous twelve modules each taught a single pattern in isolation. Real interview problems do not announce which pattern they need. This module is about the **diagnosis step**: reading a prompt and choosing the right tool quickly, then defending the choice with a clear complexity narrative.

## Learning Goals

- Recognise the **structural feature** in a prompt that points to a specific pattern (sortedness, contiguity, graph edges, repeated subproblems, fast lookup).
- Estimate complexity from input dimensions and operations, and **explain** it out loud as you code.
- Choose between competing valid approaches based on tradeoffs (time vs. memory, simplicity vs. optimality).
- Communicate while solving: what you ruled out, what you are doing now, what the complexity will be.

## Pattern Recognition Signals

This is the meta-skill: every previous module has its own signals. The "signal you act on" is the question you must answer first.

A short cheat sheet:

| If the prompt says... | Reach for... |
|------------------------|--------------|
| "sorted array" + "first / last index" | Binary search |
| "contiguous subarray / substring" + non-negative values | Sliding window |
| "all combinations / permutations / subsets" | Backtracking |
| "shortest path by edge count" | BFS |
| "minimum / maximum / count of ways" + overlapping subproblems | DP |
| "top k" or "next smallest" | Heap |
| "nearest previous / next greater" | Monotonic stack |
| "have I seen this before" or "groups by" | Hashing |
| "matched delimiters" or "nested" | Stack |

::: callout key
The **strongest signal** is structural (the shape of the input, the question being asked), not surface vocabulary. A prompt that says "find" could be binary search, hash lookup, BFS, or backtracking — you must look deeper.
:::

## Mental Model

When a new prompt arrives:

1. **Read twice.** Underline the words that change behaviour: *contiguous*, *distinct*, *minimum*, *first*, *return all*.
2. **State the brute force.** Even if it would time out. Brute force is the baseline that proves you understood the problem and gives you something to compare against.
3. **Identify the repeated work.** Where does the brute force redo a calculation? That redo is the lever for hashing, prefix sums, or DP.
4. **Name the pattern.** "I will use a sliding window because the prompt asks for the longest contiguous span with at most k zeros." If you cannot name the pattern, fall back to brute force and look for the lever.
5. **Estimate complexity.** State it: "O(n) time, O(n) space." Then code.

::: callout tip
Interviewers care about the **narration** as much as the code. "I considered a hash map but the input is sorted, so two pointers is enough" is a much stronger signal of skill than the same code with no commentary.
:::

## Worked Example 1

**Choose Pattern Label.** Given a short prompt as a list of feature words (e.g., \`["graph", "shortest", "unweighted"]\`), return the name of the most appropriate pattern family.

Approach: normalise the feature words to lowercase. Check high-priority structures first.

::: steps
| feature words | normalised | first matching family |
|----------------|-------------|------------------------|
| ["graph", "shortest", "unweighted"] | same | "bfs" |
| ["sorted", "rotation", "search"] | same | "binary search" |
| ["substring", "contiguous", "distinct"] | same | "sliding window" |
| ["overlap", "subproblems", "minimum"] | same | "dp" |
| ["brackets", "matched"] | same | "stack" |
:::

\`\`\`python-run
def choose_pattern_label(features):
    words = set(f.lower() for f in features)
    rules = [
        ({"graph", "shortest"}, "bfs"),
        ({"sorted", "search"}, "binary search"),
        ({"substring", "contiguous"}, "sliding window"),
        ({"subproblems"}, "dp"),
        ({"brackets"}, "stack"),
        ({"permutations"}, "backtracking"),
        ({"seen", "group"}, "hashing"),
        ({"top", "smallest"}, "heap"),
    ]
    for required, label in rules:
        if required & words:
            return label
    return "scan"

print(choose_pattern_label(["graph", "shortest", "unweighted"]))  # try other words
\`\`\`

::: callout warning
This is a teaching exercise, not a production classifier. In a real interview, you classify by **structure** (the shape of the input and the question), not by keyword bingo. But practising the keyword check trains the muscle.
:::

## Worked Example 2

**Growth Label.** You have measurements of a function's run-time at sizes \`n = 100, 200, 400, 800\`. Decide whether the function is constant, linear, quadratic, or unknown.

Approach: compute the ratio of consecutive measurements. If the ratio is consistently near 1, the function is constant. Near 2 means linear (input doubled, time doubled). Near 4 means quadratic. Anything else (or inconsistent) is unknown.

Input: \`[10, 21, 39, 80]\` ms. Ratios: \`21/10 = 2.1\`, \`39/21 ≈ 1.86\`, \`80/39 ≈ 2.05\`. Average ≈ 2.0 → linear.

::: fill
If doubling the input size also doubles the run-time, the function is approximately **{{linear|O(n)}}**. If doubling the input quadruples the run-time, it is approximately **{{quadratic|O(n^2)}}**.
> Each doubling step gives one data point of empirical complexity.
:::

\`\`\`python-run
def growth_label(times):
    if len(times) < 2:
        return "unknown"
    ratios = [times[i+1] / times[i] for i in range(len(times) - 1)]
    avg = sum(ratios) / len(ratios)
    if avg < 1.2:
        return "constant"
    if avg < 2.5:
        return "linear"
    if avg < 5:
        return "quadratic"
    return "unknown"

print(growth_label([10, 21, 39, 80]))  # try [10, 40, 160, 640]
\`\`\`

::: callout tip
In an interview, an order-of-magnitude estimate is enough. You do not need precise ratios. "It doubles, roughly linear" is a complete answer.
:::

## Implementation Checklist

- Read the prompt twice. Restate it out loud.
- State the brute force. Estimate its complexity.
- Identify the source of repeated work or the structural property (sortedness, contiguity, etc.) that enables an improvement.
- Name the pattern. Justify it in one sentence.
- State the new complexity. Code.
- Test edge cases: empty input, singleton, all-equal values, the boundary at the first or last index.

## Common Mistakes

- Picking the most recently studied pattern instead of the one the prompt actually wants.
- Skipping the brute-force baseline. Without it, you cannot explain why the optimisation matters.
- Saying "O(n)" without naming what \`n\` is. In a 2D grid problem, "O(n)" is ambiguous — clarify it is rows × cols, or use V + E for graphs.
- Treating a passing sample as proof of correctness. The hidden tests cover edge cases on purpose.
- Letting silence happen during the interview. The interviewer cannot tell what you are thinking.

::: quiz
**Q:** A prompt says: "Given a stream of integers, after each integer report the median of all integers seen so far." Which pattern is the cleanest match?
- Sliding window with two pointers
- DP over the prefix
* Two heaps (one max-heap, one min-heap)
- Sort the input after every insert
> The two-heap pattern keeps the median accessible in O(log n) per insert. Sorting after every insert is O(n log n) per insert — too slow for large streams.
:::

## Complexity Notes

Mixed-review problems test whether you can choose **the right complexity class** for the prompt and constraints:

- Small input (n ≤ 20): exponential approaches (backtracking) often work.
- Medium input (n ≤ 1000): O(n²) is fine, O(n) is preferred.
- Large input (n ≤ 10⁶): you almost certainly need O(n) or O(n log n).
- Streaming or "after each operation, report …": think about per-operation cost.

::: callout warning
Saying a solution is "O(n)" when it is really O(n log n) (because of a sort) is a quiet but common error. Account for **every** non-constant operation when you state complexity.
:::

## Practice Path

Mix the three problems in this module — **Choose Pattern Label**, **Growth Label**, **Mixed Review Score** — between sessions on previous modules. For every real interview-style problem you attempt, write down the pattern signal and complexity estimate **before** opening the editor. That habit, more than any individual technique, is what makes interviews predictable.
`;
}
