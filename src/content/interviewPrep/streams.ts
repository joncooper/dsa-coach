import { setProblem } from "./_shared";

const tradePnl = setProblem({
  id: "tek-trade-pnl",
  title: "Realized P&L from a Trade Tape",
  difficulty: "medium",
  patterns: ["queue", "FIFO matching", "domain modeling"],
  entrypoint: "realized_pnl",
  prompt:
    "You are given a chronological list of trades for a single instrument. Each trade is a dict with keys `side` (`\"BUY\"` or `\"SELL\"`), `qty` (positive integer), and `price` (integer cents per share). Compute the total realized profit and loss in cents using FIFO lot matching: every SELL is matched against the oldest unsold BUY lots in order. Unmatched BUY quantity remains as open inventory and does not contribute to realized P&L. Trades are processed in input order; you may assume the input never sells more than has been bought.",
  constraints: [
    "0 <= len(trades) <= 10000.",
    "Every trade has positive qty and price.",
    "A SELL is always covered by prior unsold BUY lots.",
    "Use FIFO matching: oldest BUY lot is matched first.",
    "Return the integer total realized P&L in cents."
  ],
  examples: [
    {
      name: "two-lot fifo",
      args: [[
        { side: "BUY", qty: 100, price: 50 },
        { side: "BUY", qty: 100, price: 60 },
        { side: "SELL", qty: 150, price: 70 }
      ]],
      expected: 2500
    }
  ],
  starterCode:
    "def realized_pnl(trades):\n" +
    "    # Match every SELL against the oldest unsold BUY lots (FIFO).\n" +
    "    # Return the total realized P&L in integer cents.\n" +
    "    pass\n",
  referenceCode:
    "from collections import deque\n\n" +
    "def realized_pnl(trades):\n" +
    "    lots = deque()\n" +
    "    total = 0\n" +
    "    for trade in trades:\n" +
    "        side = trade[\"side\"]\n" +
    "        qty = trade[\"qty\"]\n" +
    "        price = trade[\"price\"]\n" +
    "        if side == \"BUY\":\n" +
    "            lots.append([qty, price])\n" +
    "        elif side == \"SELL\":\n" +
    "            remaining = qty\n" +
    "            while remaining > 0 and lots:\n" +
    "                lot_qty, lot_price = lots[0]\n" +
    "                matched = lot_qty if lot_qty <= remaining else remaining\n" +
    "                total += (price - lot_price) * matched\n" +
    "                remaining -= matched\n" +
    "                if matched == lot_qty:\n" +
    "                    lots.popleft()\n" +
    "                else:\n" +
    "                    lots[0][0] = lot_qty - matched\n" +
    "    return total\n",
  solutionCode:
    "from collections import deque\n\n" +
    "def realized_pnl(trades):\n" +
    "    lots = deque()\n" +
    "    total = 0\n" +
    "    for trade in trades:\n" +
    "        if trade[\"side\"] == \"BUY\":\n" +
    "            lots.append([trade[\"qty\"], trade[\"price\"]])\n" +
    "            continue\n" +
    "        remaining = trade[\"qty\"]\n" +
    "        price = trade[\"price\"]\n" +
    "        while remaining > 0 and lots:\n" +
    "            lot_qty, lot_price = lots[0]\n" +
    "            matched = min(remaining, lot_qty)\n" +
    "            total += (price - lot_price) * matched\n" +
    "            remaining -= matched\n" +
    "            lot_qty -= matched\n" +
    "            if lot_qty == 0:\n" +
    "                lots.popleft()\n" +
    "            else:\n" +
    "                lots[0][0] = lot_qty\n" +
    "    return total\n",
  visibleTests: [
    { name: "empty tape", args: [[]], expected: 0 },
    { name: "buy only no realized", args: [[{ side: "BUY", qty: 100, price: 50 }]], expected: 0 },
    {
      name: "simple round trip",
      args: [[
        { side: "BUY", qty: 10, price: 50 },
        { side: "SELL", qty: 10, price: 70 }
      ]],
      expected: 200
    },
    {
      name: "two-lot fifo",
      args: [[
        { side: "BUY", qty: 100, price: 50 },
        { side: "BUY", qty: 100, price: 60 },
        { side: "SELL", qty: 150, price: 70 }
      ]],
      expected: 2500
    }
  ],
  hiddenTests: [
    {
      name: "partial sell leaves open lot",
      args: [[
        { side: "BUY", qty: 100, price: 50 },
        { side: "SELL", qty: 30, price: 70 }
      ]],
      expected: 600
    },
    {
      name: "multiple sells against same lot",
      args: [[
        { side: "BUY", qty: 100, price: 50 },
        { side: "SELL", qty: 50, price: 70 },
        { side: "SELL", qty: 50, price: 80 }
      ]],
      expected: 2500
    },
    {
      name: "realized loss",
      args: [[
        { side: "BUY", qty: 10, price: 100 },
        { side: "SELL", qty: 10, price: 90 }
      ]],
      expected: -100
    },
    {
      name: "interleaved buys and sells",
      args: [[
        { side: "BUY", qty: 50, price: 10 },
        { side: "SELL", qty: 20, price: 15 },
        { side: "BUY", qty: 30, price: 12 },
        { side: "SELL", qty: 40, price: 14 }
      ]],
      expected: 240
    },
    {
      name: "exact lot match clears queue",
      args: [[
        { side: "BUY", qty: 10, price: 50 },
        { side: "BUY", qty: 10, price: 60 },
        { side: "SELL", qty: 10, price: 70 },
        { side: "BUY", qty: 5, price: 40 },
        { side: "SELL", qty: 15, price: 80 }
      ]],
      expected: 600
    },
    {
      name: "single sell drains three lots in order",
      args: [[
        { side: "BUY", qty: 10, price: 1 },
        { side: "BUY", qty: 10, price: 2 },
        { side: "BUY", qty: 10, price: 3 },
        { side: "SELL", qty: 30, price: 5 }
      ]],
      expected: 90
    },
    {
      name: "mixed wins and losses across many trades",
      args: [[
        { side: "BUY", qty: 100, price: 50 },
        { side: "SELL", qty: 40, price: 60 },
        { side: "BUY", qty: 20, price: 80 },
        { side: "SELL", qty: 60, price: 55 },
        { side: "SELL", qty: 20, price: 70 }
      ]],
      expected: 500
    },
    {
      name: "sell of one against thousand-lot buy",
      args: [[
        { side: "BUY", qty: 1000, price: 100 },
        { side: "SELL", qty: 1, price: 200 }
      ]],
      expected: 100
    }
  ],
  hints: [
    "A deque of open lots gives you O(1) access to the oldest unsold BUY.",
    "A SELL may consume part of a lot. Track remaining quantity for both the SELL and the front lot until one of them hits zero.",
    "Keep total P&L in integer cents so you do not introduce float comparison errors."
  ],
  solution:
    "Maintain a FIFO queue of open BUY lots as (qty, price) pairs. On each SELL, repeatedly take the oldest lot and match the smaller of its remaining quantity and the SELL's remaining quantity. Add (sell_price - lot_price) * matched to the running total. Pop the lot when it is fully consumed; otherwise reduce its remaining quantity in place.",
  walkthrough:
    "Buys append a new lot to the right of the queue. Sells drain lots from the left. Each lot can be partially consumed by several sells before it is popped, and each sell can consume several lots before it is satisfied. The two loops are bounded together: every iteration either advances the sell's remaining quantity toward zero or pops a lot from the queue, so the total work across a sell is linear in the number of lots it touches.",
  followUps: [
    "How would you also report the unrealized P&L given a current mark price?",
    "What changes if the firm uses LIFO rather than FIFO for matching?"
  ],
  complexity: { time: "O(n + m) where m is the total number of lot fragments touched", space: "O(open lots)" },
  parts: [
    {
      id: "part-2-multi-instrument",
      title: "Part 2: Multiple instruments",
      prompt:
        "Now the tape contains trades for many instruments. Each trade has an additional `symbol` field (string). FIFO lots are tracked per symbol — a SELL in one symbol never consumes BUY lots from another. Return a dict mapping `symbol -> total realized P&L in cents`. Symbols that never had a SELL should not appear in the output. A symbol whose realized P&L is exactly zero (because of offsetting wins and losses) does appear.",
      entrypoint: "realized_pnl_by_symbol",
      starterCode:
        "def realized_pnl_by_symbol(trades):\n" +
        "    # Per-symbol FIFO matching. Return {symbol: realized_pnl_cents}.\n" +
        "    pass\n",
      referenceCode:
        "from collections import defaultdict, deque\n\n" +
        "def realized_pnl_by_symbol(trades):\n" +
        "    lots = defaultdict(deque)\n" +
        "    totals = {}\n" +
        "    for trade in trades:\n" +
        "        symbol = trade[\"symbol\"]\n" +
        "        qty = trade[\"qty\"]\n" +
        "        price = trade[\"price\"]\n" +
        "        if trade[\"side\"] == \"BUY\":\n" +
        "            lots[symbol].append([qty, price])\n" +
        "            continue\n" +
        "        if symbol not in totals:\n" +
        "            totals[symbol] = 0\n" +
        "        remaining = qty\n" +
        "        while remaining > 0 and lots[symbol]:\n" +
        "            lot_qty, lot_price = lots[symbol][0]\n" +
        "            matched = min(remaining, lot_qty)\n" +
        "            totals[symbol] += (price - lot_price) * matched\n" +
        "            remaining -= matched\n" +
        "            if matched == lot_qty:\n" +
        "                lots[symbol].popleft()\n" +
        "            else:\n" +
        "                lots[symbol][0][0] = lot_qty - matched\n" +
        "    return totals\n",
      solutionCode:
        "from collections import defaultdict, deque\n\n" +
        "def realized_pnl_by_symbol(trades):\n" +
        "    lots = defaultdict(deque)\n" +
        "    pnl = {}\n" +
        "    for trade in trades:\n" +
        "        sym = trade[\"symbol\"]\n" +
        "        if trade[\"side\"] == \"BUY\":\n" +
        "            lots[sym].append([trade[\"qty\"], trade[\"price\"]])\n" +
        "            continue\n" +
        "        pnl.setdefault(sym, 0)\n" +
        "        remaining = trade[\"qty\"]\n" +
        "        price = trade[\"price\"]\n" +
        "        while remaining > 0 and lots[sym]:\n" +
        "            lot_qty, lot_price = lots[sym][0]\n" +
        "            matched = remaining if remaining < lot_qty else lot_qty\n" +
        "            pnl[sym] += (price - lot_price) * matched\n" +
        "            remaining -= matched\n" +
        "            if matched == lot_qty:\n" +
        "                lots[sym].popleft()\n" +
        "            else:\n" +
        "                lots[sym][0][0] = lot_qty - matched\n" +
        "    return pnl\n",
      visibleTests: [
        { name: "empty tape multi", args: [[]], expected: {} },
        {
          name: "single symbol round trip",
          args: [[
            { symbol: "AAPL", side: "BUY", qty: 10, price: 50 },
            { symbol: "AAPL", side: "SELL", qty: 10, price: 70 }
          ]],
          expected: { AAPL: 200 }
        },
        {
          name: "two symbols interleaved",
          args: [[
            { symbol: "AAPL", side: "BUY", qty: 10, price: 50 },
            { symbol: "MSFT", side: "BUY", qty: 5, price: 30 },
            { symbol: "AAPL", side: "SELL", qty: 10, price: 70 },
            { symbol: "MSFT", side: "SELL", qty: 5, price: 35 }
          ]],
          expected: { AAPL: 200, MSFT: 25 }
        },
        {
          name: "buy-only symbol omitted",
          args: [[
            { symbol: "AAPL", side: "BUY", qty: 10, price: 50 }
          ]],
          expected: {}
        }
      ],
      hiddenTests: [
        {
          name: "partial sells per symbol",
          args: [[
            { symbol: "X", side: "BUY", qty: 100, price: 10 },
            { symbol: "Y", side: "BUY", qty: 100, price: 20 },
            { symbol: "X", side: "SELL", qty: 30, price: 12 },
            { symbol: "Y", side: "SELL", qty: 50, price: 25 }
          ]],
          expected: { X: 60, Y: 250 }
        },
        {
          name: "symbols do not share lots",
          args: [[
            { symbol: "X", side: "BUY", qty: 10, price: 100 },
            { symbol: "Y", side: "BUY", qty: 10, price: 50 },
            { symbol: "X", side: "SELL", qty: 10, price: 60 }
          ]],
          expected: { X: -400 }
        },
        {
          name: "offsetting net zero still reported",
          args: [[
            { symbol: "A", side: "BUY", qty: 10, price: 100 },
            { symbol: "A", side: "BUY", qty: 10, price: 50 },
            { symbol: "A", side: "SELL", qty: 10, price: 50 },
            { symbol: "A", side: "SELL", qty: 10, price: 100 }
          ]],
          expected: { A: 0 }
        }
      ],
      hints: [
        "Reuse the Part 1 logic but key every piece of state by symbol.",
        "A `defaultdict(deque)` keeps the per-symbol FIFO queues clean.",
        "Only write into the output dict from the SELL branch so buy-only symbols are naturally excluded."
      ],
      solution:
        "Maintain a per-symbol `defaultdict(deque)` of open BUY lots and a dict of running totals keyed by symbol. On every SELL, ensure the symbol exists in the totals dict (so net-zero realized still shows up), then drain the symbol's lot queue exactly as in Part 1, accumulating P&L into that symbol's total. Buy-only symbols never reach the totals dict and are therefore omitted from the result.",
      walkthrough:
        "The shape of the algorithm is unchanged; only the lookups become two-step (symbol, then position). The output rule (\"include symbols that had a SELL even if net zero, omit symbols with no SELL\") is enforced by where you initialize the totals entry — at the start of the SELL branch, not at trade ingest.",
      complexity: { time: "O(t) amortized across all trades", space: "O(s + open lots) where s is the number of symbols" }
    }
  ]
});

const logErrors = setProblem({
  id: "tek-log-errors-per-hour",
  title: "Error Counts Per Hour",
  difficulty: "easy",
  patterns: ["string parsing", "grouping", "tokenization"],
  entrypoint: "errors_per_hour",
  prompt:
    "You are given a list of log lines. Each well-formed line begins with an ISO-8601 timestamp `YYYY-MM-DDTHH:MM:SS`, then a single space, then a level token (`INFO`, `WARN`, or `ERROR`), then a space, then a free-text message. Return a dict mapping each hour string `YYYY-MM-DDTHH` to the number of `ERROR` lines whose timestamp falls in that hour. Skip lines that do not have at least a timestamp and a level token. Non-`ERROR` lines do not appear in the output.",
  constraints: [
    "0 <= len(lines) <= 100000.",
    "A line is well-formed when split on spaces yields a timestamp followed by a level token.",
    "Ignore malformed lines instead of raising.",
    "Only `ERROR` lines contribute to the counts.",
    "Hours with zero errors should not appear as keys."
  ],
  examples: [
    {
      name: "two errors same hour",
      args: [[
        "2025-01-15T14:00:00 ERROR connect failed",
        "2025-01-15T14:59:59 ERROR retry failed",
        "2025-01-15T15:00:00 INFO healthy"
      ]],
      expected: { "2025-01-15T14": 2 }
    }
  ],
  starterCode:
    "def errors_per_hour(lines):\n" +
    "    # Return a dict mapping YYYY-MM-DDTHH to the number of ERROR lines.\n" +
    "    pass\n",
  referenceCode:
    "def errors_per_hour(lines):\n" +
    "    counts = {}\n" +
    "    for line in lines:\n" +
    "        parts = line.split(\" \", 2)\n" +
    "        if len(parts) < 2:\n" +
    "            continue\n" +
    "        timestamp, level = parts[0], parts[1]\n" +
    "        if level != \"ERROR\":\n" +
    "            continue\n" +
    "        if len(timestamp) < 13 or timestamp[10] != \"T\":\n" +
    "            continue\n" +
    "        hour = timestamp[:13]\n" +
    "        counts[hour] = counts.get(hour, 0) + 1\n" +
    "    return counts\n",
  solutionCode:
    "def errors_per_hour(lines):\n" +
    "    counts = {}\n" +
    "    for line in lines:\n" +
    "        head = line.split(\" \", 2)\n" +
    "        if len(head) < 2:\n" +
    "            continue\n" +
    "        timestamp, level = head[0], head[1]\n" +
    "        if level != \"ERROR\":\n" +
    "            continue\n" +
    "        if len(timestamp) < 13 or timestamp[10] != \"T\":\n" +
    "            continue\n" +
    "        hour = timestamp[:13]\n" +
    "        counts[hour] = counts.get(hour, 0) + 1\n" +
    "    return counts\n",
  visibleTests: [
    { name: "empty input", args: [[]], expected: {} },
    {
      name: "two errors one info",
      args: [[
        "2025-01-15T14:00:00 ERROR connect failed",
        "2025-01-15T14:59:59 ERROR retry failed",
        "2025-01-15T15:00:00 INFO healthy"
      ]],
      expected: { "2025-01-15T14": 2 }
    },
    {
      name: "only non-errors",
      args: [[
        "2025-01-15T14:00:00 INFO ok",
        "2025-01-15T14:30:00 WARN slow"
      ]],
      expected: {}
    }
  ],
  hiddenTests: [
    {
      name: "spans multiple hours",
      args: [[
        "2025-02-01T09:01:00 ERROR a",
        "2025-02-01T09:55:00 ERROR b",
        "2025-02-01T10:00:00 ERROR c",
        "2025-02-01T11:59:59 WARN d"
      ]],
      expected: { "2025-02-01T09": 2, "2025-02-01T10": 1 }
    },
    {
      name: "ignores malformed line",
      args: [[
        "garbage",
        "2025-02-01T09:01:00 ERROR a"
      ]],
      expected: { "2025-02-01T09": 1 }
    },
    {
      name: "all errors same minute",
      args: [[
        "2026-05-15T08:00:00 ERROR x",
        "2026-05-15T08:00:01 ERROR y",
        "2026-05-15T08:00:02 ERROR z"
      ]],
      expected: { "2026-05-15T08": 3 }
    },
    {
      name: "level match is case sensitive",
      args: [[
        "2025-01-15T14:00:00 error lowercase",
        "2025-01-15T14:00:00 Error mixed",
        "2025-01-15T14:00:00 ERROR upper"
      ]],
      expected: { "2025-01-15T14": 1 }
    },
    {
      name: "ERROR appearing in message text is not a level",
      args: [[
        "2025-01-15T14:00:00 INFO request failed ERROR retry",
        "2025-01-15T15:00:00 ERROR genuine"
      ]],
      expected: { "2025-01-15T15": 1 }
    },
    {
      name: "buckets across day boundary stay distinct",
      args: [[
        "2025-01-15T23:59:59 ERROR late",
        "2025-01-16T00:00:00 ERROR early",
        "2025-01-16T00:30:00 ERROR mid"
      ]],
      expected: { "2025-01-15T23": 1, "2025-01-16T00": 2 }
    },
    {
      name: "single-token line is ignored",
      args: [[
        "2025-01-15T14:00:00",
        "2025-01-15T14:01:00 ERROR good"
      ]],
      expected: { "2025-01-15T14": 1 }
    },
    {
      name: "non-ISO timestamp ignored",
      args: [[
        "15-01-2025 14:00:00 ERROR euro-format",
        "2025-01-15T14:00:00 ERROR iso"
      ]],
      expected: { "2025-01-15T14": 1 }
    }
  ],
  hints: [
    "Split each line into at most three parts so the message can still contain spaces.",
    "The hour key is just the first thirteen characters of a well-formed timestamp.",
    "Validate the timestamp shape before slicing so a malformed line cannot corrupt the output."
  ],
  solution:
    "Walk the lines once. For each line, split into timestamp, level, and message. Skip lines that do not have at least a timestamp and a level, and lines whose level is not `ERROR`. For the remaining lines, the hour bucket is the timestamp truncated to thirteen characters. Increment that bucket in a dict.",
  walkthrough:
    "The work is a single pass over the input. The dict's `get(key, 0) + 1` pattern is the standard counter idiom and avoids any KeyError on a fresh bucket. The validation step (length and the `T` separator) keeps the function robust to a noisy log file.",
  followUps: [
    "How would you also return a sorted list of (hour, count) tuples?",
    "How would you stream this over a file that does not fit in memory?",
    "How would you parameterize the level filter so callers can ask for WARN counts as well?"
  ],
  complexity: { time: "O(n) where n is the number of lines", space: "O(h) where h is the number of distinct hours with errors" }
});

const rateLimiter = setProblem({
  id: "tek-rate-limiter",
  title: "Per-User Sliding-Window Rate Limiter",
  difficulty: "medium",
  patterns: ["sliding window", "queue per key", "stream processing"],
  entrypoint: "rate_limited",
  prompt:
    "Process a stream of events `[[timestamp, user_id], ...]` already sorted by `timestamp` (integer seconds, non-decreasing). For each event, decide whether the request is accepted. The rule per user: a request is accepted only if strictly fewer than `limit` of that user's previously accepted requests have timestamps within the last `window` seconds (counting requests whose timestamp difference from the current one is strictly less than `window`). Rejected requests do not count toward the limit. Return a list of booleans with one entry per event, in input order, where `True` means accepted.",
  constraints: [
    "0 <= len(events) <= 100000.",
    "Timestamps are non-decreasing across the input.",
    "Rejected requests do not consume rate-limit budget.",
    "Each user is rate-limited independently.",
    "1 <= limit, 1 <= window."
  ],
  examples: [
    {
      name: "two accepted then one rejected",
      args: [[[1, "a"], [2, "a"], [3, "a"]], 2, 5],
      expected: [true, true, false]
    },
    {
      name: "different users do not interfere",
      args: [[[1, "a"], [2, "b"]], 1, 10],
      expected: [true, true]
    }
  ],
  starterCode:
    "def rate_limited(events, limit, window):\n" +
    "    # Return a list of booleans matching the events list.\n" +
    "    # Each user gets `limit` requests per sliding `window` seconds.\n" +
    "    pass\n",
  referenceCode:
    "from collections import defaultdict, deque\n\n" +
    "def rate_limited(events, limit, window):\n" +
    "    accepted = defaultdict(deque)\n" +
    "    out = []\n" +
    "    for timestamp, user_id in events:\n" +
    "        queue = accepted[user_id]\n" +
    "        while queue and queue[0] <= timestamp - window:\n" +
    "            queue.popleft()\n" +
    "        if len(queue) < limit:\n" +
    "            queue.append(timestamp)\n" +
    "            out.append(True)\n" +
    "        else:\n" +
    "            out.append(False)\n" +
    "    return out\n",
  solutionCode:
    "from collections import defaultdict, deque\n\n" +
    "def rate_limited(events, limit, window):\n" +
    "    history = defaultdict(deque)\n" +
    "    result = []\n" +
    "    for timestamp, user_id in events:\n" +
    "        q = history[user_id]\n" +
    "        cutoff = timestamp - window\n" +
    "        while q and q[0] <= cutoff:\n" +
    "            q.popleft()\n" +
    "        if len(q) < limit:\n" +
    "            q.append(timestamp)\n" +
    "            result.append(True)\n" +
    "        else:\n" +
    "            result.append(False)\n" +
    "    return result\n",
  visibleTests: [
    { name: "empty stream", args: [[], 5, 10], expected: [] },
    {
      name: "two accepted then one rejected",
      args: [[[1, "a"], [2, "a"], [3, "a"]], 2, 5],
      expected: [true, true, false]
    },
    {
      name: "different users do not interfere",
      args: [[[1, "a"], [2, "b"]], 1, 10],
      expected: [true, true]
    },
    {
      name: "edge-of-window allowed",
      args: [[[0, "a"], [5, "a"]], 1, 5],
      expected: [true, true]
    }
  ],
  hiddenTests: [
    {
      name: "rejected does not consume budget",
      args: [[[0, "a"], [1, "a"], [5, "a"], [6, "a"]], 1, 5],
      expected: [true, false, true, false]
    },
    {
      name: "burst at same timestamp",
      args: [[[0, "a"], [0, "a"], [0, "a"]], 2, 10],
      expected: [true, true, false]
    },
    {
      name: "user resets after gap",
      args: [[[0, "a"], [4, "a"], [9, "a"], [13, "a"]], 1, 5],
      expected: [true, false, true, false]
    },
    {
      name: "multiple users interleaved",
      args: [[[0, "a"], [1, "b"], [2, "a"], [3, "b"], [4, "a"]], 2, 10],
      expected: [true, true, true, true, false]
    },
    {
      name: "narrow window allows tight recovery",
      args: [[[0, "a"], [0, "a"], [1, "a"], [1, "a"]], 1, 1],
      expected: [true, false, true, false]
    },
    {
      name: "one full one fresh user",
      args: [[[0, "a"], [0, "a"], [0, "a"], [0, "b"]], 2, 10],
      expected: [true, true, false, true]
    },
    {
      name: "all events same timestamp same user",
      args: [[[5, "a"], [5, "a"], [5, "a"], [5, "a"], [5, "a"]], 3, 10],
      expected: [true, true, true, false, false]
    },
    {
      name: "long stream tight rhythm",
      args: [
        [[0, "a"], [1, "a"], [2, "a"], [3, "a"], [4, "a"], [5, "a"], [6, "a"]],
        2,
        3
      ],
      expected: [true, true, false, true, true, false, true]
    }
  ],
  hints: [
    "Keep a per-user queue of accepted timestamps; nothing else matters about the past.",
    "Before deciding the current event, evict timestamps that are out of the window from the queue's head.",
    "Only append the current timestamp to the queue if the request is actually accepted."
  ],
  solution:
    "Maintain a `defaultdict(deque)` keyed by user. For each event in arrival order, pop accepted timestamps from the front of that user's deque while they are out of the window (`<= current - window`). If the deque has fewer than `limit` entries left, append the current timestamp and accept; otherwise reject without touching the deque. The output list grows in lockstep with the input.",
  walkthrough:
    "Each timestamp enters and leaves the deque at most once, so the per-user amortized work is O(1) per event and the total work is O(n). The strict-less-than semantics around the window matter: `queue[0] <= timestamp - window` evicts a request that is exactly `window` seconds in the past, matching the prompt's definition of \"strictly less than `window`\".",
  followUps: [
    "How would you adapt this for a distributed environment where multiple workers see the same user's events?",
    "What changes if timestamps can arrive out of order?"
  ],
  complexity: { time: "O(n) amortized", space: "O(u * limit) where u is the number of users" },
  parts: [
    {
      id: "part-2-token-bucket",
      title: "Part 2: Token-bucket variant",
      prompt:
        "Now switch to a token-bucket scheme. Each user has a bucket that starts full with `capacity` tokens. Tokens refill at the rate of one token every `refill_period` seconds (integer). The bucket never holds more than `capacity` tokens — extra refills are dropped. Each event spends one token: if the bucket has at least one token at the moment of the event, accept and decrement; otherwise reject with no state change. Events are sorted by timestamp; a user's bucket is created on their first appearance.",
      entrypoint: "token_bucket_rate_limited",
      starterCode:
        "def token_bucket_rate_limited(events, capacity, refill_period):\n" +
        "    # Each user has a bucket starting full with `capacity` tokens.\n" +
        "    # One token refills every `refill_period` seconds, capped at capacity.\n" +
        "    # Return a list of booleans, one per event.\n" +
        "    pass\n",
      referenceCode:
        "def token_bucket_rate_limited(events, capacity, refill_period):\n" +
        "    state = {}\n" +
        "    out = []\n" +
        "    for timestamp, user_id in events:\n" +
        "        if user_id not in state:\n" +
        "            state[user_id] = [capacity, timestamp]\n" +
        "        bucket = state[user_id]\n" +
        "        tokens, last_refill = bucket\n" +
        "        elapsed = timestamp - last_refill\n" +
        "        if elapsed > 0 and refill_period > 0:\n" +
        "            refills = elapsed // refill_period\n" +
        "            if refills > 0:\n" +
        "                tokens = min(capacity, tokens + refills)\n" +
        "                last_refill += refills * refill_period\n" +
        "        if tokens >= 1:\n" +
        "            tokens -= 1\n" +
        "            out.append(True)\n" +
        "        else:\n" +
        "            out.append(False)\n" +
        "        bucket[0] = tokens\n" +
        "        bucket[1] = last_refill\n" +
        "    return out\n",
      solutionCode:
        "def token_bucket_rate_limited(events, capacity, refill_period):\n" +
        "    buckets = {}\n" +
        "    results = []\n" +
        "    for timestamp, user_id in events:\n" +
        "        bucket = buckets.get(user_id)\n" +
        "        if bucket is None:\n" +
        "            bucket = [capacity, timestamp]\n" +
        "            buckets[user_id] = bucket\n" +
        "        tokens, anchor = bucket\n" +
        "        delta = timestamp - anchor\n" +
        "        if delta > 0:\n" +
        "            refills = delta // refill_period\n" +
        "            tokens = min(capacity, tokens + refills)\n" +
        "            anchor += refills * refill_period\n" +
        "        if tokens >= 1:\n" +
        "            tokens -= 1\n" +
        "            results.append(True)\n" +
        "        else:\n" +
        "            results.append(False)\n" +
        "        bucket[0] = tokens\n" +
        "        bucket[1] = anchor\n" +
        "    return results\n",
      visibleTests: [
        { name: "empty stream", args: [[], 5, 10], expected: [] },
        {
          name: "start full and drain",
          args: [[[0, "a"], [0, "a"], [0, "a"]], 2, 1],
          expected: [true, true, false]
        },
        {
          name: "one refill arrives",
          args: [[[0, "a"], [0, "a"], [1, "a"]], 2, 1],
          expected: [true, true, true]
        },
        {
          name: "different users independent",
          args: [[[0, "a"], [0, "b"]], 1, 10],
          expected: [true, true]
        }
      ],
      hiddenTests: [
        {
          name: "partial elapsed no refill",
          args: [[[0, "a"], [0, "a"], [1, "a"], [2, "a"]], 1, 2],
          expected: [true, false, false, true]
        },
        {
          name: "exhaust then slow recovery",
          args: [[[0, "a"], [0, "a"], [0, "a"], [3, "a"], [3, "a"]], 2, 2],
          expected: [true, true, false, true, false]
        },
        {
          name: "capacity above refill rate",
          args: [[[0, "a"], [10, "a"]], 5, 1],
          expected: [true, true]
        },
        {
          name: "burst at same timestamp depletes bucket",
          args: [[[5, "a"], [5, "a"], [5, "a"], [5, "a"]], 3, 1],
          expected: [true, true, true, false]
        },
        {
          name: "refill anchor preserves fractional carry",
          args: [[[0, "a"], [4, "a"], [6, "a"], [7, "a"]], 1, 3],
          expected: [true, true, true, false]
        },
        {
          name: "refill never exceeds capacity",
          args: [[[0, "a"], [0, "a"], [100, "a"], [100, "a"], [100, "a"]], 2, 1],
          expected: [true, true, true, true, false]
        },
        {
          name: "two users independent bucket state",
          args: [[[0, "a"], [0, "a"], [0, "b"], [0, "b"], [0, "a"], [0, "b"]], 2, 5],
          expected: [true, true, true, true, false, false]
        }
      ],
      hints: [
        "Keep two numbers per user: current token count and the timestamp of the last applied refill.",
        "Advance the refill anchor by `refills * refill_period`, not by `elapsed`, so partial seconds do not accumulate twice.",
        "Initialize a user's bucket as full on their first event so the test order does not influence outcomes."
      ],
      solution:
        "Track a per-user `[tokens, last_refill_ts]` pair. On each event, compute how many full refill periods have passed since `last_refill_ts`; bump tokens by that count (capped at capacity) and advance `last_refill_ts` by the same number of periods (not by the raw elapsed time, so any unused fraction is preserved for the next event). If at least one token is available, deduct one and accept; otherwise reject without mutating either field.",
      walkthrough:
        "The subtle bit is the anchor update. If you set `last_refill_ts = timestamp` after a partial refill, you would lose the fractional carry and slowly drift below the true refill rate. By advancing the anchor only by completed periods, the leftover fraction is implicit in the gap between anchor and current timestamp, ready to combine with future elapsed time.",
      complexity: { time: "O(n)", space: "O(u) per active user" }
    }
  ]
});

const bank = setProblem({
  id: "tek-bank-transactions",
  title: "Apply a Stream of Bank Transactions",
  difficulty: "medium",
  patterns: ["dispatch", "validation", "domain modeling"],
  entrypoint: "apply_transactions",
  prompt:
    "Apply a list of bank transactions to a set of starting balances. Starting balances is a dict `{account_id: integer balance}`. Each transaction is a dict with a `type` field, one of `DEPOSIT` (with `account`, `amount`), `WITHDRAW` (with `account`, `amount`), or `TRANSFER` (with `from`, `to`, `amount`). Apply them in order. A transaction is rejected (skipped, with no balance change) if any referenced account does not exist or if a `WITHDRAW` or `TRANSFER` would leave any account with a negative balance. Return a two-element list `[final_balances, rejected_indexes]` where `rejected_indexes` is a list of the input indexes that were rejected, in ascending order.",
  constraints: [
    "Amounts are non-negative integers.",
    "Account ids are strings present in starting_balances; any other account id causes rejection.",
    "A WITHDRAW or TRANSFER that would push the source negative is rejected, even if a later deposit would have covered it.",
    "DEPOSIT and TRANSFER never create new accounts.",
    "Do not mutate the starting_balances dict; return a fresh dict."
  ],
  examples: [
    {
      name: "simple deposit",
      args: [{ a: 0 }, [{ type: "DEPOSIT", account: "a", amount: 50 }]],
      expected: [{ a: 50 }, []]
    },
    {
      name: "withdraw rejected",
      args: [{ a: 10 }, [{ type: "WITHDRAW", account: "a", amount: 50 }]],
      expected: [{ a: 10 }, [0]]
    }
  ],
  starterCode:
    "def apply_transactions(starting_balances, transactions):\n" +
    "    # Apply transactions in order; reject ones that would overdraw\n" +
    "    # or reference unknown accounts.\n" +
    "    # Return [final_balances, rejected_indexes].\n" +
    "    pass\n",
  referenceCode:
    "def apply_transactions(starting_balances, transactions):\n" +
    "    balances = dict(starting_balances)\n" +
    "    rejected = []\n" +
    "    for index, txn in enumerate(transactions):\n" +
    "        kind = txn.get(\"type\")\n" +
    "        if kind == \"DEPOSIT\":\n" +
    "            account = txn.get(\"account\")\n" +
    "            amount = txn.get(\"amount\", 0)\n" +
    "            if account not in balances:\n" +
    "                rejected.append(index)\n" +
    "                continue\n" +
    "            balances[account] += amount\n" +
    "        elif kind == \"WITHDRAW\":\n" +
    "            account = txn.get(\"account\")\n" +
    "            amount = txn.get(\"amount\", 0)\n" +
    "            if account not in balances or balances[account] < amount:\n" +
    "                rejected.append(index)\n" +
    "                continue\n" +
    "            balances[account] -= amount\n" +
    "        elif kind == \"TRANSFER\":\n" +
    "            src = txn.get(\"from\")\n" +
    "            dst = txn.get(\"to\")\n" +
    "            amount = txn.get(\"amount\", 0)\n" +
    "            if src not in balances or dst not in balances or balances[src] < amount:\n" +
    "                rejected.append(index)\n" +
    "                continue\n" +
    "            balances[src] -= amount\n" +
    "            balances[dst] += amount\n" +
    "        else:\n" +
    "            rejected.append(index)\n" +
    "    return [balances, rejected]\n",
  solutionCode:
    "def apply_transactions(starting_balances, transactions):\n" +
    "    balances = dict(starting_balances)\n" +
    "    rejected = []\n" +
    "\n" +
    "    def reject(index):\n" +
    "        rejected.append(index)\n" +
    "\n" +
    "    for index, txn in enumerate(transactions):\n" +
    "        kind = txn.get(\"type\")\n" +
    "        amount = txn.get(\"amount\", 0)\n" +
    "        if kind == \"DEPOSIT\":\n" +
    "            account = txn.get(\"account\")\n" +
    "            if account in balances:\n" +
    "                balances[account] += amount\n" +
    "            else:\n" +
    "                reject(index)\n" +
    "        elif kind == \"WITHDRAW\":\n" +
    "            account = txn.get(\"account\")\n" +
    "            if account in balances and balances[account] >= amount:\n" +
    "                balances[account] -= amount\n" +
    "            else:\n" +
    "                reject(index)\n" +
    "        elif kind == \"TRANSFER\":\n" +
    "            src = txn.get(\"from\")\n" +
    "            dst = txn.get(\"to\")\n" +
    "            if src in balances and dst in balances and balances[src] >= amount:\n" +
    "                balances[src] -= amount\n" +
    "                balances[dst] += amount\n" +
    "            else:\n" +
    "                reject(index)\n" +
    "        else:\n" +
    "            reject(index)\n" +
    "    return [balances, rejected]\n",
  visibleTests: [
    {
      name: "no transactions",
      args: [{ a: 100 }, []],
      expected: [{ a: 100 }, []]
    },
    {
      name: "simple deposit",
      args: [{ a: 0 }, [{ type: "DEPOSIT", account: "a", amount: 50 }]],
      expected: [{ a: 50 }, []]
    },
    {
      name: "withdraw rejected",
      args: [{ a: 10 }, [{ type: "WITHDRAW", account: "a", amount: 50 }]],
      expected: [{ a: 10 }, [0]]
    },
    {
      name: "transfer ok",
      args: [
        { a: 100, b: 0 },
        [{ type: "TRANSFER", from: "a", to: "b", amount: 30 }]
      ],
      expected: [{ a: 70, b: 30 }, []]
    }
  ],
  hiddenTests: [
    {
      name: "unknown account on deposit",
      args: [{ a: 50 }, [{ type: "DEPOSIT", account: "c", amount: 10 }]],
      expected: [{ a: 50 }, [0]]
    },
    {
      name: "mixed sequence with rejections",
      args: [
        { a: 100, b: 50 },
        [
          { type: "WITHDRAW", account: "a", amount: 30 },
          { type: "TRANSFER", from: "b", to: "a", amount: 100 },
          { type: "DEPOSIT", account: "b", amount: 25 },
          { type: "TRANSFER", from: "a", to: "b", amount: 20 }
        ]
      ],
      expected: [{ a: 50, b: 95 }, [1]]
    },
    {
      name: "unknown transfer destination",
      args: [
        { a: 100 },
        [{ type: "TRANSFER", from: "a", to: "ghost", amount: 10 }]
      ],
      expected: [{ a: 100 }, [0]]
    },
    {
      name: "unknown type rejected",
      args: [{ a: 5 }, [{ type: "BURN", account: "a", amount: 1 }]],
      expected: [{ a: 5 }, [0]]
    },
    {
      name: "zero-amount transfer ok",
      args: [{ a: 5, b: 5 }, [{ type: "TRANSFER", from: "a", to: "b", amount: 0 }]],
      expected: [{ a: 5, b: 5 }, []]
    },
    {
      name: "self-transfer leaves balance unchanged",
      args: [{ a: 100 }, [{ type: "TRANSFER", from: "a", to: "a", amount: 30 }]],
      expected: [{ a: 100 }, []]
    },
    {
      name: "withdraw that exactly empties account",
      args: [{ a: 50 }, [{ type: "WITHDRAW", account: "a", amount: 50 }]],
      expected: [{ a: 0 }, []]
    },
    {
      name: "transfer that exactly empties source",
      args: [
        { a: 100, b: 0 },
        [{ type: "TRANSFER", from: "a", to: "b", amount: 100 }]
      ],
      expected: [{ a: 0, b: 100 }, []]
    },
    {
      name: "rejected transfer must not mutate source",
      args: [
        { a: 100 },
        [{ type: "TRANSFER", from: "a", to: "ghost", amount: 10 }]
      ],
      expected: [{ a: 100 }, [0]]
    },
    {
      name: "multiple rejections kept in input order",
      args: [
        { a: 10 },
        [
          { type: "WITHDRAW", account: "a", amount: 100 },
          { type: "DEPOSIT", account: "ghost", amount: 5 },
          { type: "WITHDRAW", account: "a", amount: 5 },
          { type: "TRANSFER", from: "a", to: "ghost", amount: 1 }
        ]
      ],
      expected: [{ a: 5 }, [0, 1, 3]]
    },
    {
      name: "deposit at zero amount leaves balance",
      args: [{ a: 5 }, [{ type: "DEPOSIT", account: "a", amount: 0 }]],
      expected: [{ a: 5 }, []]
    }
  ],
  hints: [
    "Copy the starting balances dict up front so callers cannot see partial state.",
    "Validate every account referenced by a transaction before changing any balance.",
    "For TRANSFER, check both the source funds and the destination existence before applying."
  ],
  solution:
    "Copy the starting balances so the input dict is not mutated. Walk transactions in order and dispatch on `type`. Validate each transaction completely (account existence and sufficient funds) before touching any balance. If validation fails, append the index to a `rejected` list and continue with the next transaction. Return `[balances, rejected]`.",
  walkthrough:
    "The win condition here is structure: a clean dispatch on `type`, fully validated preconditions before any mutation, and a single source of truth for what \"rejected\" means. The interviewer is looking for the discipline of \"check then act\" rather than the half-applied transfer bug where you debit the source and then realize the destination does not exist.",
  followUps: [
    "How would you support optimistic locking so concurrent runs cannot double-spend?",
    "How would you add a transaction-fee field per type?",
    "How would you stream the output instead of buffering it?"
  ],
  complexity: { time: "O(t) where t is the number of transactions", space: "O(a) where a is the number of accounts" }
});

const sessionize = setProblem({
  id: "tek-sessionize-events",
  title: "Sessionize an Event Stream",
  difficulty: "medium",
  patterns: ["per-key state", "gap detection", "stream processing"],
  entrypoint: "sessionize_events",
  prompt:
    "You are given a chronological list of events `[[timestamp, user_id], ...]` sorted by `timestamp` (integer seconds, non-decreasing), and a `timeout` in seconds. Group each user's events into sessions: a user's session ends when more than `timeout` seconds elapse between their consecutive events. A new event for the same user after that gap starts a fresh session. Return one entry per session as `[user_id, start, end, count]`, sorted by `(start, user_id)` ascending. A session of a single event has `start == end` and `count == 1`.",
  constraints: [
    "0 <= len(events) <= 100000.",
    "Events are sorted by timestamp (ties allowed).",
    "A gap is strictly greater than `timeout` — exactly `timeout` seconds keeps the session open.",
    "Each user is sessionized independently.",
    "Return sessions sorted by start ascending, then user_id ascending."
  ],
  examples: [
    {
      name: "single user one session",
      args: [[[1, "a"], [3, "a"], [6, "a"]], 5],
      expected: [["a", 1, 6, 3]]
    },
    {
      name: "gap splits user",
      args: [[[1, "a"], [7, "a"]], 5],
      expected: [["a", 1, 1, 1], ["a", 7, 7, 1]]
    }
  ],
  starterCode:
    "def sessionize_events(events, timeout):\n" +
    "    # Group events into per-user sessions; close a session when the gap\n" +
    "    # between consecutive events exceeds `timeout` seconds.\n" +
    "    # Return [[user_id, start, end, count], ...] sorted by (start, user_id).\n" +
    "    pass\n",
  referenceCode:
    "def sessionize_events(events, timeout):\n" +
    "    open_sessions = {}\n" +
    "    closed = []\n" +
    "    for timestamp, user_id in events:\n" +
    "        session = open_sessions.get(user_id)\n" +
    "        if session is None or timestamp - session[\"end\"] > timeout:\n" +
    "            if session is not None:\n" +
    "                closed.append([user_id, session[\"start\"], session[\"end\"], session[\"count\"]])\n" +
    "            open_sessions[user_id] = {\"start\": timestamp, \"end\": timestamp, \"count\": 1}\n" +
    "        else:\n" +
    "            session[\"end\"] = timestamp\n" +
    "            session[\"count\"] += 1\n" +
    "    for user_id, session in open_sessions.items():\n" +
    "        closed.append([user_id, session[\"start\"], session[\"end\"], session[\"count\"]])\n" +
    "    closed.sort(key=lambda row: (row[1], row[0]))\n" +
    "    return closed\n",
  solutionCode:
    "def sessionize_events(events, timeout):\n" +
    "    active = {}\n" +
    "    out = []\n" +
    "    for timestamp, user_id in events:\n" +
    "        current = active.get(user_id)\n" +
    "        if current and timestamp - current[2] <= timeout:\n" +
    "            current[2] = timestamp\n" +
    "            current[3] += 1\n" +
    "            continue\n" +
    "        if current is not None:\n" +
    "            out.append(current)\n" +
    "        active[user_id] = [user_id, timestamp, timestamp, 1]\n" +
    "    out.extend(active.values())\n" +
    "    out.sort(key=lambda row: (row[1], row[0]))\n" +
    "    return out\n",
  visibleTests: [
    { name: "empty", args: [[], 5], expected: [] },
    {
      name: "single event",
      args: [[[1, "a"]], 5],
      expected: [["a", 1, 1, 1]]
    },
    {
      name: "single user one session",
      args: [[[1, "a"], [3, "a"], [6, "a"]], 5],
      expected: [["a", 1, 6, 3]]
    },
    {
      name: "gap splits user",
      args: [[[1, "a"], [7, "a"]], 5],
      expected: [["a", 1, 1, 1], ["a", 7, 7, 1]]
    }
  ],
  hiddenTests: [
    {
      name: "exact timeout keeps open",
      args: [[[0, "a"], [5, "a"], [10, "a"]], 5],
      expected: [["a", 0, 10, 3]]
    },
    {
      name: "users interleaved",
      args: [[[1, "a"], [2, "b"], [3, "a"], [4, "b"]], 10],
      expected: [["a", 1, 3, 2], ["b", 2, 4, 2]]
    },
    {
      name: "tie on start sorts by user",
      args: [[[1, "b"], [1, "a"]], 10],
      expected: [["a", 1, 1, 1], ["b", 1, 1, 1]]
    },
    {
      name: "multiple sessions per user",
      args: [[[0, "a"], [3, "a"], [20, "a"], [22, "a"], [50, "a"]], 5],
      expected: [["a", 0, 3, 2], ["a", 20, 22, 2], ["a", 50, 50, 1]]
    },
    {
      name: "gap measured from last event not start",
      args: [[[0, "a"], [4, "a"], [8, "a"], [12, "a"]], 5],
      expected: [["a", 0, 12, 4]]
    },
    {
      name: "gap exceeded by one second",
      args: [[[0, "a"], [4, "a"], [10, "a"]], 5],
      expected: [["a", 0, 4, 2], ["a", 10, 10, 1]]
    },
    {
      name: "two users overlapping sessions",
      args: [[[0, "a"], [1, "b"], [5, "a"], [6, "b"], [20, "a"]], 5],
      expected: [["a", 0, 5, 2], ["b", 1, 6, 2], ["a", 20, 20, 1]]
    },
    {
      name: "ties on start sort by user across many",
      args: [[[5, "c"], [5, "a"], [5, "b"]], 1],
      expected: [["a", 5, 5, 1], ["b", 5, 5, 1], ["c", 5, 5, 1]]
    },
    {
      name: "ties on start with different ends",
      args: [[[0, "a"], [0, "b"], [4, "a"], [10, "b"]], 5],
      expected: [["a", 0, 4, 2], ["b", 0, 0, 1], ["b", 10, 10, 1]]
    }
  ],
  hints: [
    "Track one open session per user keyed by user_id; that is all the state you need from the past.",
    "Compare each new event against the open session's last timestamp, not its start.",
    "After the loop finishes, every still-open session must be flushed to the output."
  ],
  solution:
    "Walk the events in order and maintain a dict of open sessions keyed by user_id. For each event, look up that user's open session: if the gap from its last timestamp is within `timeout`, extend the session in place; otherwise close the old session (push it to the output) and open a new one starting at the current timestamp. After the input is consumed, flush whatever sessions remain open. Finally, sort the output by (start, user_id).",
  walkthrough:
    "The trickiest detail is the boundary semantics — `<= timeout` keeps the session open, `> timeout` closes it. Drawing one user's timeline on paper makes the rule obvious: a fixed-width sliding gap test on the most recent event for that user. Sorting at the end is the cheapest way to enforce the deterministic output order required by the spec.",
  followUps: [
    "How would you bound memory if the stream is unbounded? (Hint: emit closed sessions as soon as they close.)",
    "How would you support a configurable session-close grace based on event count, not just gap?",
    "What changes if events can arrive slightly out of order within a small bounded window?"
  ],
  complexity: { time: "O(n log n) due to the final sort", space: "O(u) where u is the number of distinct users" }
});

export const streamsProblems = [tradePnl, logErrors, rateLimiter, bank, sessionize];
