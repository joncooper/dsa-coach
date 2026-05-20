import type { Problem } from "../../types";
import { LIBRARY_SORTEDCONTAINERS_SET_ID, libraryProblem } from "./_shared";

/**
 * sortedcontainers practice — two problems that punish you for not having a
 * data structure that supports O(log n) add/remove AND O(1) indexed access.
 * Both are solvable with two heaps or `bisect.insort`, but `SortedList` is
 * the clean idiom: a single object that stays sorted, supports `add`,
 * `remove`, indexed `sl[i]`, and slice access.
 */

const make = libraryProblem(LIBRARY_SORTEDCONTAINERS_SET_ID);

// ---------------------------------------------------------------------------
// Running median
// ---------------------------------------------------------------------------

const RUNNING_MEDIAN_STARTER = `from sortedcontainers import SortedList

def running_median(stream):
    sl = SortedList()
    medians = []
    for value in stream:
        # Maintain sl in sorted order, then read the middle (or average the
        # two middle values when the count is even). Return a list of one
        # median per element appended, in input order.
        pass
    return medians
`;

const RUNNING_MEDIAN_REFERENCE = `from sortedcontainers import SortedList

def running_median(stream):
    sl = SortedList()
    medians = []
    for value in stream:
        sl.add(value)
        n = len(sl)
        if n % 2 == 1:
            medians.append(float(sl[n // 2]))
        else:
            medians.append((sl[n // 2 - 1] + sl[n // 2]) / 2.0)
    return medians
`;

const RUNNING_MEDIAN_SOLUTION = `from sortedcontainers import SortedList

def running_median(stream):
    window = SortedList()
    out = []
    for x in stream:
        window.add(x)
        size = len(window)
        mid = size // 2
        if size & 1:
            out.append(float(window[mid]))
        else:
            out.append((window[mid - 1] + window[mid]) / 2.0)
    return out
`;

const runningMedian: Problem = make({
  id: "lib-sc-running-median",
  title: "Running Median",
  difficulty: "medium",
  patterns: ["sorted container", "online median", "SortedList"],
  prompt:
    "Given a stream of integers, return a list of medians — after each element is appended, record the median of all values seen so far. The output length equals the input length. For an odd count, the median is the middle value; for an even count, it is the mean of the two middle values (as a float). Use `sortedcontainers.SortedList` so each insert is O(log n) and the middle lookup is O(1) via indexing.",
  constraints: [
    "0 <= len(stream) <= 10000.",
    "Each value fits in a Python int (positive, negative, or zero).",
    "Return medians as Python numbers; integer medians may be returned as int or float interchangeably."
  ],
  examples: [
    {
      name: "small ascending stream",
      args: [[1, 2, 3, 4]],
      expected: [1, 1.5, 2, 2.5]
    }
  ],
  entrypoint: "running_median",
  starterCode: RUNNING_MEDIAN_STARTER,
  referenceCode: RUNNING_MEDIAN_REFERENCE,
  solutionCode: RUNNING_MEDIAN_SOLUTION,
  visibleTests: [
    { name: "empty stream", args: [[]], expected: [] },
    { name: "single value", args: [[5]], expected: [5] },
    { name: "two values average", args: [[5, 3]], expected: [5, 4] },
    {
      name: "small ascending stream",
      args: [[1, 2, 3, 4]],
      expected: [1, 1.5, 2, 2.5]
    }
  ],
  hiddenTests: [
    {
      name: "repeated values",
      args: [[5, 5, 5, 5]],
      expected: [5, 5, 5, 5]
    },
    {
      name: "negative and zero",
      args: [[-5, 0, 5]],
      expected: [-5, -2.5, 0]
    },
    {
      name: "interleaved order",
      args: [[2, 0, 4, 1, 3]],
      expected: [2, 1, 2, 1.5, 2]
    },
    {
      name: "longer stream of mixed signs",
      args: [[1, 10, -1, 4, -3, 7, -8, 2]],
      expected: [1, 5.5, 1, 2.5, 1, 2.5, 1, 1.5]
    },
    {
      name: "duplicates with sorting",
      args: [[3, 3, 1, 1, 2]],
      expected: [3, 3, 3, 2, 2]
    }
  ],
  hints: [
    "`SortedList.add(x)` keeps the collection sorted in O(log n); you do not need to re-sort.",
    "Once `sl` is sorted, the median lives at index `n // 2` (odd) or averages indices `n // 2 - 1` and `n // 2` (even).",
    "Use `/ 2.0` (not `/ 2`) when you want the even-case result to come back as a float."
  ],
  solution:
    "Maintain a SortedList over every value seen so far. After each insert, read the middle via indexed access: the value at index n // 2 when n is odd, and the average of indices n // 2 - 1 and n // 2 when n is even. Each step is O(log n) for the insert and O(1) for the lookup, so the whole pass is O(n log n) — better than the O(n^2) you'd get from sorting on every step.",
  walkthrough:
    "SortedList is a list-like structure with O(log n) insertion that still supports O(1) indexed access. The two-heap technique works here too, but it has more bookkeeping (rebalance after each add); SortedList collapses both responsibilities — order maintenance and indexed read — into one object. The same shape applies to running quantiles (sl[k * n // q]) and other order-statistic streams.",
  followUps: [
    "How would you adapt this to a stream where the window forgets values older than k? (See the Sliding Window Median problem.)",
    "What changes if you want the median of values BELOW a threshold rather than all values?"
  ],
  complexity: {
    time: "O(n log n) total — O(log n) insert plus O(1) median per step",
    space: "O(n) for the SortedList"
  }
});

// ---------------------------------------------------------------------------
// Sliding window median
// ---------------------------------------------------------------------------

const SLIDING_WINDOW_STARTER = `from sortedcontainers import SortedList

def sliding_window_median(nums, k):
    if not nums or k <= 0:
        return []
    window = SortedList(nums[:k])
    medians = []
    # Emit the median of nums[0:k], then slide the window one step at a time:
    # remove the value leaving the window, add the new one entering, emit the
    # next median. Use SortedList so both the remove and the add are O(log k).
    return medians
`;

const SLIDING_WINDOW_REFERENCE = `from sortedcontainers import SortedList

def sliding_window_median(nums, k):
    if not nums or k <= 0:
        return []
    window = SortedList(nums[:k])
    medians = []
    n = len(nums)
    for i in range(k - 1, n):
        if k % 2 == 1:
            medians.append(float(window[k // 2]))
        else:
            medians.append((window[k // 2 - 1] + window[k // 2]) / 2.0)
        if i + 1 < n:
            window.remove(nums[i - k + 1])
            window.add(nums[i + 1])
    return medians
`;

const SLIDING_WINDOW_SOLUTION = `from sortedcontainers import SortedList

def sliding_window_median(nums, k):
    if k <= 0 or k > len(nums):
        return []
    sl = SortedList(nums[:k])
    out = []
    mid = k // 2
    odd = k % 2 == 1
    for i in range(len(nums) - k + 1):
        if odd:
            out.append(float(sl[mid]))
        else:
            out.append((sl[mid - 1] + sl[mid]) / 2.0)
        next_index = i + k
        if next_index < len(nums):
            sl.remove(nums[i])
            sl.add(nums[next_index])
    return out
`;

const slidingWindowMedian: Problem = make({
  id: "lib-sc-sliding-window-median",
  title: "Sliding Window Median",
  difficulty: "medium",
  patterns: ["sliding window", "sorted container", "SortedList"],
  prompt:
    "Given an integer array `nums` and a window size `k`, return the median of every length-`k` window as the window slides from left to right by one position at a time. The output length is `len(nums) - k + 1`. For odd `k` the median is the middle value of the sorted window; for even `k` it is the mean of the two middle values (as a float). `SortedList` gives you O(log k) add/remove and O(1) indexed access — exactly the operations a sliding median needs.",
  constraints: [
    "1 <= k <= len(nums) <= 10000.",
    "Values may be negative, zero, or positive integers.",
    "Return an empty list when `nums` is empty or `k` is non-positive."
  ],
  examples: [
    {
      name: "classic k=3 window",
      args: [[1, 3, -1, -3, 5, 3, 6, 7], 3],
      expected: [1, -1, -1, 3, 5, 6]
    }
  ],
  entrypoint: "sliding_window_median",
  starterCode: SLIDING_WINDOW_STARTER,
  referenceCode: SLIDING_WINDOW_REFERENCE,
  solutionCode: SLIDING_WINDOW_SOLUTION,
  visibleTests: [
    {
      name: "k=1 returns each element",
      args: [[1, 2, 3], 1],
      expected: [1, 2, 3]
    },
    {
      name: "k=2 means of pairs",
      args: [[1, 3, 5, 7], 2],
      expected: [2, 4, 6]
    },
    {
      name: "classic k=3 window",
      args: [[1, 3, -1, -3, 5, 3, 6, 7], 3],
      expected: [1, -1, -1, 3, 5, 6]
    },
    {
      name: "window equals full array",
      args: [[5, 2, 1, 4, 3], 5],
      expected: [3]
    }
  ],
  hiddenTests: [
    {
      name: "duplicates inside a window",
      args: [[1, 1, 1, 1], 2],
      expected: [1, 1, 1]
    },
    {
      name: "even window over signed values",
      args: [[-4, -2, 0, 2, 4], 4],
      expected: [-1, 1]
    },
    {
      name: "single element with k=1",
      args: [[42], 1],
      expected: [42]
    },
    {
      name: "remove correct end of window",
      args: [[7, 3, 5, 1, 4, 6, 2], 3],
      expected: [5, 3, 4, 4, 4]
    },
    {
      name: "all identical large window",
      args: [[5, 5, 5, 5, 5], 3],
      expected: [5, 5, 5]
    }
  ],
  hints: [
    "Seed `SortedList(nums[:k])` once; from there each slide is one `remove` of the value leaving the window and one `add` of the value entering.",
    "Order matters: emit the median BEFORE you slide the window, otherwise your output is for the next window instead of the current one.",
    "`SortedList.remove(x)` removes a single occurrence — it's the right tool when the window contains duplicates."
  ],
  solution:
    "Seed a SortedList with the first k values and walk an index `i` from k - 1 to the end of the array. At each step, read the median from the current window (`sl[k // 2]` for odd k, the mean of `sl[k // 2 - 1]` and `sl[k // 2]` for even k), then slide: remove `nums[i - k + 1]` and add `nums[i + 1]` as long as you're not past the end. Each slide is two O(log k) operations on the SortedList, so the full pass is O(n log k).",
  walkthrough:
    "The trick is recognising that `SortedList` collapses what would otherwise be a balancing act between two heaps: it supports both the multiset semantics (remove a single occurrence in a window with duplicates) and the indexed median read. The bisect module would also work for the find-and-insert pair, but list-shifting on remove drags it to O(k) per step; SortedList's segment-list internals keep both operations sub-linear.",
  followUps: [
    "How would the approach change for a window with non-uniform size (e.g. expand on event A, shrink on event B)?",
    "What if the window's median operation has to be running statistics like 'count of values < x' as the window slides?"
  ],
  complexity: {
    time: "O(n log k) — two O(log k) ops per slide",
    space: "O(k) for the window"
  }
});

export const sortedContainersProblems: Problem[] = [runningMedian, slidingWindowMedian];
