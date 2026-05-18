import { setProblem } from "./_shared";

const topWords = setProblem({
  id: "tek-top-k-words",
  title: "Top-K Words by Frequency",
  difficulty: "easy",
  patterns: ["tokenization", "counting", "stable tie-breaking"],
  entrypoint: "top_k_words",
  prompt:
    "Given a string `text` and an integer `k`, return the `k` most frequent words as a list of `[word, count]` pairs. Tokenize by treating any run of letters as one word and lowercasing it; ignore every non-letter character. Order the result by descending count, breaking ties by ascending word. If fewer than `k` distinct words exist, return all of them.",
  constraints: [
    "A word is a maximal run of ASCII letters [a-zA-Z].",
    "Words are case-insensitive: `Hello` and `hello` are the same word.",
    "Tie-break equal counts by ascending word.",
    "`k` is a non-negative integer; `k == 0` returns an empty list.",
    "If the text has no words, return an empty list."
  ],
  examples: [
    { name: "single word repeated", args: ["the the the", 1], expected: [["the", 3]] },
    {
      name: "alphabetical tie-break",
      args: ["a b c a b c", 2],
      expected: [["a", 2], ["b", 2]]
    }
  ],
  starterCode:
    "def top_k_words(text, k):\n" +
    "    # Return the k most frequent words as [word, count] pairs.\n" +
    "    # Tie-break by ascending word.\n" +
    "    pass\n",
  referenceCode:
    "import re\n" +
    "from collections import Counter\n\n" +
    "def top_k_words(text, k):\n" +
    "    if k <= 0:\n" +
    "        return []\n" +
    "    words = re.findall(r\"[a-zA-Z]+\", text.lower())\n" +
    "    counts = Counter(words)\n" +
    "    ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))\n" +
    "    return [[word, count] for word, count in ranked[:k]]\n",
  solutionCode:
    "import re\n" +
    "from collections import Counter\n\n" +
    "def top_k_words(text, k):\n" +
    "    if k <= 0:\n" +
    "        return []\n" +
    "    tokens = re.findall(r\"[a-zA-Z]+\", text.lower())\n" +
    "    counts = Counter(tokens)\n" +
    "    ordered = sorted(counts.items(), key=lambda item: (-item[1], item[0]))\n" +
    "    return [[word, count] for word, count in ordered[:k]]\n",
  visibleTests: [
    { name: "empty text", args: ["", 3], expected: [] },
    { name: "single word repeated", args: ["the the the", 1], expected: [["the", 3]] },
    {
      name: "alphabetical tie-break",
      args: ["a b c a b c", 2],
      expected: [["a", 2], ["b", 2]]
    },
    {
      name: "punctuation ignored",
      args: ["Hello, hello! HELLO?", 1],
      expected: [["hello", 3]]
    }
  ],
  hiddenTests: [
    {
      name: "k larger than vocabulary",
      args: ["x y", 5],
      expected: [["x", 1], ["y", 1]]
    },
    { name: "k zero", args: ["a a b", 0], expected: [] },
    {
      name: "mixed sentence",
      args: ["apple banana apple cherry banana apple", 2],
      expected: [["apple", 3], ["banana", 2]]
    },
    {
      name: "numbers excluded",
      args: ["abc123 abc 999", 2],
      expected: [["abc", 2]]
    },
    {
      name: "multi-way tie sorts alphabetically",
      args: ["zebra apple banana zebra apple banana", 3],
      expected: [["apple", 2], ["banana", 2], ["zebra", 2]]
    },
    {
      name: "hyphen splits words",
      args: ["well-known well known", 3],
      expected: [["known", 2], ["well", 2]]
    },
    {
      name: "apostrophe splits words",
      args: ["don't do don do", 3],
      expected: [["do", 2], ["don", 2], ["t", 1]]
    },
    {
      name: "whitespace only input",
      args: ["   \t  \n  ", 5],
      expected: []
    },
    {
      name: "tied counts more than k",
      args: ["a b c d e", 3],
      expected: [["a", 1], ["b", 1], ["c", 1]]
    },
    {
      name: "mixed case across input",
      args: ["The THE the tHe", 1],
      expected: [["the", 4]]
    }
  ],
  hints: [
    "Lowercase the text before tokenizing so case differences collapse.",
    "A regex that matches runs of letters gives you tokens without any non-letter characters.",
    "Sort by (-count, word) so higher counts come first and ties are alphabetical."
  ],
  solution:
    "Lowercase the text, extract runs of letters as tokens, and count them with `Counter`. Convert the counter to a list of items and sort by the key `(-count, word)`. Slice the first `k` entries and convert each tuple into a `[word, count]` list. Handle `k <= 0` up front by returning an empty list.",
  walkthrough:
    "The trickiest part is tie-breaking deterministically. Python's sort is stable, but stability alone is not enough when you also need descending counts; the composite key `(-count, word)` makes both directions explicit. Casting tuples to lists in the final step matches the test expectations.",
  followUps: [
    "How would you do this efficiently for a streaming text source?",
    "How would you use a heap instead of a full sort, and when is that worth it?",
    "How would you extend the tokenizer to keep apostrophes inside words like `don't`?"
  ],
  complexity: { time: "O(n + v log v) where v is the vocabulary size", space: "O(v)" }
});

const reconcile = setProblem({
  id: "tek-reconcile-inventory",
  title: "Reconcile Expected vs Observed Inventory",
  difficulty: "easy",
  patterns: ["dict diff", "set union", "sorted output"],
  entrypoint: "reconcile_inventory",
  prompt:
    "You are given two dicts: `expected` and `observed`, each mapping `sku -> quantity` (non-negative integers). Produce a sorted list of discrepancy rows. For each sku that appears in either dict, classify the row as: `missing` if the sku is in `expected` but not `observed`, `extra` if in `observed` but not `expected`, `short` if `observed[sku] < expected[sku]`, `over` if `observed[sku] > expected[sku]`. Exact matches do not appear in the output. Each row is `[sku, status, expected_qty, observed_qty, delta]` where `delta = observed_qty - expected_qty` (missing sku contributes 0 for the missing side). Return the rows sorted by sku ascending.",
  constraints: [
    "Keys are non-empty strings; quantities are non-negative integers.",
    "Skus that match exactly must be omitted from the output.",
    "`delta` is always `observed_qty - expected_qty`.",
    "A sku missing from one dict is treated as having quantity 0 for that dict.",
    "Output rows are sorted by sku ascending."
  ],
  examples: [
    {
      name: "single short",
      args: [{ apple: 10 }, { apple: 7 }],
      expected: [["apple", "short", 10, 7, -3]]
    },
    {
      name: "mixed report",
      args: [{ a: 5, c: 3 }, { a: 5, b: 1, c: 10 }],
      expected: [["b", "extra", 0, 1, 1], ["c", "over", 3, 10, 7]]
    }
  ],
  starterCode:
    "def reconcile_inventory(expected, observed):\n" +
    "    # Compare expected vs observed and return a sorted discrepancy report.\n" +
    "    # Each row: [sku, status, expected_qty, observed_qty, delta].\n" +
    "    pass\n",
  referenceCode:
    "def reconcile_inventory(expected, observed):\n" +
    "    rows = []\n" +
    "    skus = sorted(set(expected) | set(observed))\n" +
    "    for sku in skus:\n" +
    "        in_exp = sku in expected\n" +
    "        in_obs = sku in observed\n" +
    "        exp_qty = expected.get(sku, 0)\n" +
    "        obs_qty = observed.get(sku, 0)\n" +
    "        delta = obs_qty - exp_qty\n" +
    "        if not in_obs:\n" +
    "            rows.append([sku, \"missing\", exp_qty, 0, delta])\n" +
    "        elif not in_exp:\n" +
    "            rows.append([sku, \"extra\", 0, obs_qty, delta])\n" +
    "        elif obs_qty < exp_qty:\n" +
    "            rows.append([sku, \"short\", exp_qty, obs_qty, delta])\n" +
    "        elif obs_qty > exp_qty:\n" +
    "            rows.append([sku, \"over\", exp_qty, obs_qty, delta])\n" +
    "    return rows\n",
  solutionCode:
    "def reconcile_inventory(expected, observed):\n" +
    "    out = []\n" +
    "    for sku in sorted(set(expected) | set(observed)):\n" +
    "        exp = expected.get(sku)\n" +
    "        obs = observed.get(sku)\n" +
    "        if exp is None:\n" +
    "            out.append([sku, \"extra\", 0, obs, obs])\n" +
    "        elif obs is None:\n" +
    "            out.append([sku, \"missing\", exp, 0, -exp])\n" +
    "        elif obs < exp:\n" +
    "            out.append([sku, \"short\", exp, obs, obs - exp])\n" +
    "        elif obs > exp:\n" +
    "            out.append([sku, \"over\", exp, obs, obs - exp])\n" +
    "    return out\n",
  visibleTests: [
    { name: "both empty", args: [{}, {}], expected: [] },
    {
      name: "exact match is omitted",
      args: [{ apple: 5 }, { apple: 5 }],
      expected: []
    },
    {
      name: "single short row",
      args: [{ apple: 10 }, { apple: 7 }],
      expected: [["apple", "short", 10, 7, -3]]
    },
    {
      name: "missing sku in observed",
      args: [{ apple: 5 }, {}],
      expected: [["apple", "missing", 5, 0, -5]]
    },
    {
      name: "extra sku in observed",
      args: [{}, { apple: 5 }],
      expected: [["apple", "extra", 0, 5, 5]]
    },
    {
      name: "all four statuses sorted",
      args: [
        { a: 1, b: 2, c: 3, d: 4 },
        { a: 1, b: 5, d: 1, e: 9 }
      ],
      expected: [
        ["b", "over", 2, 5, 3],
        ["c", "missing", 3, 0, -3],
        ["d", "short", 4, 1, -3],
        ["e", "extra", 0, 9, 9]
      ]
    }
  ],
  hiddenTests: [
    {
      name: "single over row",
      args: [{ apple: 5 }, { apple: 8 }],
      expected: [["apple", "over", 5, 8, 3]]
    },
    {
      name: "delta sign on missing is negative",
      args: [{ widget: 12 }, {}],
      expected: [["widget", "missing", 12, 0, -12]]
    },
    {
      name: "input dicts are not mutated",
      args: [{ a: 5 }, { a: 5 }],
      expected: []
    },
    {
      name: "mixed report sorted by sku",
      args: [{ a: 5, c: 3 }, { a: 5, b: 1, c: 10 }],
      expected: [["b", "extra", 0, 1, 1], ["c", "over", 3, 10, 7]]
    },
    {
      name: "lex sort across long sku names",
      args: [
        { zebra: 1, alpha: 5, mango: 3 },
        { alpha: 6, mango: 3, zebra: 1, banana: 2 }
      ],
      expected: [
        ["alpha", "over", 5, 6, 1],
        ["banana", "extra", 0, 2, 2]
      ]
    },
    {
      name: "zero observed treated as short not missing",
      args: [{ a: 5 }, { a: 0 }],
      expected: [["a", "short", 5, 0, -5]]
    },
    {
      name: "zero expected treated as over not extra",
      args: [{ a: 0 }, { a: 5 }],
      expected: [["a", "over", 0, 5, 5]]
    }
  ],
  hints: [
    "Iterate the union of keys so you naturally pick up both missing and extra skus.",
    "A row's status depends only on which dicts the sku is in and how the quantities compare.",
    "Sort the union of keys once; do not sort the output afterwards."
  ],
  solution:
    "Build the sorted union of all skus in `expected` and `observed`. Walk that union and classify each sku based on presence and quantity comparison. Skip skus where both quantities are present and equal. The `delta` is consistently `observed - expected`, which is negative for `short` and `missing` and positive for `over` and `extra`.",
  walkthrough:
    "Two dicts plus a status enum cover every interesting case. The trap is to think you need four loops or four separate passes; one walk over the sorted union is enough, and it keeps the output order deterministic for free.",
  followUps: [
    "How would you also compute the total dollar impact given a `{sku: unit_price}` price book?",
    "How would you aggregate by category if each sku carried a category code?",
    "What changes if the input is streamed from two sorted files rather than fully materialized dicts?"
  ],
  complexity: { time: "O(u log u) where u is the size of the sku union", space: "O(u)" }
});

const revenueByRegion = setProblem({
  id: "tek-revenue-by-region",
  title: "Revenue by Region (Join + Roll-up)",
  difficulty: "medium",
  patterns: ["hash join", "group-by", "aggregation"],
  entrypoint: "revenue_by_region",
  prompt:
    "You are given two lists. `customers` is a list of dicts, each with an integer `id` and a string `region`. `orders` is a list of dicts, each with a `customer_id` and an integer `amount` in cents. Join orders to customers on the customer id and return a dict mapping `region -> total order amount` for that region. An order whose `customer_id` does not match any customer is dropped entirely. A region only appears in the output if at least one matched order rolled up into it.",
  constraints: [
    "0 <= len(customers), len(orders) <= 100000.",
    "Customer ids are unique within the customers list; customer ids and order customer_id values are integers.",
    "An order with no matching customer is ignored, not bucketed.",
    "Amounts are non-negative integers and may be zero.",
    "Return a dict of region -> summed integer amount."
  ],
  examples: [
    {
      name: "two regions",
      args: [
        [{ id: 1, region: "US" }, { id: 2, region: "EU" }],
        [{ customer_id: 1, amount: 100 }, { customer_id: 2, amount: 50 }, { customer_id: 1, amount: 25 }]
      ],
      expected: { US: 125, EU: 50 }
    }
  ],
  starterCode:
    "def revenue_by_region(customers, orders):\n" +
    "    # Build a customer_id -> region lookup, then roll orders up by region.\n" +
    "    pass\n",
  referenceCode: `def revenue_by_region(customers, orders):
    region_of = {c["id"]: c["region"] for c in customers}
    totals = {}
    for order in orders:
        region = region_of.get(order["customer_id"])
        if region is None:
            continue
        totals[region] = totals.get(region, 0) + order["amount"]
    return totals
`,
  solutionCode: `def revenue_by_region(customers, orders):
    region_of = {}
    for c in customers:
        region_of[c["id"]] = c["region"]
    totals = {}
    for order in orders:
        cid = order["customer_id"]
        if cid not in region_of:
            continue
        region = region_of[cid]
        totals.setdefault(region, 0)
        totals[region] += order["amount"]
    return totals
`,
  visibleTests: [
    { name: "empty everything", args: [[], []], expected: {} },
    {
      name: "two regions",
      args: [
        [{ id: 1, region: "US" }, { id: 2, region: "EU" }],
        [{ customer_id: 1, amount: 100 }, { customer_id: 2, amount: 50 }, { customer_id: 1, amount: 25 }]
      ],
      expected: { US: 125, EU: 50 }
    },
    {
      name: "unmatched order dropped",
      args: [
        [{ id: 1, region: "US" }],
        [{ customer_id: 9, amount: 100 }]
      ],
      expected: {}
    }
  ],
  hiddenTests: [
    {
      name: "two customers same region",
      args: [
        [{ id: 1, region: "US" }, { id: 2, region: "US" }],
        [{ customer_id: 1, amount: 10 }, { customer_id: 2, amount: 5 }]
      ],
      expected: { US: 15 }
    },
    {
      name: "customer with no orders absent",
      args: [
        [{ id: 1, region: "US" }, { id: 2, region: "EU" }],
        [{ customer_id: 1, amount: 40 }]
      ],
      expected: { US: 40 }
    },
    {
      name: "zero amount still creates region",
      args: [
        [{ id: 1, region: "APAC" }],
        [{ customer_id: 1, amount: 0 }]
      ],
      expected: { APAC: 0 }
    },
    {
      name: "mixed matched and unmatched",
      args: [
        [{ id: 1, region: "US" }, { id: 2, region: "EU" }],
        [
          { customer_id: 1, amount: 30 },
          { customer_id: 7, amount: 999 },
          { customer_id: 2, amount: 20 },
          { customer_id: 2, amount: 5 }
        ]
      ],
      expected: { US: 30, EU: 25 }
    },
    {
      name: "no orders at all",
      args: [
        [{ id: 1, region: "US" }],
        []
      ],
      expected: {}
    }
  ],
  hints: [
    "A dict comprehension turns the customers list into an O(1) customer_id -> region lookup so the join is a single pass.",
    "Use `dict.get` with a default of 0 (or `setdefault`) to accumulate per-region totals without a separate initialization pass.",
    "Skip — do not bucket — any order whose customer id is missing from the lookup."
  ],
  solution:
    "Build a hash map from customer id to region from the customers list. Then make one pass over orders: look up each order's region, skip the order if the lookup misses, and otherwise add the amount to that region's running total. The output naturally contains only regions that received at least one matched order.",
  walkthrough:
    "This is the classic 'join then group-by' shape. The hash join turns what looks like a nested loop into two linear passes. The drop-on-miss rule is enforced at exactly one place — the lookup — and the 'region only appears if it got an order' property is automatic because totals keys are created lazily on first hit.",
  followUps: [
    "How would you also return the number of orders and the average amount per region?",
    "What changes if a customer can belong to several regions over time and each order carries its own timestamp?"
  ],
  complexity: { time: "O(c + o) for c customers and o orders", space: "O(c + r) for the lookup and r regions" },
  parts: [
    {
      id: "part-2-stats",
      title: "Part 2: Per-region statistics",
      prompt:
        "Extend the roll-up. Instead of a single number per region, return a dict mapping `region -> {\"total\": <summed amount>, \"count\": <number of matched orders>}`. The same join and drop-unmatched rules apply. A region appears only if at least one matched order contributed to it, and `count` is the number of matched orders for that region (never zero in the output).",
      entrypoint: "revenue_stats_by_region",
      starterCode:
        "def revenue_stats_by_region(customers, orders):\n" +
        "    # Same join as Part 1, but accumulate both a total and a count per region.\n" +
        "    pass\n",
      referenceCode: `def revenue_stats_by_region(customers, orders):
    region_of = {c["id"]: c["region"] for c in customers}
    stats = {}
    for order in orders:
        region = region_of.get(order["customer_id"])
        if region is None:
            continue
        bucket = stats.setdefault(region, {"total": 0, "count": 0})
        bucket["total"] += order["amount"]
        bucket["count"] += 1
    return stats
`,
      solutionCode: `def revenue_stats_by_region(customers, orders):
    region_of = {c["id"]: c["region"] for c in customers}
    stats = {}
    for order in orders:
        cid = order["customer_id"]
        if cid not in region_of:
            continue
        r = region_of[cid]
        if r not in stats:
            stats[r] = {"total": 0, "count": 0}
        stats[r]["total"] += order["amount"]
        stats[r]["count"] += 1
    return stats
`,
      visibleTests: [
        { name: "empty stats", args: [[], []], expected: {} },
        {
          name: "two regions with counts",
          args: [
            [{ id: 1, region: "US" }, { id: 2, region: "EU" }],
            [{ customer_id: 1, amount: 100 }, { customer_id: 2, amount: 50 }, { customer_id: 1, amount: 25 }]
          ],
          expected: { US: { total: 125, count: 2 }, EU: { total: 50, count: 1 } }
        }
      ],
      hiddenTests: [
        {
          name: "unmatched not counted",
          args: [
            [{ id: 1, region: "US" }],
            [{ customer_id: 1, amount: 10 }, { customer_id: 9, amount: 99 }]
          ],
          expected: { US: { total: 10, count: 1 } }
        },
        {
          name: "zero amount counts as an order",
          args: [
            [{ id: 1, region: "APAC" }],
            [{ customer_id: 1, amount: 0 }, { customer_id: 1, amount: 5 }]
          ],
          expected: { APAC: { total: 5, count: 2 } }
        }
      ],
      hints: [
        "Reuse the exact same join; only the accumulator shape changes from an int to a small dict.",
        "`setdefault(region, {\"total\": 0, \"count\": 0})` gives you the bucket to update in one line.",
        "Increment count once per matched order, independent of the amount value."
      ],
      solution:
        "Identical join to Part 1. The only change is that each region maps to a small record with a running total and a running count; on every matched order, add the amount to total and add one to count.",
      walkthrough:
        "The lesson is that the join is the stable part and the accumulator is the variable part. Swapping a scalar accumulator for a structured one is the general move that takes you from 'sum by group' to 'arbitrary stats by group' without touching the join logic.",
      complexity: { time: "O(c + o)", space: "O(c + r)" }
    }
  ]
});

export const aggregationProblems = [topWords, reconcile, revenueByRegion];
