import type { FunctionSignature, ValueType } from "../../src/core/types.js";

type LanguageId = "python" | "typescript" | "go" | "scala";

interface LanguageFiles {
  entrypoint: string;
  extension: string;
  starter: string;
  reference: string;
}

interface CuratedProblem {
  signature: FunctionSignature;
  languages: Record<LanguageId, LanguageFiles>;
}

export const interviewPrepProblemIds = [
  "tek-trade-pnl",
  "tek-log-errors-per-hour",
  "tek-rate-limiter",
  "tek-bank-transactions",
  "tek-sessionize-events",
  "tek-parse-csv-row",
  "tek-render-template",
  "tek-resolve-path",
  "tek-eval-expression",
  "tek-min-meeting-rooms",
  "tek-top-k-words",
  "tek-reconcile-inventory",
  "tek-revenue-by-region",
  "tek-flatten-config",
  "tek-versioned-kv",
  "tek-mini-filesystem",
  "tek-task-order",
  "tek-flood-fill"
] as const;

export const interviewPrepCurated: Record<string, CuratedProblem> = {
  "tek-trade-pnl": problem(
    { name: "realizedPnl", inputs: [{ name: "trades", type: arrayOf(objectType()) }], output: numberType() },
    names("realized_pnl", "realizedPnl", "RealizedPnl", "realizedPnl"),
    "trades: list[dict]",
    "trades: Array<{ side: string; qty: number; price: number }>",
    "trades []map[string]any",
    "trades: Seq[Map[String, Any]]",
    "int",
    "number",
    "int",
    "Int",
    [
      "lots = []",
      "total = 0",
      "for trade in trades:",
      "    if trade['side'] == 'BUY':",
      "        lots.append([trade['qty'], trade['price']])",
      "        continue",
      "    remaining = trade['qty']",
      "    while remaining > 0 and lots:",
      "        lot_qty, lot_price = lots[0]",
      "        matched = min(remaining, lot_qty)",
      "        total += (trade['price'] - lot_price) * matched",
      "        remaining -= matched",
      "        if matched == lot_qty:",
      "            lots.pop(0)",
      "        else:",
      "            lots[0][0] = lot_qty - matched",
      "return total"
    ],
    [
      "const lots: Array<{ qty: number; price: number }> = [];",
      "let total = 0;",
      "for (const trade of trades) {",
      "  if (trade.side === \"BUY\") { lots.push({ qty: trade.qty, price: trade.price }); continue; }",
      "  let remaining = trade.qty;",
      "  while (remaining > 0 && lots.length > 0) {",
      "    const lot = lots[0];",
      "    const matched = Math.min(remaining, lot.qty);",
      "    total += (trade.price - lot.price) * matched;",
      "    remaining -= matched;",
      "    lot.qty -= matched;",
      "    if (lot.qty === 0) lots.shift();",
      "  }",
      "}",
      "return total;"
    ]
  ),
  "tek-log-errors-per-hour": problem(
    { name: "errorsPerHour", inputs: [{ name: "lines", type: stringArray() }], output: objectType() },
    names("errors_per_hour", "errorsPerHour", "ErrorsPerHour", "errorsPerHour"),
    "lines: list[str]",
    "lines: string[]",
    "lines []string",
    "lines: Seq[String]",
    "dict",
    "Record<string, number>",
    "map[string]int",
    "Map[String, Int]",
    [
      "counts = {}",
      "for line in lines:",
      "    parts = line.split(' ', 2)",
      "    if len(parts) < 2:",
      "        continue",
      "    timestamp, level = parts[0], parts[1]",
      "    if level != 'ERROR' or len(timestamp) < 13 or timestamp[10] != 'T':",
      "        continue",
      "    hour = timestamp[:13]",
      "    counts[hour] = counts.get(hour, 0) + 1",
      "return counts"
    ],
    [
      "const counts: Record<string, number> = {};",
      "for (const line of lines) {",
      "  const parts = line.split(\" \", 3);",
      "  if (parts.length < 2) continue;",
      "  const [timestamp, level] = parts;",
      "  if (level !== \"ERROR\" || timestamp.length < 13 || timestamp[10] !== \"T\") continue;",
      "  const hour = timestamp.slice(0, 13);",
      "  counts[hour] = (counts[hour] ?? 0) + 1;",
      "}",
      "return counts;"
    ]
  ),
  "tek-rate-limiter": problem(
    { name: "rateLimited", inputs: [{ name: "events", type: arrayOf(arrayOf(anyType())) }, { name: "limit", type: numberType() }, { name: "window", type: numberType() }], output: booleanArray() },
    names("rate_limited", "rateLimited", "RateLimited", "rateLimited"),
    "events: list[list[object]], limit: int, window: int",
    "events: Array<[number, string]>, limit: number, window: number",
    "events [][]any, limit int, window int",
    "events: Seq[(Int, String)], limit: Int, window: Int",
    "list[bool]",
    "boolean[]",
    "[]bool",
    "Seq[Boolean]",
    [
      "accepted = {}",
      "out = []",
      "for timestamp, user_id in events:",
      "    queue = accepted.setdefault(user_id, [])",
      "    while queue and queue[0] <= timestamp - window:",
      "        queue.pop(0)",
      "    if len(queue) < limit:",
      "        queue.append(timestamp)",
      "        out.append(True)",
      "    else:",
      "        out.append(False)",
      "return out"
    ],
    [
      "const accepted = new Map<string, number[]>();",
      "const out: boolean[] = [];",
      "for (const [timestamp, userId] of events) {",
      "  const queue = accepted.get(userId) ?? [];",
      "  while (queue.length > 0 && queue[0] <= timestamp - window) queue.shift();",
      "  if (queue.length < limit) { queue.push(timestamp); out.push(true); }",
      "  else out.push(false);",
      "  accepted.set(userId, queue);",
      "}",
      "return out;"
    ]
  ),
  "tek-bank-transactions": problem(
    { name: "applyTransactions", inputs: [{ name: "startingBalances", type: objectType() }, { name: "transactions", type: arrayOf(objectType()) }], output: arrayOf(anyType()) },
    names("apply_transactions", "applyTransactions", "ApplyTransactions", "applyTransactions"),
    "starting_balances: dict, transactions: list[dict]",
    "startingBalances: Record<string, number>, transactions: Array<Record<string, unknown>>",
    "startingBalances map[string]int, transactions []map[string]any",
    "startingBalances: Map[String, Int], transactions: Seq[Map[String, Any]]",
    "list[object]",
    "[Record<string, number>, number[]]",
    "[]any",
    "(Map[String, Int], Seq[Int])",
    [
      "balances = dict(starting_balances)",
      "rejected = []",
      "for index, txn in enumerate(transactions):",
      "    kind = txn.get('type')",
      "    amount = txn.get('amount', 0)",
      "    if kind == 'DEPOSIT':",
      "        account = txn.get('account')",
      "        if account in balances:",
      "            balances[account] += amount",
      "        else:",
      "            rejected.append(index)",
      "    elif kind == 'WITHDRAW':",
      "        account = txn.get('account')",
      "        if account in balances and balances[account] >= amount:",
      "            balances[account] -= amount",
      "        else:",
      "            rejected.append(index)",
      "    elif kind == 'TRANSFER':",
      "        src = txn.get('from')",
      "        dst = txn.get('to')",
      "        if src in balances and dst in balances and balances[src] >= amount:",
      "            balances[src] -= amount",
      "            balances[dst] += amount",
      "        else:",
      "            rejected.append(index)",
      "    else:",
      "        rejected.append(index)",
      "return [balances, rejected]"
    ],
    [
      "const balances: Record<string, number> = { ...startingBalances };",
      "const rejected: number[] = [];",
      "for (let index = 0; index < transactions.length; index += 1) {",
      "  const txn = transactions[index];",
      "  const kind = txn.type;",
      "  const amount = Number(txn.amount ?? 0);",
      "  if (kind === \"DEPOSIT\") {",
      "    const account = String(txn.account);",
      "    if (Object.hasOwn(balances, account)) balances[account] += amount;",
      "    else rejected.push(index);",
      "  } else if (kind === \"WITHDRAW\") {",
      "    const account = String(txn.account);",
      "    if (Object.hasOwn(balances, account) && balances[account] >= amount) balances[account] -= amount;",
      "    else rejected.push(index);",
      "  } else if (kind === \"TRANSFER\") {",
      "    const src = String(txn.from);",
      "    const dst = String(txn.to);",
      "    if (Object.hasOwn(balances, src) && Object.hasOwn(balances, dst) && balances[src] >= amount) {",
      "      balances[src] -= amount;",
      "      balances[dst] += amount;",
      "    } else rejected.push(index);",
      "  } else rejected.push(index);",
      "}",
      "return [balances, rejected];"
    ]
  ),
  "tek-sessionize-events": problem(
    { name: "sessionizeEvents", inputs: [{ name: "events", type: arrayOf(arrayOf(anyType())) }, { name: "timeout", type: numberType() }], output: arrayOf(arrayOf(anyType())) },
    names("sessionize_events", "sessionizeEvents", "SessionizeEvents", "sessionizeEvents"),
    "events: list[list[object]], timeout: int",
    "events: Array<[number, string]>, timeout: number",
    "events [][]any, timeout int",
    "events: Seq[(Int, String)], timeout: Int",
    "list[list[object]]",
    "Array<[string, number, number, number]>",
    "[][]any",
    "Seq[(String, Int, Int, Int)]",
    [
      "open_sessions = {}",
      "closed = []",
      "for timestamp, user_id in events:",
      "    session = open_sessions.get(user_id)",
      "    if session is None or timestamp - session['end'] > timeout:",
      "        if session is not None:",
      "            closed.append([user_id, session['start'], session['end'], session['count']])",
      "        open_sessions[user_id] = {'start': timestamp, 'end': timestamp, 'count': 1}",
      "    else:",
      "        session['end'] = timestamp",
      "        session['count'] += 1",
      "for user_id, session in open_sessions.items():",
      "    closed.append([user_id, session['start'], session['end'], session['count']])",
      "closed.sort(key=lambda row: (row[1], row[0]))",
      "return closed"
    ],
    [
      "const open = new Map<string, { start: number; end: number; count: number }>();",
      "const closed: Array<[string, number, number, number]> = [];",
      "for (const [timestamp, userId] of events) {",
      "  const session = open.get(userId);",
      "  if (!session || timestamp - session.end > timeout) {",
      "    if (session) closed.push([userId, session.start, session.end, session.count]);",
      "    open.set(userId, { start: timestamp, end: timestamp, count: 1 });",
      "  } else {",
      "    session.end = timestamp;",
      "    session.count += 1;",
      "  }",
      "}",
      "for (const [userId, session] of open) closed.push([userId, session.start, session.end, session.count]);",
      "closed.sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));",
      "return closed;"
    ]
  ),
  "tek-parse-csv-row": problem(
    { name: "parseCsvRow", inputs: [{ name: "line", type: stringType() }], output: stringArray() },
    names("parse_csv_row", "parseCsvRow", "ParseCsvRow", "parseCsvRow"),
    "line: str",
    "line: string",
    "line string",
    "line: String",
    "list[str]",
    "string[]",
    "[]string",
    "Seq[String]",
    [
      "fields = []",
      "current = []",
      "in_quotes = False",
      "i = 0",
      "while i < len(line):",
      "    ch = line[i]",
      "    if in_quotes:",
      "        if ch == '\"':",
      "            if i + 1 < len(line) and line[i + 1] == '\"':",
      "                current.append('\"')",
      "                i += 2",
      "                continue",
      "            in_quotes = False",
      "            i += 1",
      "            continue",
      "        current.append(ch)",
      "        i += 1",
      "    else:",
      "        if ch == '\"' and not current:",
      "            in_quotes = True",
      "            i += 1",
      "        elif ch == ',':",
      "            fields.append(''.join(current))",
      "            current = []",
      "            i += 1",
      "        else:",
      "            current.append(ch)",
      "            i += 1",
      "fields.append(''.join(current))",
      "return fields"
    ],
    [
      "const fields: string[] = [];",
      "let current = \"\";",
      "let inQuotes = false;",
      "let index = 0;",
      "while (index < line.length) {",
      "  const ch = line[index];",
      "  if (inQuotes) {",
      "    if (ch === \"\\\"\") {",
      "      if (index + 1 < line.length && line[index + 1] === \"\\\"\") { current += \"\\\"\"; index += 2; continue; }",
      "      inQuotes = false; index += 1; continue;",
      "    }",
      "    current += ch; index += 1;",
      "  } else if (ch === \"\\\"\" && current.length === 0) { inQuotes = true; index += 1; }",
      "  else if (ch === \",\") { fields.push(current); current = \"\"; index += 1; }",
      "  else { current += ch; index += 1; }",
      "}",
      "fields.push(current);",
      "return fields;"
    ]
  ),
  "tek-render-template": problem(
    { name: "renderTemplate", inputs: [{ name: "template", type: stringType() }, { name: "values", type: objectType() }], output: stringType() },
    names("render_template", "renderTemplate", "RenderTemplate", "renderTemplate"),
    "template: str, values: dict",
    "template: string, values: Record<string, unknown>",
    "template string, values map[string]any",
    "template: String, values: Map[String, Any]",
    "str",
    "string",
    "string",
    "String",
    [
      "import re",
      "pattern = re.compile(r'\\{\\{([a-zA-Z_][a-zA-Z0-9_]*)\\}\\}')",
      "def repl(match):",
      "    name = match.group(1)",
      "    return str(values[name]) if name in values else match.group(0)",
      "return pattern.sub(repl, template)"
    ],
    [
      "return template.replace(/\\{\\{([a-zA-Z_][a-zA-Z0-9_]*)\\}\\}/g, (match, name: string) => {",
      "  return Object.hasOwn(values, name) ? pyString(values[name]) : match;",
      "});"
    ],
    [pyStringTs()]
  ),
  "tek-resolve-path": problem(
    { name: "resolvePath", inputs: [{ name: "path", type: stringType() }], output: stringType() },
    names("resolve_path", "resolvePath", "ResolvePath", "resolvePath"),
    "path: str",
    "path: string",
    "path string",
    "path: String",
    "str",
    "string",
    "string",
    "String",
    [
      "stack = []",
      "for part in path.split('/'):",
      "    if part == '' or part == '.':",
      "        continue",
      "    if part == '..':",
      "        if stack:",
      "            stack.pop()",
      "    else:",
      "        stack.append(part)",
      "return '/' + '/'.join(stack)"
    ],
    [
      "const stack: string[] = [];",
      "for (const part of path.split(\"/\")) {",
      "  if (part === \"\" || part === \".\") continue;",
      "  if (part === \"..\") stack.pop();",
      "  else stack.push(part);",
      "}",
      "return `/${stack.join(\"/\")}`;"
    ]
  ),
  "tek-eval-expression": problem(
    { name: "evaluate", inputs: [{ name: "expr", type: stringType() }], output: numberType() },
    names("evaluate", "evaluate", "Evaluate", "evaluate"),
    "expr: str",
    "expr: string",
    "expr string",
    "expr: String",
    "int",
    "number",
    "int",
    "Int",
    [
      "tokens = []",
      "i = 0",
      "while i < len(expr):",
      "    c = expr[i]",
      "    if c == ' ':",
      "        i += 1",
      "    elif c.isdigit():",
      "        j = i",
      "        while j < len(expr) and expr[j].isdigit():",
      "            j += 1",
      "        tokens.append(int(expr[i:j]))",
      "        i = j",
      "    else:",
      "        tokens.append(c)",
      "        i += 1",
      "pos = 0",
      "def trunc_div(a, b):",
      "    q = abs(a) // abs(b)",
      "    return q if (a < 0) == (b < 0) else -q",
      "def parse_expr():",
      "    nonlocal pos",
      "    value = parse_term()",
      "    while pos < len(tokens) and tokens[pos] in ('+', '-'):",
      "        op = tokens[pos]; pos += 1",
      "        rhs = parse_term()",
      "        value = value + rhs if op == '+' else value - rhs",
      "    return value",
      "def parse_term():",
      "    nonlocal pos",
      "    value = parse_factor()",
      "    while pos < len(tokens) and tokens[pos] in ('*', '/'):",
      "        op = tokens[pos]; pos += 1",
      "        rhs = parse_factor()",
      "        value = value * rhs if op == '*' else trunc_div(value, rhs)",
      "    return value",
      "def parse_factor():",
      "    nonlocal pos",
      "    tok = tokens[pos]",
      "    if tok == '(':",
      "        pos += 1",
      "        value = parse_expr()",
      "        pos += 1",
      "        return value",
      "    pos += 1",
      "    return tok",
      "return parse_expr()"
    ],
    [
      "const tokens: Array<number | string> = [];",
      "let cursor = 0;",
      "while (cursor < expr.length) {",
      "  const ch = expr[cursor];",
      "  if (ch === \" \") { cursor += 1; continue; }",
      "  if (/\\d/.test(ch)) {",
      "    let end = cursor;",
      "    while (end < expr.length && /\\d/.test(expr[end])) end += 1;",
      "    tokens.push(Number(expr.slice(cursor, end)));",
      "    cursor = end;",
      "  } else { tokens.push(ch); cursor += 1; }",
      "}",
      "let pos = 0;",
      "const truncDiv = (a: number, b: number) => { const q = Math.trunc(Math.abs(a) / Math.abs(b)); return (a < 0) === (b < 0) ? q : -q; };",
      "const parseExpr = (): number => { let value = parseTerm(); while (pos < tokens.length && (tokens[pos] === \"+\" || tokens[pos] === \"-\")) { const op = tokens[pos++]; const rhs = parseTerm(); value = op === \"+\" ? value + rhs : value - rhs; } return value; };",
      "const parseTerm = (): number => { let value = parseFactor(); while (pos < tokens.length && (tokens[pos] === \"*\" || tokens[pos] === \"/\")) { const op = tokens[pos++]; const rhs = parseFactor(); value = op === \"*\" ? value * rhs : truncDiv(value, rhs); } return value; };",
      "const parseFactor = (): number => { const token = tokens[pos++]; if (token === \"(\") { const value = parseExpr(); pos += 1; return value; } return token as number; };",
      "return parseExpr();"
    ]
  ),
  "tek-min-meeting-rooms": problem(
    { name: "minMeetingRooms", inputs: [{ name: "meetings", type: numberMatrix() }], output: numberType() },
    names("min_meeting_rooms", "minMeetingRooms", "MinMeetingRooms", "minMeetingRooms"),
    "meetings: list[list[int]]",
    "meetings: number[][]",
    "meetings [][]int",
    "meetings: Seq[Seq[Int]]",
    "int",
    "number",
    "int",
    "Int",
    [
      "events = []",
      "for start, end in meetings:",
      "    events.append((start, 1))",
      "    events.append((end, -1))",
      "events.sort(key=lambda event: (event[0], event[1]))",
      "active = peak = 0",
      "for _, delta in events:",
      "    active += delta",
      "    peak = max(peak, active)",
      "return peak"
    ],
    [
      "const events: Array<[number, number]> = [];",
      "for (const [start, end] of meetings) { events.push([start, 1], [end, -1]); }",
      "events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);",
      "let active = 0;",
      "let peak = 0;",
      "for (const [, delta] of events) { active += delta; peak = Math.max(peak, active); }",
      "return peak;"
    ]
  ),
  "tek-top-k-words": problem(
    { name: "topKWords", inputs: [{ name: "text", type: stringType() }, { name: "k", type: numberType() }], output: arrayOf(arrayOf(anyType())) },
    names("top_k_words", "topKWords", "TopKWords", "topKWords"),
    "text: str, k: int",
    "text: string, k: number",
    "text string, k int",
    "text: String, k: Int",
    "list[list[object]]",
    "Array<[string, number]>",
    "[][]any",
    "Seq[(String, Int)]",
    [
      "import re",
      "if k <= 0:",
      "    return []",
      "counts = {}",
      "for word in re.findall(r'[a-zA-Z]+', text.lower()):",
      "    counts[word] = counts.get(word, 0) + 1",
      "ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))",
      "return [[word, count] for word, count in ranked[:k]]"
    ],
    [
      "if (k <= 0) return [];",
      "const counts = new Map<string, number>();",
      "for (const match of text.toLowerCase().matchAll(/[a-z]+/g)) counts.set(match[0], (counts.get(match[0]) ?? 0) + 1);",
      "return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, k).map(([word, count]) => [word, count]);"
    ]
  ),
  "tek-reconcile-inventory": problem(
    { name: "reconcileInventory", inputs: [{ name: "expected", type: objectType() }, { name: "observed", type: objectType() }], output: arrayOf(arrayOf(anyType())) },
    names("reconcile_inventory", "reconcileInventory", "ReconcileInventory", "reconcileInventory"),
    "expected: dict, observed: dict",
    "expected: Record<string, number>, observed: Record<string, number>",
    "expected map[string]int, observed map[string]int",
    "expected: Map[String, Int], observed: Map[String, Int]",
    "list[list[object]]",
    "Array<[string, string, number, number, number]>",
    "[][]any",
    "Seq[(String, String, Int, Int, Int)]",
    [
      "rows = []",
      "for sku in sorted(set(expected) | set(observed)):",
      "    in_exp = sku in expected",
      "    in_obs = sku in observed",
      "    exp_qty = expected.get(sku, 0)",
      "    obs_qty = observed.get(sku, 0)",
      "    delta = obs_qty - exp_qty",
      "    if not in_obs:",
      "        rows.append([sku, 'missing', exp_qty, 0, delta])",
      "    elif not in_exp:",
      "        rows.append([sku, 'extra', 0, obs_qty, delta])",
      "    elif obs_qty < exp_qty:",
      "        rows.append([sku, 'short', exp_qty, obs_qty, delta])",
      "    elif obs_qty > exp_qty:",
      "        rows.append([sku, 'over', exp_qty, obs_qty, delta])",
      "return rows"
    ],
    [
      "const rows: Array<[string, string, number, number, number]> = [];",
      "const skus = [...new Set([...Object.keys(expected), ...Object.keys(observed)])].sort();",
      "for (const sku of skus) {",
      "  const inExp = Object.hasOwn(expected, sku);",
      "  const inObs = Object.hasOwn(observed, sku);",
      "  const expQty = expected[sku] ?? 0;",
      "  const obsQty = observed[sku] ?? 0;",
      "  const delta = obsQty - expQty;",
      "  if (!inObs) rows.push([sku, \"missing\", expQty, 0, delta]);",
      "  else if (!inExp) rows.push([sku, \"extra\", 0, obsQty, delta]);",
      "  else if (obsQty < expQty) rows.push([sku, \"short\", expQty, obsQty, delta]);",
      "  else if (obsQty > expQty) rows.push([sku, \"over\", expQty, obsQty, delta]);",
      "}",
      "return rows;"
    ]
  ),
  "tek-revenue-by-region": problem(
    { name: "revenueByRegion", inputs: [{ name: "customers", type: arrayOf(objectType()) }, { name: "orders", type: arrayOf(objectType()) }], output: objectType() },
    names("revenue_by_region", "revenueByRegion", "RevenueByRegion", "revenueByRegion"),
    "customers: list[dict], orders: list[dict]",
    "customers: Array<{ id: number; region: string }>, orders: Array<{ customer_id: number; amount: number }>",
    "customers []map[string]any, orders []map[string]any",
    "customers: Seq[Map[String, Any]], orders: Seq[Map[String, Any]]",
    "dict",
    "Record<string, number>",
    "map[string]int",
    "Map[String, Int]",
    [
      "region_of = {c['id']: c['region'] for c in customers}",
      "totals = {}",
      "for order in orders:",
      "    region = region_of.get(order['customer_id'])",
      "    if region is None:",
      "        continue",
      "    totals[region] = totals.get(region, 0) + order['amount']",
      "return totals"
    ],
    [
      "const regionOf = new Map<number, string>();",
      "for (const customer of customers) regionOf.set(customer.id, customer.region);",
      "const totals: Record<string, number> = {};",
      "for (const order of orders) {",
      "  const region = regionOf.get(order.customer_id);",
      "  if (region === undefined) continue;",
      "  totals[region] = (totals[region] ?? 0) + order.amount;",
      "}",
      "return totals;"
    ]
  ),
  "tek-flatten-config": problem(
    { name: "flattenConfig", inputs: [{ name: "config", type: objectType() }], output: objectType() },
    names("flatten_config", "flattenConfig", "FlattenConfig", "flattenConfig"),
    "config: dict",
    "config: Record<string, unknown>",
    "config map[string]any",
    "config: Map[String, Any]",
    "dict",
    "Record<string, unknown>",
    "map[string]any",
    "Map[String, Any]",
    [
      "out = {}",
      "def walk(node, prefix):",
      "    for key, value in node.items():",
      "        path = prefix + '.' + key if prefix else key",
      "        if isinstance(value, dict):",
      "            walk(value, path)",
      "        else:",
      "            out[path] = value",
      "walk(config, '')",
      "return out"
    ],
    [
      "const out: Record<string, unknown> = {};",
      "const walk = (node: Record<string, unknown>, prefix: string) => {",
      "  for (const [key, value] of Object.entries(node)) {",
      "    const path = prefix ? `${prefix}.${key}` : key;",
      "    if (isPlainObject(value)) walk(value, path);",
      "    else out[path] = value;",
      "  }",
      "};",
      "walk(config, \"\");",
      "return out;"
    ],
    [objectHelpersTs()]
  ),
  "tek-versioned-kv": problem(
    { name: "versionedKv", inputs: [{ name: "operations", type: arrayOf(arrayOf(anyType())) }], output: arrayOf(anyType()) },
    names("versioned_kv", "versionedKv", "VersionedKv", "versionedKv"),
    "operations: list[list[object]]",
    "operations: unknown[][]",
    "operations [][]any",
    "operations: Seq[Seq[Any]]",
    "list[object]",
    "unknown[]",
    "[]any",
    "Seq[Any]",
    [
      "history = {}",
      "table = {}",
      "results = []",
      "for op in operations:",
      "    if op[0] == 'SET':",
      "        _, key, value, ts = op",
      "        stamps = history.setdefault(key, [])",
      "        if ts not in stamps:",
      "            stamps.append(ts); stamps.sort()",
      "        table[(key, ts)] = value",
      "    else:",
      "        _, key, ts = op",
      "        stamps = history.get(key, [])",
      "        candidates = [stamp for stamp in stamps if stamp <= ts]",
      "        results.append(None if not candidates else table[(key, candidates[-1])])",
      "return results"
    ],
    [
      "const history = new Map<string, number[]>();",
      "const table = new Map<string, unknown>();",
      "const out: unknown[] = [];",
      "for (const op of operations) {",
      "  if (op[0] === \"SET\") {",
      "    const key = String(op[1]);",
      "    const value = op[2];",
      "    const ts = Number(op[3]);",
      "    const stamps = history.get(key) ?? [];",
      "    if (!stamps.includes(ts)) { stamps.push(ts); stamps.sort((a, b) => a - b); }",
      "    history.set(key, stamps);",
      "    table.set(`${key}\\u0000${ts}`, value);",
      "  } else {",
      "    const key = String(op[1]);",
      "    const ts = Number(op[2]);",
      "    const stamps = history.get(key) ?? [];",
      "    let answer: unknown = null;",
      "    for (const stamp of stamps) if (stamp <= ts) answer = table.get(`${key}\\u0000${stamp}`);",
      "    out.push(answer ?? null);",
      "  }",
      "}",
      "return out;"
    ]
  ),
  "tek-mini-filesystem": problem(
    { name: "runFs", inputs: [{ name: "commands", type: arrayOf(arrayOf(anyType())) }], output: arrayOf(anyType()) },
    names("run_fs", "runFs", "RunFs", "runFs"),
    "commands: list[list[object]]",
    "commands: unknown[][]",
    "commands [][]any",
    "commands: Seq[Seq[Any]]",
    "list[object]",
    "unknown[]",
    "[]any",
    "Seq[Any]",
    [
      "root = {'type': 'dir', 'children': {}}",
      "def parts(path): return [p for p in path.split('/') if p]",
      "def node_at(segs, create=False):",
      "    node = root",
      "    for seg in segs:",
      "        children = node['children']",
      "        if seg not in children:",
      "            if not create: return None",
      "            children[seg] = {'type': 'dir', 'children': {}}",
      "        node = children[seg]",
      "    return node",
      "out = []",
      "for cmd in commands:",
      "    op = cmd[0]",
      "    if op == 'mkdir': node_at(parts(cmd[1]), True)",
      "    elif op == 'addFile':",
      "        segs = parts(cmd[1]); parent = node_at(segs[:-1], True); parent['children'][segs[-1]] = {'type': 'file', 'content': cmd[2]}",
      "    elif op == 'ls':",
      "        segs = parts(cmd[1]); node = node_at(segs)",
      "        out.append([segs[-1]] if node['type'] == 'file' else sorted(node['children'].keys()))",
      "    elif op == 'cat': out.append(node_at(parts(cmd[1]))['content'])",
      "    elif op == 'rm':",
      "        segs = parts(cmd[1]); parent = node_at(segs[:-1])",
      "        if parent is not None and segs and segs[-1] in parent['children']: del parent['children'][segs[-1]]",
      "return out"
    ],
    [
      "type Node = { type: \"dir\"; children: Record<string, Node> } | { type: \"file\"; content: string };",
      "const root: Node = { type: \"dir\", children: {} };",
      "const parts = (path: string) => path.split(\"/\").filter(Boolean);",
      "const nodeAt = (segs: string[], create = false): Node | undefined => {",
      "  let node: Node = root;",
      "  for (const seg of segs) {",
      "    if (node.type !== \"dir\") return undefined;",
      "    if (!node.children[seg]) { if (!create) return undefined; node.children[seg] = { type: \"dir\", children: {} }; }",
      "    node = node.children[seg];",
      "  }",
      "  return node;",
      "};",
      "const out: unknown[] = [];",
      "for (const cmd of commands) {",
      "  const op = cmd[0];",
      "  if (op === \"mkdir\") nodeAt(parts(String(cmd[1])), true);",
      "  else if (op === \"addFile\") { const segs = parts(String(cmd[1])); const parent = nodeAt(segs.slice(0, -1), true) as Extract<Node, { type: \"dir\" }>; parent.children[segs.at(-1)!] = { type: \"file\", content: String(cmd[2]) }; }",
      "  else if (op === \"ls\") { const segs = parts(String(cmd[1])); const node = nodeAt(segs)!; out.push(node.type === \"file\" ? [segs.at(-1)!] : Object.keys(node.children).sort()); }",
      "  else if (op === \"cat\") out.push((nodeAt(parts(String(cmd[1]))) as Extract<Node, { type: \"file\" }>).content);",
      "  else if (op === \"rm\") { const segs = parts(String(cmd[1])); const parent = nodeAt(segs.slice(0, -1)) as Extract<Node, { type: \"dir\" }> | undefined; if (parent && segs.length) delete parent.children[segs.at(-1)!]; }",
      "}",
      "return out;"
    ]
  ),
  "tek-task-order": problem(
    { name: "taskOrder", inputs: [{ name: "deps", type: objectType() }], output: nullableStringArray() },
    names("task_order", "taskOrder", "TaskOrder", "taskOrder"),
    "deps: dict[str, list[str]]",
    "deps: Record<string, string[]>",
    "deps map[string][]string",
    "deps: Map[String, Seq[String]]",
    "list[str] | None",
    "string[] | null",
    "[]string",
    "Option[Seq[String]]",
    [
      "adj = {}",
      "indegree = {}",
      "def ensure(task):",
      "    adj.setdefault(task, [])",
      "    indegree.setdefault(task, 0)",
      "for task, prereqs in deps.items():",
      "    ensure(task)",
      "    for prereq in prereqs:",
      "        ensure(prereq)",
      "        adj[prereq].append(task)",
      "        indegree[task] += 1",
      "ready = sorted([task for task in indegree if indegree[task] == 0])",
      "order = []",
      "while ready:",
      "    task = ready.pop(0)",
      "    order.append(task)",
      "    for nxt in adj[task]:",
      "        indegree[nxt] -= 1",
      "        if indegree[nxt] == 0:",
      "            ready.append(nxt); ready.sort()",
      "return order if len(order) == len(indegree) else None"
    ],
    [
      "const adj = new Map<string, string[]>();",
      "const indegree = new Map<string, number>();",
      "const ensure = (task: string) => { if (!adj.has(task)) adj.set(task, []); if (!indegree.has(task)) indegree.set(task, 0); };",
      "for (const [task, prereqs] of Object.entries(deps)) {",
      "  ensure(task);",
      "  for (const prereq of prereqs) { ensure(prereq); adj.get(prereq)!.push(task); indegree.set(task, (indegree.get(task) ?? 0) + 1); }",
      "}",
      "const ready = [...indegree.entries()].filter(([, degree]) => degree === 0).map(([task]) => task).sort();",
      "const order: string[] = [];",
      "while (ready.length > 0) {",
      "  const task = ready.shift()!;",
      "  order.push(task);",
      "  for (const next of adj.get(task) ?? []) {",
      "    const degree = (indegree.get(next) ?? 0) - 1;",
      "    indegree.set(next, degree);",
      "    if (degree === 0) { ready.push(next); ready.sort(); }",
      "  }",
      "}",
      "return order.length === indegree.size ? order : null;"
    ]
  ),
  "tek-flood-fill": problem(
    { name: "floodFill", inputs: [{ name: "grid", type: numberMatrix() }, { name: "sr", type: numberType() }, { name: "sc", type: numberType() }, { name: "newValue", type: numberType() }], output: numberMatrix() },
    names("flood_fill", "floodFill", "FloodFill", "floodFill"),
    "grid: list[list[int]], sr: int, sc: int, new_value: int",
    "grid: number[][], sr: number, sc: number, newValue: number",
    "grid [][]int, sr int, sc int, newValue int",
    "grid: Seq[Seq[Int]], sr: Int, sc: Int, newValue: Int",
    "list[list[int]]",
    "number[][]",
    "[][]int",
    "Seq[Seq[Int]]",
    [
      "old = grid[sr][sc]",
      "if old == new_value:",
      "    return grid",
      "rows, cols = len(grid), len(grid[0])",
      "stack = [(sr, sc)]",
      "while stack:",
      "    row, col = stack.pop()",
      "    if row < 0 or row >= rows or col < 0 or col >= cols or grid[row][col] != old:",
      "        continue",
      "    grid[row][col] = new_value",
      "    stack.extend([(row + 1, col), (row - 1, col), (row, col + 1), (row, col - 1)])",
      "return grid"
    ],
    [
      "const out = grid.map((row) => [...row]);",
      "const old = out[sr][sc];",
      "if (old === newValue) return out;",
      "const rows = out.length;",
      "const cols = out[0].length;",
      "const stack: Array<[number, number]> = [[sr, sc]];",
      "while (stack.length > 0) {",
      "  const [row, col] = stack.pop()!;",
      "  if (row < 0 || row >= rows || col < 0 || col >= cols || out[row][col] !== old) continue;",
      "  out[row][col] = newValue;",
      "  stack.push([row + 1, col], [row - 1, col], [row, col + 1], [row, col - 1]);",
      "}",
      "return out;"
    ]
  )
};

type Names = {
  python: string;
  typescript: string;
  go: string;
  scala: string;
};

function names(python: string, typescript: string, go: string, scala: string): Names {
  return { python, typescript, go, scala };
}

function problem(
  signature: FunctionSignature,
  names: Names,
  pyArgs: string,
  tsArgs: string,
  goArgs: string,
  scalaArgs: string,
  pyReturn: string,
  tsReturn: string,
  goReturn: string,
  scalaReturn: string,
  pyBody: string[],
  tsBody: string[],
  tsHelpers: string[] = []
): CuratedProblem {
  return {
    signature,
    languages: {
      python: py(names.python, pyArgs, pyReturn, pyBody),
      typescript: ts(names.typescript, tsArgs, tsReturn, tsBody, tsHelpers),
      go: go(names.go, goArgs, goReturn),
      scala: scala(names.scala, scalaArgs, scalaReturn)
    }
  };
}

function py(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return { entrypoint: name, extension: "py", starter: `def ${name}(${args}) -> ${returnType}:\n    raise NotImplementedError\n`, reference: `def ${name}(${args}) -> ${returnType}:\n${indent(body, "    ")}\n` };
}

function ts(name: string, args: string, returnType: string, body: string[], helpers: string[]): LanguageFiles {
  const helperText = helpers.length ? `\n\n${helpers.join("\n\n")}\n` : "\n";
  return { entrypoint: name, extension: "ts", starter: `export function ${name}(${args}): ${returnType} {\n  throw new Error("TODO");\n}\n`, reference: `export function ${name}(${args}): ${returnType} {\n${indent(body, "  ")}\n}${helperText}` };
}

function go(name: string, args: string, returnType: string): LanguageFiles {
  return {
    entrypoint: name,
    extension: "go",
    starter: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`,
    reference: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("GENERATE_REFERENCE_FROM_LEGACY_TESTS")\n}\n`
  };
}

function scala(name: string, args: string, returnType: string): LanguageFiles {
  return {
    entrypoint: name,
    extension: "scala",
    starter: `object Solution {\n  def ${name}(${args}): ${returnType} = ???\n}\n`,
    reference: `object Solution {\n  def ${name}(${args}): ${returnType} = throw new NotImplementedError("GENERATE_REFERENCE_FROM_LEGACY_TESTS")\n}\n`
  };
}

function objectHelpersTs(): string {
  return `function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}`;
}

function pyStringTs(): string {
  return `function pyString(value: unknown): string {
  if (Array.isArray(value)) return \`[\${value.map(pyString).join(", ")}]\`;
  if (typeof value === "boolean") return value ? "True" : "False";
  if (value === null) return "None";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}`;
}

function anyType(): ValueType {
  return { type: "any" };
}

function arrayOf(items: ValueType): ValueType {
  return { type: "array", items };
}

function booleanArray(): ValueType {
  return arrayOf(booleanType());
}

function booleanType(): ValueType {
  return { type: "boolean" };
}

function nullableStringArray(): ValueType {
  return { ...stringArray(), nullable: true };
}

function numberMatrix(): ValueType {
  return arrayOf(numberArray());
}

function numberArray(): ValueType {
  return arrayOf(numberType());
}

function numberType(): ValueType {
  return { type: "number" };
}

function objectType(): ValueType {
  return { type: "object" };
}

function stringArray(): ValueType {
  return arrayOf(stringType());
}

function stringType(): ValueType {
  return { type: "string" };
}

function indent(lines: string[], prefix: string): string {
  return lines.map((line) => `${prefix}${line}`).join("\n");
}
