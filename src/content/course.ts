import { guidedReferenceCode } from "./referenceSolutions";
import { problemSets as interviewSets } from "./problemSets";
import { aocSets } from "./aocSets";
import type { BonusProblem, Chapter, CourseData, Difficulty, Lesson, Problem, ProblemSet, ProblemTest, Quiz } from "../types";

const problemSets: ProblemSet[] = [...interviewSets, ...aocSets];

interface ChapterSpec {
  id: string;
  title: string;
  summary: string;
  concepts: string[];
}

interface ProblemSeed {
  id: string;
  chapterId: string;
  title: string;
  difficulty: Difficulty;
  patterns: string[];
  entrypoint: string;
  signature: string;
  adapter?: Problem["adapter"];
  prompt: string;
  visibleTests: ProblemTest[];
  hiddenTests: ProblemTest[];
  hints: string[];
  solution: string;
  time: string;
  space: string;
}

interface LessonDetail {
  objectiveNouns: string[];
  signals: string[];
  mentalModel: string;
  exampleA: string;
  exampleB: string;
  traceA: string[];
  traceB: string[];
  pitfalls: string[];
  complexity: string;
}

interface BonusFamilyInfo {
  title: string;
  pattern: string;
}

const chaptersBase: ChapterSpec[] = [
  {
    id: "foundations",
    title: "Foundations",
    summary: "Build the shared language for runtime, recursion, invariants, and test-driven problem solving.",
    concepts: ["Big O", "edge cases", "recursion", "iteration", "test design"]
  },
  {
    id: "arrays-strings",
    title: "Arrays & Strings",
    summary: "Practice ordered data, prefix state, careful indexing, and string construction.",
    concepts: ["indexing", "prefix sums", "string scans", "in-place thinking", "array transforms"]
  },
  {
    id: "two-pointers-sliding-window",
    title: "Two Pointers & Sliding Window",
    summary: "Use monotonic movement to replace nested loops with linear scans.",
    concepts: ["opposite pointers", "same-direction pointers", "fixed windows", "variable windows", "palindromes"]
  },
  {
    id: "hashing",
    title: "Hashing",
    summary: "Trade memory for fast lookup, counting, grouping, and prefix-state queries.",
    concepts: ["sets", "maps", "frequency tables", "prefix counts", "canonical keys"]
  },
  {
    id: "linked-lists",
    title: "Linked Lists",
    summary: "Reason about node references, sentinels, pointer rewiring, and one-pass constraints.",
    concepts: ["ListNode", "dummy heads", "fast and slow pointers", "merge", "in-place updates"]
  },
  {
    id: "stacks-queues",
    title: "Stacks & Queues",
    summary: "Model pending work, nesting, streaming windows, and nearest-neighbor relationships.",
    concepts: ["stacks", "queues", "monotonic stacks", "simulation", "streaming"]
  },
  {
    id: "trees-graphs",
    title: "Trees & Graphs",
    summary: "Traverse structured data with DFS, BFS, graph modeling, and visited-state discipline.",
    concepts: ["DFS", "BFS", "tree recursion", "topological order", "connected components"]
  },
  {
    id: "heaps",
    title: "Heaps",
    summary: "Use priority queues for selection, merging, streaming order, and repeated minimum work.",
    concepts: ["heapq", "top k", "merge", "streaming median", "priority simulation"]
  },
  {
    id: "greedy",
    title: "Greedy",
    summary: "Choose locally with proof obligations: exchange arguments, sorting, and feasibility checks.",
    concepts: ["intervals", "sorting", "reachability", "exchange arguments", "partitioning"]
  },
  {
    id: "binary-search",
    title: "Binary Search",
    summary: "Search positions and answer spaces by maintaining a correct predicate boundary.",
    concepts: ["lower bound", "upper bound", "rotated arrays", "answer search", "integer math"]
  },
  {
    id: "backtracking",
    title: "Backtracking",
    summary: "Explore decision trees with pruning, undo steps, and deterministic output ordering.",
    concepts: ["recursion trees", "subsets", "combinations", "constraints", "grid search"]
  },
  {
    id: "dynamic-programming",
    title: "Dynamic Programming",
    summary: "Turn repeated subproblems into stable recurrences and compact state transitions.",
    concepts: ["memoization", "tabulation", "state", "transition", "optimization"]
  },
  {
    id: "interview-tools",
    title: "Interview Tools + Mixed Review",
    summary: "Practice synthesis: choosing patterns, communicating complexity, and reviewing mixed prompts.",
    concepts: ["pattern choice", "complexity narration", "tradeoffs", "mock review", "mixed practice"]
  }
];

const lessonDetails: Record<string, LessonDetail> = {
  "foundations": {
    objectiveNouns: ["runtime vocabulary", "edge-case discipline", "recursive base cases", "loop invariants"],
    signals: ["The prompt asks for a direct aggregate, a first occurrence, or a small simulation.", "The constraints are small enough to reason about by hand but large enough to punish accidental quadratic scans.", "The examples hide an empty input, a singleton input, or a value that should not contribute."],
    mentalModel: "Treat the first pass through any interview problem as an evidence-gathering pass. You are not trying to guess the clever trick; you are naming the state that would let a simple loop, recursion, or helper structure stay honest. Foundations problems reward precise definitions: what does the counter count, when is the answer final, and what is the smallest input that should not break the code?",
    exampleA: "For `Sum Positive Readings`, the input `[3, -2, 7, 0, -5]` should produce `10`. The invariant is: after processing index i, `total` is the sum of positive values in the prefix ending at i.",
    exampleB: "For `First Repeated Index`, the input `[5, 1, 4, 1, 9]` should produce `3`. The invariant is: before checking index i, the set contains exactly the values from indexes before i.",
    traceA: ["Start total at 0.", "See 3, add it because it is positive: total is 3.", "Ignore -2 and 0 because they do not satisfy the predicate.", "See 7, total becomes 10, and later negative values leave it unchanged."],
    traceB: ["Before index 0, seen is empty, then add 5.", "Before index 1, seen is {5}, then add 1.", "Before index 3, seen is {5, 1, 4}; value 1 already exists, so index 3 is final."],
    pitfalls: ["Counting values before defining whether zero contributes.", "Returning the repeated value when the prompt asks for the repeated index.", "Writing recursion without a base case that handles zero or a single digit.", "Calling an O(log n) loop O(n) because it is still a loop."],
    complexity: "Most foundation loops are O(n) time and O(1) space unless they store seen values. A set changes the memory cost to O(n) but keeps lookup expected O(1). Repeated halving is O(log n) because the input size shrinks by a constant factor each step."
  },
  "arrays-strings": {
    objectiveNouns: ["index safety", "prefix state", "stable output construction", "string scan discipline"],
    signals: ["The problem asks for a transformed array or compressed string.", "A split, prefix, suffix, or window summary can answer many positions.", "The input order matters and sorting would destroy the required relationship."],
    mentalModel: "Arrays and strings are about respecting position. The strongest solutions usually keep one piece of state that summarizes the prefix already consumed, then write output in a deliberate direction. If the answer for every index depends on information from both sides, build one side first and combine it with the other side during a second pass.",
    exampleA: "For `Product Except Self Local`, `[1, 2, 3, 4]` should produce `[24, 12, 8, 6]`. The answer at each index is the product of values strictly left of it times values strictly right of it.",
    exampleB: "For `Compress Runs`, `aaabb` becomes `a3b2`. The active state is the current character and the run length that has not yet been flushed to output.",
    traceA: ["Left pass writes prefix products `[1, 1, 2, 6]`.", "Right pass starts suffix at 1 and walks backward.", "At index 3, multiply by suffix 1, then suffix becomes 4.", "At index 0, multiply prefix 1 by suffix 24."],
    traceB: ["Start with `a`, count 1.", "Second and third `a` increase the count.", "Seeing `b` flushes `a3` and starts `b1`.", "End of input flushes `b2`."],
    pitfalls: ["Using division when zero values make it invalid.", "Forgetting to normalize rotation counts with modulo.", "Appending characters directly in a loop when a list and join is clearer.", "Off-by-one errors around empty suffixes."],
    complexity: "A single scan or pair of scans is O(n). Output arrays and compressed strings are O(n) space because the result must be stored. Prefix/suffix product can be O(1) extra space if the output array is not counted."
  },
  "two-pointers-sliding-window": {
    objectiveNouns: ["monotonic pointer movement", "window validity", "opposite-end reasoning", "bounded shrink loops"],
    signals: ["The prompt asks about contiguous subarrays or substrings.", "All numbers are positive, making sums grow when the right edge expands.", "A sorted input allows one pointer move to increase or decrease a candidate value."],
    mentalModel: "Two-pointer solutions work when movement is irreversible. Each pointer should have a reason to move that never requires it to backtrack. Sliding windows add one rule: define what makes the window valid, expand until it breaks, then shrink until it is valid again. The proof is that each element enters and leaves at most once.",
    exampleA: "For `Longest With Flips`, `[1, 0, 1, 0, 1, 1, 0]` with k = 2 produces 6. The valid condition is at most two zeroes in the current window.",
    exampleB: "For `Closest Pair Sum`, a sorted array lets you compare the low and high values. If the sum is too small, only moving the low pointer can increase it.",
    traceA: ["Expand right while counting zeroes.", "When zeroes becomes 3, move left until one zero leaves.", "After each repair, the window is valid and its length can update the best answer.", "No index is moved left twice."],
    traceB: ["Start at both ends.", "Record the current sum if it is closer than the best.", "Move left to raise small sums and right to lower large sums.", "Preserve the smaller sum on exact distance ties."],
    pitfalls: ["Shrinking before adding the new right value, then mixing invariants.", "Using sliding window when negative numbers break monotonic sums.", "Counting replacements instead of counting broken characters or zeroes.", "Stopping a palindrome scan after pointers cross but accidentally counting the center."],
    complexity: "When pointer movement is monotonic, time is O(n) because each pointer moves across the input once. Space is usually O(1), except when the output must store transformed values."
  },
  "hashing": {
    objectiveNouns: ["constant-time lookup", "frequency tables", "canonical grouping keys", "prefix state counts"],
    signals: ["The prompt asks whether something has been seen before.", "You need counts, membership, or groups keyed by normalized values.", "A subarray sum problem includes negative values, preventing sliding-window monotonicity."],
    mentalModel: "Hashing buys fast answers to questions about the past. The design step is choosing the key. Sometimes the key is the value itself, sometimes it is a remainder, a sorted string, or a prefix sum. Good hash solutions make the second occurrence easy to identify without rescanning earlier data.",
    exampleA: "For `Count Target Sum Subarrays`, prefix sums turn a range sum into `current_prefix - previous_prefix`. If that difference equals target, the previous prefix is what you need to count.",
    exampleB: "For `Anagram Bucket Sizes`, sorting the letters in each word creates a canonical key so `tea`, `eat`, and `ate` land in the same bucket.",
    traceA: ["Initialize prefix count with 0 because a subarray may start at index 0.", "At each value, update the prefix.", "Add the number of previous prefixes equal to `prefix - target`.", "Only then store the current prefix for later ranges."],
    traceB: ["Normalize each word to a sorted-letter signature.", "Increment that signature's bucket count.", "After scanning, sort the bucket sizes for deterministic output."],
    pitfalls: ["Updating prefix counts before asking how many previous prefixes match.", "Forgetting modulo complement edge cases like remainder 0.", "Using a mutable object as a key.", "Returning groups when the prompt only asks for group sizes."],
    complexity: "Hash-table scans are usually O(n) expected time, with O(n) memory for counts or seen values. Canonicalizing strings adds the cost of building the key, often O(m log m) per word when sorting letters."
  },
  "linked-lists": {
    objectiveNouns: ["node identity", "sentinel nodes", "fast and slow pointers", "safe rewiring"],
    signals: ["The prompt gives a `head` node instead of an array.", "The answer requires removing, merging, or finding a node without random access.", "The head itself may change."],
    mentalModel: "Linked lists are reference problems. You do not own indexes; you own arrows. A sentinel node turns head changes into ordinary rewiring, and a fast pointer lets you measure structure without first computing length. Before changing `next`, save the reference you still need.",
    exampleA: "For `Remove List Value`, `[2, 1, 2, 3]` with target 2 should return `[1, 3]`. A dummy node before the head means removing the first real node is the same operation as removing a middle node.",
    exampleB: "For `Middle List Value`, slow moves one step while fast moves two. When fast finishes, slow points at the second middle for even-length lists.",
    traceA: ["Dummy points to head.", "If `prev.next.val` is target, bypass it with `prev.next = prev.next.next`.", "If it is kept, advance prev.", "Return `dummy.next`, not the original head."],
    traceB: ["Start both pointers at head.", "After one loop on `[1,2,3,4]`, slow is 2 and fast is 3.", "After the next loop, slow is 3 and fast is null.", "Return slow's value."],
    pitfalls: ["Advancing `prev` after deleting a node, which skips the new next node.", "Returning the old head after it was removed.", "Comparing node objects instead of node values.", "Forgetting that an empty list returns `None` or an empty serialized list depending on the problem."],
    complexity: "Most linked-list operations are O(n) time because random access is unavailable. Pointer rewiring is O(1) extra space; copying values for palindrome checks costs O(n) memory but is often the clearest first solution."
  },
  "stacks-queues": {
    objectiveNouns: ["pending work", "last-in-first-out structure", "first-in-first-out streams", "monotonic stacks"],
    signals: ["The prompt involves nesting, undoing, nearest greater values, or unresolved previous items.", "Events arrive over time and old events expire.", "You need to match a closing token with the most recent opening token."],
    mentalModel: "Stacks and queues externalize time. A stack remembers the most recent unresolved item; a queue remembers the oldest item that might still matter. Monotonic stacks are especially powerful because each new value resolves some earlier values and leaves the rest in useful order.",
    exampleA: "For `Warmer Day Waits`, a decreasing stack stores indexes whose warmer day is unknown. A warmer current temperature resolves all colder indexes on top.",
    exampleB: "For `Recent Event Counts`, timestamps arrive sorted. A queue contains exactly the events within the current inclusive time range.",
    traceA: ["Push day 0.", "Day 1 is warmer, so pop day 0 and write distance 1.", "Cooler days wait on the stack.", "Each index is pushed and popped at most once."],
    traceB: ["Append the current timestamp.", "Pop from the left while it is older than `current - window`.", "The queue length is the answer for that timestamp.", "Equal timestamps remain because the range is inclusive."],
    pitfalls: ["Using a stack when the oldest item must expire first.", "Treating equal temperature as warmer.", "Forgetting to flush the last active stack state with default answers.", "Popping above the root path when simplifying folders."],
    complexity: "Stack and queue simulations are usually O(n) time. Even nested while loops stay linear when every item can be pushed once and popped once. Space is O(n) in the worst case for unresolved or active items."
  },
  "trees-graphs": {
    objectiveNouns: ["recursive tree state", "BFS frontier", "visited sets", "graph modeling"],
    signals: ["Inputs describe parent-child relationships, grids, edges, or reachability.", "The problem asks for shortest paths in an unweighted graph.", "You need to count connected regions or detect dependency cycles."],
    mentalModel: "Trees and graphs are traversal problems first and data-shape problems second. Choose DFS when the state follows a path or component; choose BFS when distance by edge count matters. In graphs, the visited set is part of the algorithm, not an optimization.",
    exampleA: "For `Tree Has Path Sum Local`, subtract the current node from the remaining target and only accept a match at a leaf.",
    exampleB: "For `Shortest Edge Path`, BFS starts from the source and explores all nodes at distance d before distance d + 1.",
    traceA: ["At root 5 and target 22, recurse with target 17.", "At child 4, recurse with target 13.", "Only when a leaf value equals the remaining target is the path valid.", "A non-leaf partial match is not enough."],
    traceB: ["Build adjacency from undirected edges.", "Queue starts with `(start, 0)`.", "When a neighbor equals goal, return distance + 1.", "Visited prevents cycles from re-entering the queue."],
    pitfalls: ["Accepting path sums before reaching a leaf.", "Forgetting isolated nodes when counting components.", "Using DFS for shortest unweighted paths and accidentally returning a longer path.", "Mutating grids without tracking whether the caller expects the grid unchanged."],
    complexity: "Tree traversals are O(n). Graph traversals are O(vertices + edges). Grid flood fill is O(rows * columns). Recursion or queue space is bounded by tree height, graph frontier, or component size."
  },
  "heaps": {
    objectiveNouns: ["priority selection", "streaming order", "k-way merge", "repeated minimum work"],
    signals: ["The prompt repeatedly asks for the smallest or largest available item.", "You only need the top k values rather than a fully sorted list.", "Several sorted streams must be merged without flattening first."],
    mentalModel: "A heap is a disciplined compromise between a scan and a sort. It lets the next priority item be retrieved cheaply while postponing all other ordering decisions. Use it when repeated selection drives the algorithm.",
    exampleA: "For `Merge Sorted Batches`, the heap holds one candidate from each batch. Popping a candidate reveals the next candidate from the same batch.",
    exampleB: "For `Running Medians Local`, two heaps split the stream into lower and upper halves. The median lives at the heap tops.",
    traceA: ["Push the first value of each non-empty batch with its batch index.", "Pop the smallest value into output.", "Push the next value from that same batch.", "Repeat until the heap is empty."],
    traceB: ["Push into the lower half as a max heap using negative values.", "Move the largest lower value into the upper heap.", "Rebalance sizes so the lower half is never smaller.", "Read one top or average two tops."],
    pitfalls: ["Sorting the full input when k is small.", "Forgetting tie-breakers for deterministic point ordering.", "Letting two heaps drift by more than one element.", "Mutating caller-owned arrays with heapify when the caller expects preservation."],
    complexity: "Heap operations are O(log k) or O(log n), depending on heap size. K-way merge is O(total_items log number_of_batches). Two-heap streaming median is O(log n) per insertion."
  },
  "greedy": {
    objectiveNouns: ["local choice", "exchange argument", "sorted intervals", "reachability frontiers"],
    signals: ["A sorted order seems to make future choices easier.", "The problem asks for maximum count, minimum removals, or feasibility with one pass.", "Choosing the earliest finish, smallest sufficient resource, or farthest reach can be justified."],
    mentalModel: "Greedy algorithms are not just fast choices; they are choices with a proof. The proof usually says any optimal solution can be transformed to include your local choice without getting worse. Sorting often creates the order where that proof is visible.",
    exampleA: "For `Max Compatible Meetings`, choosing the meeting that ends earliest leaves the most room for all future meetings.",
    exampleB: "For `Can Reach End Local`, the only state that matters is the farthest index reachable so far.",
    traceA: ["Sort meetings by end time.", "Take the first compatible meeting.", "Ignore overlapping meetings because they end no earlier.", "Every accepted meeting advances the boundary."],
    traceB: ["Start farthest at 0.", "At each reachable index, update `farthest`.", "If the current index is greater than farthest, no earlier jump can reach it.", "If the scan finishes, the end is reachable."],
    pitfalls: ["Choosing the shortest interval instead of earliest ending interval.", "Sorting by start time when the proof needs end time.", "Updating reach after checking a blocked index.", "Calling a choice greedy without an exchange argument."],
    complexity: "Greedy interval and matching problems often spend O(n log n) on sorting and O(n) on the pass. Reachability scans can be O(n) time and O(1) space."
  },
  "binary-search": {
    objectiveNouns: ["predicate boundaries", "lower bounds", "answer-space search", "integer-safe midpoints"],
    signals: ["The input is sorted, rotated sorted, or monotonic by condition.", "The question asks for the first, last, minimum feasible, or maximum feasible value.", "A candidate answer can be checked faster than it can be constructed directly."],
    mentalModel: "Binary search is boundary maintenance. At every step, you must know which side still contains the first true, last false, or exact target. For answer search, write the predicate before writing the loop.",
    exampleA: "For `Lower Bound Local`, the boundary is the first index whose value is at least target.",
    exampleB: "For `Ship Capacity Local`, the predicate is whether a given capacity can ship all packages within the allowed days.",
    traceA: ["Use a half-open range `[left, right)`.", "If mid value is at least target, mid could be the answer, so move right.", "Otherwise move left past mid.", "Return left when the range collapses."],
    traceB: ["Capacity below max weight is impossible.", "Capacity at total weight is always possible.", "Binary search between those bounds.", "The greedy day counter evaluates each candidate."],
    pitfalls: ["Searching for a value when the prompt asks for an insertion boundary.", "Using `while left <= right` with boundary semantics that require half-open ranges.", "Forgetting impossible cases before answer search.", "Overflow is rare in Python but midpoint discipline still prevents logic bugs."],
    complexity: "Plain binary search is O(log n). Answer-space search is O(check_cost * log range). Space is usually O(1), with the predicate doing a linear scan when needed."
  },
  "backtracking": {
    objectiveNouns: ["decision trees", "path mutation", "duplicate skipping", "constraint pruning"],
    signals: ["The prompt asks for all combinations, permutations, subsets, or valid configurations.", "A partial choice can be extended, rejected, or undone.", "The input size is small enough for exponential exploration with pruning."],
    mentalModel: "Backtracking is controlled recursion over choices. The path is the current partial answer. Each recursive call owns a decision point, and every mutation must be undone before the next choice. Good pruning turns impossible branches into constant-time exits.",
    exampleA: "For `Generate Parentheses Local`, a left parenthesis is allowed while open count is below n; a right parenthesis is allowed only while it will not exceed opens.",
    exampleB: "For `Combination Sum Exact Local`, sorting lets you stop when a candidate exceeds the remaining target and skip duplicates at the same depth.",
    traceA: ["Start with empty path.", "Choose `(` until opens reaches n.", "Choose `)` only if closed is less than opened.", "Append the path when length is `2n`."],
    traceB: ["Sort candidates.", "At a depth, remember the previous value to skip duplicate siblings.", "Subtract the chosen value from remaining target.", "Pop the value before trying the next candidate."],
    pitfalls: ["Appending the live path object instead of a copy.", "Skipping duplicates across different depths instead of only sibling choices.", "Forgetting to unmark a grid cell after DFS.", "Generating invalid states then filtering instead of enforcing constraints during generation."],
    complexity: "Backtracking is usually exponential in the number of choices. Space is O(depth) for recursion plus output size. Pruning improves constants and sometimes avoids large impossible subtrees, but it does not make enumeration polynomial."
  },
  "dynamic-programming": {
    objectiveNouns: ["state definitions", "recurrences", "memoization", "tabulation"],
    signals: ["The prompt asks for optimal value or count of ways.", "The same suffix, prefix, amount, or grid cell is solved repeatedly.", "A choice at one position depends on best answers to smaller positions."],
    mentalModel: "Dynamic programming starts with a sentence: `dp[state] means ...`. If that sentence is vague, the code will be vague. Once state is clear, the transition says how smaller solved states combine to solve the current one.",
    exampleA: "For `Coin Change Min Local`, `dp[x]` is the fewest coins needed to make amount x. Every coin contributes `1 + dp[x - coin]` if the smaller amount is reachable.",
    exampleB: "For `Grid Paths With Blocks`, each open cell receives paths from above and left; blocked cells reset the count to zero.",
    traceA: ["Initialize `dp[0] = 0`.", "Fill amounts from 1 to target.", "Ignore coins larger than the amount or unreachable subamounts.", "Return -1 when the target remains sentinel."],
    traceB: ["Start top-left as 1 if open.", "Scan rows left to right.", "A blocked cell sets `dp[c] = 0`.", "An open non-first-column cell adds paths from the left."],
    pitfalls: ["Defining state after writing loops.", "Using zero as both a valid answer and an unreachable sentinel.", "Updating a one-dimensional DP in the wrong direction.", "Forgetting that choosing no values may be allowed in max-sum problems."],
    complexity: "DP time is usually number_of_states times transition_cost. Space can often be reduced when each state depends only on nearby previous states, such as rolling variables or a single grid row."
  },
  "interview-tools": {
    objectiveNouns: ["pattern selection", "complexity narration", "mixed review", "self-debugging"],
    signals: ["The prompt combines multiple familiar shapes.", "The interviewer asks for tradeoffs, not just code.", "Your first idea works but has avoidable repeated work."],
    mentalModel: "Mixed review is about diagnosis. Instead of memorizing problem names, ask which property unlocks the solution: sortedness, contiguity, repeated subproblems, graph reachability, or fast lookup. Then explain the proof of why the chosen pattern is enough.",
    exampleA: "For `Choose Pattern Label`, feature words such as nodes, edges, and shortest path should push you toward graph traversal before considering DP or hashing.",
    exampleB: "For `Growth Label`, doubling input size and comparing operation ratios trains you to separate constant, linear, and quadratic behavior.",
    traceA: ["Normalize feature words.", "Check high-priority structures first, such as graph signals.", "Return the first matching pattern family.", "Use the answer as a prompt for the implementation approach."],
    traceB: ["Compute ratios between measurements.", "Average the ratios roughly rather than demanding exact equality.", "Map near 1 to constant, near 2 to linear, near 4 to quadratic.", "Return unknown when the evidence is inconsistent."],
    pitfalls: ["Choosing the most recently studied pattern instead of the prompt's strongest signal.", "Overstating complexity without naming input dimensions.", "Skipping the brute-force baseline, which makes the optimization harder to explain.", "Treating a passed sample as proof of correctness."],
    complexity: "Interview-tool problems are usually small, but the habit matters: name the dimensions, justify the data structure, and explain why repeated work is bounded or cached."
  }
};

const bonusFamilies: BonusFamilyInfo[] = [
  { title: "Count Scores At Least Threshold", pattern: "single pass predicate" },
  { title: "Longest Target Run", pattern: "contiguous run" },
  { title: "First Prefix Over Limit", pattern: "prefix sum" },
  { title: "Adjacent Change Count", pattern: "string scan" },
  { title: "Minimum Neighbor Gap", pattern: "sorted scan" },
  { title: "Maximum Affordable Tasks", pattern: "greedy sorting" },
  { title: "All Frequencies Even", pattern: "frequency table" },
  { title: "Rows Containing One", pattern: "grid scan" },
  { title: "Running Maximums", pattern: "streaming state" },
  { title: "Merged Coverage Length", pattern: "interval merge" },
  { title: "Lower Bound Value", pattern: "binary search" },
  { title: "Two-Item Combinations", pattern: "combination generation" },
  { title: "Non-Adjacent Max Sum", pattern: "dynamic programming" },
  { title: "Forward Dependency Check", pattern: "dependency order" }
];

const problemSeeds: ProblemSeed[] = [
  {
    id: "sum-positive-readings",
    chapterId: "foundations",
    title: "Sum Positive Readings",
    difficulty: "warmup",
    patterns: ["single pass", "filtering"],
    entrypoint: "sum_positive_readings",
    signature: "readings",
    prompt: "Given a list of integer sensor readings, return the sum of only the positive readings. Zero and negative readings do not contribute.",
    visibleTests: [
      { name: "mixed readings", args: [[3, -2, 7, 0, -5]], expected: 10 },
      { name: "no positives", args: [[-4, 0, -1]], expected: 0 }
    ],
    hiddenTests: [
      { name: "all positives", args: [[1, 2, 3, 4]], expected: 10 },
      { name: "empty", args: [[]], expected: 0 }
    ],
    hints: ["Track one running total.", "Only add a reading when it is greater than zero."],
    solution: "Scan once and accumulate values that pass the predicate `value > 0`.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "first-repeated-index",
    chapterId: "foundations",
    title: "First Repeated Index",
    difficulty: "easy",
    patterns: ["set", "scan"],
    entrypoint: "first_repeated_index",
    signature: "values",
    prompt: "Return the first index whose value has appeared earlier in the array. If every value is new when visited, return -1.",
    visibleTests: [
      { name: "repeat in middle", args: [[5, 1, 4, 1, 9]], expected: 3 },
      { name: "unique", args: [[2, 4, 6]], expected: -1 }
    ],
    hiddenTests: [
      { name: "first pair", args: [[8, 8, 9]], expected: 1 },
      { name: "late repeat", args: [[3, 1, 2, 4, 3]], expected: 4 }
    ],
    hints: ["You need to remember values, not indexes.", "A set answers whether a value has been seen in expected constant time."],
    solution: "Keep a set of seen values. On each index, return immediately if the value is already present; otherwise add it.",
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "safe-window-count",
    chapterId: "foundations",
    title: "Safe Window Count",
    difficulty: "easy",
    patterns: ["fixed window", "running sum"],
    entrypoint: "count_safe_windows",
    signature: "nums, k, limit",
    prompt: "Count how many contiguous windows of length `k` have a sum less than or equal to `limit`.",
    visibleTests: [
      { name: "three safe", args: [[2, 1, 5, 1, 1], 2, 6], expected: 4 },
      { name: "none", args: [[9, 9, 9], 2, 10], expected: 0 }
    ],
    hiddenTests: [
      { name: "whole array", args: [[1, 2, 3], 3, 6], expected: 1 },
      { name: "k too large", args: [[1, 2], 3, 5], expected: 0 }
    ],
    hints: ["Avoid recomputing each window from scratch.", "Subtract the element that leaves before adding or after adding consistently."],
    solution: "Maintain the sum of the current length-k window and update it by one outgoing and one incoming element.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "longest-true-run",
    chapterId: "foundations",
    title: "Longest True Run",
    difficulty: "warmup",
    patterns: ["scan", "state"],
    entrypoint: "longest_true_run",
    signature: "flags",
    prompt: "Given booleans, return the length of the longest contiguous run of `True` values.",
    visibleTests: [
      { name: "middle run", args: [[true, true, false, true, true, true]], expected: 3 },
      { name: "all false", args: [[false, false]], expected: 0 }
    ],
    hiddenTests: [
      { name: "all true", args: [[true, true, true]], expected: 3 },
      { name: "empty", args: [[]], expected: 0 }
    ],
    hints: ["Keep current run length and best run length.", "Reset the current length when the flag is false."],
    solution: "Update `current` on each true value, reset it on false, and store the maximum seen.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "recursive-digit-sum",
    chapterId: "foundations",
    title: "Recursive Digit Sum",
    difficulty: "easy",
    patterns: ["recursion", "modulo"],
    entrypoint: "recursive_digit_sum",
    signature: "n",
    prompt: "Return the sum of the decimal digits of a non-negative integer. Use recursion for the main reduction.",
    visibleTests: [
      { name: "several digits", args: [4072], expected: 13 },
      { name: "zero", args: [0], expected: 0 }
    ],
    hiddenTests: [
      { name: "one digit", args: [9], expected: 9 },
      { name: "many zeros", args: [1000200], expected: 3 }
    ],
    hints: ["The last digit is `n % 10`.", "The rest of the number is `n // 10`."],
    solution: "The recurrence is `digit_sum(n) = n % 10 + digit_sum(n // 10)` with a base case below 10.",
    time: "O(d)",
    space: "O(d)"
  },
  {
    id: "halve-step-count",
    chapterId: "foundations",
    title: "Halve Step Count",
    difficulty: "warmup",
    patterns: ["logarithmic loop"],
    entrypoint: "halve_step_count",
    signature: "n",
    prompt: "Starting from positive integer `n`, repeatedly replace it with `n // 2` until it becomes 0. Return the number of replacements.",
    visibleTests: [
      { name: "eight", args: [8], expected: 4 },
      { name: "one", args: [1], expected: 1 }
    ],
    hiddenTests: [
      { name: "fifteen", args: [15], expected: 4 },
      { name: "large power", args: [1024], expected: 11 }
    ],
    hints: ["This is a loop over shrinking input.", "Count after each division."],
    solution: "Repeated halving takes one step per binary digit, so loop while `n > 0` and count divisions.",
    time: "O(log n)",
    space: "O(1)"
  },
  {
    id: "rotate-left-local",
    chapterId: "arrays-strings",
    title: "Rotate Left Local",
    difficulty: "easy",
    patterns: ["array transform", "modulo"],
    entrypoint: "rotate_left",
    signature: "nums, k",
    prompt: "Return a new array containing `nums` rotated left by `k` positions. Do not mutate the input.",
    visibleTests: [
      { name: "basic", args: [[1, 2, 3, 4, 5], 2], expected: [3, 4, 5, 1, 2] },
      { name: "large k", args: [[1, 2, 3], 5], expected: [3, 1, 2] }
    ],
    hiddenTests: [
      { name: "empty", args: [[], 3], expected: [] },
      { name: "zero", args: [[4, 5], 0], expected: [4, 5] }
    ],
    hints: ["Reduce `k` modulo the length.", "The answer is the suffix after `k` followed by the prefix before `k`."],
    solution: "Normalize `k` and concatenate `nums[k:] + nums[:k]`.",
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "compress-runs",
    chapterId: "arrays-strings",
    title: "Compress Runs",
    difficulty: "easy",
    patterns: ["string scan", "run length"],
    entrypoint: "compress_runs",
    signature: "text",
    prompt: "Compress consecutive equal characters as `character + count`. For example, `aaabb` becomes `a3b2`.",
    visibleTests: [
      { name: "two groups", args: ["aaabb"], expected: "a3b2" },
      { name: "single chars", args: ["abc"], expected: "a1b1c1" }
    ],
    hiddenTests: [
      { name: "empty", args: [""], expected: "" },
      { name: "one run", args: ["zzzz"], expected: "z4" }
    ],
    hints: ["Flush a group when the character changes.", "Remember to flush the final group after the loop."],
    solution: "Track the active character and count, append to a list when the run ends, then join.",
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "merge-sorted-unique",
    chapterId: "arrays-strings",
    title: "Merge Sorted Unique",
    difficulty: "easy",
    patterns: ["merge", "dedupe"],
    entrypoint: "merge_sorted_unique",
    signature: "a, b",
    prompt: "Merge two sorted integer arrays into one sorted array with duplicate values removed.",
    visibleTests: [
      { name: "overlap", args: [[1, 2, 4], [2, 3, 4, 5]], expected: [1, 2, 3, 4, 5] },
      { name: "one empty", args: [[], [1, 1, 2]], expected: [1, 2] }
    ],
    hiddenTests: [
      { name: "both empty", args: [[], []], expected: [] },
      { name: "duplicates inside", args: [[1, 1, 1], [1, 2, 2]], expected: [1, 2] }
    ],
    hints: ["This resembles the merge step of merge sort.", "Only append a value if it differs from the last appended value."],
    solution: "Walk both arrays with two indexes and append the smaller next value when it is not already last in the answer.",
    time: "O(n + m)",
    space: "O(n + m)"
  },
  {
    id: "minimum-average-gap",
    chapterId: "arrays-strings",
    title: "Minimum Average Gap",
    difficulty: "medium",
    patterns: ["prefix sum", "averages"],
    entrypoint: "minimum_average_gap_index",
    signature: "nums",
    prompt: "For every split after index `i`, compare the floor average of `nums[:i+1]` with the floor average of `nums[i+1:]`. Return the index with the smallest absolute gap. Empty right side has average 0.",
    visibleTests: [
      { name: "middle", args: [[2, 5, 3, 9, 5]], expected: 3 },
      { name: "single", args: [[7]], expected: 0 }
    ],
    hiddenTests: [
      { name: "tie earliest", args: [[1, 1, 1]], expected: 0 },
      { name: "falling", args: [[10, 1, 1, 1]], expected: 2 }
    ],
    hints: ["Total sum gives the right side once you know the left sum.", "Integer floor division is expected."],
    solution: "Keep a prefix sum, compute both averages at each index, and preserve the earliest index for equal gaps.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "product-except-self-local",
    chapterId: "arrays-strings",
    title: "Product Except Self Local",
    difficulty: "medium",
    patterns: ["prefix product", "suffix product"],
    entrypoint: "product_except_self_local",
    signature: "nums",
    prompt: "Return an array where each position contains the product of every input value except the value at that position. Do not use division.",
    visibleTests: [
      { name: "basic", args: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
      { name: "contains zero", args: [[0, 2, 3]], expected: [6, 0, 0] }
    ],
    hiddenTests: [
      { name: "single", args: [[9]], expected: [1] },
      { name: "negative", args: [[-1, 2, -3]], expected: [-6, 3, -2] }
    ],
    hints: ["A left product and right product meet at each index.", "You can write left products into the answer, then multiply by a running suffix."],
    solution: "Build prefix products in the output array, then scan from right with a suffix product.",
    time: "O(n)",
    space: "O(1) extra"
  },
  {
    id: "longest-balanced-prefix",
    chapterId: "arrays-strings",
    title: "Longest Balanced Prefix",
    difficulty: "easy",
    patterns: ["string scan", "counter"],
    entrypoint: "longest_balanced_prefix",
    signature: "text",
    prompt: "The string contains only `A` and `B`. Return the length of the longest prefix with the same number of `A` and `B` characters.",
    visibleTests: [
      { name: "balanced early", args: ["AABBBA"], expected: 6 },
      { name: "never", args: ["AAA"], expected: 0 }
    ],
    hiddenTests: [
      { name: "whole string", args: ["ABBA"], expected: 4 },
      { name: "empty", args: [""], expected: 0 }
    ],
    hints: ["Treat `A` as +1 and `B` as -1.", "A prefix is balanced when the running score returns to zero."],
    solution: "Scan with a running balance and update the answer each time it is zero.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "closest-pair-sum",
    chapterId: "two-pointers-sliding-window",
    title: "Closest Pair Sum",
    difficulty: "medium",
    patterns: ["opposite pointers", "sorted array"],
    entrypoint: "closest_pair_sum",
    signature: "nums, target",
    prompt: "Given a sorted array, return the sum of two distinct values whose sum is closest to `target`. If there is a tie, return the smaller sum.",
    visibleTests: [
      { name: "near target", args: [[1, 4, 6, 8], 11], expected: 10 },
      { name: "exact", args: [[2, 3, 5], 8], expected: 8 }
    ],
    hiddenTests: [
      { name: "tie smaller", args: [[1, 2, 8, 9], 10], expected: 10 },
      { name: "negative", args: [[-5, -2, 7, 10], 3], expected: 2 }
    ],
    hints: ["The array is sorted, so a low plus high pointer gives direction.", "Move the left pointer to increase the sum, right pointer to decrease it."],
    solution: "Evaluate `nums[left] + nums[right]`, track closest, and move the pointer that can improve direction.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "trim-adjacent-pairs",
    chapterId: "two-pointers-sliding-window",
    title: "Trim Adjacent Pairs",
    difficulty: "easy",
    patterns: ["stack as output", "string cleanup"],
    entrypoint: "trim_adjacent_pairs",
    signature: "text",
    prompt: "Repeatedly remove adjacent equal character pairs. Return the final string after no adjacent equal pair remains.",
    visibleTests: [
      { name: "cascade", args: ["abbaca"], expected: "ca" },
      { name: "none", args: ["abc"], expected: "abc" }
    ],
    hiddenTests: [
      { name: "all removed", args: ["aabb"], expected: "" },
      { name: "nested", args: ["azxxzy"], expected: "ay" }
    ],
    hints: ["The most recent kept character is the only one that can pair with the new character.", "Use a list as a stack."],
    solution: "Push characters unless they match the stack top; in that case pop the stack top.",
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "max-sum-under-limit",
    chapterId: "two-pointers-sliding-window",
    title: "Max Sum Under Limit",
    difficulty: "medium",
    patterns: ["variable window", "positive numbers"],
    entrypoint: "max_sum_under_limit",
    signature: "nums, limit",
    prompt: "All numbers are positive. Return the largest sum of any contiguous subarray with sum less than or equal to `limit`.",
    visibleTests: [
      { name: "shrink needed", args: [[2, 1, 5, 2, 3], 7], expected: 7 },
      { name: "all too large", args: [[9, 10], 5], expected: 0 }
    ],
    hiddenTests: [
      { name: "whole array", args: [[1, 2, 3], 10], expected: 6 },
      { name: "single best", args: [[4, 8, 1], 8], expected: 8 }
    ],
    hints: ["Positive numbers make the window sum monotonic as the right side expands.", "Shrink from the left while the sum is too large."],
    solution: "Use a variable window with a running sum and update the best valid sum after restoring validity.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "longest-with-flips",
    chapterId: "two-pointers-sliding-window",
    title: "Longest With Flips",
    difficulty: "medium",
    patterns: ["sliding window", "at most k"],
    entrypoint: "longest_with_flips",
    signature: "bits, k",
    prompt: "Given a binary array, return the longest contiguous length that can become all 1s after flipping at most `k` zeroes.",
    visibleTests: [
      { name: "two flips", args: [[1, 0, 1, 0, 1, 1, 0], 2], expected: 6 },
      { name: "no flips", args: [[1, 1, 0, 1], 0], expected: 2 }
    ],
    hiddenTests: [
      { name: "all zero", args: [[0, 0, 0], 1], expected: 1 },
      { name: "all one", args: [[1, 1, 1], 2], expected: 3 }
    ],
    hints: ["The broken condition is having more than `k` zeroes.", "Track how many zeroes are currently inside the window."],
    solution: "Expand right, count zeroes, shrink left until zeroes <= k, and track maximum width.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "palindrome-edge-score",
    chapterId: "two-pointers-sliding-window",
    title: "Palindrome Edge Score",
    difficulty: "easy",
    patterns: ["two pointers", "palindrome"],
    entrypoint: "palindrome_edge_score",
    signature: "text",
    prompt: "Compare characters from both ends while they match. Return how many matching pairs are consumed before the first mismatch. A center character does not count as a pair.",
    visibleTests: [
      { name: "three pairs", args: ["abccba"], expected: 3 },
      { name: "one pair", args: ["abca"], expected: 1 }
    ],
    hiddenTests: [
      { name: "none", args: ["road"], expected: 0 },
      { name: "odd", args: ["level"], expected: 2 }
    ],
    hints: ["Start one pointer at each end.", "Stop when pointers cross or the characters differ."],
    solution: "Move inward while `text[left] == text[right]` and count pairs.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "sorted-squares-local",
    chapterId: "two-pointers-sliding-window",
    title: "Sorted Squares Local",
    difficulty: "easy",
    patterns: ["two pointers", "sorted output"],
    entrypoint: "sorted_squares_local",
    signature: "nums",
    prompt: "Given a nondecreasing integer array, return a nondecreasing array of the squares.",
    visibleTests: [
      { name: "mixed", args: [[-4, -1, 0, 3]], expected: [0, 1, 9, 16] },
      { name: "positive", args: [[1, 2, 3]], expected: [1, 4, 9] }
    ],
    hiddenTests: [
      { name: "negative", args: [[-5, -3, -1]], expected: [1, 9, 25] },
      { name: "empty", args: [[]], expected: [] }
    ],
    hints: ["The largest square is at one of the ends.", "Fill the answer from right to left."],
    solution: "Compare absolute values at both ends, write the larger square at the end of the output, and move inward.",
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "pairable-remainders",
    chapterId: "hashing",
    title: "Pairable Remainders",
    difficulty: "medium",
    patterns: ["hash counts", "modulo"],
    entrypoint: "pairable_remainders",
    signature: "nums, k",
    prompt: "Return true if the numbers can be split into pairs where each pair sum is divisible by `k`.",
    visibleTests: [
      { name: "pairable", args: [[1, 5, 9, 3], 6], expected: true },
      { name: "not pairable", args: [[1, 2, 3], 3], expected: false }
    ],
    hiddenTests: [
      { name: "zero remainder", args: [[2, 4, 6, 8], 2], expected: true },
      { name: "negative", args: [[-1, 1, 2, 4], 3], expected: true }
    ],
    hints: ["A remainder `r` must pair with `k - r`.", "Remainder 0 and, for even k, k/2 need even counts."],
    solution: "Count remainders and verify complement counts, handling self-complement remainders specially.",
    time: "O(n + k)",
    space: "O(k)"
  },
  {
    id: "first-unique-token",
    chapterId: "hashing",
    title: "First Unique Token",
    difficulty: "easy",
    patterns: ["frequency map", "stable order"],
    entrypoint: "first_unique_token",
    signature: "tokens",
    prompt: "Return the first string that appears exactly once in the input list. Return an empty string if none exists.",
    visibleTests: [
      { name: "middle unique", args: [["go", "to", "go", "run"]], expected: "to" },
      { name: "none", args: [["a", "a"]], expected: "" }
    ],
    hiddenTests: [
      { name: "first", args: [["x", "y", "y"]], expected: "x" },
      { name: "empty", args: [[]], expected: "" }
    ],
    hints: ["Count first, decide second.", "The second pass preserves original order."],
    solution: "Build a frequency dictionary, then scan tokens and return the first with count 1.",
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "anagram-bucket-sizes",
    chapterId: "hashing",
    title: "Anagram Bucket Sizes",
    difficulty: "medium",
    patterns: ["canonical key", "grouping"],
    entrypoint: "anagram_bucket_sizes",
    signature: "words",
    prompt: "Group words by sorted-letter signature and return the bucket sizes sorted from smallest to largest.",
    visibleTests: [
      { name: "two buckets", args: [["tea", "eat", "tan", "ate"]], expected: [1, 3] },
      { name: "empty", args: [[]], expected: [] }
    ],
    hiddenTests: [
      { name: "all unique", args: [["ab", "cd", "ef"]], expected: [1, 1, 1] },
      { name: "one bucket", args: [["abc", "bca", "cab"]], expected: [3] }
    ],
    hints: ["The exact words do not need to be returned.", "A sorted string is a stable anagram key."],
    solution: "Count words per sorted-character key and sort the resulting counts.",
    time: "O(n * m log m)",
    space: "O(n * m)"
  },
  {
    id: "longest-distinct-span",
    chapterId: "hashing",
    title: "Longest Distinct Span",
    difficulty: "medium",
    patterns: ["sliding window", "last seen map"],
    entrypoint: "longest_distinct_span",
    signature: "text",
    prompt: "Return the length of the longest substring with no repeated characters.",
    visibleTests: [
      { name: "repeat", args: ["pwwkew"], expected: 3 },
      { name: "all same", args: ["aaaa"], expected: 1 }
    ],
    hiddenTests: [
      { name: "empty", args: [""], expected: 0 },
      { name: "all distinct", args: ["abcdef"], expected: 6 }
    ],
    hints: ["Remember the most recent index for each character.", "Move the left boundary past the previous copy."],
    solution: "Keep a last-seen dictionary and a left boundary that never moves backward.",
    time: "O(n)",
    space: "O(k)"
  },
  {
    id: "count-target-sum-subarrays",
    chapterId: "hashing",
    title: "Count Target Sum Subarrays",
    difficulty: "medium",
    patterns: ["prefix sum", "hash counts"],
    entrypoint: "count_target_sum_subarrays",
    signature: "nums, target",
    prompt: "Return how many contiguous subarrays have sum exactly equal to `target`.",
    visibleTests: [
      { name: "three", args: [[1, 2, 1, 2, 1], 3], expected: 4 },
      { name: "with zero", args: [[0, 0], 0], expected: 3 }
    ],
    hiddenTests: [
      { name: "negative", args: [[3, -1, -2, 5], 2], expected: 2 },
      { name: "none", args: [[5, 6], 1], expected: 0 }
    ],
    hints: ["If current prefix is `p`, a previous prefix `p - target` forms a valid subarray.", "Count how often each prefix sum has occurred."],
    solution: "Initialize prefix count `{0: 1}`, scan, and add the count of `prefix - target` before storing the current prefix.",
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "common-customers",
    chapterId: "hashing",
    title: "Common Customers",
    difficulty: "easy",
    patterns: ["set intersection"],
    entrypoint: "common_customers",
    signature: "morning, evening",
    prompt: "Return the number of distinct customer ids that appear in both the morning and evening lists.",
    visibleTests: [
      { name: "overlap", args: [[1, 2, 2, 3], [3, 3, 4, 1]], expected: 2 },
      { name: "none", args: [[1], [2]], expected: 0 }
    ],
    hiddenTests: [
      { name: "duplicates", args: [[5, 5, 5], [5]], expected: 1 },
      { name: "empty", args: [[], [1, 2]], expected: 0 }
    ],
    hints: ["Distinct means duplicates do not increase the count.", "Convert both lists to sets."],
    solution: "The answer is the size of the intersection of the two id sets.",
    time: "O(n + m)",
    space: "O(n + m)"
  },
  {
    id: "list-sum",
    chapterId: "linked-lists",
    title: "List Sum",
    difficulty: "warmup",
    patterns: ["linked-list traversal"],
    entrypoint: "list_sum",
    signature: "head",
    adapter: "linked-list",
    prompt: "Given the head of a singly linked list of integers, return the sum of its values.",
    visibleTests: [
      { name: "three nodes", args: [[4, 1, 7]], expected: 12 },
      { name: "empty", args: [[]], expected: 0 }
    ],
    hiddenTests: [
      { name: "negative", args: [[-2, 5]], expected: 3 },
      { name: "single", args: [[9]], expected: 9 }
    ],
    hints: ["Walk with a `curr` pointer.", "Stop when `curr` is `None`."],
    solution: "Accumulate `curr.val` while advancing `curr = curr.next`.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "remove-list-value",
    chapterId: "linked-lists",
    title: "Remove List Value",
    difficulty: "easy",
    patterns: ["dummy head", "pointer rewiring"],
    entrypoint: "remove_list_value",
    signature: "head, target",
    adapter: "linked-list",
    prompt: "Remove every node whose value equals `target` and return the new head.",
    visibleTests: [
      { name: "remove middle and head", args: [[2, 1, 2, 3], 2], expected: [1, 3] },
      { name: "remove none", args: [[1, 2], 9], expected: [1, 2] }
    ],
    hiddenTests: [
      { name: "all removed", args: [[5, 5], 5], expected: [] },
      { name: "empty", args: [[], 1], expected: [] }
    ],
    hints: ["A dummy node avoids special handling when the head is removed.", "Only advance `prev` when you keep the current node."],
    solution: "Use a sentinel before the head and rewire `prev.next` around matching nodes.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "middle-list-value",
    chapterId: "linked-lists",
    title: "Middle List Value",
    difficulty: "easy",
    patterns: ["fast and slow pointers"],
    entrypoint: "middle_list_value",
    signature: "head",
    adapter: "linked-list",
    prompt: "Return the value of the middle node. For an even-length list, return the second middle value. Return `None` for an empty list.",
    visibleTests: [
      { name: "odd", args: [[1, 2, 3]], expected: 2 },
      { name: "even", args: [[1, 2, 3, 4]], expected: 3 }
    ],
    hiddenTests: [
      { name: "single", args: [[8]], expected: 8 },
      { name: "empty", args: [[]], expected: null }
    ],
    hints: ["Move one pointer one step and the other two steps.", "When the fast pointer ends, the slow pointer is in the middle."],
    solution: "Advance `slow` by one and `fast` by two until fast cannot move.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "merge-two-linked-lists",
    chapterId: "linked-lists",
    title: "Merge Two Linked Lists",
    difficulty: "medium",
    patterns: ["merge", "dummy head"],
    entrypoint: "merge_two_linked_lists",
    signature: "a, b",
    adapter: "linked-list",
    prompt: "Merge two sorted linked lists and return the head of one sorted linked list containing all nodes. Creating new nodes is allowed.",
    visibleTests: [
      { name: "interleaved", args: [[1, 3, 5], [2, 4]], expected: [1, 2, 3, 4, 5] },
      { name: "one empty", args: [[], [1, 2]], expected: [1, 2] }
    ],
    hiddenTests: [
      { name: "duplicates", args: [[1, 1], [1]], expected: [1, 1, 1] },
      { name: "both empty", args: [[], []], expected: [] }
    ],
    hints: ["Use a tail pointer on a result list.", "Append the smaller current value and advance that list."],
    solution: "Use a dummy head, repeatedly attach the smaller node, then attach the remaining suffix.",
    time: "O(n + m)",
    space: "O(1) if reusing nodes"
  },
  {
    id: "palindrome-linked-list-local",
    chapterId: "linked-lists",
    title: "Palindrome Linked List Local",
    difficulty: "medium",
    patterns: ["linked-list traversal", "palindrome"],
    entrypoint: "palindrome_linked_list_local",
    signature: "head",
    adapter: "linked-list",
    prompt: "Return true if the linked list values read the same forward and backward.",
    visibleTests: [
      { name: "palindrome", args: [[1, 2, 2, 1]], expected: true },
      { name: "not", args: [[1, 2, 3]], expected: false }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: true },
      { name: "odd", args: [[1, 2, 1]], expected: true }
    ],
    hints: ["The simplest approach is to copy values into an array.", "Then compare from both ends."],
    solution: "Collect values while traversing the list and compare the list of values with its reverse.",
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "balanced-brackets-local",
    chapterId: "stacks-queues",
    title: "Balanced Brackets Local",
    difficulty: "easy",
    patterns: ["stack", "parsing"],
    entrypoint: "balanced_brackets_local",
    signature: "text",
    prompt: "Return true if every bracket in the string is balanced and correctly nested. Bracket types are `()`, `[]`, and `{}`.",
    visibleTests: [
      { name: "balanced", args: ["([]{})"], expected: true },
      { name: "wrong order", args: ["([)]"], expected: false }
    ],
    hiddenTests: [
      { name: "extra opener", args: ["((())"], expected: false },
      { name: "plain", args: [""], expected: true }
    ],
    hints: ["Push opening brackets.", "A closing bracket must match the most recent opening bracket."],
    solution: "Use a stack of openers and a map from closer to required opener.",
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "warmer-day-waits",
    chapterId: "stacks-queues",
    title: "Warmer Day Waits",
    difficulty: "medium",
    patterns: ["monotonic stack", "next greater"],
    entrypoint: "warmer_day_waits",
    signature: "temps",
    prompt: "For each temperature, return how many days must pass before a warmer temperature. Use 0 if none occurs.",
    visibleTests: [
      { name: "classic", args: [[70, 71, 69, 72]], expected: [1, 2, 1, 0] },
      { name: "decreasing", args: [[5, 4, 3]], expected: [0, 0, 0] }
    ],
    hiddenTests: [
      { name: "equal not warmer", args: [[5, 5, 6]], expected: [2, 1, 0] },
      { name: "empty", args: [[]], expected: [] }
    ],
    hints: ["Keep indexes whose answer is not known yet.", "A warmer current day resolves colder previous days."],
    solution: "Maintain a decreasing stack of indexes; pop while current temp is greater and fill distances.",
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "simplify-folder-steps",
    chapterId: "stacks-queues",
    title: "Simplify Folder Steps",
    difficulty: "easy",
    patterns: ["stack", "simulation"],
    entrypoint: "simplify_folder_steps",
    signature: "steps",
    prompt: "Given folder steps where `..` means move up, `.` means stay, and any other token is a folder name, return the simplified absolute path beginning with `/`.",
    visibleTests: [
      { name: "mixed", args: [["home", ".", "code", "..", "docs"]], expected: "/home/docs" },
      { name: "above root", args: [["..", "..", "x"]], expected: "/x" }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: "/" },
      { name: "all removed", args: [["a", ".."]], expected: "/" }
    ],
    hints: ["Folder names push onto a stack.", "`..` pops only if a folder exists."],
    solution: "Simulate the path with a stack, ignore `.`, pop for `..`, and join with slashes.",
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "recent-event-counts",
    chapterId: "stacks-queues",
    title: "Recent Event Counts",
    difficulty: "medium",
    patterns: ["queue", "sliding time window"],
    entrypoint: "recent_event_counts",
    signature: "events, window",
    prompt: "Event timestamps arrive sorted. For each timestamp, return how many events are in the inclusive range `[timestamp - window, timestamp]`.",
    visibleTests: [
      { name: "small", args: [[1, 3, 8, 10], 5], expected: [1, 2, 2, 2] },
      { name: "window zero", args: [[2, 2, 3], 0], expected: [1, 2, 1] }
    ],
    hiddenTests: [
      { name: "empty", args: [[], 10], expected: [] },
      { name: "wide", args: [[1, 2, 3], 100], expected: [1, 2, 3] }
    ],
    hints: ["A queue stores only timestamps still in range.", "Remove timestamps less than `current - window`."],
    solution: "Append each event and pop from the left while it is too old; record the queue length.",
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "next-greater-values",
    chapterId: "stacks-queues",
    title: "Next Greater Values",
    difficulty: "medium",
    patterns: ["monotonic stack"],
    entrypoint: "next_greater_values",
    signature: "nums",
    prompt: "For each value, return the next value to its right that is strictly greater. Use -1 when none exists.",
    visibleTests: [
      { name: "mixed", args: [[2, 1, 3, 2]], expected: [3, 3, -1, -1] },
      { name: "increasing", args: [[1, 2, 3]], expected: [2, 3, -1] }
    ],
    hiddenTests: [
      { name: "decreasing", args: [[3, 2, 1]], expected: [-1, -1, -1] },
      { name: "duplicates", args: [[2, 2, 3]], expected: [3, 3, -1] }
    ],
    hints: ["Store indexes waiting for a greater value.", "The current number resolves smaller stack values."],
    solution: "Use a decreasing stack of indexes and fill answers when a greater current value appears.",
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "tree-max-depth-local",
    chapterId: "trees-graphs",
    title: "Tree Max Depth Local",
    difficulty: "easy",
    patterns: ["tree DFS", "recursion"],
    entrypoint: "tree_max_depth_local",
    signature: "root",
    adapter: "binary-tree",
    prompt: "Given a binary tree, return its maximum depth. An empty tree has depth 0.",
    visibleTests: [
      { name: "balanced", args: [[3, 9, 20, null, null, 15, 7]], expected: 3 },
      { name: "empty", args: [[]], expected: 0 }
    ],
    hiddenTests: [
      { name: "single", args: [[1]], expected: 1 },
      { name: "chain", args: [[1, 2, null, 3]], expected: 3 }
    ],
    hints: ["Depth is one plus the deeper child depth.", "The base case for `None` is 0."],
    solution: "Return `0` for no node, otherwise `1 + max(depth(left), depth(right))`.",
    time: "O(n)",
    space: "O(h)"
  },
  {
    id: "tree-level-sums",
    chapterId: "trees-graphs",
    title: "Tree Level Sums",
    difficulty: "medium",
    patterns: ["tree BFS", "queue"],
    entrypoint: "tree_level_sums",
    signature: "root",
    adapter: "binary-tree",
    prompt: "Return a list where each value is the sum of all tree node values at that depth, from root level downward.",
    visibleTests: [
      { name: "three levels", args: [[1, 2, 3, 4, null, null, 5]], expected: [1, 5, 9] },
      { name: "empty", args: [[]], expected: [] }
    ],
    hiddenTests: [
      { name: "single", args: [[7]], expected: [7] },
      { name: "negative", args: [[1, -2, 3]], expected: [1, 1] }
    ],
    hints: ["Process the queue one level at a time.", "The current queue length tells you how many nodes are in the level."],
    solution: "Use BFS, sum each level, and enqueue children for the next level.",
    time: "O(n)",
    space: "O(w)"
  },
  {
    id: "tree-has-path-sum-local",
    chapterId: "trees-graphs",
    title: "Tree Has Path Sum Local",
    difficulty: "easy",
    patterns: ["tree DFS", "path state"],
    entrypoint: "tree_has_path_sum_local",
    signature: "root, target",
    adapter: "binary-tree",
    prompt: "Return true if the tree has a root-to-leaf path whose node values sum to `target`.",
    visibleTests: [
      { name: "exists", args: [[5, 4, 8, 11, null, 13, 4, 7, 2], 22], expected: true },
      { name: "missing", args: [[1, 2, 3], 5], expected: false }
    ],
    hiddenTests: [
      { name: "empty", args: [[], 0], expected: false },
      { name: "single", args: [[1], 1], expected: true }
    ],
    hints: ["Subtract the current value as you descend.", "Only accept at a leaf."],
    solution: "DFS with remaining sum; a leaf is valid when `remaining == node.val`.",
    time: "O(n)",
    space: "O(h)"
  },
  {
    id: "count-grid-islands",
    chapterId: "trees-graphs",
    title: "Count Grid Islands",
    difficulty: "medium",
    patterns: ["grid DFS", "visited"],
    entrypoint: "count_grid_islands",
    signature: "grid",
    adapter: "grid",
    prompt: "A grid contains 1 for land and 0 for water. Count 4-directionally connected land masses.",
    visibleTests: [
      { name: "three islands", args: [[ [1, 1, 0], [0, 0, 1], [1, 0, 1] ]], expected: 3 },
      { name: "none", args: [[[0, 0], [0, 0]]], expected: 0 }
    ],
    hiddenTests: [
      { name: "one", args: [[[1, 1], [1, 1]]], expected: 1 },
      { name: "empty", args: [[]], expected: 0 }
    ],
    hints: ["When you find unvisited land, that starts one island.", "DFS or BFS should mark the whole island visited."],
    solution: "Scan cells, launch a flood fill from each unvisited land cell, and count launches.",
    time: "O(r * c)",
    space: "O(r * c)"
  },
  {
    id: "shortest-edge-path",
    chapterId: "trees-graphs",
    title: "Shortest Edge Path",
    difficulty: "medium",
    patterns: ["graph BFS", "adjacency list"],
    entrypoint: "shortest_edge_path",
    signature: "n, edges, start, goal",
    adapter: "graph",
    prompt: "Given an undirected graph with nodes `0..n-1`, return the number of edges in the shortest path from `start` to `goal`, or -1 if unreachable.",
    visibleTests: [
      { name: "reachable", args: [5, [[0, 1], [1, 2], [0, 3], [3, 4], [4, 2]], 0, 2], expected: 2 },
      { name: "unreachable", args: [4, [[0, 1]], 0, 3], expected: -1 }
    ],
    hiddenTests: [
      { name: "same", args: [3, [], 1, 1], expected: 0 },
      { name: "direct", args: [2, [[0, 1]], 1, 0], expected: 1 }
    ],
    hints: ["BFS explores by distance in an unweighted graph.", "Store distance with the node or track levels."],
    solution: "Build an adjacency list and BFS from start until goal is found.",
    time: "O(n + e)",
    space: "O(n + e)"
  },
  {
    id: "can-finish-local",
    chapterId: "trees-graphs",
    title: "Can Finish Local",
    difficulty: "medium",
    patterns: ["topological sort", "cycle detection"],
    entrypoint: "can_finish_local",
    signature: "n, prerequisites",
    adapter: "graph",
    prompt: "There are `n` courses. Each pair `[course, before]` means `before` must be taken first. Return true if all courses can be completed.",
    visibleTests: [
      { name: "acyclic", args: [3, [[1, 0], [2, 1]]], expected: true },
      { name: "cycle", args: [2, [[0, 1], [1, 0]]], expected: false }
    ],
    hiddenTests: [
      { name: "none", args: [4, []], expected: true },
      { name: "diamond", args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: true }
    ],
    hints: ["A cycle blocks completion.", "Kahn's algorithm removes nodes with indegree zero."],
    solution: "Build indegrees and adjacency, process zero-indegree courses, and verify all courses are processed.",
    time: "O(n + e)",
    space: "O(n + e)"
  },
  {
    id: "connected-component-count",
    chapterId: "trees-graphs",
    title: "Connected Component Count",
    difficulty: "easy",
    patterns: ["graph DFS", "visited"],
    entrypoint: "connected_component_count",
    signature: "n, edges",
    adapter: "graph",
    prompt: "Return the number of connected components in an undirected graph with nodes `0..n-1`.",
    visibleTests: [
      { name: "two", args: [5, [[0, 1], [1, 2], [3, 4]]], expected: 2 },
      { name: "isolated", args: [3, []], expected: 3 }
    ],
    hiddenTests: [
      { name: "one", args: [4, [[0, 1], [1, 2], [2, 3]]], expected: 1 },
      { name: "empty graph", args: [0, []], expected: 0 }
    ],
    hints: ["Each DFS/BFS launch from an unvisited node finds one component.", "Remember isolated nodes."],
    solution: "Build adjacency, scan all nodes, and count traversals that start from unvisited nodes.",
    time: "O(n + e)",
    space: "O(n + e)"
  },
  {
    id: "top-k-scores",
    chapterId: "heaps",
    title: "Top K Scores",
    difficulty: "easy",
    patterns: ["heap", "top k"],
    entrypoint: "top_k_scores",
    signature: "scores, k",
    adapter: "heap",
    prompt: "Return the `k` largest scores in descending order. If `k` exceeds the number of scores, return all scores descending.",
    visibleTests: [
      { name: "three", args: [[4, 9, 1, 7], 2], expected: [9, 7] },
      { name: "k large", args: [[3, 1], 5], expected: [3, 1] }
    ],
    hiddenTests: [
      { name: "duplicates", args: [[5, 5, 2], 2], expected: [5, 5] },
      { name: "empty", args: [[], 3], expected: [] }
    ],
    hints: ["Python has `heapq.nlargest`.", "A size-k min heap also works."],
    solution: "Use a heap selection routine or keep a min heap of the best k values, then sort descending.",
    time: "O(n log k)",
    space: "O(k)"
  },
  {
    id: "merge-sorted-batches",
    chapterId: "heaps",
    title: "Merge Sorted Batches",
    difficulty: "medium",
    patterns: ["heap", "k-way merge"],
    entrypoint: "merge_sorted_batches",
    signature: "batches",
    adapter: "heap",
    prompt: "Given a list of sorted integer arrays, merge them into one sorted array.",
    visibleTests: [
      { name: "three batches", args: [[[1, 4], [2, 3], [0, 8]]], expected: [0, 1, 2, 3, 4, 8] },
      { name: "empty batches", args: [[[], [1]]], expected: [1] }
    ],
    hiddenTests: [
      { name: "none", args: [[]], expected: [] },
      { name: "duplicates", args: [[[1, 1], [1]]], expected: [1, 1, 1] }
    ],
    hints: ["The heap should hold the next candidate from each batch.", "When you pop a value, push the next value from the same batch."],
    solution: "Initialize a heap with the first value from each nonempty batch and perform a k-way merge.",
    time: "O(n log k)",
    space: "O(k)"
  },
  {
    id: "k-closest-points-local",
    chapterId: "heaps",
    title: "K Closest Points Local",
    difficulty: "medium",
    patterns: ["heap", "distance"],
    entrypoint: "k_closest_points_local",
    signature: "points, k",
    adapter: "heap",
    prompt: "Return the `k` points closest to the origin, sorted by distance, then x, then y. Distance can be compared using squared distance.",
    visibleTests: [
      { name: "two", args: [[[1, 2], [3, 4], [0, 2]], 2], expected: [[0, 2], [1, 2]] },
      { name: "k zero", args: [[[1, 1]], 0], expected: [] }
    ],
    hiddenTests: [
      { name: "tie", args: [[[1, 0], [0, 1], [2, 0]], 2], expected: [[0, 1], [1, 0]] },
      { name: "all", args: [[[-1, -1]], 5], expected: [[-1, -1]] }
    ],
    hints: ["Squared distance avoids square roots.", "Sort output deterministically even if you use a heap internally."],
    solution: "Select by `(x*x + y*y, x, y)` and return the first k points in that order.",
    time: "O(n log n) or O(n log k)",
    space: "O(n) or O(k)"
  },
  {
    id: "running-medians-local",
    chapterId: "heaps",
    title: "Running Medians Local",
    difficulty: "hard",
    patterns: ["two heaps", "streaming"],
    entrypoint: "running_medians_local",
    signature: "nums",
    adapter: "heap",
    prompt: "After each inserted number, return the median of all numbers seen so far. Use floats for even counts.",
    visibleTests: [
      { name: "stream", args: [[2, 1, 5, 7]], expected: [2, 1.5, 2, 3.5] },
      { name: "single", args: [[4]], expected: [4] }
    ],
    hiddenTests: [
      { name: "duplicates", args: [[1, 1, 1]], expected: [1, 1, 1] },
      { name: "negative", args: [[-1, -2, -3]], expected: [-1, -1.5, -2] }
    ],
    hints: ["Use a max heap for the lower half and a min heap for the upper half.", "Keep heap sizes balanced by at most one."],
    solution: "Maintain two heaps, rebalance after each insertion, and read the median from heap tops.",
    time: "O(n log n)",
    space: "O(n)"
  },
  {
    id: "combine-until-target",
    chapterId: "heaps",
    title: "Combine Until Target",
    difficulty: "medium",
    patterns: ["min heap", "simulation"],
    entrypoint: "combine_until_target",
    signature: "values, target",
    adapter: "heap",
    prompt: "Repeatedly combine the two smallest values into `small + 2 * large` until every value is at least `target`. Return the number of combines, or -1 if impossible.",
    visibleTests: [
      { name: "possible", args: [[1, 2, 3, 9], 7], expected: 2 },
      { name: "already", args: [[8, 9], 7], expected: 0 }
    ],
    hiddenTests: [
      { name: "impossible", args: [[1], 10], expected: -1 },
      { name: "empty", args: [[], 1], expected: -1 }
    ],
    hints: ["The next combine should always use the two smallest values.", "A min heap makes the repeated minimum operation efficient."],
    solution: "Heapify values, pop two smallest while the minimum is below target, push the combined value, and count operations.",
    time: "O(n log n)",
    space: "O(n)"
  },
  {
    id: "max-compatible-meetings",
    chapterId: "greedy",
    title: "Max Compatible Meetings",
    difficulty: "medium",
    patterns: ["interval greedy", "sorting"],
    entrypoint: "max_compatible_meetings",
    signature: "intervals",
    prompt: "Given intervals `[start, end]`, return the maximum number of non-overlapping meetings. A meeting ending at time `t` is compatible with one starting at `t`.",
    visibleTests: [
      { name: "choose three", args: [[[1, 3], [2, 4], [3, 5], [5, 6]]], expected: 3 },
      { name: "empty", args: [[]], expected: 0 }
    ],
    hiddenTests: [
      { name: "nested", args: [[[1, 10], [2, 3], [3, 4]]], expected: 2 },
      { name: "same end", args: [[[1, 2], [0, 2], [2, 3]]], expected: 2 }
    ],
    hints: ["The meeting that ends earliest leaves the most room.", "Sort by end time."],
    solution: "Sort intervals by end time and greedily take each interval whose start is at least the last selected end.",
    time: "O(n log n)",
    space: "O(1) extra"
  },
  {
    id: "assign-snacks",
    chapterId: "greedy",
    title: "Assign Snacks",
    difficulty: "easy",
    patterns: ["two sorted lists", "greedy matching"],
    entrypoint: "assign_snacks",
    signature: "appetites, snacks",
    prompt: "Each child needs a snack size at least their appetite. Each snack can be used once. Return the maximum satisfied children.",
    visibleTests: [
      { name: "two satisfied", args: [[1, 2, 3], [1, 1, 3]], expected: 2 },
      { name: "none", args: [[5], [1, 2]], expected: 0 }
    ],
    hiddenTests: [
      { name: "all", args: [[1, 2], [2, 3]], expected: 2 },
      { name: "empty", args: [[], [1]], expected: 0 }
    ],
    hints: ["Sort both lists.", "Give the smallest usable snack to the least hungry remaining child."],
    solution: "Sort appetites and snacks, then greedily match with two pointers.",
    time: "O(n log n + m log m)",
    space: "O(1) extra"
  },
  {
    id: "largest-one-swap",
    chapterId: "greedy",
    title: "Largest One Swap",
    difficulty: "medium",
    patterns: ["greedy", "digits"],
    entrypoint: "largest_one_swap",
    signature: "digits",
    prompt: "Given a string of digits, return the largest string obtainable by at most one swap of two positions.",
    visibleTests: [
      { name: "improve", args: ["2736"], expected: "7236" },
      { name: "already", args: ["987"], expected: "987" }
    ],
    hiddenTests: [
      { name: "duplicate best", args: ["1993"], expected: "9913" },
      { name: "single", args: ["5"], expected: "5" }
    ],
    hints: ["A better digit should move as far left as possible.", "When multiple equal best digits exist, swap with the rightmost one."],
    solution: "Record last positions of digits, then scan left to right looking for a larger digit available to the right.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "can-reach-end-local",
    chapterId: "greedy",
    title: "Can Reach End Local",
    difficulty: "easy",
    patterns: ["greedy reach", "array"],
    entrypoint: "can_reach_end_local",
    signature: "jumps",
    prompt: "Each value is the maximum jump length from that index. Return true if index 0 can reach the final index.",
    visibleTests: [
      { name: "reachable", args: [[2, 3, 1, 0, 4]], expected: true },
      { name: "blocked", args: [[1, 0, 2]], expected: false }
    ],
    hiddenTests: [
      { name: "single", args: [[0]], expected: true },
      { name: "exact", args: [[1, 1, 0]], expected: true }
    ],
    hints: ["Track the farthest reachable index.", "If the current index is beyond that, you are stuck."],
    solution: "Scan while maintaining `farthest = max(farthest, i + jumps[i])`.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "partition-labels-local",
    chapterId: "greedy",
    title: "Partition Labels Local",
    difficulty: "medium",
    patterns: ["greedy partition", "last occurrence"],
    entrypoint: "partition_labels_local",
    signature: "text",
    prompt: "Split the string into as many parts as possible so each character appears in at most one part. Return the part lengths.",
    visibleTests: [
      { name: "classic shape", args: ["abacddc"], expected: [3, 4] },
      { name: "all same", args: ["aaaa"], expected: [4] }
    ],
    hiddenTests: [
      { name: "all separate", args: ["abc"], expected: [1, 1, 1] },
      { name: "empty", args: [""], expected: [] }
    ],
    hints: ["A part must extend to the last occurrence of every character inside it.", "Close a part when the current index reaches the farthest required end."],
    solution: "Precompute last positions, scan while extending current end, and close partitions at the end boundary.",
    time: "O(n)",
    space: "O(k)"
  },
  {
    id: "lower-bound-local",
    chapterId: "binary-search",
    title: "Lower Bound Local",
    difficulty: "easy",
    patterns: ["binary search", "boundary"],
    entrypoint: "lower_bound_local",
    signature: "nums, target",
    prompt: "Return the first index where `target` could be inserted without breaking sorted order.",
    visibleTests: [
      { name: "inside", args: [[1, 3, 3, 7], 3], expected: 1 },
      { name: "end", args: [[1, 2], 5], expected: 2 }
    ],
    hiddenTests: [
      { name: "start", args: [[2, 4], 1], expected: 0 },
      { name: "empty", args: [[], 9], expected: 0 }
    ],
    hints: ["Search for the first index whose value is at least target.", "Use a half-open range `[left, right)`."],
    solution: "Maintain `[left, right)` and move right to mid when `nums[mid] >= target`, else move left past mid.",
    time: "O(log n)",
    space: "O(1)"
  },
  {
    id: "first-day-for-bouquets",
    chapterId: "binary-search",
    title: "First Day For Bouquets",
    difficulty: "medium",
    patterns: ["binary search answer", "feasibility"],
    entrypoint: "first_day_for_bouquets",
    signature: "bloom_days, bouquets, size",
    prompt: "Each flower blooms on its listed day. A bouquet needs `size` adjacent bloomed flowers. Return the earliest day to make `bouquets` bouquets, or -1 if impossible.",
    visibleTests: [
      { name: "day three", args: [[1, 3, 2, 4], 2, 1], expected: 2 },
      { name: "impossible", args: [[1, 2], 2, 2], expected: -1 }
    ],
    hiddenTests: [
      { name: "adjacent needed", args: [[1, 10, 3, 10, 2], 1, 3], expected: 10 },
      { name: "single", args: [[5], 1, 1], expected: 5 }
    ],
    hints: ["The predicate is: can we make enough bouquets by day d?", "That predicate changes from false to true once."],
    solution: "Binary search the day range and count adjacent bloomed groups in the feasibility check.",
    time: "O(n log D)",
    space: "O(1)"
  },
  {
    id: "integer-square-root",
    chapterId: "binary-search",
    title: "Integer Square Root",
    difficulty: "easy",
    patterns: ["binary search", "integer math"],
    entrypoint: "integer_square_root",
    signature: "n",
    prompt: "Return the greatest integer `x` such that `x * x <= n` for non-negative integer `n`.",
    visibleTests: [
      { name: "not perfect", args: [20], expected: 4 },
      { name: "perfect", args: [49], expected: 7 }
    ],
    hiddenTests: [
      { name: "zero", args: [0], expected: 0 },
      { name: "one", args: [1], expected: 1 }
    ],
    hints: ["Search the answer, not an array.", "Avoid floating point."],
    solution: "Binary search integers from 0 to n and keep the largest square that does not exceed n.",
    time: "O(log n)",
    space: "O(1)"
  },
  {
    id: "search-rotated-local",
    chapterId: "binary-search",
    title: "Search Rotated Local",
    difficulty: "medium",
    patterns: ["binary search", "rotated sorted array"],
    entrypoint: "search_rotated_local",
    signature: "nums, target",
    prompt: "Given a sorted array rotated at an unknown pivot with distinct values, return the index of `target`, or -1.",
    visibleTests: [
      { name: "right side", args: [[4, 5, 6, 1, 2, 3], 2], expected: 4 },
      { name: "missing", args: [[4, 5, 1, 2], 3], expected: -1 }
    ],
    hiddenTests: [
      { name: "not rotated", args: [[1, 2, 3], 1], expected: 0 },
      { name: "single", args: [[7], 7], expected: 0 }
    ],
    hints: ["At least one half around mid is sorted.", "Decide whether target lies inside the sorted half."],
    solution: "Binary search while identifying the sorted half and discarding the half that cannot contain target.",
    time: "O(log n)",
    space: "O(1)"
  },
  {
    id: "ship-capacity-local",
    chapterId: "binary-search",
    title: "Ship Capacity Local",
    difficulty: "medium",
    patterns: ["binary search answer", "greedy check"],
    entrypoint: "ship_capacity_local",
    signature: "weights, days",
    prompt: "Packages must ship in order. Return the minimum ship capacity needed to ship all packages within `days` days.",
    visibleTests: [
      { name: "basic", args: [[3, 2, 2, 4, 1], 3], expected: 5 },
      { name: "one day", args: [[1, 2, 3], 1], expected: 6 }
    ],
    hiddenTests: [
      { name: "many days", args: [[5, 1, 1], 5], expected: 5 },
      { name: "single", args: [[9], 2], expected: 9 }
    ],
    hints: ["Capacity must be at least max weight and at most total weight.", "Given a capacity, greedily count needed days."],
    solution: "Binary search capacity and use a linear feasibility check that starts a new day when the current package would overflow.",
    time: "O(n log S)",
    space: "O(1)"
  },
  {
    id: "subsets-lexicographic",
    chapterId: "backtracking",
    title: "Subsets Lexicographic",
    difficulty: "medium",
    patterns: ["backtracking", "subsets"],
    entrypoint: "subsets_lexicographic",
    signature: "nums",
    prompt: "Given distinct integers, return all subsets. Sort the input first and return subsets in DFS order where each subset is copied when visited.",
    visibleTests: [
      { name: "two", args: [[2, 1]], expected: [[], [1], [1, 2], [2]] },
      { name: "empty", args: [[]], expected: [[]] }
    ],
    hiddenTests: [
      { name: "one", args: [[5]], expected: [[], [5]] },
      { name: "three count shape", args: [[1, 2, 3]], expected: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]] }
    ],
    hints: ["At each recursive call, append the current subset to the answer.", "Loop choices from `start` to the end."],
    solution: "Sort nums, run DFS(start), append a copy of path, choose each later number, recurse, and pop.",
    time: "O(n * 2^n)",
    space: "O(n)"
  },
  {
    id: "unique-tile-sequence-count",
    chapterId: "backtracking",
    title: "Unique Tile Sequence Count",
    difficulty: "medium",
    patterns: ["backtracking", "frequency counts"],
    entrypoint: "unique_tile_sequence_count",
    signature: "tiles",
    prompt: "Given a string of uppercase tiles, return how many non-empty sequences can be formed using each tile at most once. Duplicate letters are indistinguishable.",
    visibleTests: [
      { name: "aab", args: ["AAB"], expected: 8 },
      { name: "single", args: ["Z"], expected: 1 }
    ],
    hiddenTests: [
      { name: "duplicates only", args: ["AA"], expected: 2 },
      { name: "empty", args: [""], expected: 0 }
    ],
    hints: ["Count available letters instead of permuting indexes.", "Every time you place a letter, that creates one non-empty sequence."],
    solution: "DFS over letters with positive counts; decrement, count the sequence, recurse, and restore.",
    time: "O(number of generated sequences)",
    space: "O(k)"
  },
  {
    id: "combination-sum-exact-local",
    chapterId: "backtracking",
    title: "Combination Sum Exact Local",
    difficulty: "medium",
    patterns: ["backtracking", "combinations"],
    entrypoint: "combination_sum_exact_local",
    signature: "nums, target",
    prompt: "Return combinations of numbers that sum to `target`. Each number can be used at most once. Input may contain duplicates; output must not contain duplicate combinations.",
    visibleTests: [
      { name: "duplicates", args: [[1, 1, 2, 5], 3], expected: [[1, 2]] },
      { name: "two answers", args: [[2, 3, 6, 7], 9], expected: [[2, 7], [3, 6]] }
    ],
    hiddenTests: [
      { name: "none", args: [[4, 5], 3], expected: [] },
      { name: "exact", args: [[1, 2, 2], 4], expected: [[2, 2]] }
    ],
    hints: ["Sort first.", "Skip equal values at the same recursion depth."],
    solution: "Sort nums, DFS with a start index and remaining target, skip duplicates, and stop when remaining is zero.",
    time: "O(2^n)",
    space: "O(n)"
  },
  {
    id: "generate-parentheses-local",
    chapterId: "backtracking",
    title: "Generate Parentheses Local",
    difficulty: "medium",
    patterns: ["backtracking", "constraints"],
    entrypoint: "generate_parentheses_local",
    signature: "n",
    prompt: "Return all valid strings containing `n` pairs of parentheses in lexicographic order.",
    visibleTests: [
      { name: "two", args: [2], expected: ["(())", "()()"] },
      { name: "one", args: [1], expected: ["()"] }
    ],
    hiddenTests: [
      { name: "zero", args: [0], expected: [""] },
      { name: "three", args: [3], expected: ["((()))", "(()())", "(())()", "()(())", "()()()"] }
    ],
    hints: ["You may add `(` while open count is below n.", "You may add `)` only while it would not exceed opens."],
    solution: "Backtrack with counts of open and closed parentheses and append completed length `2n` strings.",
    time: "O(Catalan(n) * n)",
    space: "O(n)"
  },
  {
    id: "word-path-exists-local",
    chapterId: "backtracking",
    title: "Word Path Exists Local",
    difficulty: "medium",
    patterns: ["grid backtracking", "visited"],
    entrypoint: "word_path_exists_local",
    signature: "board, word",
    adapter: "grid",
    prompt: "Return true if `word` can be formed by moving 4-directionally through adjacent cells without reusing a cell in the same path.",
    visibleTests: [
      { name: "exists", args: [[["A", "B"], ["C", "D"]], "ABD"], expected: true },
      { name: "reuse blocked", args: [[["A", "B"], ["C", "D"]], "ABA"], expected: false }
    ],
    hiddenTests: [
      { name: "single", args: [[["Z"]], "Z"], expected: true },
      { name: "missing", args: [[["A"]], "B"], expected: false }
    ],
    hints: ["Try starting from every matching first character.", "Mark a cell visited before exploring neighbors and unmark it when returning."],
    solution: "Run DFS from each cell with index into the word, temporarily marking cells as used along the active path.",
    time: "O(r * c * 4^L)",
    space: "O(L)"
  },
  {
    id: "climb-with-blocks",
    chapterId: "dynamic-programming",
    title: "Climb With Blocks",
    difficulty: "easy",
    patterns: ["DP count", "1D state"],
    entrypoint: "climb_with_blocks",
    signature: "n, blocks",
    prompt: "You can climb exactly `step` stairs for any value in `blocks`. Return the number of distinct ordered ways to reach stair `n`.",
    visibleTests: [
      { name: "one or two", args: [4, [1, 2]], expected: 5 },
      { name: "exact block", args: [3, [2, 3]], expected: 1 }
    ],
    hiddenTests: [
      { name: "zero", args: [0, [1, 2]], expected: 1 },
      { name: "unreachable", args: [1, [2]], expected: 0 }
    ],
    hints: ["Let `dp[i]` be ways to reach i.", "Each previous stair `i - block` contributes if non-negative."],
    solution: "Initialize `dp[0] = 1` and for every stair sum `dp[i - block]` for valid blocks.",
    time: "O(n * b)",
    space: "O(n)"
  },
  {
    id: "min-cost-steps-local",
    chapterId: "dynamic-programming",
    title: "Min Cost Steps Local",
    difficulty: "easy",
    patterns: ["DP min", "rolling state"],
    entrypoint: "min_cost_steps_local",
    signature: "cost",
    prompt: "You may start at step 0 or 1 and climb one or two steps at a time. Return the minimum cost to move beyond the final step.",
    visibleTests: [
      { name: "choose cheap", args: [[10, 15, 20]], expected: 15 },
      { name: "zigzag", args: [[1, 100, 1, 1]], expected: 2 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "one", args: [[7]], expected: 0 }
    ],
    hints: ["The top is one position after the last index.", "Cost is paid when you stand on a step."],
    solution: "Use DP where reaching step i costs the min of previous one or two states plus the previous step cost.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "max-non-adjacent-local",
    chapterId: "dynamic-programming",
    title: "Max Non Adjacent Local",
    difficulty: "easy",
    patterns: ["DP choice", "rolling state"],
    entrypoint: "max_non_adjacent_local",
    signature: "nums",
    prompt: "Return the maximum sum obtainable by choosing values with no two chosen values adjacent. Choosing no values is allowed.",
    visibleTests: [
      { name: "choose spread", args: [[2, 7, 9, 3]], expected: 11 },
      { name: "all negative", args: [[-5, -1]], expected: 0 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "single", args: [[8]], expected: 8 }
    ],
    hints: ["At each index, choose it or skip it.", "Keep best through previous and through two previous."],
    solution: "Update `take = prev2 + num` and `skip = prev1`, then keep the maximum.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "coin-change-min-local",
    chapterId: "dynamic-programming",
    title: "Coin Change Min Local",
    difficulty: "medium",
    patterns: ["unbounded DP", "minimum"],
    entrypoint: "coin_change_min_local",
    signature: "coins, amount",
    prompt: "Return the fewest coins needed to make `amount`, using each coin value any number of times. Return -1 if impossible.",
    visibleTests: [
      { name: "eleven", args: [[1, 2, 5], 11], expected: 3 },
      { name: "impossible", args: [[2], 3], expected: -1 }
    ],
    hiddenTests: [
      { name: "zero", args: [[1], 0], expected: 0 },
      { name: "exact", args: [[7, 3], 6], expected: 2 }
    ],
    hints: ["Let `dp[x]` be the fewest coins for amount x.", "Initialize unreachable states to a large sentinel."],
    solution: "For each amount from 1 to target, try every coin and take `1 + dp[amount - coin]` when valid.",
    time: "O(amount * c)",
    space: "O(amount)"
  },
  {
    id: "lis-length-local",
    chapterId: "dynamic-programming",
    title: "LIS Length Local",
    difficulty: "medium",
    patterns: ["DP", "binary search optimization"],
    entrypoint: "lis_length_local",
    signature: "nums",
    prompt: "Return the length of the longest strictly increasing subsequence.",
    visibleTests: [
      { name: "mixed", args: [[10, 9, 2, 5, 3, 7]], expected: 3 },
      { name: "decreasing", args: [[5, 4, 3]], expected: 1 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "duplicates", args: [[2, 2, 2]], expected: 1 }
    ],
    hints: ["The O(n^2) DP is acceptable, but a tails array is faster.", "For strict increase, replace the first tail >= current number."],
    solution: "Maintain `tails[length-1]` as the smallest possible tail for an increasing subsequence of that length.",
    time: "O(n log n)",
    space: "O(n)"
  },
  {
    id: "grid-paths-with-blocks",
    chapterId: "dynamic-programming",
    title: "Grid Paths With Blocks",
    difficulty: "medium",
    patterns: ["grid DP", "path count"],
    entrypoint: "grid_paths_with_blocks",
    signature: "grid",
    adapter: "grid",
    prompt: "A grid has 0 for open cells and 1 for blocked cells. Moving only right or down from top-left, return how many paths reach bottom-right.",
    visibleTests: [
      { name: "one block", args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: 2 },
      { name: "blocked start", args: [[[1]]], expected: 0 }
    ],
    hiddenTests: [
      { name: "single open", args: [[[0]]], expected: 1 },
      { name: "empty", args: [[]], expected: 0 }
    ],
    hints: ["A blocked cell contributes zero paths.", "An open cell receives paths from above and left."],
    solution: "Fill a DP grid or one-dimensional row accumulator while respecting blocked cells.",
    time: "O(r * c)",
    space: "O(c)"
  },
  {
    id: "growth-label",
    chapterId: "interview-tools",
    title: "Growth Label",
    difficulty: "easy",
    patterns: ["complexity recognition"],
    entrypoint: "growth_label",
    signature: "operations",
    prompt: "Given operation counts observed as input size doubles, classify the growth as `constant`, `linear`, `quadratic`, or `unknown`. Use rough ratios: near 1, near 2, near 4.",
    visibleTests: [
      { name: "linear", args: [[100, 210, 390]], expected: "linear" },
      { name: "quadratic", args: [[100, 410, 1600]], expected: "quadratic" }
    ],
    hiddenTests: [
      { name: "constant", args: [[50, 52, 49]], expected: "constant" },
      { name: "unknown", args: [[10, 100, 105]], expected: "unknown" }
    ],
    hints: ["Look at ratios between consecutive measurements.", "Use broad ranges, not exact equality."],
    solution: "Average consecutive ratios and map approximately 1 to constant, 2 to linear, and 4 to quadratic.",
    time: "O(n)",
    space: "O(1)"
  },
  {
    id: "choose-pattern-label",
    chapterId: "interview-tools",
    title: "Choose Pattern Label",
    difficulty: "easy",
    patterns: ["pattern recognition"],
    entrypoint: "choose_pattern_label",
    signature: "features",
    prompt: "Given feature strings about a problem, return a likely pattern: `hashing`, `binary-search`, `sliding-window`, `graph`, or `dp`. Prefer graph over dp, dp over binary search, binary search over sliding window, sliding window over hashing.",
    visibleTests: [
      { name: "graph", args: [["nodes", "edges", "shortest"]], expected: "graph" },
      { name: "window", args: [["contiguous", "at most", "positive"]], expected: "sliding-window" }
    ],
    hiddenTests: [
      { name: "dp", args: [["minimum", "subproblem", "reuse"]], expected: "dp" },
      { name: "hash", args: [["frequency", "lookup"]], expected: "hashing" }
    ],
    hints: ["Normalize feature words to lowercase.", "Priority matters when multiple signals appear."],
    solution: "Check for keyword families in the stated priority order and return the first matching pattern.",
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "mixed-review-score",
    chapterId: "interview-tools",
    title: "Mixed Review Score",
    difficulty: "warmup",
    patterns: ["aggregation", "study planning"],
    entrypoint: "mixed_review_score",
    signature: "results",
    prompt: "Each result is `[difficulty, passed]`, where difficulty is 1, 2, or 3. Return the sum of difficulty values for passed results only.",
    visibleTests: [
      { name: "some pass", args: [[[1, true], [3, false], [2, true]]], expected: 3 },
      { name: "none", args: [[[2, false]]], expected: 0 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "all", args: [[[3, true], [3, true]]], expected: 6 }
    ],
    hints: ["Ignore failed rows.", "The first tuple value is the weight."],
    solution: "Scan results and sum `difficulty` whenever `passed` is true.",
    time: "O(n)",
    space: "O(1)"
  }
];

function starterCode(entrypoint: string, signature: string): string {
  return `def ${entrypoint}(${signature}):\n    # Write your solution here.\n    pass\n`;
}

function lessonBody(chapter: ChapterSpec): string {
  const detail = lessonDetails[chapter.id];
  const [firstProblem, secondProblem] = problemSeeds.filter((problem) => problem.chapterId === chapter.id);
  const objectiveText = detail.objectiveNouns.map((objective) => `- ${objective}`).join("\n");
  const signalText = detail.signals.map((signal) => `- ${signal}`).join("\n");
  const pitfallsText = detail.pitfalls.map((pitfall) => `- ${pitfall}`).join("\n");
  const traceA = detail.traceA.map((step, index) => `${index + 1}. ${step}`).join("\n");
  const traceB = detail.traceB.map((step, index) => `${index + 1}. ${step}`).join("\n");
  return `# ${chapter.title}

${chapter.summary}

## Learning Goals

${objectiveText}

By the end of this module, you should be able to read a prompt, name the state that matters, choose the right traversal or data structure, and explain why the code avoids unnecessary repeated work.

## Pattern Recognition Signals

${signalText}

When two signals compete, prefer the one that is structural. Sortedness, contiguity, graph edges, and repeated subproblems usually matter more than the names of variables in the prompt. Before coding, say which signal you are acting on and which signal you are intentionally ignoring.

## Mental Model

${detail.mentalModel}

The practical workflow is to write the brute-force idea in one sentence, then ask what information would let you avoid its repeated work. That information becomes the state. If the state can be updated cheaply and remains correct after every step, the algorithm is usually close.

## Worked Example 1

${detail.exampleA}

Trace:

${traceA}

The important habit is not memorizing this exact prompt. It is naming what the state means after every processed element. Once that sentence is precise, the implementation becomes a direct translation.

## Worked Example 2

${detail.exampleB}

Trace:

${traceB}

Notice how the second example uses the same chapter-level idea but a different surface shape. This is why the module includes both guided problems and bonus drills: you are practicing the recognition step, not just a finished snippet.

## Implementation Checklist

- Restate the result in terms of the input dimensions and edge cases.
- Write the invariant before the loop, recursion, heap, queue, or DP table.
- Decide exactly when the answer becomes final.
- Preserve deterministic output order when multiple answers are valid.
- Run one empty or singleton case, one representative case, and one stress-shaped case.

## Common Mistakes

${pitfallsText}

## Complexity Notes

${detail.complexity}

## Practice Path

Start with ${firstProblem?.title ?? "the first guided problem"} to verify the core pattern, then move to ${secondProblem?.title ?? "the next guided problem"} to see a variation. After that, use the runnable bonus drills for this chapter as spaced repetition. For every bonus prompt, write down the signal that triggered your pattern choice before opening the editor.

## Study Routine

Use a three-pass routine for this chapter. On the first pass, read the prompt and write only the state definition: what variables, frontier, table, or helper structure must mean after each step. On the second pass, implement the simplest correct version, even if it is not the cleverest version you can imagine. On the third pass, compare the final code against the invariant and remove only the complexity that is not earning its keep.

For ${chapter.title}, the most useful review question is: "What information from the past, boundary, or smaller subproblem do I need right now?" If the answer is one scalar, keep the solution small. If the answer is a collection, name exactly what belongs in it and when an item leaves. If the answer is a recurrence, define the state in words before choosing indexes.

## Self Check

Before marking a lesson complete, solve one guided problem and one bonus drill without opening the solution. Then explain the difference between their pattern signals. If your explanation uses only the chapter name, it is too vague. A stronger explanation names the input shape, the invariant, the update rule, and the condition that makes the answer final.

Write that explanation in your notes when the pattern still feels uncomfortable.

## Interview Narrative

Before coding, lead with the pattern signal: "${chapter.concepts[0]} is relevant because ..." Then describe the invariant, not every line of code. After coding, walk through the smallest edge case and one normal case. Close with time and space complexity and explain the term that dominates.
`;
}

function extractSolutionCode(entrypoint: string): string {
  const lines = guidedReferenceCode.split("\n");
  const start = lines.findIndex((line) => line.startsWith(`def ${entrypoint}(`));
  if (start === -1) return `# Verified reference for ${entrypoint} is included in the shared bundle.\n`;
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (lines[index].startsWith("def ")) {
      end = index;
      break;
    }
  }
  return `${lines.slice(start, end).join("\n").trim()}\n`;
}

function makeProblem(seed: ProblemSeed): Problem {
  return {
    id: seed.id,
    chapterId: seed.chapterId,
    title: seed.title,
    difficulty: seed.difficulty,
    source: "guided",
    patterns: seed.patterns,
    prompt: seed.prompt,
    constraints: ["Handle empty inputs when the prompt permits them.", "Return the exact type shown in the examples.", "Keep the stated asymptotic complexity."],
    examples: seed.visibleTests,
    starterCode: starterCode(seed.entrypoint, seed.signature),
    referenceCode: guidedReferenceCode,
    solutionCode: extractSolutionCode(seed.entrypoint),
    entrypoint: seed.entrypoint,
    adapter: seed.adapter ?? "default",
    visibleTests: seed.visibleTests,
    hiddenTests: seed.hiddenTests,
    hints: seed.hints,
    solution: seed.solution,
    walkthrough: `Use the chapter pattern tags (${seed.patterns.join(", ")}) to define the state, update it once per relevant input item, and compare the final state with the visible examples before submitting hidden tests.`,
    followUps: ["Can you explain the brute-force baseline?", "What edge case would break the first draft?", "Can the memory usage be reduced without making the code harder to trust?"],
    complexity: {
      time: seed.time,
      space: seed.space
    }
  };
}

function makeBonusProblems(chapterId: string, chapterTitle: string, count: number): BonusProblem[] {
  const slug = chapterId.replace(/-/g, "_");
  const chapter = chaptersBase.find((candidate) => candidate.id === chapterId);
  return Array.from({ length: count }, (_, index) => {
    const ordinal = index + 1;
    const entrypoint = `${slug}_bonus_${String(ordinal).padStart(2, "0")}`;
    const family = index % bonusFamilies.length;
    const familyInfo = bonusFamilies[family];
    const difficulty: Difficulty = index % 5 === 4 ? "medium" : index % 3 === 0 ? "easy" : "warmup";
    const conceptTag = chapter?.concepts[index % (chapter.concepts.length || 1)]?.toLowerCase() ?? chapterId;
    const base = {
      id: `${chapterId}-bonus-${String(ordinal).padStart(2, "0")}`,
      chapterId,
      title: `${familyInfo.title}: ${chapterTitle}`,
      difficulty,
      source: "bonus" as const,
      adapter: "default" as const,
      patterns: [chapterId, familyInfo.pattern, conceptTag, "bonus drill"],
      entrypoint
    };

    if (family === 0) {
      return {
        ...base,
        prompt: `In a practice score list for ${chapterTitle}, each attempt has an integer score. Given the scores and a threshold, return how many scores are greater than or equal to the threshold.`,
        starterCode: starterCode(entrypoint, "nums, threshold"),
        referenceCode: `def ${entrypoint}(nums, threshold):\n    return sum(1 for value in nums if value >= threshold)\n`,
        solutionCode: `def ${entrypoint}(nums, threshold):\n    return sum(1 for value in nums if value >= threshold)\n`,
        constraints: ["Scores may be empty.", "Threshold can be negative.", "Do not sort the input."],
        examples: [{ name: "mixed threshold", args: [[1, 4, 7, 2], 4], expected: 2 }],
        visibleTests: [
          { name: "mixed threshold", args: [[1, 4, 7, 2], 4], expected: 2 },
          { name: "none", args: [[-2, -1, 0], 3], expected: 0 }
        ],
        hiddenTests: [
          { name: "empty", args: [[], 1], expected: 0 },
          { name: "all match", args: [[5, 5, 6], 5], expected: 3 }
        ],
        hints: ["A boolean comparison can feed a counter.", "No sorting is needed; every value is independent."],
        solution: "Scan the array once and increment the answer whenever the value satisfies the threshold predicate.",
        walkthrough: "The invariant is the count of qualifying scores in the prefix already scanned.",
        followUps: ["How would the answer change if the threshold were strict?", "Can you stream the input without storing it?"],
        complexity: { time: "O(n)", space: "O(1)" }
      };
    }

    if (family === 1) {
      return {
        ...base,
        prompt: `Given a sequence of topic markers for ${chapterTitle} practice and a target marker, return the length of the longest contiguous run equal to the target.`,
        starterCode: starterCode(entrypoint, "values, target"),
        referenceCode: `def ${entrypoint}(values, target):\n    best = current = 0\n    for value in values:\n        if value == target:\n            current += 1\n            best = max(best, current)\n        else:\n            current = 0\n    return best\n`,
        solutionCode: `def ${entrypoint}(values, target):\n    best = current = 0\n    for value in values:\n        if value == target:\n            current += 1\n            best = max(best, current)\n        else:\n            current = 0\n    return best\n`,
        constraints: ["Values can be empty.", "Only contiguous runs count.", "Return 0 when the target never appears."],
        examples: [{ name: "middle run", args: [[2, 2, 3, 2, 2, 2], 2], expected: 3 }],
        visibleTests: [
          { name: "middle run", args: [[2, 2, 3, 2, 2, 2], 2], expected: 3 },
          { name: "missing", args: [[1, 3, 4], 2], expected: 0 }
        ],
        hiddenTests: [
          { name: "all target", args: [[7, 7, 7], 7], expected: 3 },
          { name: "empty", args: [[], 9], expected: 0 }
        ],
        hints: ["Track the active run separately from the best run.", "Reset the active run when the value changes away from the target."],
        solution: "Maintain `current` for the run ending at the current index and `best` for the maximum run seen.",
        walkthrough: "Each value either extends the current run or closes it. The best run is updated only after extension.",
        followUps: ["How would you return the start index too?", "What changes if there are multiple acceptable targets?"],
        complexity: { time: "O(n)", space: "O(1)" }
      };
    }

    if (family === 2) {
      return {
        ...base,
        prompt: `Given checkpoint weights from the ${chapterTitle} practice plan and a limit, return the first index where the running prefix total becomes strictly greater than the limit. Return -1 if it never crosses.`,
        starterCode: starterCode(entrypoint, "nums, limit"),
        referenceCode: `def ${entrypoint}(nums, limit):\n    total = 0\n    for index, value in enumerate(nums):\n        total += value\n        if total > limit:\n            return index\n    return -1\n`,
        solutionCode: `def ${entrypoint}(nums, limit):\n    total = 0\n    for index, value in enumerate(nums):\n        total += value\n        if total > limit:\n            return index\n    return -1\n`,
        constraints: ["Numbers may be negative.", "Return the earliest crossing index.", "An exact match to the limit is not a crossing."],
        examples: [{ name: "crosses", args: [[2, 3, 5], 4], expected: 1 }],
        visibleTests: [
          { name: "crosses", args: [[2, 3, 5], 4], expected: 1 },
          { name: "never crosses", args: [[1, 1, 1], 5], expected: -1 }
        ],
        hiddenTests: [
          { name: "first element", args: [[9, 1], 3], expected: 0 },
          { name: "empty", args: [[], 0], expected: -1 }
        ],
        hints: ["Prefix state changes by one value per step.", "Return as soon as the invariant changes from within limit to over limit."],
        solution: "Accumulate the prefix sum while scanning and return the first index where the sum exceeds the limit.",
        walkthrough: "The running total is the full state. Because the prompt asks for the first crossing, the first valid index is final.",
        followUps: ["Would binary search work if all values were positive?", "How do negative values affect monotonicity?"],
        complexity: { time: "O(n)", space: "O(1)" }
      };
    }

    if (family === 3) {
      return {
        ...base,
        prompt: `Given a string of status codes from the ${chapterTitle} exercise, return the number of adjacent character changes. A change occurs at index i when text[i] differs from text[i - 1].`,
        starterCode: starterCode(entrypoint, "text"),
        referenceCode: `def ${entrypoint}(text):\n    changes = 0\n    for i in range(1, len(text)):\n        if text[i] != text[i - 1]:\n            changes += 1\n    return changes\n`,
        solutionCode: `def ${entrypoint}(text):\n    changes = 0\n    for i in range(1, len(text)):\n        if text[i] != text[i - 1]:\n            changes += 1\n    return changes\n`,
        constraints: ["The string may be empty.", "Only adjacent positions are compared.", "Case-sensitive comparison is intended."],
        examples: [{ name: "alternating", args: ["aabcca"], expected: 3 }],
        visibleTests: [
          { name: "alternating", args: ["aabcca"], expected: 3 },
          { name: "stable", args: ["xxxx"], expected: 0 }
        ],
        hiddenTests: [
          { name: "empty", args: [""], expected: 0 },
          { name: "all changes", args: ["abcd"], expected: 3 }
        ],
        hints: ["Start comparing at index 1.", "Only the previous character is needed."],
        solution: "Scan adjacent pairs and count positions where the current character differs from the previous character.",
        walkthrough: "The invariant is the number of boundaries found before the current index.",
        followUps: ["How would you return the boundary indexes?", "What if comparisons were case-insensitive?"],
        complexity: { time: "O(n)", space: "O(1)" }
      };
    }

    if (family === 4) {
      return {
        ...base,
        prompt: `Given sorted checkpoint values from the ${chapterTitle} practice set, return the smallest absolute gap between neighboring checkpoints. Return 0 for fewer than two checkpoints.`,
        starterCode: starterCode(entrypoint, "values"),
        referenceCode: `def ${entrypoint}(values):\n    if len(values) < 2:\n        return 0\n    best = abs(values[1] - values[0])\n    for i in range(2, len(values)):\n        best = min(best, abs(values[i] - values[i - 1]))\n    return best\n`,
        solutionCode: `def ${entrypoint}(values):\n    if len(values) < 2:\n        return 0\n    best = abs(values[1] - values[0])\n    for i in range(2, len(values)):\n        best = min(best, abs(values[i] - values[i - 1]))\n    return best\n`,
        constraints: ["Input is already sorted.", "Negative values are allowed.", "Return 0 when no pair exists."],
        examples: [{ name: "smallest middle", args: [[1, 5, 6, 12]], expected: 1 }],
        visibleTests: [
          { name: "smallest middle", args: [[1, 5, 6, 12]], expected: 1 },
          { name: "one value", args: [[4]], expected: 0 }
        ],
        hiddenTests: [
          { name: "negative", args: [[-8, -3, 2]], expected: 5 },
          { name: "duplicates", args: [[2, 2, 9]], expected: 0 }
        ],
        hints: ["Sorted order means the closest pair must be adjacent.", "Track the minimum neighboring gap."],
        solution: "Compare every adjacent pair and keep the smallest absolute difference.",
        walkthrough: "Sortedness is the pattern signal: non-neighboring values cannot have a smaller gap than every value between them.",
        followUps: ["What if the input were unsorted?", "How would you return the pair as well as the gap?"],
        complexity: { time: "O(n)", space: "O(1)" }
      };
    }

    if (family === 5) {
      return {
        ...base,
        prompt: `Given task costs for the ${chapterTitle} practice session and a budget, return the maximum number of tasks that can be completed if tasks may be done in any order.`,
        starterCode: starterCode(entrypoint, "costs, budget"),
        referenceCode: `def ${entrypoint}(costs, budget):\n    done = 0\n    for cost in sorted(costs):\n        if cost > budget:\n            break\n        budget -= cost\n        done += 1\n    return done\n`,
        solutionCode: `def ${entrypoint}(costs, budget):\n    done = 0\n    for cost in sorted(costs):\n        if cost > budget:\n            break\n        budget -= cost\n        done += 1\n    return done\n`,
        constraints: ["Costs are non-negative.", "Tasks can be reordered.", "Return the count, not the chosen tasks."],
        examples: [{ name: "choose cheap", args: [[5, 1, 2, 4], 7], expected: 3 }],
        visibleTests: [
          { name: "choose cheap", args: [[5, 1, 2, 4], 7], expected: 3 },
          { name: "none", args: [[7, 8], 3], expected: 0 }
        ],
        hiddenTests: [
          { name: "exact", args: [[3, 3, 3], 6], expected: 2 },
          { name: "empty", args: [[], 9], expected: 0 }
        ],
        hints: ["Doing cheaper tasks first cannot reduce the count.", "Sort the costs before spending the budget."],
        solution: "Sort costs ascending and greedily take each affordable task until the next task exceeds the remaining budget.",
        walkthrough: "This is a greedy selection: replacing a chosen expensive task with a cheaper available task never hurts the number completed.",
        followUps: ["How would you return selected indexes?", "What if tasks had values as well as costs?"],
        complexity: { time: "O(n log n)", space: "O(n)" }
      };
    }

    if (family === 6) {
      return {
        ...base,
        prompt: `Given integer labels from the ${chapterTitle} practice set, return true if every label appears an even number of times.`,
        starterCode: starterCode(entrypoint, "values"),
        referenceCode: `from collections import Counter\n\ndef ${entrypoint}(values):\n    return all(count % 2 == 0 for count in Counter(values).values())\n`,
        solutionCode: `from collections import Counter\n\ndef ${entrypoint}(values):\n    return all(count % 2 == 0 for count in Counter(values).values())\n`,
        constraints: ["Empty input returns true.", "Values may be negative.", "Only parity of frequencies matters."],
        examples: [{ name: "paired", args: [[1, 2, 1, 2]], expected: true }],
        visibleTests: [
          { name: "paired", args: [[1, 2, 1, 2]], expected: true },
          { name: "odd count", args: [[3, 3, 3]], expected: false }
        ],
        hiddenTests: [
          { name: "empty", args: [[]], expected: true },
          { name: "negative", args: [[-1, -1, 2, 2, 2, 2]], expected: true }
        ],
        hints: ["A frequency table is enough.", "Every count must be divisible by two."],
        solution: "Count values and verify that each count has even parity.",
        walkthrough: "The hash table compresses arbitrary positions into value frequencies.",
        followUps: ["How would you find the odd-count values?", "Can XOR solve a restricted version?"],
        complexity: { time: "O(n)", space: "O(n)" }
      };
    }

    if (family === 7) {
      return {
        ...base,
        prompt: `Given a binary grid used in ${chapterTitle} practice, return how many rows contain at least one 1.`,
        starterCode: starterCode(entrypoint, "grid"),
        referenceCode: `def ${entrypoint}(grid):\n    return sum(1 for row in grid if any(value == 1 for value in row))\n`,
        solutionCode: `def ${entrypoint}(grid):\n    return sum(1 for row in grid if any(value == 1 for value in row))\n`,
        constraints: ["The grid may be empty.", "Rows may be empty.", "Only row-level existence matters."],
        examples: [{ name: "two rows", args: [[[0, 1], [0, 0], [1, 1]]], expected: 2 }],
        visibleTests: [
          { name: "two rows", args: [[[0, 1], [0, 0], [1, 1]]], expected: 2 },
          { name: "none", args: [[[0], []]], expected: 0 }
        ],
        hiddenTests: [
          { name: "empty", args: [[]], expected: 0 },
          { name: "all rows", args: [[[1], [1, 0]]], expected: 2 }
        ],
        hints: ["Use `any` for a row.", "Count rows, not cells."],
        solution: "Scan rows and count each row whose values include at least one 1 marker.",
        walkthrough: "The state is a row count; each row can be summarized independently.",
        followUps: ["How would you count columns instead?", "How does this differ from island counting?"],
        complexity: { time: "O(r * c)", space: "O(1)" }
      };
    }

    if (family === 8) {
      return {
        ...base,
        prompt: `Given a stream of ${chapterTitle} practice scores, return the running maximum after each score arrives.`,
        starterCode: starterCode(entrypoint, "scores"),
        referenceCode: `def ${entrypoint}(scores):\n    out = []\n    best = None\n    for score in scores:\n        best = score if best is None else max(best, score)\n        out.append(best)\n    return out\n`,
        solutionCode: `def ${entrypoint}(scores):\n    out = []\n    best = None\n    for score in scores:\n        best = score if best is None else max(best, score)\n        out.append(best)\n    return out\n`,
        constraints: ["Scores may be empty.", "Negative scores are allowed.", "Output length equals input length."],
        examples: [{ name: "rises", args: [[2, 1, 5, 3]], expected: [2, 2, 5, 5] }],
        visibleTests: [
          { name: "rises", args: [[2, 1, 5, 3]], expected: [2, 2, 5, 5] },
          { name: "falling", args: [[4, 3, 1]], expected: [4, 4, 4] }
        ],
        hiddenTests: [
          { name: "empty", args: [[]], expected: [] },
          { name: "negative", args: [[-5, -2, -9]], expected: [-5, -2, -2] }
        ],
        hints: ["Keep the best value seen so far.", "Append the best after processing each score."],
        solution: "Scan once, update the maximum so far, and append it to the output after each item.",
        walkthrough: "The output exposes the invariant after every prefix.",
        followUps: ["How would you produce running minimum too?", "What if the stream supported deletions?"],
        complexity: { time: "O(n)", space: "O(n)" }
      };
    }

    if (family === 9) {
      return {
        ...base,
        prompt: `Given time intervals from the ${chapterTitle} study schedule, return the total covered length after merging overlaps. Intervals are [start, end] and may touch.`,
        starterCode: starterCode(entrypoint, "intervals"),
        referenceCode: `def ${entrypoint}(intervals):\n    if not intervals:\n        return 0\n    intervals = sorted(intervals)\n    total = 0\n    start, end = intervals[0]\n    for next_start, next_end in intervals[1:]:\n        if next_start <= end:\n            end = max(end, next_end)\n        else:\n            total += end - start\n            start, end = next_start, next_end\n    total += end - start\n    return total\n`,
        solutionCode: `def ${entrypoint}(intervals):\n    if not intervals:\n        return 0\n    intervals = sorted(intervals)\n    total = 0\n    start, end = intervals[0]\n    for next_start, next_end in intervals[1:]:\n        if next_start <= end:\n            end = max(end, next_end)\n        else:\n            total += end - start\n            start, end = next_start, next_end\n    total += end - start\n    return total\n`,
        constraints: ["Intervals may be unsorted.", "Touching intervals merge.", "Return total length, not merged intervals."],
        examples: [{ name: "overlap", args: [[[1, 4], [2, 6], [8, 9]]], expected: 6 }],
        visibleTests: [
          { name: "overlap", args: [[[1, 4], [2, 6], [8, 9]]], expected: 6 },
          { name: "empty", args: [[]], expected: 0 }
        ],
        hiddenTests: [
          { name: "touching", args: [[[1, 2], [2, 5]]], expected: 4 },
          { name: "separate", args: [[[0, 1], [3, 5]]], expected: 3 }
        ],
        hints: ["Sort by start time.", "Flush a merged interval only when the next interval starts after it ends."],
        solution: "Sort intervals, merge overlaps, and accumulate the length of each completed merged interval.",
        walkthrough: "Sorting creates a local invariant: the active interval only needs to compare with the next interval.",
        followUps: ["How would you return merged intervals?", "What changes if touching intervals do not merge?"],
        complexity: { time: "O(n log n)", space: "O(n)" }
      };
    }

    if (family === 10) {
      return {
        ...base,
        prompt: `Given a target and sorted ${chapterTitle} checkpoint scores, return the first score greater than or equal to target, or -1 if none exists.`,
        starterCode: starterCode(entrypoint, "checkpoints, target"),
        referenceCode: `def ${entrypoint}(checkpoints, target):\n    left, right = 0, len(checkpoints)\n    while left < right:\n        mid = (left + right) // 2\n        if checkpoints[mid] >= target:\n            right = mid\n        else:\n            left = mid + 1\n    return -1 if left == len(checkpoints) else checkpoints[left]\n`,
        solutionCode: `def ${entrypoint}(checkpoints, target):\n    left, right = 0, len(checkpoints)\n    while left < right:\n        mid = (left + right) // 2\n        if checkpoints[mid] >= target:\n            right = mid\n        else:\n            left = mid + 1\n    return -1 if left == len(checkpoints) else checkpoints[left]\n`,
        constraints: ["Input is sorted ascending.", "Return the value, not the index.", "Return -1 when target is larger than every checkpoint."],
        examples: [{ name: "inside", args: [[1, 4, 7], 5], expected: 7 }],
        visibleTests: [
          { name: "inside", args: [[1, 4, 7], 5], expected: 7 },
          { name: "exact", args: [[1, 4, 7], 4], expected: 4 }
        ],
        hiddenTests: [
          { name: "too high", args: [[2, 3], 5], expected: -1 },
          { name: "empty", args: [[], 1], expected: -1 }
        ],
        hints: ["This is a lower-bound search.", "The answer position is the first value that satisfies `>= target`."],
        solution: "Use half-open binary search to find the lower-bound index, then convert the index to a value or -1.",
        walkthrough: "The maintained boundary separates values known to be too small from possible answers.",
        followUps: ["How would you return insertion index?", "What if duplicates are present?"],
        complexity: { time: "O(log n)", space: "O(1)" }
      };
    }

    if (family === 11) {
      return {
        ...base,
        prompt: `Given candidate labels for the ${chapterTitle} practice set, return all two-item combinations in input order.`,
        starterCode: starterCode(entrypoint, "choices"),
        referenceCode: `def ${entrypoint}(choices):\n    out = []\n    for i in range(len(choices)):\n        for j in range(i + 1, len(choices)):\n            out.append([choices[i], choices[j]])\n    return out\n`,
        solutionCode: `def ${entrypoint}(choices):\n    out = []\n    for i in range(len(choices)):\n        for j in range(i + 1, len(choices)):\n            out.append([choices[i], choices[j]])\n    return out\n`,
        constraints: ["Input order must be preserved.", "Do not include self-pairs.", "Return an empty list for fewer than two choices."],
        examples: [{ name: "three choices", args: [["A", "B", "C"]], expected: [["A", "B"], ["A", "C"], ["B", "C"]] }],
        visibleTests: [
          { name: "three choices", args: [["A", "B", "C"]], expected: [["A", "B"], ["A", "C"], ["B", "C"]] },
          { name: "one", args: [["A"]], expected: [] }
        ],
        hiddenTests: [
          { name: "empty", args: [[]], expected: [] },
          { name: "two", args: [["x", "y"]], expected: [["x", "y"]] }
        ],
        hints: ["The second index always starts after the first.", "Copy each pair into a new list."],
        solution: "Use nested loops with `j > i` to enumerate every unordered pair once in stable order.",
        walkthrough: "This is a small decision-tree drill: choose the first item, then choose only later items.",
        followUps: ["How would you generate size-k combinations?", "What if duplicate values should be deduplicated?"],
        complexity: { time: "O(n^2)", space: "O(n^2)" }
      };
    }

    if (family === 12) {
      return {
        ...base,
        prompt: `Given daily ${chapterTitle} practice gains, return the maximum total from choosing non-adjacent days. Choosing no days is allowed.`,
        starterCode: starterCode(entrypoint, "gains"),
        referenceCode: `def ${entrypoint}(gains):\n    prev2 = prev1 = 0\n    for gain in gains:\n        prev2, prev1 = prev1, max(prev1, prev2 + gain)\n    return prev1\n`,
        solutionCode: `def ${entrypoint}(gains):\n    prev2 = prev1 = 0\n    for gain in gains:\n        prev2, prev1 = prev1, max(prev1, prev2 + gain)\n    return prev1\n`,
        constraints: ["Gains may be negative.", "No adjacent indexes may both be chosen.", "Choosing nothing is valid."],
        examples: [{ name: "skip adjacent", args: [[2, 7, 9, 3]], expected: 11 }],
        visibleTests: [
          { name: "skip adjacent", args: [[2, 7, 9, 3]], expected: 11 },
          { name: "negative", args: [[-1, -2]], expected: 0 }
        ],
        hiddenTests: [
          { name: "empty", args: [[]], expected: 0 },
          { name: "single", args: [[5]], expected: 5 }
        ],
        hints: ["At each day, either take it with the best two days back or skip it.", "Two rolling values are enough."],
        solution: "Use rolling dynamic programming where `prev1` is best so far and `prev2` is best before the previous day.",
        walkthrough: "The recurrence compares taking the current value against skipping it.",
        followUps: ["How would you recover chosen indexes?", "What if the days formed a circle?"],
        complexity: { time: "O(n)", space: "O(1)" }
      };
    }

    return {
      ...base,
      prompt: `Given prerequisite pairs for the ${chapterTitle} practice plan, return true if every dependency points from a smaller numbered item to a larger numbered item. This checks whether the listed order is already topologically consistent.`,
      starterCode: starterCode(entrypoint, "pairs"),
      referenceCode: `def ${entrypoint}(pairs):\n    return all(before < after for before, after in pairs)\n`,
      solutionCode: `def ${entrypoint}(pairs):\n    return all(before < after for before, after in pairs)\n`,
      constraints: ["Pairs are two-item integer lists.", "Empty pairs are valid.", "Return a boolean."],
      examples: [{ name: "ordered", args: [[[0, 1], [2, 4]]], expected: true }],
      visibleTests: [
        { name: "ordered", args: [[[0, 1], [2, 4]]], expected: true },
        { name: "bad edge", args: [[[2, 1]]], expected: false }
      ],
      hiddenTests: [
        { name: "empty", args: [[]], expected: true },
        { name: "equal", args: [[[1, 1]]], expected: false }
      ],
      hints: ["Check every pair independently.", "Equality is not a valid forward dependency."],
      solution: "Return true only when every pair has the first item strictly smaller than the second.",
      walkthrough: "The prompt gives a preordered dependency claim; the algorithm verifies the local condition for each edge.",
      followUps: ["How would you validate arbitrary topological order?", "What if item labels were strings?"],
      complexity: { time: "O(n)", space: "O(1)" }
    };
  });
}

function makeQuiz(chapter: ChapterSpec, order: number): Quiz {
  const concept = chapter.concepts[0];
  const second = chapter.concepts[1] ?? chapter.concepts[0];
  return {
    id: `${chapter.id}-quiz`,
    chapterId: chapter.id,
    title: `${chapter.title} Quiz`,
    questions: [
      {
        id: `${chapter.id}-q1`,
        prompt: `What should you identify before selecting a ${chapter.title} approach?`,
        choices: ["The invariant and input constraints", "The longest variable name", "The final line of code", "The editor theme"],
        answer: 0,
        explanation: "The invariant and constraints determine which pattern is justified."
      },
      {
        id: `${chapter.id}-q2`,
        prompt: `Which signal most strongly suggests using ${concept}?`,
        choices: [`A prompt feature that matches ${concept}`, "Only the sample output", "A desire to avoid tests", "The number of imports"],
        answer: 0,
        explanation: `Pattern choice should come from prompt structure, such as ${concept}.`
      },
      {
        id: `${chapter.id}-q3`,
        prompt: `Why do we compare ${concept} with ${second}?`,
        choices: ["To choose the smallest correct state", "To make code longer", "To avoid edge cases", "To skip complexity analysis"],
        answer: 0,
        explanation: "Many interview mistakes come from using a heavier pattern than the prompt requires."
      },
      {
        id: `${chapter.id}-q4`,
        prompt: `What is the best final check after solving a ${chapter.title} problem?`,
        choices: ["Run edge cases and explain complexity", "Delete the tests", "Only inspect formatting", "Change the problem statement"],
        answer: 0,
        explanation: "A correct solution needs evidence from tests plus a defensible complexity explanation."
      }
    ].map((question, index) => ({ ...question, id: `${chapter.id}-q${order}-${index + 1}` }))
  };
}

const lessons: Lesson[] = chaptersBase.map((chapter, index) => ({
  id: `${chapter.id}-lesson`,
  chapterId: chapter.id,
  title: `${chapter.title} Playbook`,
  concepts: chapter.concepts,
  minutes: index === 0 ? 18 : 24,
  objectives: lessonDetails[chapter.id].objectiveNouns,
  workedExamples: [lessonDetails[chapter.id].exampleA, lessonDetails[chapter.id].exampleB],
  pitfalls: lessonDetails[chapter.id].pitfalls,
  linkedProblemIds: problemSeeds.filter((problem) => problem.chapterId === chapter.id).slice(0, 4).map((problem) => problem.id),
  body: lessonBody(chapter)
}));

const guidedProblems = problemSeeds.map(makeProblem);
const quizzes = chaptersBase.slice(0, 12).map(makeQuiz);

const bonusProblems = chaptersBase.flatMap((chapter) => {
  const chapterProblems = guidedProblems.filter((problem) => problem.chapterId === chapter.id);
  return makeBonusProblems(chapter.id, chapter.title, chapterProblems.length * 2);
});

const problems = [...guidedProblems, ...bonusProblems];

const chapters: Chapter[] = chaptersBase.map((chapter, index) => {
  const chapterProblems = guidedProblems.filter((problem) => problem.chapterId === chapter.id);
  const chapterBonusProblems = bonusProblems.filter((problem) => problem.chapterId === chapter.id);
  return {
    id: chapter.id,
    title: chapter.title,
    order: index + 1,
    summary: chapter.summary,
    lessons: lessons.filter((lesson) => lesson.chapterId === chapter.id).map((lesson) => lesson.id),
    quizzes: quizzes.filter((quiz) => quiz.chapterId === chapter.id).map((quiz) => quiz.id),
    problems: chapterProblems.map((problem) => problem.id),
    bonusProblems: chapterBonusProblems
  };
});

export const course: CourseData = {
  chapters,
  lessons,
  problems,
  quizzes,
  problemSets
};

export const contentStats = {
  chapterCount: course.chapters.length,
  lessonCount: course.lessons.length,
  guidedProblemCount: course.problems.filter((problem) => problem.source === "guided").length,
  bonusProblemCount: course.chapters.reduce((total, chapter) => total + chapter.bonusProblems.length, 0),
  totalProblemCount: course.problems.length,
  quizCount: course.quizzes.length,
  problemSetCount: course.problemSets.length,
  problemSetProblemCount: course.problemSets.reduce((total, set) => total + set.problems.length, 0)
};

export function findChapter(id: string): Chapter | undefined {
  return course.chapters.find((chapter) => chapter.id === id);
}

export function findLesson(id: string): Lesson | undefined {
  return course.lessons.find((lesson) => lesson.id === id);
}

export function findProblem(id: string): Problem | undefined {
  const own = course.problems.find((problem) => problem.id === id);
  if (own) return own;
  for (const set of course.problemSets) {
    const match = set.problems.find((problem) => problem.id === id);
    if (match) return match;
  }
  return undefined;
}

export function findProblemSet(id: string): ProblemSet | undefined {
  return course.problemSets.find((set) => set.id === id);
}

export function findQuiz(id: string): Quiz | undefined {
  return course.quizzes.find((quiz) => quiz.id === id);
}
