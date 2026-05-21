import type { BonusSeed } from "./types";

/**
 * Hashing bonus problems. Concepts: sets, maps, frequency tables, prefix
 * counts, canonical keys. Each seed drills one of those tools on a fresh
 * task — distinct from the guided set and from each other.
 */
export const bonus: BonusSeed[] = [
  {
    id: "hashing-bonus-01",
    chapterId: "hashing",
    title: "Nearby Duplicate",
    difficulty: "easy",
    patterns: ["hashing", "last seen map", "iteration"],
    entrypoint: "contains_duplicate_within_k",
    signature: "nums, k",
    prompt:
      "Return True if the list contains two equal values whose indices differ by at most k, and False otherwise. The two occurrences must be distinct positions.",
    constraints: [
      "k is a non-negative integer.",
      "An empty or single-element list has no such pair; return False.",
      "When k is 0 no two distinct indices can qualify."
    ],
    hints: [
      "For each value, the only copy that can help is the most recent one.",
      "Store the latest index of every value in a map and compare the gap."
    ],
    solution:
      "Scan once, keeping a map from each value to the last index where it appeared. When the current value is already in the map, check whether the index gap is within k before overwriting the stored index.",
    walkthrough:
      "Only the most recent earlier occurrence matters: it gives the smallest possible gap to the current index. Overwriting the stored index after each check keeps that invariant, so one pass with a last-seen map decides the answer.",
    followUps: [
      "How would you also return the actual pair of indices that qualified?",
      "What changes if values within a window must differ by at most some amount, not be exactly equal?"
    ],
    code: `def contains_duplicate_within_k(nums, k):
    last = {}
    for index, value in enumerate(nums):
        if value in last and index - last[value] <= k:
            return True
        last[value] = index
    return False
`,
    visibleTests: [
      { name: "close repeat", args: [[1, 2, 3, 1], 3], expected: true },
      { name: "repeat too far", args: [[1, 2, 3, 1, 2, 3], 2], expected: false }
    ],
    hiddenTests: [
      { name: "empty", args: [[], 3], expected: false },
      { name: "single", args: [[1], 5], expected: false },
      { name: "k zero never matches", args: [[1, 1], 0], expected: false },
      { name: "adjacent within k one", args: [[2, 2], 1], expected: true },
      { name: "triple close", args: [[5, 5, 5], 1], expected: true },
      { name: "later pair qualifies", args: [[1, 0, 1, 1], 1], expected: true },
      { name: "negatives", args: [[-1, -1], 1], expected: true }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "hashing-bonus-02",
    chapterId: "hashing",
    title: "Mode Of A List",
    difficulty: "easy",
    patterns: ["hashing", "frequency map", "stable order"],
    entrypoint: "most_frequent_value",
    signature: "nums",
    prompt:
      "Return the value that appears most often in the list. If several values tie for the highest count, return the one whose first occurrence comes earliest. Return None for an empty list.",
    constraints: [
      "The list may be empty; return None then.",
      "On a tie, the earliest-appearing value wins.",
      "Values may be negative."
    ],
    hints: [
      "Count every value first so each count is final before you compare.",
      "Then scan the list in order — the first value that reaches the top count is the answer."
    ],
    solution:
      "Build a frequency map in one pass. Then walk the list in its original order, tracking the best value and its count, and update only on a strictly larger count so earlier values win ties.",
    walkthrough:
      "Counting first makes every lookup final. Scanning the list in order and updating only when a strictly higher count appears means the earliest value among any tie is the one that gets recorded, satisfying the tie-break rule for free.",
    followUps: [
      "How would you return every value that ties for the most frequent?",
      "How would the approach change if the input were a stream too large to store?"
    ],
    code: `def most_frequent_value(nums):
    if not nums:
        return None
    counts = Counter(nums)
    best = None
    best_count = -1
    for value in nums:
        if counts[value] > best_count:
            best, best_count = value, counts[value]
    return best
`,
    visibleTests: [
      { name: "clear winner", args: [[1, 3, 1, 3, 1]], expected: 1 },
      { name: "later value wins", args: [[4, 4, 5, 5, 5]], expected: 5 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: null },
      { name: "single", args: [[7]], expected: 7 },
      { name: "all equal", args: [[2, 2, 2]], expected: 2 },
      { name: "tie picks earliest", args: [[9, 8, 9, 8]], expected: 9 },
      { name: "negatives", args: [[-1, -1, -2]], expected: -1 },
      { name: "all distinct picks first", args: [[1, 2, 3]], expected: 1 }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "hashing-bonus-03",
    chapterId: "hashing",
    title: "Smallest Missing Whole Number",
    difficulty: "easy",
    patterns: ["hashing", "set membership", "iteration"],
    entrypoint: "missing_number",
    signature: "nums",
    prompt:
      "The list holds n distinct values, each somewhere in the range 0 to n inclusive, so exactly one number in that range is absent. Return the missing number.",
    constraints: [
      "The list has n distinct values drawn from 0 to n inclusive.",
      "An empty list is missing the number 0.",
      "Exactly one value in the range is absent."
    ],
    hints: [
      "Put every present value into a set for constant-time membership checks.",
      "Walk the candidates 0, 1, ..., n and return the first one not in the set."
    ],
    solution:
      "Load the values into a set, then test each integer from 0 up to n in turn and return the first that the set does not contain.",
    walkthrough:
      "With every present value in a set, each membership test is constant time. Scanning the n + 1 candidates in order finds the single gap; the loop is guaranteed to hit it because exactly one number is missing.",
    followUps: [
      "How would you find the answer in constant extra space using a sum formula?",
      "What changes if more than one number can be missing?"
    ],
    code: `def missing_number(nums):
    present = set(nums)
    for candidate in range(len(nums) + 1):
        if candidate not in present:
            return candidate
    return len(nums)
`,
    visibleTests: [
      { name: "two missing", args: [[3, 0, 1]], expected: 2 },
      { name: "top missing", args: [[0, 1, 2, 3]], expected: 4 }
    ],
    hiddenTests: [
      { name: "empty misses zero", args: [[]], expected: 0 },
      { name: "single has zero", args: [[0]], expected: 1 },
      { name: "single misses zero", args: [[1]], expected: 0 },
      { name: "zero missing", args: [[1, 2]], expected: 0 },
      { name: "middle missing", args: [[0, 2]], expected: 1 },
      { name: "zero missing longer", args: [[4, 3, 2, 1]], expected: 0 }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "hashing-bonus-04",
    chapterId: "hashing",
    title: "Two Sum Exists",
    difficulty: "easy",
    patterns: ["hashing", "complement set", "iteration"],
    entrypoint: "two_sum_exists",
    signature: "nums, target",
    prompt:
      "Return True if some pair of values at two different indices adds up to the target, and False otherwise.",
    constraints: [
      "The two values must come from distinct indices.",
      "An empty or single-element list cannot form a pair; return False.",
      "Values and target may be negative."
    ],
    hints: [
      "As you reach each value, its partner would be target minus that value.",
      "Keep the values seen so far in a set and check for the partner before adding."
    ],
    solution:
      "Scan once with a set of values already seen. For each value, check whether target minus it is in the set; if so a pair exists. Otherwise add the value and continue.",
    walkthrough:
      "Checking the set before inserting the current value guarantees the partner came from an earlier index, so the two values occupy distinct positions. A hit means a valid pair; finishing the scan with no hit means none exists.",
    followUps: [
      "How would you return the indices of the pair instead of a boolean?",
      "How would the approach differ if the list were already sorted?"
    ],
    code: `def two_sum_exists(nums, target):
    seen = set()
    for value in nums:
        if target - value in seen:
            return True
        seen.add(value)
    return False
`,
    visibleTests: [
      { name: "pair found", args: [[2, 7, 11, 15], 9], expected: true },
      { name: "no pair", args: [[1, 2, 3], 7], expected: false }
    ],
    hiddenTests: [
      { name: "empty", args: [[], 0], expected: false },
      { name: "single", args: [[5], 10], expected: false },
      { name: "equal halves", args: [[3, 3], 6], expected: true },
      { name: "two zeros", args: [[0, 0], 0], expected: true },
      { name: "negative partner", args: [[-3, 4, 1], 1], expected: true },
      { name: "value not reused", args: [[4], 8], expected: false }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "hashing-bonus-05",
    chapterId: "hashing",
    title: "First Repeated Value",
    difficulty: "warmup",
    patterns: ["hashing", "set membership", "first occurrence"],
    entrypoint: "first_repeated_value",
    signature: "nums",
    prompt:
      "Return the first value whose copy has already appeared earlier in the list — that is, the value at the earliest index that closes a repeat. Return None if every value is unique.",
    constraints: [
      "The answer is the value whose second occurrence comes first.",
      "An empty or single-element list has no repeat; return None.",
      "Values may be negative."
    ],
    hints: [
      "Keep a set of values you have already passed.",
      "The first value found to be already in the set is the answer."
    ],
    solution:
      "Walk the list maintaining a set of values seen so far. The moment a value is found already in the set, return it; if the scan ends, return None.",
    walkthrough:
      "Returning on the first value that is already in the set stops exactly at the earliest repeated occurrence, because that is the first index whose value was seen before. No later position can produce an earlier second occurrence.",
    followUps: [
      "How would you return the index of the repeat rather than the value?",
      "What changes if you need the value whose first occurrence is earliest among all repeated values?"
    ],
    code: `def first_repeated_value(nums):
    seen = set()
    for value in nums:
        if value in seen:
            return value
        seen.add(value)
    return None
`,
    visibleTests: [
      { name: "inner repeat first", args: [[1, 2, 3, 2, 1]], expected: 2 },
      { name: "all unique", args: [[1, 2, 3]], expected: null }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: null },
      { name: "single", args: [[7]], expected: null },
      { name: "all equal", args: [[4, 4, 4]], expected: 4 },
      { name: "negatives", args: [[-1, 0, -1]], expected: -1 },
      { name: "two repeats", args: [[5, 6, 7, 5, 6]], expected: 5 },
      { name: "wrap around", args: [[0, 1, 2, 3, 0]], expected: 0 }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "hashing-bonus-06",
    chapterId: "hashing",
    title: "Symmetric Difference Size",
    difficulty: "warmup",
    patterns: ["hashing", "set operations"],
    entrypoint: "symmetric_difference_size",
    signature: "first, second",
    prompt:
      "Return how many distinct values appear in exactly one of the two lists — present in one but not the other. Values appearing in both are excluded.",
    constraints: [
      "Duplicates within a list do not change the answer.",
      "Either list may be empty.",
      "A value in both lists contributes nothing."
    ],
    hints: [
      "Convert each list to a set so duplicates collapse.",
      "The symmetric difference operator keeps values that are in exactly one set."
    ],
    solution:
      "Turn both lists into sets, take their symmetric difference, and return its size — the count of values unique to one side.",
    walkthrough:
      "Sets discard duplicates so each value is considered once. The symmetric difference is precisely the values in exactly one set, so its length is the requested count.",
    followUps: [
      "How would you also return which values are unique to each list?",
      "How would you compute this without the symmetric difference operator?"
    ],
    code: `def symmetric_difference_size(first, second):
    return len(set(first) ^ set(second))
`,
    visibleTests: [
      { name: "partial overlap", args: [[1, 2, 3], [2, 3, 4]], expected: 2 },
      { name: "identical sets", args: [[1, 2], [1, 2]], expected: 0 }
    ],
    hiddenTests: [
      { name: "both empty", args: [[], []], expected: 0 },
      { name: "one empty", args: [[], [1, 2, 3]], expected: 3 },
      { name: "duplicates collapse", args: [[1, 1, 2], [2, 2]], expected: 1 },
      { name: "fully disjoint", args: [[1, 2, 3], [4, 5, 6]], expected: 6 },
      { name: "negatives", args: [[-1, -2], [-2, -3]], expected: 2 },
      { name: "duplicate value shared", args: [[5], [5, 5, 5]], expected: 0 }
    ],
    time: "O(n + m)",
    space: "O(n + m)"
  },
  {
    id: "hashing-bonus-07",
    chapterId: "hashing",
    title: "Character Frequency Table",
    difficulty: "warmup",
    patterns: ["hashing", "frequency map", "string scans"],
    entrypoint: "char_frequency_table",
    signature: "text",
    prompt:
      "Return a dictionary mapping each character of the string to the number of times it occurs. Characters that never appear are simply absent from the dictionary.",
    constraints: [
      "The string may be empty; return an empty dictionary then.",
      "Counting is case-sensitive: 'a' and 'A' are different keys.",
      "Whitespace characters count like any other character."
    ],
    hints: [
      "Walk the string one character at a time.",
      "For each character, add one to its running tally in the dictionary."
    ],
    solution:
      "Scan the string once. For each character, increment its entry in a dictionary, treating a missing entry as a count of zero.",
    walkthrough:
      "A single pass builds the table: each character either creates a new entry at one or bumps an existing entry. Because every character is its own key, case and whitespace are preserved exactly.",
    followUps: [
      "How would you return only the characters that appear more than once?",
      "How would you build the same table with collections.Counter?"
    ],
    code: `def char_frequency_table(text):
    counts = {}
    for char in text:
        counts[char] = counts.get(char, 0) + 1
    return counts
`,
    visibleTests: [
      { name: "mixed letters", args: ["aabbc"], expected: { a: 2, b: 2, c: 1 } },
      { name: "all distinct", args: ["xyz"], expected: { x: 1, y: 1, z: 1 } }
    ],
    hiddenTests: [
      { name: "empty", args: [""], expected: {} },
      { name: "single", args: ["a"], expected: { a: 1 } },
      { name: "all same", args: ["aaaa"], expected: { a: 4 } },
      { name: "case sensitive", args: ["aA"], expected: { a: 1, A: 1 } },
      { name: "spaces count", args: ["  "], expected: { " ": 2 } }
    ],
    time: "O(n)",
    space: "O(k)"
  },
  {
    id: "hashing-bonus-08",
    chapterId: "hashing",
    title: "Group Words By First Letter",
    difficulty: "easy",
    patterns: ["hashing", "grouping", "canonical key"],
    entrypoint: "group_by_first_letter",
    signature: "words",
    prompt:
      "Group the words by their first letter and return a dictionary mapping each first letter to the list of words that start with it, in their original order. Skip any empty string. Iterate the dictionary keys in sorted order.",
    constraints: [
      "Empty strings have no first letter and are ignored.",
      "Within each group, words keep their original relative order.",
      "The returned dictionary's keys must be in sorted order."
    ],
    hints: [
      "The first character of a word is its group key.",
      "A dictionary of lists collects each group; build the result with sorted keys."
    ],
    solution:
      "Append each non-empty word to the list keyed by its first character. Then build the result dictionary by reading the keys in sorted order so the grouping is deterministic.",
    walkthrough:
      "The first character is a stable group key, and appending preserves arrival order within each group. Rebuilding the dictionary over sorted keys makes the output order deterministic regardless of input order.",
    followUps: [
      "How would you group by word length instead of first letter?",
      "How would you also return the size of each group?"
    ],
    code: `def group_by_first_letter(words):
    groups = defaultdict(list)
    for word in words:
        if word:
            groups[word[0]].append(word)
    return {key: groups[key] for key in sorted(groups)}
`,
    visibleTests: [
      {
        name: "two groups",
        args: [["apple", "ant", "bee", "bat"]],
        expected: { a: ["apple", "ant"], b: ["bee", "bat"] }
      },
      { name: "empty", args: [[]], expected: {} }
    ],
    hiddenTests: [
      { name: "single word", args: [["one"]], expected: { o: ["one"] } },
      { name: "one group", args: [["cat", "car", "cap"]], expected: { c: ["cat", "car", "cap"] } },
      { name: "keys sorted", args: [["zoo", "ant"]], expected: { a: ["ant"], z: ["zoo"] } },
      { name: "all empty strings", args: [["", ""]], expected: {} },
      { name: "empty string skipped", args: [["dog", "", "deer"]], expected: { d: ["dog", "deer"] } }
    ],
    time: "O(n log n)",
    space: "O(n)"
  },
  {
    id: "hashing-bonus-09",
    chapterId: "hashing",
    title: "Can Form Word From Letters",
    difficulty: "easy",
    patterns: ["hashing", "frequency map", "multiset"],
    entrypoint: "can_form_word",
    signature: "word, letters",
    prompt:
      "Given a target word and a list of available single-character letters, return True if the word can be spelled using those letters. Each letter may be used at most as many times as it appears in the list.",
    constraints: [
      "An empty word can always be formed; return True then.",
      "A letter can be used only as often as it occurs in the list.",
      "Letters not needed by the word may simply go unused."
    ],
    hints: [
      "Count how many of each character the word needs.",
      "Count how many of each character are available and compare per character."
    ],
    solution:
      "Build a frequency count of the word and of the available letters. The word is formable exactly when, for every character the word needs, the available count is at least the required count.",
    walkthrough:
      "Spelling the word is a multiset containment check: each required character must be matched by an equal-or-greater supply. Comparing the two counts character by character settles it; a single shortfall makes the word impossible.",
    followUps: [
      "How would you return how many extra letters are left over after spelling the word?",
      "What changes if a single blank letter could substitute for any character?"
    ],
    code: `def can_form_word(word, letters):
    need = Counter(word)
    have = Counter(letters)
    for char, count in need.items():
        if have[char] < count:
            return False
    return True
`,
    visibleTests: [
      { name: "enough letters", args: ["cat", ["a", "c", "t", "x"]], expected: true },
      { name: "missing copy", args: ["aa", ["a"]], expected: false }
    ],
    hiddenTests: [
      { name: "empty word", args: ["", ["a", "b"]], expected: true },
      { name: "no letters", args: ["a", []], expected: false },
      { name: "exact letters", args: ["abc", ["c", "b", "a"]], expected: true },
      { name: "duplicates needed", args: ["aab", ["a", "a", "b", "b"]], expected: true },
      { name: "short on repeats", args: ["aaa", ["a", "a"]], expected: false },
      { name: "both empty", args: ["", []], expected: true }
    ],
    time: "O(n + m)",
    space: "O(k)"
  },
  {
    id: "hashing-bonus-10",
    chapterId: "hashing",
    title: "Longest Balanced Span",
    difficulty: "medium",
    patterns: ["hashing", "prefix counts", "first occurrence map"],
    entrypoint: "longest_balanced_prefix",
    signature: "nums",
    prompt:
      "The list contains only 0s and 1s. Return the length of the longest contiguous span that holds an equal number of 0s and 1s.",
    constraints: [
      "The list contains only the values 0 and 1.",
      "An empty list has no balanced span; return 0.",
      "If no balanced span exists, return 0."
    ],
    hints: [
      "Treat 0 as minus one and 1 as plus one, then track a running balance.",
      "A span is balanced when the running balance is the same at both ends; record where each balance value first appeared."
    ],
    solution:
      "Convert the list to a running balance that adds one for a 1 and subtracts one for a 0. Whenever a balance value repeats, the span between the two positions is balanced; keep a map of each balance value's first index and take the widest such span.",
    walkthrough:
      "Two indices with the same running balance enclose a span whose 0s and 1s cancel. Storing the first index for each balance value (seeding balance 0 at index minus one) means every later repeat measures the longest span ending there.",
    followUps: [
      "How would you instead count how many balanced spans exist?",
      "What changes if the span must contain twice as many 1s as 0s?"
    ],
    code: `def longest_balanced_prefix(nums):
    first_seen = {0: -1}
    balance = 0
    best = 0
    for index, value in enumerate(nums):
        balance += 1 if value == 1 else -1
        if balance in first_seen:
            best = max(best, index - first_seen[balance])
        else:
            first_seen[balance] = index
    return best
`,
    visibleTests: [
      { name: "one balanced pair", args: [[0, 1, 0]], expected: 2 },
      { name: "all ones", args: [[1, 1, 1, 1]], expected: 0 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "single", args: [[0]], expected: 0 },
      { name: "minimal pair", args: [[0, 1]], expected: 2 },
      { name: "whole list balanced", args: [[0, 0, 1, 0, 1, 1]], expected: 6 },
      { name: "alternating", args: [[1, 0, 1, 0]], expected: 4 },
      { name: "balanced prefix only", args: [[1, 1, 0, 0, 1]], expected: 4 }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "hashing-bonus-11",
    chapterId: "hashing",
    title: "Distinct Pair Sums",
    difficulty: "medium",
    patterns: ["hashing", "set membership", "pair enumeration"],
    entrypoint: "count_distinct_pair_sums",
    signature: "nums",
    prompt:
      "Consider every unordered pair of values at two different indices. Return how many distinct sums those pairs produce.",
    constraints: [
      "Each pair uses two different indices.",
      "A list with fewer than two values produces no pairs; return 0.",
      "Equal pair sums count only once toward the total."
    ],
    hints: [
      "Generate the sum of every pair of distinct indices.",
      "Collect those sums in a set so equal sums collapse, then report its size."
    ],
    solution:
      "Enumerate every pair of distinct indices, add each pair sum to a set, and return the set's size — the number of distinct sums.",
    walkthrough:
      "Each unordered pair is visited once by letting the second index start after the first. The set absorbs duplicate sums automatically, so its final length is exactly the count of distinct pair sums.",
    followUps: [
      "How would you instead return how many pairs share the single most common sum?",
      "Could you find the number of distinct sums faster than enumerating every pair?"
    ],
    code: `def count_distinct_pair_sums(nums):
    sums = set()
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            sums.add(nums[i] + nums[j])
    return len(sums)
`,
    visibleTests: [
      { name: "three distinct sums", args: [[1, 2, 3]], expected: 3 },
      { name: "all equal values", args: [[1, 1, 1]], expected: 1 }
    ],
    hiddenTests: [
      { name: "empty", args: [[]], expected: 0 },
      { name: "single", args: [[5]], expected: 0 },
      { name: "one pair", args: [[2, 4]], expected: 1 },
      { name: "four values", args: [[1, 2, 3, 4]], expected: 5 },
      { name: "negatives", args: [[-1, 0, 1]], expected: 3 },
      { name: "all zeros", args: [[0, 0, 0, 0]], expected: 1 }
    ],
    time: "O(n^2)",
    space: "O(n^2)"
  },
  {
    id: "hashing-bonus-12",
    chapterId: "hashing",
    title: "Isomorphic Strings",
    difficulty: "medium",
    patterns: ["hashing", "bijection map", "canonical key"],
    entrypoint: "isomorphic_strings",
    signature: "s, t",
    prompt:
      "Two strings are isomorphic if the characters of the first can be consistently replaced to produce the second: every occurrence of a character maps to the same character, and no two distinct characters map to the same one. Return True if the strings are isomorphic.",
    constraints: [
      "Strings of different lengths can never be isomorphic.",
      "Two empty strings are isomorphic.",
      "The mapping must be one-to-one in both directions."
    ],
    hints: [
      "Pair up the characters of the two strings position by position.",
      "Keep a forward map and a backward map; a conflict in either one breaks the isomorphism."
    ],
    solution:
      "If the lengths differ, return False. Otherwise walk the aligned character pairs, maintaining a forward map from s to t and a backward map from t to s. A pair that contradicts either map means the strings are not isomorphic.",
    walkthrough:
      "Isomorphism requires a bijection, so one map is not enough — two different source characters could otherwise collapse onto the same target. Checking both the forward and backward maps at every pair enforces a one-to-one correspondence.",
    followUps: [
      "How would you return the actual character mapping when the strings are isomorphic?",
      "What changes if the mapping is only required to be a function, not a bijection?"
    ],
    code: `def isomorphic_strings(s, t):
    if len(s) != len(t):
        return False
    forward = {}
    backward = {}
    for source, target in zip(s, t):
        if forward.get(source, target) != target:
            return False
        if backward.get(target, source) != source:
            return False
        forward[source] = target
        backward[target] = source
    return True
`,
    visibleTests: [
      { name: "isomorphic", args: ["egg", "add"], expected: true },
      { name: "not isomorphic", args: ["foo", "bar"], expected: false }
    ],
    hiddenTests: [
      { name: "both empty", args: ["", ""], expected: true },
      { name: "single chars", args: ["a", "b"], expected: true },
      { name: "target collision", args: ["ab", "aa"], expected: false },
      { name: "longer pair", args: ["paper", "title"], expected: true },
      { name: "length mismatch", args: ["abc", "abcd"], expected: false },
      { name: "same pattern", args: ["aba", "xyx"], expected: true },
      { name: "source collision", args: ["badc", "baba"], expected: false }
    ],
    time: "O(n)",
    space: "O(k)"
  }
];
