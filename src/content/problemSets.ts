import type { Problem, ProblemSet } from "../types";

const setId = "tekmerion-prep";

function setProblem(problem: Omit<Problem, "chapterId" | "source" | "adapter"> & Partial<Pick<Problem, "adapter">>): Problem {
  return {
    chapterId: setId,
    source: "guided",
    adapter: problem.adapter ?? "default",
    ...problem
  };
}

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

const parseCsv = setProblem({
  id: "tek-parse-csv-row",
  title: "Parse a Quoted CSV Row",
  difficulty: "medium",
  patterns: ["state machine", "string scan", "tokenization"],
  entrypoint: "parse_csv_row",
  prompt:
    "Implement a single-row CSV parser without using the `csv` module. The input is one line of CSV text. Fields are separated by commas. A field may be wrapped in double quotes; inside a quoted field, commas are literal characters and the two-character sequence `\"\"` represents a single literal `\"`. A field is only considered quoted when its first character is `\"`. Return a list of the parsed field strings.",
  constraints: [
    "Do not use the `csv` module or any other CSV library.",
    "An empty input string yields a single empty field: `[\"\"]`.",
    "Only fields whose first character is `\"` enter quoted mode.",
    "Inside quoted mode, `\"\"` is a literal quote and `\"` followed by anything else closes the field.",
    "The line never contains newline characters."
  ],
  examples: [
    { name: "plain fields", args: ["a,b,c"], expected: ["a", "b", "c"] },
    { name: "embedded comma", args: ["\"a,b\",c"], expected: ["a,b", "c"] }
  ],
  starterCode:
    "def parse_csv_row(line):\n" +
    "    # Parse one CSV row into a list of field strings.\n" +
    "    # Handle quoted fields with embedded commas and \"\" escapes.\n" +
    "    pass\n",
  referenceCode:
    "def parse_csv_row(line):\n" +
    "    fields = []\n" +
    "    current = []\n" +
    "    in_quotes = False\n" +
    "    i = 0\n" +
    "    while i < len(line):\n" +
    "        ch = line[i]\n" +
    "        if in_quotes:\n" +
    "            if ch == '\"':\n" +
    "                if i + 1 < len(line) and line[i + 1] == '\"':\n" +
    "                    current.append('\"')\n" +
    "                    i += 2\n" +
    "                    continue\n" +
    "                in_quotes = False\n" +
    "                i += 1\n" +
    "                continue\n" +
    "            current.append(ch)\n" +
    "            i += 1\n" +
    "        else:\n" +
    "            if ch == '\"' and not current:\n" +
    "                in_quotes = True\n" +
    "                i += 1\n" +
    "            elif ch == ',':\n" +
    "                fields.append(''.join(current))\n" +
    "                current = []\n" +
    "                i += 1\n" +
    "            else:\n" +
    "                current.append(ch)\n" +
    "                i += 1\n" +
    "    fields.append(''.join(current))\n" +
    "    return fields\n",
  solutionCode:
    "def parse_csv_row(line):\n" +
    "    fields = []\n" +
    "    buf = []\n" +
    "    quoted = False\n" +
    "    i = 0\n" +
    "    n = len(line)\n" +
    "    while i < n:\n" +
    "        ch = line[i]\n" +
    "        if quoted:\n" +
    "            if ch == '\"' and i + 1 < n and line[i + 1] == '\"':\n" +
    "                buf.append('\"')\n" +
    "                i += 2\n" +
    "            elif ch == '\"':\n" +
    "                quoted = False\n" +
    "                i += 1\n" +
    "            else:\n" +
    "                buf.append(ch)\n" +
    "                i += 1\n" +
    "        elif ch == ',':\n" +
    "            fields.append(''.join(buf))\n" +
    "            buf = []\n" +
    "            i += 1\n" +
    "        elif ch == '\"' and not buf:\n" +
    "            quoted = True\n" +
    "            i += 1\n" +
    "        else:\n" +
    "            buf.append(ch)\n" +
    "            i += 1\n" +
    "    fields.append(''.join(buf))\n" +
    "    return fields\n",
  visibleTests: [
    { name: "plain fields", args: ["a,b,c"], expected: ["a", "b", "c"] },
    { name: "single field", args: ["hello"], expected: ["hello"] },
    { name: "empty input", args: [""], expected: [""] },
    { name: "embedded comma", args: ["\"a,b\",c"], expected: ["a,b", "c"] },
    { name: "trailing empty field", args: ["a,"], expected: ["a", ""] }
  ],
  hiddenTests: [
    { name: "escaped quotes", args: ["\"he said \"\"hi\"\"\""], expected: ["he said \"hi\""] },
    { name: "two empty fields", args: [","], expected: ["", ""] },
    { name: "mixed quoted and plain", args: ["\"alpha\",beta,\"gamma,delta\""], expected: ["alpha", "beta", "gamma,delta"] },
    { name: "quote not at field start is literal", args: ["a\"b,c"], expected: ["a\"b", "c"] },
    { name: "empty quoted field", args: ["\"\",x"], expected: ["", "x"] },
    { name: "adjacent escaped quotes", args: ["\"a\"\"\"\"b\""], expected: ["a\"\"b"] },
    { name: "three commas yield four empty fields", args: [",,,"], expected: ["", "", "", ""] },
    { name: "leading comma", args: [",a,b"], expected: ["", "a", "b"] },
    { name: "quoted field preserves whitespace", args: ["\" hello \",x"], expected: [" hello ", "x"] },
    { name: "embedded commas across two quoted fields", args: ["\"a,b\",\"c,d,e\""], expected: ["a,b", "c,d,e"] }
  ],
  hints: [
    "Track exactly one boolean: are you currently inside a quoted field?",
    "Inside a quoted field, two consecutive quotes mean one literal quote; a single quote ends the field.",
    "Only enter quoted mode when you see a quote and the current field buffer is still empty."
  ],
  solution:
    "Walk the string with an index and a single `in_quotes` flag. Outside quotes, a comma flushes the current buffer to the field list, a quote at the very start of a field flips you into quoted mode, and every other character is appended. Inside quotes, a doubled quote becomes a literal quote and a single quote closes the field. At the end of input, flush whatever remains in the buffer as the final field, including the empty string for trailing commas or empty input.",
  walkthrough:
    "The trickiest cases are the empty input (which is one empty field, not zero fields) and the `\"\"` escape. The escape is handled by peeking one character ahead while inside quoted mode: a quote followed by a quote consumes both and appends one literal quote, while a quote followed by anything else closes the quoted field.",
  followUps: [
    "How would you extend this to a streaming reader that handles multiple lines including newlines inside quoted fields?",
    "How would you report a structured error when the input is malformed (unterminated quote, junk after closing quote)?",
    "How would you produce the inverse: serializing a list of fields back into a properly-quoted CSV row?"
  ],
  complexity: { time: "O(n) in the length of the line", space: "O(n) for the output fields" }
});

const minRooms = setProblem({
  id: "tek-min-meeting-rooms",
  title: "Minimum Meeting Rooms",
  difficulty: "medium",
  patterns: ["sweep line", "interval scheduling", "sorting"],
  entrypoint: "min_meeting_rooms",
  prompt:
    "You are given a list of meetings, each represented as `[start, end]` with `start < end` and end exclusive (a meeting ending at 10 frees the room for a meeting starting at exactly 10). Return the minimum number of meeting rooms needed so that no two meetings sharing a room overlap. Input meetings are in no particular order.",
  constraints: [
    "0 <= len(meetings) <= 50000.",
    "Each meeting is a list `[start, end]` of integers with start < end.",
    "A meeting ending at time t does not conflict with one starting at time t.",
    "Return 0 for an empty input.",
    "Do not assume the input is sorted."
  ],
  examples: [
    { name: "three overlapping", args: [[[0, 30], [5, 10], [15, 20]]], expected: 2 },
    { name: "back to back", args: [[[0, 10], [10, 20]]], expected: 1 }
  ],
  starterCode:
    "def min_meeting_rooms(meetings):\n" +
    "    # Return the minimum number of rooms needed to host every meeting.\n" +
    "    pass\n",
  referenceCode:
    "def min_meeting_rooms(meetings):\n" +
    "    events = []\n" +
    "    for start, end in meetings:\n" +
    "        events.append((start, 1))\n" +
    "        events.append((end, -1))\n" +
    "    events.sort(key=lambda event: (event[0], event[1]))\n" +
    "    active = 0\n" +
    "    peak = 0\n" +
    "    for _, delta in events:\n" +
    "        active += delta\n" +
    "        if active > peak:\n" +
    "            peak = active\n" +
    "    return peak\n",
  solutionCode:
    "def min_meeting_rooms(meetings):\n" +
    "    events = []\n" +
    "    for start, end in meetings:\n" +
    "        events.append((start, 1))\n" +
    "        events.append((end, -1))\n" +
    "    events.sort(key=lambda event: (event[0], event[1]))\n" +
    "    active = peak = 0\n" +
    "    for _, delta in events:\n" +
    "        active += delta\n" +
    "        peak = max(peak, active)\n" +
    "    return peak\n",
  visibleTests: [
    { name: "empty", args: [[]], expected: 0 },
    { name: "single meeting", args: [[[0, 30]]], expected: 1 },
    { name: "three overlapping", args: [[[0, 30], [5, 10], [15, 20]]], expected: 2 },
    { name: "back to back same room", args: [[[0, 10], [10, 20]]], expected: 1 }
  ],
  hiddenTests: [
    { name: "fully nested", args: [[[1, 10], [2, 9], [3, 8]]], expected: 3 },
    { name: "disjoint", args: [[[0, 1], [2, 3], [4, 5]]], expected: 1 },
    { name: "unsorted input", args: [[[10, 20], [0, 30], [5, 15]]], expected: 3 },
    { name: "shared endpoints chain", args: [[[1, 5], [5, 10], [10, 15], [1, 12]]], expected: 2 },
    { name: "five simultaneous starts", args: [[[0, 30], [0, 20], [0, 10], [0, 5], [0, 1]]], expected: 5 },
    { name: "non-zero offsets disjoint", args: [[[5, 10], [10, 15], [15, 20]]], expected: 1 },
    { name: "peak in the middle", args: [[[0, 100], [10, 20], [10, 20], [10, 20], [90, 95]]], expected: 4 },
    { name: "tight chain of end-equals-start", args: [[[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]]], expected: 1 },
    { name: "two pairs of identical intervals", args: [[[0, 10], [0, 10], [5, 15], [5, 15]]], expected: 4 }
  ],
  hints: [
    "Turn each meeting into a start event (+1) and an end event (-1).",
    "When two events share a time, process the end before the start so the room can be reused.",
    "Sweep the events in time order and track the running count of active meetings; the answer is the peak count."
  ],
  solution:
    "Convert each meeting into two events: a +1 at the start time and a -1 at the end time. Sort events by (time, delta) so that for equal times an ending meeting is processed before a starting one — this is what allows back-to-back meetings to share a room. Sweep the events, keep a running active count, and remember the maximum value the count ever reaches. That maximum is the minimum number of concurrent rooms needed.",
  walkthrough:
    "The sweep is a classic transform: any interval question that asks for the maximum overlap can be answered by sorting endpoints and walking them in order. The (-1 before +1) tie-breaker encodes the inclusive-start, exclusive-end semantics. The algorithm is O(n log n) from the sort and O(1) extra space beyond the events array.",
  followUps: [
    "How would you also return one valid room assignment per meeting?",
    "How would you handle 1M meetings without building the full events array?",
    "What if a room transition required a 5-minute cleanup buffer?"
  ],
  complexity: { time: "O(n log n)", space: "O(n)" }
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

const renderTemplate = setProblem({
  id: "tek-render-template",
  title: "Render a `{{name}}` Template",
  difficulty: "easy",
  patterns: ["string scan", "tokenization", "substitution"],
  entrypoint: "render_template",
  prompt:
    "Implement a minimal template renderer. A placeholder has the exact shape `{{name}}` where `name` matches the identifier pattern `[a-zA-Z_][a-zA-Z0-9_]*`. When `name` is a key in `values`, replace the entire `{{name}}` span with `str(values[name])`. When `name` is not present, leave the literal `{{name}}` text in the output unchanged. Any other text — including stray `{` or `{{` that is not followed by a valid identifier and `}}` — must be copied to the output verbatim.",
  constraints: [
    "An identifier is `[a-zA-Z_][a-zA-Z0-9_]*`.",
    "Only `{{identifier}}` is a placeholder; anything else (e.g. `{{1bad}}`, `{ x }`, `{{}}`) is literal text.",
    "Unknown keys leave the placeholder text intact — they are not errors.",
    "Values are stringified with `str(value)` before insertion.",
    "An empty template returns an empty string."
  ],
  examples: [
    { name: "basic substitution", args: ["Hello {{name}}!", { name: "World" }], expected: "Hello World!" },
    { name: "unknown key kept literal", args: ["{{missing}} here", {}], expected: "{{missing}} here" }
  ],
  starterCode:
    "def render_template(template, values):\n" +
    "    # Replace each {{identifier}} with str(values[identifier]).\n" +
    "    # Leave unknown placeholders and malformed spans as literal text.\n" +
    "    pass\n",
  referenceCode:
    "import re\n\n" +
    "def render_template(template, values):\n" +
    "    pattern = re.compile(r\"\\{\\{([a-zA-Z_][a-zA-Z0-9_]*)\\}\\}\")\n" +
    "    def repl(match):\n" +
    "        name = match.group(1)\n" +
    "        if name in values:\n" +
    "            return str(values[name])\n" +
    "        return match.group(0)\n" +
    "    return pattern.sub(repl, template)\n",
  solutionCode:
    "import re\n\n" +
    "_PLACEHOLDER = re.compile(r\"\\{\\{([a-zA-Z_][a-zA-Z0-9_]*)\\}\\}\")\n\n" +
    "def render_template(template, values):\n" +
    "    def replace(match):\n" +
    "        key = match.group(1)\n" +
    "        return str(values[key]) if key in values else match.group(0)\n" +
    "    return _PLACEHOLDER.sub(replace, template)\n",
  visibleTests: [
    { name: "empty template", args: ["", { a: 1 }], expected: "" },
    { name: "no placeholders", args: ["just text", { a: 1 }], expected: "just text" },
    { name: "basic substitution", args: ["Hello {{name}}!", { name: "World" }], expected: "Hello World!" },
    {
      name: "multiple placeholders",
      args: ["{{a}} + {{b}} = {{c}}", { a: 1, b: 2, c: 3 }],
      expected: "1 + 2 = 3"
    },
    { name: "unknown key kept literal", args: ["{{missing}} here", {}], expected: "{{missing}} here" }
  ],
  hiddenTests: [
    { name: "back-to-back placeholders", args: ["{{a}}{{b}}{{a}}", { a: "X", b: "Y" }], expected: "XYX" },
    { name: "numeric value stringified", args: ["value: {{n}}", { n: 42 }], expected: "value: 42" },
    {
      name: "malformed spans are literal",
      args: ["{x} { y } {{!}} {{1bad}} {{}}", {}],
      expected: "{x} { y } {{!}} {{1bad}} {{}}"
    },
    {
      name: "mixed known and unknown",
      args: ["{{a}}/{{b}}/{{c}}", { a: "X", c: "Z" }],
      expected: "X/{{b}}/Z"
    },
    {
      name: "underscore and digits in name",
      args: ["{{first_name_1}}", { first_name_1: "Ada" }],
      expected: "Ada"
    }
  ],
  hints: [
    "A regex that matches `{{` then a valid identifier then `}}` lets you scan in one pass.",
    "Use a substitution callback so unknown keys can return the literal match unchanged.",
    "The identifier rules disqualify names that start with a digit or contain punctuation."
  ],
  solution:
    "Compile one regex that matches the full placeholder span `{{identifier}}`. Use `re.sub` with a callback: when the captured name is in `values`, return `str(values[name])`; otherwise return the entire matched span unchanged. Everything not matched by the regex is already copied verbatim by `sub`.",
  walkthrough:
    "The callback approach is what makes the \"leave unknown keys literal\" rule trivial. The regex's strict identifier shape ensures malformed spans like `{{1bad}}` or `{{}}` are skipped entirely, so they survive in the output without special handling.",
  followUps: [
    "How would you extend this to support dotted paths like `{{user.name}}` walking a nested dict?",
    "How would you support default values like `{{name|Anonymous}}` if the key is missing?",
    "How would you precompile the template into a list of segments for repeated rendering?"
  ],
  complexity: { time: "O(n) in the template length", space: "O(n) for the output" }
});

const resolvePath = setProblem({
  id: "tek-resolve-path",
  title: "Canonicalize a Unix Path",
  difficulty: "easy",
  patterns: ["stack", "string scan", "normalization"],
  entrypoint: "resolve_path",
  prompt:
    "Given an absolute Unix path, return its canonical form. Collapse repeated slashes, remove `.` segments, and resolve `..` segments by popping the previous real segment (no-op when already at the root). The result must start with `/` and must not have a trailing slash unless the result is the root `/`. Single-segment names that happen to contain dots beyond `.` or `..` (for example `...` or `..foo`) are ordinary directory names.",
  constraints: [
    "The input always starts with `/`.",
    "Segments are separated by `/`; consecutive slashes collapse.",
    "`.` is the current directory and is skipped.",
    "`..` pops the previous segment; at the root it is a no-op.",
    "Only the exact tokens `.` and `..` are special — names like `...` or `..foo` are real directories."
  ],
  examples: [
    { name: "trailing slash dropped", args: ["/home/"], expected: "/home" },
    { name: "double-dot pops", args: ["/a/b/c/../../d"], expected: "/a/d" }
  ],
  starterCode:
    "def resolve_path(path):\n" +
    "    # Return the canonical form of an absolute Unix path.\n" +
    "    pass\n",
  referenceCode:
    "def resolve_path(path):\n" +
    "    stack = []\n" +
    "    for part in path.split(\"/\"):\n" +
    "        if part == \"\" or part == \".\":\n" +
    "            continue\n" +
    "        if part == \"..\":\n" +
    "            if stack:\n" +
    "                stack.pop()\n" +
    "            continue\n" +
    "        stack.append(part)\n" +
    "    return \"/\" + \"/\".join(stack)\n",
  solutionCode:
    "def resolve_path(path):\n" +
    "    parts = []\n" +
    "    for segment in path.split(\"/\"):\n" +
    "        if not segment or segment == \".\":\n" +
    "            continue\n" +
    "        if segment == \"..\":\n" +
    "            if parts:\n" +
    "                parts.pop()\n" +
    "        else:\n" +
    "            parts.append(segment)\n" +
    "    return \"/\" + \"/\".join(parts)\n",
  visibleTests: [
    { name: "root stays root", args: ["/"], expected: "/" },
    { name: "single level", args: ["/home"], expected: "/home" },
    { name: "trailing slash dropped", args: ["/home/"], expected: "/home" },
    { name: "double-dot pops", args: ["/a/b/c/../../d"], expected: "/a/d" },
    { name: "double slash collapses", args: ["/home//user"], expected: "/home/user" }
  ],
  hiddenTests: [
    { name: "dot skipped", args: ["/home/./user"], expected: "/home/user" },
    { name: "pop past root no-op", args: ["/.."], expected: "/" },
    { name: "triple dot is a directory", args: ["/a/.../b"], expected: "/a/.../b" },
    { name: "many mixed", args: ["/a//b/./c/"], expected: "/a/b/c" },
    { name: "only dots and slashes", args: ["/./../."], expected: "/" }
  ],
  hints: [
    "Split on `/` and treat each non-empty piece as a single segment.",
    "Use a stack to push real names and pop on `..`; only the two exact tokens are special.",
    "The final path is `\"/\" + \"/\".join(stack)`, which handles both the root case and the no-trailing-slash rule."
  ],
  solution:
    "Split the input on `/` and walk the parts. Skip empty strings (the result of leading, trailing, or doubled slashes) and the literal `.`. For `..`, pop the stack if non-empty. For every other part, push it. Join the stack with `/` and prefix one slash to produce the canonical path. The empty-stack case naturally produces `/`.",
  walkthrough:
    "A stack is the right shape because `..` operates on the most recent real directory, never deeper. Treating empty strings the same as `.` is the trick that makes `//` and trailing slash both vanish without any extra code. Names like `...` are not popped because the equality check is exact.",
  followUps: [
    "How would you adapt this to relative paths (no leading slash)?",
    "How would you also report whether the input had any non-canonical features (collapsing happened)?",
    "How would you preserve a leading `//` per the POSIX implementation-defined rule?"
  ],
  complexity: { time: "O(n) in the path length", space: "O(n) for the segment stack" }
});

const versionedKv = setProblem({
  id: "tek-versioned-kv",
  title: "Versioned Key-Value Store",
  difficulty: "medium",
  patterns: ["per-key sorted history", "binary search", "operation log"],
  entrypoint: "versioned_kv",
  prompt:
    "Given a list of operations against a versioned key-value store, return the result of each `GET` in order. Each operation is one of `[\"SET\", key, value, timestamp]` or `[\"GET\", key, timestamp]`. A `GET` returns the value of `key` with the largest timestamp less than or equal to the query timestamp, or `None` if no such write exists. Operations can arrive in any timestamp order, and the same `(key, timestamp)` can be written more than once — in that case the most recent write at that timestamp wins. Each key's history is independent.",
  constraints: [
    "Operations are processed in input order, but their internal timestamps can be arbitrary.",
    "A repeated `SET` for the same `(key, timestamp)` overwrites the previous value at that timestamp.",
    "A `GET` returns the most recent value with `timestamp <= query_timestamp`, or `None`.",
    "Different keys do not share history.",
    "Return one entry per `GET`, in the order they appeared."
  ],
  examples: [
    {
      name: "set then get",
      args: [[["SET", "a", "x", 5], ["GET", "a", 10]]],
      expected: ["x"]
    },
    {
      name: "get before any set",
      args: [[["GET", "a", 5]]],
      expected: [null]
    }
  ],
  starterCode:
    "def versioned_kv(operations):\n" +
    "    # Process a sequence of SET and GET operations against a versioned\n" +
    "    # key-value store. Return the result of each GET in input order.\n" +
    "    pass\n",
  referenceCode:
    "import bisect\n\n" +
    "def versioned_kv(operations):\n" +
    "    timestamps = {}\n" +
    "    values = {}\n" +
    "    out = []\n" +
    "    for op in operations:\n" +
    "        kind = op[0]\n" +
    "        if kind == \"SET\":\n" +
    "            _, key, value, ts = op\n" +
    "            history = timestamps.setdefault(key, [])\n" +
    "            idx = bisect.bisect_left(history, ts)\n" +
    "            if idx == len(history) or history[idx] != ts:\n" +
    "                history.insert(idx, ts)\n" +
    "            values[(key, ts)] = value\n" +
    "        elif kind == \"GET\":\n" +
    "            _, key, ts = op\n" +
    "            history = timestamps.get(key, [])\n" +
    "            idx = bisect.bisect_right(history, ts)\n" +
    "            if idx == 0:\n" +
    "                out.append(None)\n" +
    "            else:\n" +
    "                out.append(values[(key, history[idx - 1])])\n" +
    "    return out\n",
  solutionCode:
    "import bisect\n\n" +
    "def versioned_kv(operations):\n" +
    "    history = {}\n" +
    "    table = {}\n" +
    "    results = []\n" +
    "    for op in operations:\n" +
    "        if op[0] == \"SET\":\n" +
    "            _, key, value, ts = op\n" +
    "            stamps = history.setdefault(key, [])\n" +
    "            position = bisect.bisect_left(stamps, ts)\n" +
    "            if position == len(stamps) or stamps[position] != ts:\n" +
    "                stamps.insert(position, ts)\n" +
    "            table[(key, ts)] = value\n" +
    "        else:\n" +
    "            _, key, ts = op\n" +
    "            stamps = history.get(key, [])\n" +
    "            position = bisect.bisect_right(stamps, ts)\n" +
    "            if position == 0:\n" +
    "                results.append(None)\n" +
    "            else:\n" +
    "                results.append(table[(key, stamps[position - 1])])\n" +
    "    return results\n",
  visibleTests: [
    { name: "empty operations", args: [[]], expected: [] },
    {
      name: "set then get",
      args: [[["SET", "a", "x", 5], ["GET", "a", 10]]],
      expected: ["x"]
    },
    {
      name: "get before any set",
      args: [[["GET", "a", 5]]],
      expected: [null]
    },
    {
      name: "get before first set returns None",
      args: [[["SET", "a", "x", 10], ["GET", "a", 5]]],
      expected: [null]
    },
    {
      name: "multiple timestamps",
      args: [[
        ["SET", "a", "x", 5],
        ["SET", "a", "y", 10],
        ["GET", "a", 7],
        ["GET", "a", 10],
        ["GET", "a", 100]
      ]],
      expected: ["x", "y", "y"]
    }
  ],
  hiddenTests: [
    {
      name: "exact match at set timestamp",
      args: [[["SET", "k", "v", 3], ["GET", "k", 3]]],
      expected: ["v"]
    },
    {
      name: "keys independent",
      args: [[
        ["SET", "a", "alpha", 5],
        ["SET", "b", "beta", 5],
        ["GET", "a", 10],
        ["GET", "b", 10],
        ["GET", "c", 10]
      ]],
      expected: ["alpha", "beta", null]
    },
    {
      name: "out of order sets",
      args: [[
        ["SET", "a", "later", 20],
        ["SET", "a", "earlier", 5],
        ["GET", "a", 10],
        ["GET", "a", 30]
      ]],
      expected: ["earlier", "later"]
    },
    {
      name: "overwrite same timestamp",
      args: [[
        ["SET", "a", "first", 5],
        ["SET", "a", "second", 5],
        ["GET", "a", 5]
      ]],
      expected: ["second"]
    },
    {
      name: "interleaved sets and gets",
      args: [[
        ["SET", "a", "v1", 1],
        ["GET", "a", 1],
        ["SET", "a", "v2", 2],
        ["GET", "a", 1],
        ["GET", "a", 2]
      ]],
      expected: ["v1", "v1", "v2"]
    }
  ],
  hints: [
    "Keep a sorted list of timestamps per key plus a `(key, timestamp) -> value` table for lookups.",
    "On `SET`, insert the timestamp at its sorted position if it is new; otherwise just update the value.",
    "On `GET`, use `bisect_right` to find the first timestamp greater than the query; the answer lives just before it."
  ],
  solution:
    "Maintain two structures: a `key -> sorted list of timestamps` history and a `(key, timestamp) -> value` table. On `SET`, insert the timestamp into its key's history at the correct sorted position (idempotently for repeated timestamps) and overwrite the entry in the value table. On `GET`, binary-search the history with `bisect_right(timestamps, query_ts)`; if the result is 0, no earlier write exists and the answer is `None`. Otherwise the predecessor timestamp at `result - 1` gives the value to return.",
  walkthrough:
    "Splitting the index from the values lets you handle out-of-order writes cleanly: the sorted-timestamp list grows in the right place no matter what order writes arrive, and the value table makes overwrite-at-same-timestamp a trivial dict update. `bisect_right` is the right side of binary search because the query is inclusive on equality; `bisect_left` would miss an exact-timestamp match.",
  followUps: [
    "How would you trim history older than a retention horizon without breaking the API?"
  ],
  complexity: { time: "O(log h) per GET, O(h) per SET for the insert", space: "O(s) where s is the total number of writes" },
  parts: [
    {
      id: "part-2-delete-snapshot",
      title: "Part 2: Delete and snapshot",
      prompt:
        "Extend the store to support two new operations. `[\"DELETE\", key, timestamp]` tombstones a key at the given timestamp: any `GET` whose query timestamp is at or after a tombstone (and before any later `SET`) returns `None`. A later `SET` at a higher timestamp re-creates the key. `[\"SNAPSHOT\", timestamp]` returns a dict of every key whose latest non-tombstone write at or before `timestamp` is still live — that is, the most recent entry must be a `SET` (not a `DELETE`). The output list still contains one entry per `GET` and per `SNAPSHOT`, in input order; `DELETE` and `SET` produce no output entry.",
      entrypoint: "versioned_kv_with_snapshot",
      starterCode:
        "def versioned_kv_with_snapshot(operations):\n" +
        "    # Support SET, DELETE, GET, and SNAPSHOT.\n" +
        "    # Return one entry per GET (value or None) and per SNAPSHOT (dict).\n" +
        "    pass\n",
      referenceCode:
        "import bisect\n\n" +
        "def versioned_kv_with_snapshot(operations):\n" +
        "    history = {}\n" +
        "    table = {}\n" +
        "    results = []\n" +
        "    for op in operations:\n" +
        "        kind = op[0]\n" +
        "        if kind == \"SET\":\n" +
        "            _, key, value, ts = op\n" +
        "            stamps = history.setdefault(key, [])\n" +
        "            position = bisect.bisect_left(stamps, ts)\n" +
        "            if position == len(stamps) or stamps[position] != ts:\n" +
        "                stamps.insert(position, ts)\n" +
        "            table[(key, ts)] = value\n" +
        "        elif kind == \"DELETE\":\n" +
        "            _, key, ts = op\n" +
        "            stamps = history.setdefault(key, [])\n" +
        "            position = bisect.bisect_left(stamps, ts)\n" +
        "            if position == len(stamps) or stamps[position] != ts:\n" +
        "                stamps.insert(position, ts)\n" +
        "            table[(key, ts)] = None\n" +
        "        elif kind == \"GET\":\n" +
        "            _, key, ts = op\n" +
        "            stamps = history.get(key, [])\n" +
        "            position = bisect.bisect_right(stamps, ts)\n" +
        "            if position == 0:\n" +
        "                results.append(None)\n" +
        "            else:\n" +
        "                results.append(table[(key, stamps[position - 1])])\n" +
        "        elif kind == \"SNAPSHOT\":\n" +
        "            _, ts = op\n" +
        "            snapshot = {}\n" +
        "            for key, stamps in history.items():\n" +
        "                position = bisect.bisect_right(stamps, ts)\n" +
        "                if position == 0:\n" +
        "                    continue\n" +
        "                value = table[(key, stamps[position - 1])]\n" +
        "                if value is not None:\n" +
        "                    snapshot[key] = value\n" +
        "            results.append(snapshot)\n" +
        "    return results\n",
      solutionCode:
        "import bisect\n\n" +
        "def versioned_kv_with_snapshot(operations):\n" +
        "    history = {}\n" +
        "    table = {}\n" +
        "    out = []\n" +
        "\n" +
        "    def write(key, ts, value):\n" +
        "        stamps = history.setdefault(key, [])\n" +
        "        idx = bisect.bisect_left(stamps, ts)\n" +
        "        if idx == len(stamps) or stamps[idx] != ts:\n" +
        "            stamps.insert(idx, ts)\n" +
        "        table[(key, ts)] = value\n" +
        "\n" +
        "    def as_of(key, ts):\n" +
        "        stamps = history.get(key, [])\n" +
        "        idx = bisect.bisect_right(stamps, ts)\n" +
        "        if idx == 0:\n" +
        "            return None\n" +
        "        return table[(key, stamps[idx - 1])]\n" +
        "\n" +
        "    for op in operations:\n" +
        "        kind = op[0]\n" +
        "        if kind == \"SET\":\n" +
        "            write(op[1], op[3], op[2])\n" +
        "        elif kind == \"DELETE\":\n" +
        "            write(op[1], op[2], None)\n" +
        "        elif kind == \"GET\":\n" +
        "            out.append(as_of(op[1], op[2]))\n" +
        "        elif kind == \"SNAPSHOT\":\n" +
        "            ts = op[1]\n" +
        "            snap = {}\n" +
        "            for key in history:\n" +
        "                value = as_of(key, ts)\n" +
        "                if value is not None:\n" +
        "                    snap[key] = value\n" +
        "            out.append(snap)\n" +
        "    return out\n",
      visibleTests: [
        { name: "empty ops part2", args: [[]], expected: [] },
        {
          name: "delete tombstones key",
          args: [[
            ["SET", "a", "x", 5],
            ["DELETE", "a", 10],
            ["GET", "a", 15]
          ]],
          expected: [null]
        },
        {
          name: "get before delete still returns value",
          args: [[
            ["SET", "a", "x", 5],
            ["DELETE", "a", 10],
            ["GET", "a", 7]
          ]],
          expected: ["x"]
        },
        {
          name: "set after delete revives key",
          args: [[
            ["SET", "a", "x", 5],
            ["DELETE", "a", 10],
            ["SET", "a", "y", 15],
            ["GET", "a", 20]
          ]],
          expected: ["y"]
        }
      ],
      hiddenTests: [
        {
          name: "snapshot collects live keys",
          args: [[
            ["SET", "a", "x", 1],
            ["SET", "b", "y", 2],
            ["SNAPSHOT", 3]
          ]],
          expected: [{ a: "x", b: "y" }]
        },
        {
          name: "snapshot omits deleted",
          args: [[
            ["SET", "a", "x", 1],
            ["DELETE", "a", 2],
            ["SNAPSHOT", 5]
          ]],
          expected: [{}]
        },
        {
          name: "snapshot at exact timestamp",
          args: [[
            ["SET", "a", "x", 1],
            ["SNAPSHOT", 1]
          ]],
          expected: [{ a: "x" }]
        },
        {
          name: "mixed operations sequence",
          args: [[
            ["SET", "a", "1", 1],
            ["SET", "b", "2", 2],
            ["DELETE", "a", 3],
            ["GET", "a", 4],
            ["SET", "a", "3", 5],
            ["SNAPSHOT", 6]
          ]],
          expected: [null, { a: "3", b: "2" }]
        }
      ],
      hints: [
        "Represent a DELETE as a SET-of-None at that timestamp; the same as-of lookup then returns None when a tombstone is the latest entry.",
        "SNAPSHOT is just a loop over every key applying the GET logic and keeping the non-None results.",
        "Watch the operation arity: SET has four fields, DELETE/GET have three, SNAPSHOT has two."
      ],
      solution:
        "Model DELETE as a write of `None` at its timestamp. That way the same as-of lookup (`bisect_right` then read the predecessor entry) returns `None` if the latest write at or before the query was a tombstone, and returns the real value if a later SET superseded the tombstone. SNAPSHOT iterates every key, runs the same as-of lookup, and copies non-`None` results into a fresh dict.",
      walkthrough:
        "Splitting reads (`as_of`) from writes (`write`) is what makes the four-operation dispatch readable. Each operation reduces to either a write or an as-of read; the tombstone trick avoids any second data structure to track deleted keys.",
      complexity: { time: "O(log h) per GET / DELETE / SET, O(k log h) per SNAPSHOT", space: "O(s)" }
    }
  ]
});

export const tekmerionPrepSet: ProblemSet = {
  id: setId,
  title: "Tekmerion Assessment Prep",
  summary: "Practical, language-agnostic programming problems sized to a coding interview that screens for clear thinking and structure rather than algorithm trivia.",
  intro:
    "These prompts are calibrated for a baseline-programming-ability interview. Each is solvable cleanly in 30–45 minutes in Python (or any language). They reward decomposition, careful state handling, explicit edge cases, and a fully-tested implementation — not clever tricks. Treat each problem like a small system: name the state, validate inputs at the boundary, and pick the simplest data structure that fits.",
  problems: [tradePnl, logErrors, parseCsv, minRooms, rateLimiter, topWords, bank, sessionize, reconcile, renderTemplate, resolvePath, versionedKv]
};

export const problemSets: ProblemSet[] = [tekmerionPrepSet];
