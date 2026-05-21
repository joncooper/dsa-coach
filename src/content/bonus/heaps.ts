import type { BonusSeed } from "./types";

/**
 * Heaps bonus problems. Concepts: heapq, top k, merge, streaming median,
 * priority simulation. Each problem makes the heap the obviously right tool —
 * a partial order maintained cheaply across pushes and pops. Distinct from the
 * guided set (Top K Scores, Merge Sorted Batches, K Closest Points Local,
 * Running Medians Local, Combine Until Target) and from each other.
 */
export const bonus: BonusSeed[] = [
  {
    id: "heaps-bonus-01",
    chapterId: "heaps",
    title: "Kth Largest Element",
    difficulty: "warmup",
    patterns: ["heaps", "top k", "bounded heap"],
    entrypoint: "kth_largest",
    signature: "nums, k",
    prompt:
      "Return the k-th largest value in the list. The k-th largest is the value that would sit at position k counting down from the maximum, so for k = 1 it is the maximum itself. Duplicates count as ordinary values.",
    constraints: [
      "You may assume 1 <= k <= len(nums).",
      "Do not sort the whole list; keep only what you need.",
      "Equal values are each counted, so [5, 5] has 5 as both the 1st and 2nd largest."
    ],
    hints: [
      "Keep a min-heap holding only the k largest values seen so far.",
      "When the heap already has k items, push the new value then pop the smallest — the root is always the weakest survivor.",
      "After the scan the heap's root is the k-th largest value."
    ],
    solution:
      "Maintain a min-heap capped at size k. Push every value; whenever the heap exceeds k entries, pop the smallest. The k largest values survive, and the heap's root is the smallest of those — exactly the k-th largest.",
    walkthrough:
      "A min-heap of size k always has the weakest of the current top k at its root, so a new value only matters if it beats that root. Capping the heap at k keeps each push-and-pop logarithmic in k rather than in n.",
    followUps: [
      "How does this compare to fully sorting the list when k is much smaller than n?",
      "How would you adapt it to a stream where n is not known in advance?"
    ],
    code: `def kth_largest(nums, k):
    heap = []
    for value in nums:
        heapq.heappush(heap, value)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]
`,
    visibleTests: [
      { name: "second largest", args: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
      { name: "fourth largest with dupes", args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 }
    ],
    hiddenTests: [
      { name: "k equals one is max", args: [[7, 1, 9, 3], 1], expected: 9 },
      { name: "k equals length is min", args: [[7, 1, 9, 3], 4], expected: 1 },
      { name: "single element", args: [[42], 1], expected: 42 },
      { name: "all equal", args: [[5, 5, 5, 5], 3], expected: 5 },
      { name: "negatives", args: [[-1, -5, -2, -8], 2], expected: -2 }
    ],
    time: "O(n log k)",
    space: "O(k)"
  },
  {
    id: "heaps-bonus-02",
    chapterId: "heaps",
    title: "Heapsort Ascending",
    difficulty: "warmup",
    patterns: ["heaps", "heapsort", "ordering"],
    entrypoint: "heapsort",
    signature: "nums",
    prompt:
      "Return a new list containing every value of the input sorted in non-decreasing order. Implement the ordering yourself with a heap: push every value in, then pop them all out.",
    constraints: [
      "The input list may be empty; return an empty list then.",
      "Duplicate values must all appear in the output.",
      "Do not call the built-in sort; drive the ordering with a heap."
    ],
    hints: [
      "Push all n values onto a min-heap.",
      "Each heappop removes the current smallest remaining value.",
      "Popping until the heap is empty yields the values in ascending order."
    ],
    solution:
      "Push every value onto a min-heap, then repeatedly pop the smallest until the heap is empty. Because each pop returns the minimum of what remains, the popped sequence is sorted ascending.",
    walkthrough:
      "A heap gives O(log n) access to the current minimum. Building the heap costs n pushes and draining it costs n pops, each logarithmic, so the whole sort is O(n log n) — the classic heapsort.",
    followUps: [
      "How would you produce descending order instead without reversing at the end?",
      "Why is heapq.heapify cheaper than pushing values one at a time?"
    ],
    code: `def heapsort(nums):
    heap = list(nums)
    heapq.heapify(heap)
    out = []
    while heap:
        out.append(heapq.heappop(heap))
    return out
`,
    visibleTests: [
      { name: "mixed order", args: [[3, 1, 4, 1, 5, 9, 2, 6]], expected: [1, 1, 2, 3, 4, 5, 6, 9] },
      { name: "already sorted", args: [[1, 2, 3]], expected: [1, 2, 3] }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: [] },
      { name: "single", args: [[7]], expected: [7] },
      { name: "reverse sorted", args: [[5, 4, 3, 2, 1]], expected: [1, 2, 3, 4, 5] },
      { name: "all equal", args: [[2, 2, 2]], expected: [2, 2, 2] },
      { name: "negatives and zero", args: [[0, -3, 2, -1]], expected: [-3, -1, 0, 2] }
    ],
    time: "O(n log n)",
    space: "O(n)"
  },
  {
    id: "heaps-bonus-03",
    chapterId: "heaps",
    title: "Last Stone Weight",
    difficulty: "easy",
    patterns: ["heaps", "max-heap", "simulation"],
    entrypoint: "last_stone_weight",
    signature: "stones",
    prompt:
      "Each turn, smash the two heaviest stones together. If they weigh x and y with x <= y, the heavier one is reduced to y - x and the lighter one is destroyed; if they are equal both are destroyed. Repeat until at most one stone remains, and return its weight (0 if none remain).",
    constraints: [
      "Stone weights are non-negative integers.",
      "An empty list has no stones; return 0.",
      "When two equal stones collide, both vanish and nothing is added back."
    ],
    hints: [
      "You always need the two largest weights, which a max-heap gives quickly.",
      "Python's heapq is a min-heap, so push negated weights to simulate a max-heap.",
      "Pop the two heaviest; if their difference is positive, push it back."
    ],
    solution:
      "Store negated weights in a min-heap so the smallest negative is the heaviest stone. Each turn pop the two heaviest; if they differ, push the negated difference back. When one or zero stones remain, return the leftover weight.",
    walkthrough:
      "The simulation only ever needs the current two heaviest stones, and a max-heap surfaces them in logarithmic time. Negating values turns heapq's min-heap into a max-heap, and the loop shrinks the heap by at least one stone per turn so it always terminates.",
    followUps: [
      "How would you also return the full sequence of collision results?",
      "What changes if a collision produced the sum of the weights instead of the difference?"
    ],
    code: `def last_stone_weight(stones):
    heap = [-weight for weight in stones]
    heapq.heapify(heap)
    while len(heap) > 1:
        heaviest = -heapq.heappop(heap)
        second = -heapq.heappop(heap)
        if heaviest != second:
            heapq.heappush(heap, -(heaviest - second))
    return -heap[0] if heap else 0
`,
    visibleTests: [
      { name: "classic example", args: [[2, 7, 4, 1, 8, 1]], expected: 1 },
      { name: "all destroyed", args: [[3, 3]], expected: 0 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "single stone", args: [[6]], expected: 6 },
      { name: "two unequal", args: [[10, 4]], expected: 6 },
      { name: "leaves one survivor", args: [[1, 1, 1]], expected: 1 },
      { name: "with zero weights", args: [[0, 0, 5]], expected: 5 }
    ],
    time: "O(n log n)",
    space: "O(n)"
  },
  {
    id: "heaps-bonus-04",
    chapterId: "heaps",
    title: "Minimum Cost To Connect Ropes",
    difficulty: "easy",
    patterns: ["heaps", "min-heap", "greedy"],
    entrypoint: "min_connect_cost",
    signature: "ropes",
    prompt:
      "You have ropes of given lengths and want to join them all into one rope. Connecting two ropes costs the sum of their two lengths and produces a single rope of that combined length. Always cheapest first, return the minimum total cost to connect every rope into one.",
    constraints: [
      "Rope lengths are non-negative integers.",
      "Zero or one rope needs no connecting; the cost is 0.",
      "Each connection's cost is added to the running total."
    ],
    hints: [
      "Every connection should join the two shortest ropes available — a min-heap gives them directly.",
      "Pop the two smallest lengths, add their sum to the total, then push the sum back as a new rope.",
      "Stop once a single rope remains."
    ],
    solution:
      "Heapify the lengths into a min-heap. Repeatedly pop the two shortest ropes, add their combined length to a running total, and push that combined length back. When one rope is left, the accumulated total is the minimum cost.",
    walkthrough:
      "Joining the two shortest ropes first keeps small lengths from being re-added many times, which is the optimal greedy choice. A min-heap supplies the two smallest in logarithmic time, and each round reduces the rope count by one.",
    followUps: [
      "Why does always merging the two shortest ropes give the optimal total?",
      "How is this problem related to building a Huffman code?"
    ],
    code: `def min_connect_cost(ropes):
    heap = list(ropes)
    heapq.heapify(heap)
    total = 0
    while len(heap) > 1:
        first = heapq.heappop(heap)
        second = heapq.heappop(heap)
        combined = first + second
        total += combined
        heapq.heappush(heap, combined)
    return total
`,
    visibleTests: [
      { name: "four ropes", args: [[4, 3, 2, 6]], expected: 29 },
      { name: "three ropes", args: [[1, 2, 3]], expected: 9 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "single rope", args: [[8]], expected: 0 },
      { name: "two ropes", args: [[5, 7]], expected: 12 },
      { name: "all equal", args: [[2, 2, 2, 2]], expected: 16 },
      { name: "with zero length", args: [[0, 0, 4]], expected: 4 }
    ],
    time: "O(n log n)",
    space: "O(n)"
  },
  {
    id: "heaps-bonus-05",
    chapterId: "heaps",
    title: "Top K Frequent Numbers",
    difficulty: "easy",
    patterns: ["heaps", "top k", "frequency count"],
    entrypoint: "top_k_frequent",
    signature: "nums, k",
    prompt:
      "Return the k values that appear most often in the list. Break ties by preferring the smaller value. Return the chosen values sorted in ascending order.",
    constraints: [
      "You may assume k is between 1 and the number of distinct values.",
      "If two values share a frequency, the smaller value ranks higher.",
      "The returned list must be sorted in ascending order."
    ],
    hints: [
      "Count occurrences first so each value has a frequency.",
      "Rank values by frequency descending, then by value ascending — a heap ordered on that key picks the top k.",
      "Sort the k chosen values before returning them."
    ],
    solution:
      "Tally counts with a Counter. Treat each value's rank as (frequency, negated value) and ask a heap for the k items with the largest such key, so higher frequency wins and, on ties, the smaller value wins. Sort the selected values for a deterministic result.",
    walkthrough:
      "Counting is linear, and selecting the k strongest items by a composite key is what nlargest is built for. Negating the value inside the key flips the tie-break so a smaller value outranks a larger one at equal frequency.",
    followUps: [
      "How would you return the frequencies alongside the values?",
      "What is the benefit of a size-k heap over sorting all distinct values?"
    ],
    code: `def top_k_frequent(nums, k):
    counts = Counter(nums)
    ranked = heapq.nlargest(k, counts, key=lambda value: (counts[value], -value))
    return sorted(ranked)
`,
    visibleTests: [
      { name: "two most frequent", args: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
      { name: "single value", args: [[7], 1], expected: [7] }
    ],
    hiddenTests: [
      { name: "tie broken by smaller", args: [[4, 4, 5, 5, 6], 1], expected: [4] },
      { name: "all distinct take all", args: [[3, 1, 2], 3], expected: [1, 2, 3] },
      { name: "negatives", args: [[-1, -1, -2, -2, -2, 0], 2], expected: [-2, -1] },
      { name: "k equals one clear winner", args: [[9, 9, 9, 1, 2], 1], expected: [9] },
      { name: "all equal frequency pick smallest", args: [[5, 6, 7, 8], 2], expected: [5, 6] }
    ],
    time: "O(n log k)",
    space: "O(n)"
  },
  {
    id: "heaps-bonus-06",
    chapterId: "heaps",
    title: "Kth Smallest Pair Sum",
    difficulty: "medium",
    patterns: ["heaps", "merge", "frontier search"],
    entrypoint: "kth_smallest_pair_sum",
    signature: "a, b, k",
    prompt:
      "Given two lists of integers each sorted in ascending order, consider every pair (a[i], b[j]) and its sum a[i] + b[j]. Return the k-th smallest pair sum. Different index pairs are distinct even if their sums are equal.",
    constraints: [
      "Both input lists are non-empty and sorted in non-decreasing order.",
      "You may assume 1 <= k <= len(a) * len(b).",
      "Do not materialise all len(a) * len(b) sums; expand the cheapest frontier only."
    ],
    hints: [
      "The smallest sum is always a[0] + b[0]; start a min-heap there.",
      "After popping pair (i, j), its only cheaper-bounded successors are (i + 1, j) and (i, j + 1).",
      "Track which (i, j) index pairs have been pushed so each is added at most once."
    ],
    solution:
      "Seed a min-heap with the sum at index pair (0, 0). Pop k times; each pop of (i, j) pushes neighbours (i + 1, j) and (i, j + 1), guarded by a visited set so no pair is enqueued twice. The k-th popped sum is the answer.",
    walkthrough:
      "Because both lists are sorted, a pair's sum never exceeds its right or down neighbour, so the heap always holds the true current minimum of the unexplored frontier. The visited set keeps the heap from ballooning, and only k pops are needed.",
    followUps: [
      "How would you return the k-th smallest sum across three sorted lists?",
      "What is the heap's maximum size in terms of k?"
    ],
    code: `def kth_smallest_pair_sum(a, b, k):
    heap = [(a[0] + b[0], 0, 0)]
    seen = {(0, 0)}
    result = 0
    for _ in range(k):
        result, i, j = heapq.heappop(heap)
        for ni, nj in ((i + 1, j), (i, j + 1)):
            if ni < len(a) and nj < len(b) and (ni, nj) not in seen:
                seen.add((ni, nj))
                heapq.heappush(heap, (a[ni] + b[nj], ni, nj))
    return result
`,
    visibleTests: [
      { name: "third smallest sum", args: [[1, 7, 11], [2, 4, 6], 3], expected: 7 },
      { name: "first smallest sum", args: [[1, 2], [3, 4], 1], expected: 4 }
    ],
    hiddenTests: [
      { name: "last sum is max", args: [[1, 2], [3, 4], 4], expected: 6 },
      { name: "single by single", args: [[5], [9], 1], expected: 14 },
      { name: "single row", args: [[2], [1, 3, 5], 2], expected: 5 },
      { name: "ties in sums", args: [[1, 1, 1], [1, 1, 1], 5], expected: 2 },
      { name: "negatives", args: [[-3, -1], [-2, 4], 3], expected: 1 }
    ],
    time: "O(k log k)",
    space: "O(k)"
  },
  {
    id: "heaps-bonus-07",
    chapterId: "heaps",
    title: "K Weakest Rows",
    difficulty: "easy",
    patterns: ["heaps", "top k", "composite key"],
    entrypoint: "k_weakest_rows",
    signature: "grid, k",
    prompt:
      "You are given a grid of 0s and 1s where every row has all its 1s packed to the left. A row's strength is the count of 1s it contains. Return the indices of the k weakest rows ordered from weakest to strongest; when two rows have equal strength, the row with the smaller index is weaker.",
    constraints: [
      "Every row contains its 1s before any of its 0s.",
      "You may assume 1 <= k <= number of rows.",
      "Ties in strength are broken by the smaller row index."
    ],
    hints: [
      "Each row reduces to a pair: its strength (number of 1s) and its index.",
      "Comparing those pairs sorts naturally by strength, then by index.",
      "Ask a heap for the k smallest such pairs and read off the indices."
    ],
    solution:
      "Map each row to the pair (sum of the row, row index). The k smallest such pairs are the weakest rows: the sum orders by strength and the index breaks ties. Extract the index from each of the k smallest pairs.",
    walkthrough:
      "Pairing strength with index makes ordinary tuple comparison do both the ranking and the tie-break at once. nsmallest selects the k weakest in O(n log k), and the pairs come out already in weakest-first order.",
    followUps: [
      "How would you exploit the packed-left layout to count 1s with binary search?",
      "When is selecting the k smallest cheaper than sorting all the rows?"
    ],
    code: `def k_weakest_rows(grid, k):
    pairs = [(sum(row), index) for index, row in enumerate(grid)]
    weakest = heapq.nsmallest(k, pairs)
    return [index for _, index in weakest]
`,
    visibleTests: [
      {
        name: "five rows pick three",
        args: [
          [
            [1, 1, 0, 0, 0],
            [1, 1, 1, 1, 0],
            [1, 0, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [1, 1, 1, 1, 1]
          ],
          3
        ],
        expected: [2, 0, 3]
      },
      {
        name: "tie broken by index",
        args: [
          [
            [1, 0, 0],
            [1, 1, 1],
            [1, 0, 0]
          ],
          2
        ],
        expected: [0, 2]
      }
    ],
    hiddenTests: [
      { name: "single row", args: [[[1, 1, 0]], 1], expected: [0] },
      { name: "k equals all rows", args: [[[1, 0], [1, 1], [0, 0]], 3], expected: [2, 0, 1] },
      { name: "all rows empty of ones", args: [[[0, 0], [0, 0]], 2], expected: [0, 1] },
      { name: "all rows full", args: [[[1, 1], [1, 1], [1, 1]], 2], expected: [0, 1] },
      { name: "weakest is last row", args: [[[1, 1, 1], [1, 1, 0], [1, 0, 0]], 1], expected: [2] }
    ],
    time: "O(n log k)",
    space: "O(n)"
  },
  {
    id: "heaps-bonus-08",
    chapterId: "heaps",
    title: "Priority Print Queue",
    difficulty: "medium",
    patterns: ["heaps", "priority simulation", "scheduling"],
    entrypoint: "print_order",
    signature: "jobs",
    prompt:
      "A printer processes jobs one at a time. Each job is a pair [priority, id]. The printer always prints the waiting job with the highest priority next; if several share the top priority, the one with the smaller id goes first. Return the list of job ids in the order they are printed.",
    constraints: [
      "Priorities and ids are non-negative integers; ids are unique.",
      "An empty job list prints nothing; return an empty list.",
      "Higher priority prints first; equal priorities print smaller id first."
    ],
    hints: [
      "A heap that always yields the top-priority job is exactly a priority queue.",
      "heapq is a min-heap, so store the key as (negated priority, id) to make high priority and small id come out first.",
      "Pop until the heap is empty, recording each id."
    ],
    solution:
      "Push every job as the key (negated priority, id) into a min-heap. Negating the priority makes the highest-priority job the smallest key, and the raw id breaks ties toward smaller ids. Pop the heap until empty, collecting ids in print order.",
    walkthrough:
      "The printer's rule is a priority queue: repeatedly remove the most urgent item. A heap delivers that in logarithmic time per job, and folding priority and id into one comparable key lets a single pop honour both the ordering and the tie-break.",
    followUps: [
      "How would you support new jobs arriving while earlier jobs are still printing?",
      "What changes if a lower numeric priority value should mean more urgent?"
    ],
    code: `def print_order(jobs):
    heap = [(-priority, job_id) for priority, job_id in jobs]
    heapq.heapify(heap)
    order = []
    while heap:
        _, job_id = heapq.heappop(heap)
        order.append(job_id)
    return order
`,
    visibleTests: [
      {
        name: "mixed priorities",
        args: [[[3, 10], [1, 20], [3, 5], [2, 30]]],
        expected: [5, 10, 30, 20]
      },
      { name: "single job", args: [[[5, 99]]], expected: [99] }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: [] },
      { name: "all same priority", args: [[[2, 3], [2, 1], [2, 2]]], expected: [1, 2, 3] },
      { name: "already in priority order", args: [[[9, 1], [5, 2], [1, 3]]], expected: [1, 2, 3] },
      { name: "reverse priority order", args: [[[1, 1], [5, 2], [9, 3]]], expected: [3, 2, 1] },
      { name: "two jobs tie", args: [[[4, 8], [4, 2]]], expected: [2, 8] }
    ],
    time: "O(n log n)",
    space: "O(n)"
  },
  {
    id: "heaps-bonus-09",
    chapterId: "heaps",
    title: "K Closest Numbers To Target",
    difficulty: "easy",
    patterns: ["heaps", "top k", "max-heap"],
    entrypoint: "k_closest_numbers",
    signature: "nums, target, k",
    prompt:
      "Return the k values from the list whose absolute distance from a target number is smallest. When two values are equally distant, prefer the smaller value. Return the chosen values sorted in ascending order.",
    constraints: [
      "You may assume 1 <= k <= len(nums).",
      "Distance is the absolute difference between a value and the target.",
      "On a distance tie, the smaller value is preferred; the result is sorted ascending."
    ],
    hints: [
      "Score each value by its distance to the target, with the value itself as a tie-break.",
      "Keep a size-k max-heap so the worst current candidate sits at the root and can be evicted.",
      "Push negated keys so that heapq, a min-heap, behaves as a max-heap on the score."
    ],
    solution:
      "Walk the list keeping a max-heap of size k keyed on (distance, value), implemented by pushing negated keys. When the heap exceeds k entries, pop the worst candidate. The k survivors are the closest values; sort them before returning.",
    walkthrough:
      "A size-k max-heap keeps the farthest of the current best k at its root, so a closer value can displace it in logarithmic time. Bundling distance with the value into the key resolves ties toward the smaller value without extra logic.",
    followUps: [
      "If the list were sorted, how could binary search plus two pointers beat the heap?",
      "How would you return the distances along with the chosen values?"
    ],
    code: `def k_closest_numbers(nums, target, k):
    heap = []
    for value in nums:
        key = (abs(value - target), value)
        heapq.heappush(heap, (-key[0], -key[1]))
        if len(heap) > k:
            heapq.heappop(heap)
    return sorted(-value for _, value in heap)
`,
    visibleTests: [
      { name: "three closest", args: [[1, 2, 3, 4, 5], 3, 3], expected: [2, 3, 4] },
      { name: "single pick", args: [[10, 20, 30], 12, 1], expected: [10] }
    ],
    hiddenTests: [
      { name: "k equals length", args: [[4, 1, 8], 5, 3], expected: [1, 4, 8] },
      { name: "tie prefers smaller", args: [[2, 4], 3, 1], expected: [2] },
      { name: "single element", args: [[7], 100, 1], expected: [7] },
      { name: "negatives around target", args: [[-5, -2, 0, 3], -1, 2], expected: [-2, 0] },
      { name: "exact match included", args: [[1, 5, 9], 5, 2], expected: [1, 5] }
    ],
    time: "O(n log k)",
    space: "O(k)"
  },
  {
    id: "heaps-bonus-10",
    chapterId: "heaps",
    title: "Maximize Score By Halving",
    difficulty: "medium",
    patterns: ["heaps", "max-heap", "greedy simulation"],
    entrypoint: "max_score_after_halving",
    signature: "nums, k",
    prompt:
      "Your score starts as the sum of the list. You perform exactly k operations; each operation replaces a chosen value `v` with `ceil(v / 2)`, lowering the score by `v - ceil(v / 2)`. Choosing well loses as little as possible. Return the highest score remaining after exactly k operations.",
    constraints: [
      "List values are non-negative integers and k is a non-negative integer.",
      "Each operation replaces the chosen value v with ceil(v / 2), so the sum drops by v - ceil(v / 2).",
      "Perform exactly k operations even if the list is short; values may be halved repeatedly."
    ],
    hints: [
      "Halving the current largest value removes the most, so a max-heap should drive each step.",
      "heapq is a min-heap; store negated values so the largest sits at the root.",
      "Each operation pops the largest, computes its ceiling-half, adjusts the running sum, and pushes the new value back."
    ],
    solution:
      "Keep all values in a max-heap of negated numbers and track the running sum. For each of the k operations, pop the largest value, compute the ceiling of its half, subtract the lost amount from the sum, and push the reduced value back. Return the sum after k operations.",
    walkthrough:
      "Greedily halving the biggest value removes the largest possible amount each turn, and a max-heap surfaces that value in logarithmic time. The same value can return to the heap and be halved again, so the heap keeps the choice correct across all k operations.",
    followUps: [
      "Why is halving the largest value each step optimal for minimising the loss?",
      "How would the approach change if each operation could only be applied once per value?"
    ],
    code: `def max_score_after_halving(nums, k):
    total = sum(nums)
    heap = [-value for value in nums]
    heapq.heapify(heap)
    for _ in range(k):
        largest = -heapq.heappop(heap)
        halved = -(-largest // 2)
        total -= largest - halved
        heapq.heappush(heap, -halved)
    return total
`,
    visibleTests: [
      { name: "two operations", args: [[10, 20], 2], expected: 15 },
      { name: "one operation", args: [[5, 5, 5], 1], expected: 13 }
    ],
    hiddenTests: [
      { name: "zero operations", args: [[3, 7, 1], 0], expected: 11 },
      { name: "single value halved twice", args: [[8], 2], expected: 2 },
      { name: "ceiling rounds up", args: [[7], 1], expected: 4 },
      { name: "value reaches one", args: [[1], 3], expected: 1 },
      { name: "with zeros present", args: [[0, 0, 6], 1], expected: 3 }
    ],
    time: "O((n + k) log n)",
    space: "O(n)"
  }
];
