import type { Problem } from "../../types";
import { LIBRARY_ORDEREDDICT_SET_ID, libraryProblem } from "./_shared";

/**
 * collections.OrderedDict practice — two problems that exercise the two
 * methods regular Py3.7+ dicts can't easily replace:
 *   - `move_to_end(key)` to update recency in O(1)
 *   - `popitem(last=False)` to evict the oldest entry in O(1)
 *
 * The LRU cache uses both; "first unique in a stream" uses the implicit
 * ordering after `del` to keep the oldest still-unique key at the front.
 */

const make = libraryProblem(LIBRARY_ORDEREDDICT_SET_ID);

// ---------------------------------------------------------------------------
// LRU cache
// ---------------------------------------------------------------------------

const LRU_STARTER = `from collections import OrderedDict

def lru_cache(capacity, operations):
    cache = OrderedDict()
    out = []
    for op in operations:
        kind = op[0]
        if kind == "get":
            # If the key is present, mark it most-recently-used and emit its
            # value. If absent, emit "-1".
            pass
        elif kind == "put":
            # Insert / update. After a successful put, if len > capacity,
            # evict the oldest (least-recently-used) entry.
            pass
    return out
`;

const LRU_REFERENCE = `from collections import OrderedDict

def lru_cache(capacity, operations):
    cache = OrderedDict()
    out = []
    for op in operations:
        kind = op[0]
        if kind == "get":
            key = op[1]
            if key in cache:
                cache.move_to_end(key)
                out.append(cache[key])
            else:
                out.append("-1")
        elif kind == "put":
            key = op[1]
            value = op[2]
            if key in cache:
                cache.move_to_end(key)
            cache[key] = value
            if len(cache) > capacity:
                cache.popitem(last=False)
    return out
`;

const LRU_SOLUTION = `from collections import OrderedDict

def lru_cache(capacity, operations):
    store = OrderedDict()
    results = []
    for op in operations:
        head = op[0]
        if head == "get":
            k = op[1]
            if k not in store:
                results.append("-1")
                continue
            v = store.pop(k)
            store[k] = v
            results.append(v)
        else:
            k, v = op[1], op[2]
            store.pop(k, None)
            store[k] = v
            if len(store) > capacity:
                store.popitem(last=False)
    return results
`;

const lruCache: Problem = make({
  id: "lib-od-lru-cache",
  title: "LRU Cache",
  difficulty: "medium",
  patterns: ["LRU", "OrderedDict", "cache"],
  prompt:
    "Implement a least-recently-used cache. `solution(capacity, operations)` receives an integer `capacity` and a list of operations. Each operation is either `[\"get\", key]` or `[\"put\", key, value]` (keys and values are strings). `get` returns the value if it's present and marks the key as most-recently-used; otherwise it returns `\"-1\"`. `put` inserts or updates the key (also marking it most-recently-used) and evicts the least-recently-used entry whenever the cache exceeds `capacity`. Return only the `get` results, in order. `collections.OrderedDict` is the right tool: `move_to_end(key)` for recency, `popitem(last=False)` for eviction.",
  constraints: [
    "1 <= capacity <= 10000.",
    "Each operation is a list of strings; `get` has 2 entries, `put` has 3.",
    "Keys and values are non-empty strings.",
    "Return the list of `get` results in input order (no entries for `put`)."
  ],
  examples: [
    {
      name: "single put then get",
      args: [2, [["put", "a", "1"], ["get", "a"]]],
      expected: ["1"]
    }
  ],
  entrypoint: "lru_cache",
  starterCode: LRU_STARTER,
  referenceCode: LRU_REFERENCE,
  solutionCode: LRU_SOLUTION,
  visibleTests: [
    { name: "empty operations", args: [2, []], expected: [] },
    {
      name: "single put then get",
      args: [2, [["put", "a", "1"], ["get", "a"]]],
      expected: ["1"]
    },
    {
      name: "missing key returns -1",
      args: [2, [["get", "x"]]],
      expected: ["-1"]
    },
    {
      name: "eviction at capacity",
      args: [
        2,
        [
          ["put", "a", "1"],
          ["put", "b", "2"],
          ["get", "a"],
          ["put", "c", "3"],
          ["get", "b"],
          ["get", "c"]
        ]
      ],
      expected: ["1", "-1", "3"]
    }
  ],
  hiddenTests: [
    {
      name: "put overwrites and is now most-recent",
      args: [
        2,
        [
          ["put", "a", "1"],
          ["put", "b", "2"],
          ["put", "a", "9"],
          ["put", "c", "3"],
          ["get", "b"],
          ["get", "a"],
          ["get", "c"]
        ]
      ],
      expected: ["-1", "9", "3"]
    },
    {
      name: "get refreshes recency",
      args: [
        2,
        [
          ["put", "a", "1"],
          ["put", "b", "2"],
          ["get", "a"],
          ["put", "c", "3"],
          ["get", "a"],
          ["get", "b"]
        ]
      ],
      expected: ["1", "1", "-1"]
    },
    {
      name: "capacity one only keeps the latest",
      args: [
        1,
        [
          ["put", "a", "1"],
          ["put", "b", "2"],
          ["put", "c", "3"],
          ["get", "a"],
          ["get", "b"],
          ["get", "c"]
        ]
      ],
      expected: ["-1", "-1", "3"]
    },
    {
      name: "interleaved gets and puts",
      args: [
        3,
        [
          ["put", "a", "1"],
          ["put", "b", "2"],
          ["put", "c", "3"],
          ["get", "a"],
          ["put", "d", "4"],
          ["get", "b"],
          ["get", "c"],
          ["get", "d"],
          ["get", "a"]
        ]
      ],
      expected: ["1", "-1", "3", "4", "1"]
    },
    {
      name: "all gets miss when nothing was put",
      args: [
        4,
        [
          ["get", "a"],
          ["get", "b"],
          ["get", "c"]
        ]
      ],
      expected: ["-1", "-1", "-1"]
    }
  ],
  hints: [
    "`OrderedDict.move_to_end(key)` reorders a key to the back in O(1). Make the back mean 'most recently used' and the front mean 'least recently used'.",
    "`popitem(last=False)` removes the oldest entry in O(1); call it whenever `len(cache) > capacity` after a put.",
    "On a `put` of an existing key, move it to the end BEFORE you overwrite the value so the order update is unconditional and the size check works on either branch."
  ],
  solution:
    "Track entries in an OrderedDict where the back is most-recently-used. `get` looks up the key; if present, move it to the back and emit the value, otherwise emit \"-1\". `put` either move-to-ends the existing key or inserts new, writes the value, then evicts via popitem(last=False) when over capacity. Both operations are O(1) and the eviction policy is enforced exactly at the put boundary.",
  walkthrough:
    "OrderedDict gives you a linked-hash-map for free: lookup is hashed, ordering is a doubly-linked list, and the two unusual methods (`move_to_end`, `popitem(last=False)`) are the LRU primitives. The standard interview pitfall is forgetting to refresh recency on `get` — a regular dict tracks insertion order but not access order. By using `move_to_end` on both branches of `get` and `put`, you keep the invariant trivially: the back is always the most-recently-touched key, the front is always the least.",
  followUps: [
    "How would you extend this to LFU (least-frequently-used) with LRU as the tiebreaker?",
    "What changes if values can expire after a TTL and a `get` past expiry should miss like an absent key?"
  ],
  complexity: {
    time: "O(1) per get and put (amortised)",
    space: "O(capacity)"
  }
});

// ---------------------------------------------------------------------------
// First unique in a stream
// ---------------------------------------------------------------------------

const FIRST_UNIQUE_STARTER = `from collections import Counter, OrderedDict

def first_unique(stream):
    counts = Counter()
    pending = OrderedDict()
    out = []
    for value in stream:
        # Track frequency. If this is the first sighting, append to pending
        # so its insertion-order tail extends. If a previously-unique value
        # has become non-unique, remove it from pending. Emit the first
        # remaining key (or "" if none).
        pass
    return out
`;

const FIRST_UNIQUE_REFERENCE = `from collections import Counter, OrderedDict

def first_unique(stream):
    counts = Counter()
    pending = OrderedDict()
    out = []
    for value in stream:
        counts[value] += 1
        if counts[value] == 1:
            pending[value] = True
        elif value in pending:
            del pending[value]
        out.append(next(iter(pending)) if pending else "")
    return out
`;

const FIRST_UNIQUE_SOLUTION = `from collections import Counter, OrderedDict

def first_unique(stream):
    seen = Counter()
    queue = OrderedDict()
    answers = []
    for token in stream:
        seen[token] += 1
        if seen[token] == 1:
            queue[token] = None
        elif token in queue:
            queue.pop(token)
        if queue:
            head = next(iter(queue))
            answers.append(head)
        else:
            answers.append("")
    return answers
`;

const firstUnique: Problem = make({
  id: "lib-od-first-unique",
  title: "First Unique String in a Stream",
  difficulty: "medium",
  patterns: ["streaming", "OrderedDict", "Counter"],
  prompt:
    "Given a stream of strings, after each string is appended return the first string in insertion order that has so far appeared exactly once. If no such string exists, return `\"\"` for that step. Output length equals input length. The natural pairing is `collections.Counter` (frequency) plus `collections.OrderedDict` (insertion-ordered set of still-unique tokens) so each step is O(1) — including the `del` that fires when a previously-unique token becomes non-unique.",
  constraints: [
    "0 <= len(stream) <= 10000.",
    "Each token is a non-empty string.",
    "Return one string per stream element, in order."
  ],
  examples: [
    {
      name: "single repeat collapses then re-emerges",
      args: [["a", "b", "a", "c", "b"]],
      expected: ["a", "a", "b", "b", "c"]
    }
  ],
  entrypoint: "first_unique",
  starterCode: FIRST_UNIQUE_STARTER,
  referenceCode: FIRST_UNIQUE_REFERENCE,
  solutionCode: FIRST_UNIQUE_SOLUTION,
  visibleTests: [
    { name: "empty stream", args: [[]], expected: [] },
    {
      name: "all unique",
      args: [["a", "b", "c"]],
      expected: ["a", "a", "a"]
    },
    {
      name: "single repeat collapses then re-emerges",
      args: [["a", "b", "a", "c", "b"]],
      expected: ["a", "a", "b", "b", "c"]
    },
    {
      name: "all duplicates eventually clear",
      args: [["x", "x", "y", "y"]],
      expected: ["x", "", "y", ""]
    }
  ],
  hiddenTests: [
    {
      name: "stream of length one",
      args: [["solo"]],
      expected: ["solo"]
    },
    {
      name: "repeat at the end resurrects nothing",
      args: [["a", "b", "c", "a"]],
      expected: ["a", "a", "a", "b"]
    },
    {
      name: "everything repeats immediately",
      args: [["a", "a", "b", "b", "c", "c"]],
      expected: ["a", "", "b", "", "c", ""]
    },
    {
      name: "case-sensitive tokens",
      args: [["A", "a", "A", "B"]],
      expected: ["A", "A", "a", "a"]
    },
    {
      name: "longer interleaved stream",
      args: [["k", "i", "t", "t", "e", "n", "s", "i", "n", "k"]],
      expected: ["k", "k", "k", "k", "k", "k", "k", "k", "k", "e"]
    }
  ],
  hints: [
    "Keep a Counter to track frequency and an OrderedDict to keep the still-unique tokens in the order you first saw them.",
    "On the first sighting of a token, append it to the OrderedDict. On the second sighting, `del` it — that's the move that requires the OrderedDict (you can't iterate a Counter in insertion order after deletes cheaply).",
    "`next(iter(pending))` returns the front key of the OrderedDict — that's the oldest still-unique token in O(1)."
  ],
  solution:
    "On each step, bump the Counter for the incoming token. If its count became 1, append it to the OrderedDict; if it became 2, remove it from the OrderedDict. After that bookkeeping, the front of the OrderedDict (via `next(iter(...))`) is the oldest token whose count is still 1, which is exactly what we need to emit. Empty OrderedDict means there is no such token — emit \"\".",
  walkthrough:
    "The OrderedDict gives you two things a plain dict doesn't lean into: cheap by-front access (`next(iter(...))` is O(1)) and a clear invariant that a `del` does not disturb insertion order of the other keys. Together they let you maintain 'the oldest token whose count is exactly 1' across an entire stream without ever rescanning history.",
  followUps: [
    "How would you answer 'first unique within the last k tokens'?",
    "What changes if you want the LAST token whose count is exactly 1 instead of the first?"
  ],
  complexity: {
    time: "O(n) total — O(1) amortised per stream element",
    space: "O(distinct tokens)"
  }
});

export const orderedDictProblems: Problem[] = [lruCache, firstUnique];
