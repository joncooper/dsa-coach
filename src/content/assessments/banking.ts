import type { Assessment, Problem } from "../../types";
import { assessmentProblem, opTest, standardLevels } from "./_shared";

/**
 * Banking / Ledger — second CodeSignal ICF practice assessment.
 *
 * Four cumulative levels:
 *   L1 create/deposit/withdraw/transfer ->
 *   L2 top-N accounts by outgoing volume ->
 *   L3 schedule + cancel payments (time-based dispatch) ->
 *   L4 merge accounts (consolidating balance, history, and scheduled payments)
 *
 * Every level uses the standard `solution(queries) -> List[str]` dispatcher.
 * Every query carries a `timestamp` as `q[1]` (string-encoded integer), even
 * in Level 1 where it's unused — the dispatcher must accept and ignore it.
 * All money is in **integer cents**; no floats, no validators, plain `==`.
 */

// ---------------------------------------------------------------------------
// Level 1 — accounts
// ---------------------------------------------------------------------------

const L1_PROMPT = `Implement a small ledger driven by an operation list. \`solution(queries)\` \
receives a list of queries; each query is a list of strings \
\`[OP, timestamp, ...args]\`. Every query carries a non-negative integer \
\`timestamp\` (given as a string), even when this level doesn't use it. Return \
a list with one string result per query, in order. All amounts are non-negative \
integers in **cents** (given as strings).

**Level 1 operations**

- \`["CREATE_ACCOUNT", timestamp, account]\` — create a new account with zero \
balance. Return \`"true"\`, or \`"false"\` if the account already exists.
- \`["DEPOSIT", timestamp, account, amount]\` — add \`amount\` cents to \
\`account\`. Return the new balance as a string, or \`""\` if the account does \
not exist.
- \`["WITHDRAW", timestamp, account, amount]\` — subtract \`amount\` cents \
from \`account\`. Return the new balance as a string, or \`""\` if the account \
does not exist or the withdrawal would overdraw it (no change in that case).
- \`["TRANSFER", timestamp, source, target, amount]\` — move \`amount\` cents \
from \`source\` to \`target\`. Return \`source\`'s new balance as a string, or \
\`""\` if either account is missing, source equals target, or source would be \
overdrawn (no change in those cases).

Later levels add operations to the same function, so structure it as a clean \
per-op dispatcher and keep all balances as integer cents.`;

const L1_STARTER = `def solution(queries):
    balances = {}         # account -> int cents
    results = []
    for query in queries:
        op = query[0]
        # CREATE_ACCOUNT ts account              -> "true" / "false"
        # DEPOSIT        ts account amount       -> "<balance>" / ""
        # WITHDRAW       ts account amount       -> "<balance>" / ""
        # TRANSFER       ts src target amount    -> "<src balance>" / ""
        results.append("")
    return results
`;

const L1_REFERENCE = `def solution(queries):
    balances = {}
    out = []
    for q in queries:
        op = q[0]
        if op == "CREATE_ACCOUNT":
            account = q[2]
            if account in balances:
                out.append("false")
            else:
                balances[account] = 0
                out.append("true")
        elif op == "DEPOSIT":
            account, amount = q[2], int(q[3])
            if account not in balances:
                out.append("")
            else:
                balances[account] += amount
                out.append(str(balances[account]))
        elif op == "WITHDRAW":
            account, amount = q[2], int(q[3])
            if account not in balances or balances[account] < amount:
                out.append("")
            else:
                balances[account] -= amount
                out.append(str(balances[account]))
        elif op == "TRANSFER":
            src, target, amount = q[2], q[3], int(q[4])
            if src == target or src not in balances or target not in balances or balances[src] < amount:
                out.append("")
            else:
                balances[src] -= amount
                balances[target] += amount
                out.append(str(balances[src]))
        else:
            out.append("")
    return out
`;

const L1_SOLUTION = `def solution(queries):
    book = {}
    answers = []
    for q in queries:
        kind = q[0]
        if kind == "CREATE_ACCOUNT":
            name = q[2]
            if name in book:
                answers.append("false")
            else:
                book[name] = 0
                answers.append("true")
        elif kind == "DEPOSIT":
            name, amt = q[2], int(q[3])
            if name not in book:
                answers.append("")
            else:
                book[name] += amt
                answers.append(str(book[name]))
        elif kind == "WITHDRAW":
            name, amt = q[2], int(q[3])
            if name not in book or book[name] < amt:
                answers.append("")
            else:
                book[name] -= amt
                answers.append(str(book[name]))
        elif kind == "TRANSFER":
            a, b, amt = q[2], q[3], int(q[4])
            ok = a != b and a in book and b in book and book[a] >= amt
            if not ok:
                answers.append("")
            else:
                book[a] -= amt
                book[b] += amt
                answers.append(str(book[a]))
        else:
            answers.append("")
    return answers
`;

// ---------------------------------------------------------------------------
// Level 2 — top spenders
// ---------------------------------------------------------------------------

const L2_PROMPT = `Extend Level 1 with activity tracking. All Level 1 operations keep working.

Track each account's **outgoing volume** — the total cents it has spent across \
successful \`WITHDRAW\` operations and the \`source\` side of successful \
\`TRANSFER\` operations. Deposits and the \`target\` side of transfers do NOT \
count. Failed operations do not count.

**New operation**

- \`["TOP_SPENDERS", timestamp, n]\` — return the top \`n\` accounts by \
outgoing volume as a single string formatted \`name(total)\`, joined by commas, \
**sorted by total descending, breaking ties by account name ascending**. \
Include accounts with zero spending if and only if \`n\` would otherwise return \
fewer than \`n\` rows and accounts with zero spending exist; in that case, list \
non-zero spenders first, then zero-spenders by name. If \`n\` is 0 or no \
accounts exist, return \`""\`.`;

const L2_STARTER = `def solution(queries):
    balances = {}
    spent = {}            # account -> total outgoing cents
    results = []
    for query in queries:
        op = query[0]
        # Level 1 ops, plus:
        # TOP_SPENDERS ts n -> "a1(t1),a2(t2)" / ""
        results.append("")
    return results
`;

const L2_REFERENCE = `def solution(queries):
    balances = {}
    spent = {}
    out = []

    def render_top(n):
        if n <= 0 or not balances:
            return ""
        rows = [(name, spent.get(name, 0)) for name in balances]
        rows.sort(key=lambda r: (-r[1], r[0]))
        rows = rows[:n]
        return ",".join(name + "(" + str(total) + ")" for name, total in rows)

    for q in queries:
        op = q[0]
        if op == "CREATE_ACCOUNT":
            account = q[2]
            if account in balances:
                out.append("false")
            else:
                balances[account] = 0
                spent[account] = 0
                out.append("true")
        elif op == "DEPOSIT":
            account, amount = q[2], int(q[3])
            if account not in balances:
                out.append("")
            else:
                balances[account] += amount
                out.append(str(balances[account]))
        elif op == "WITHDRAW":
            account, amount = q[2], int(q[3])
            if account not in balances or balances[account] < amount:
                out.append("")
            else:
                balances[account] -= amount
                spent[account] = spent.get(account, 0) + amount
                out.append(str(balances[account]))
        elif op == "TRANSFER":
            src, target, amount = q[2], q[3], int(q[4])
            if src == target or src not in balances or target not in balances or balances[src] < amount:
                out.append("")
            else:
                balances[src] -= amount
                balances[target] += amount
                spent[src] = spent.get(src, 0) + amount
                out.append(str(balances[src]))
        elif op == "TOP_SPENDERS":
            n = int(q[2])
            out.append(render_top(n))
        else:
            out.append("")
    return out
`;

const L2_SOLUTION = `def solution(queries):
    book = {}
    spent = {}
    answers = []

    def top(n):
        if n <= 0 or not book:
            return ""
        items = [(name, spent.get(name, 0)) for name in book.keys()]
        items.sort(key=lambda p: (-p[1], p[0]))
        items = items[:n]
        return ",".join("%s(%d)" % (n_, t_) for n_, t_ in items)

    for q in queries:
        kind = q[0]
        if kind == "CREATE_ACCOUNT":
            name = q[2]
            if name in book:
                answers.append("false")
            else:
                book[name] = 0
                spent[name] = 0
                answers.append("true")
        elif kind == "DEPOSIT":
            name, amt = q[2], int(q[3])
            if name not in book:
                answers.append("")
            else:
                book[name] += amt
                answers.append(str(book[name]))
        elif kind == "WITHDRAW":
            name, amt = q[2], int(q[3])
            if name not in book or book[name] < amt:
                answers.append("")
            else:
                book[name] -= amt
                spent[name] = spent.get(name, 0) + amt
                answers.append(str(book[name]))
        elif kind == "TRANSFER":
            a, b, amt = q[2], q[3], int(q[4])
            if a == b or a not in book or b not in book or book[a] < amt:
                answers.append("")
            else:
                book[a] -= amt
                book[b] += amt
                spent[a] = spent.get(a, 0) + amt
                answers.append(str(book[a]))
        elif kind == "TOP_SPENDERS":
            answers.append(top(int(q[2])))
        else:
            answers.append("")
    return answers
`;

// ---------------------------------------------------------------------------
// Level 3 — scheduled + cancellable payments
// ---------------------------------------------------------------------------

const L3_PROMPT = `Add scheduled payments. All earlier operations keep working.

Scheduled payments fire **before** the current query is processed: at the start \
of every query, all pending payments whose execution time is less than or equal \
to the current query's timestamp fire in chronological order of their execution \
time, breaking ties by the order they were scheduled. A fired payment behaves \
exactly like a successful \`WITHDRAW\` (it counts toward outgoing volume); if \
the account would be overdrawn or no longer exists, the payment is silently \
cancelled and nothing changes.

**New operations**

- \`["SCHEDULE_PAYMENT", timestamp, account, amount, delay]\` — schedule a \
withdrawal of \`amount\` cents from \`account\` at \`timestamp + delay\` (both \
non-negative integer strings). Return the new payment id as \`"payment{N}"\` \
where \`N\` starts at 1 and increments per successful schedule, or \`""\` if \
\`account\` does not exist (no change in that case).
- \`["CANCEL_PAYMENT", timestamp, account, payment_id]\` — cancel a payment \
that has not yet fired or been cancelled. Returns \`"true"\` on success, or \
\`"false"\` if the id is unknown, already fired, already cancelled, or owned \
by a different account.`;

const L3_STARTER = `def solution(queries):
    balances = {}
    spent = {}
    payments = {}         # id -> {"account","amount","exec_at","status"}
    results = []
    for query in queries:
        op = query[0]
        # Level 1-2 ops, plus:
        # SCHEDULE_PAYMENT ts account amount delay -> "payment{N}" / ""
        # CANCEL_PAYMENT   ts account payment_id   -> "true" / "false"
        results.append("")
    return results
`;

const L3_REFERENCE = `def solution(queries):
    balances = {}
    spent = {}
    payments = {}     # id -> {"account","amount","exec_at","seq","status"}
    schedule_seq = 0
    out = []

    def render_top(n):
        if n <= 0 or not balances:
            return ""
        rows = [(name, spent.get(name, 0)) for name in balances]
        rows.sort(key=lambda r: (-r[1], r[0]))
        rows = rows[:n]
        return ",".join(name + "(" + str(total) + ")" for name, total in rows)

    def fire_due(ts):
        due = [pid for pid, p in payments.items() if p["status"] == "pending" and p["exec_at"] <= ts]
        due.sort(key=lambda pid: (payments[pid]["exec_at"], payments[pid]["seq"]))
        for pid in due:
            p = payments[pid]
            account = p["account"]
            amount = p["amount"]
            if account not in balances or balances[account] < amount:
                p["status"] = "cancelled"
                continue
            balances[account] -= amount
            spent[account] = spent.get(account, 0) + amount
            p["status"] = "fired"

    for q in queries:
        ts = int(q[1])
        fire_due(ts)
        op = q[0]
        if op == "CREATE_ACCOUNT":
            account = q[2]
            if account in balances:
                out.append("false")
            else:
                balances[account] = 0
                spent[account] = 0
                out.append("true")
        elif op == "DEPOSIT":
            account, amount = q[2], int(q[3])
            if account not in balances:
                out.append("")
            else:
                balances[account] += amount
                out.append(str(balances[account]))
        elif op == "WITHDRAW":
            account, amount = q[2], int(q[3])
            if account not in balances or balances[account] < amount:
                out.append("")
            else:
                balances[account] -= amount
                spent[account] = spent.get(account, 0) + amount
                out.append(str(balances[account]))
        elif op == "TRANSFER":
            src, target, amount = q[2], q[3], int(q[4])
            if src == target or src not in balances or target not in balances or balances[src] < amount:
                out.append("")
            else:
                balances[src] -= amount
                balances[target] += amount
                spent[src] = spent.get(src, 0) + amount
                out.append(str(balances[src]))
        elif op == "TOP_SPENDERS":
            out.append(render_top(int(q[2])))
        elif op == "SCHEDULE_PAYMENT":
            account = q[2]
            amount = int(q[3])
            delay = int(q[4])
            if account not in balances:
                out.append("")
            else:
                schedule_seq += 1
                pid = "payment" + str(schedule_seq)
                payments[pid] = {
                    "account": account,
                    "amount": amount,
                    "exec_at": ts + delay,
                    "seq": schedule_seq,
                    "status": "pending",
                }
                out.append(pid)
        elif op == "CANCEL_PAYMENT":
            account = q[2]
            pid = q[3]
            p = payments.get(pid)
            if not p or p["status"] != "pending" or p["account"] != account:
                out.append("false")
            else:
                p["status"] = "cancelled"
                out.append("true")
        else:
            out.append("")
    return out
`;

const L3_SOLUTION = `def solution(queries):
    book = {}
    spent = {}
    sched = {}
    counter = 0
    answers = []

    def top(n):
        if n <= 0 or not book:
            return ""
        items = [(name, spent.get(name, 0)) for name in book]
        items.sort(key=lambda p: (-p[1], p[0]))
        items = items[:n]
        return ",".join("%s(%d)" % (a_, t_) for a_, t_ in items)

    def settle(ts):
        ready = [pid for pid, p in sched.items() if p["status"] == "pending" and p["exec_at"] <= ts]
        ready.sort(key=lambda pid: (sched[pid]["exec_at"], sched[pid]["seq"]))
        for pid in ready:
            p = sched[pid]
            who = p["account"]
            amt = p["amount"]
            if who not in book or book[who] < amt:
                p["status"] = "cancelled"
            else:
                book[who] -= amt
                spent[who] = spent.get(who, 0) + amt
                p["status"] = "fired"

    for q in queries:
        ts = int(q[1])
        settle(ts)
        kind = q[0]
        if kind == "CREATE_ACCOUNT":
            name = q[2]
            if name in book:
                answers.append("false")
            else:
                book[name] = 0
                spent[name] = 0
                answers.append("true")
        elif kind == "DEPOSIT":
            name, amt = q[2], int(q[3])
            if name not in book:
                answers.append("")
            else:
                book[name] += amt
                answers.append(str(book[name]))
        elif kind == "WITHDRAW":
            name, amt = q[2], int(q[3])
            if name not in book or book[name] < amt:
                answers.append("")
            else:
                book[name] -= amt
                spent[name] = spent.get(name, 0) + amt
                answers.append(str(book[name]))
        elif kind == "TRANSFER":
            a, b, amt = q[2], q[3], int(q[4])
            if a == b or a not in book or b not in book or book[a] < amt:
                answers.append("")
            else:
                book[a] -= amt
                book[b] += amt
                spent[a] = spent.get(a, 0) + amt
                answers.append(str(book[a]))
        elif kind == "TOP_SPENDERS":
            answers.append(top(int(q[2])))
        elif kind == "SCHEDULE_PAYMENT":
            account = q[2]
            amt = int(q[3])
            delay = int(q[4])
            if account not in book:
                answers.append("")
            else:
                counter += 1
                pid = "payment" + str(counter)
                sched[pid] = {"account": account, "amount": amt, "exec_at": ts + delay, "seq": counter, "status": "pending"}
                answers.append(pid)
        elif kind == "CANCEL_PAYMENT":
            owner = q[2]
            pid = q[3]
            rec = sched.get(pid)
            if rec is None or rec["status"] != "pending" or rec["account"] != owner:
                answers.append("false")
            else:
                rec["status"] = "cancelled"
                answers.append("true")
        else:
            answers.append("")
    return answers
`;

// ---------------------------------------------------------------------------
// Level 4 — merge accounts
// ---------------------------------------------------------------------------

const L4_PROMPT = `Add account consolidation. All earlier operations keep working.

**New operation**

- \`["MERGE_ACCOUNTS", timestamp, primary, secondary]\` — fold the \
\`secondary\` account into \`primary\`. After a successful merge: \`primary\`'s \
balance equals the sum of both balances, \`primary\`'s outgoing volume equals \
the sum of both outgoing volumes, every pending scheduled payment owned by \
\`secondary\` is reassigned to \`primary\`, and \`secondary\` is removed (future \
operations targeting it return \`""\` / \`"false"\` exactly as if it had never \
existed). Return \`primary\`'s new balance as a string on success, or \`""\` if \
either account is missing or \`primary == secondary\` (no change in that case).`;

const L4_STARTER = `def solution(queries):
    balances = {}
    spent = {}
    payments = {}
    results = []
    for query in queries:
        op = query[0]
        # Level 1-3 ops, plus:
        # MERGE_ACCOUNTS ts primary secondary -> "<new balance>" / ""
        results.append("")
    return results
`;

const L4_REFERENCE = `def solution(queries):
    balances = {}
    spent = {}
    payments = {}
    schedule_seq = 0
    out = []

    def render_top(n):
        if n <= 0 or not balances:
            return ""
        rows = [(name, spent.get(name, 0)) for name in balances]
        rows.sort(key=lambda r: (-r[1], r[0]))
        rows = rows[:n]
        return ",".join(name + "(" + str(total) + ")" for name, total in rows)

    def fire_due(ts):
        due = [pid for pid, p in payments.items() if p["status"] == "pending" and p["exec_at"] <= ts]
        due.sort(key=lambda pid: (payments[pid]["exec_at"], payments[pid]["seq"]))
        for pid in due:
            p = payments[pid]
            account = p["account"]
            amount = p["amount"]
            if account not in balances or balances[account] < amount:
                p["status"] = "cancelled"
                continue
            balances[account] -= amount
            spent[account] = spent.get(account, 0) + amount
            p["status"] = "fired"

    for q in queries:
        ts = int(q[1])
        fire_due(ts)
        op = q[0]
        if op == "CREATE_ACCOUNT":
            account = q[2]
            if account in balances:
                out.append("false")
            else:
                balances[account] = 0
                spent[account] = 0
                out.append("true")
        elif op == "DEPOSIT":
            account, amount = q[2], int(q[3])
            if account not in balances:
                out.append("")
            else:
                balances[account] += amount
                out.append(str(balances[account]))
        elif op == "WITHDRAW":
            account, amount = q[2], int(q[3])
            if account not in balances or balances[account] < amount:
                out.append("")
            else:
                balances[account] -= amount
                spent[account] = spent.get(account, 0) + amount
                out.append(str(balances[account]))
        elif op == "TRANSFER":
            src, target, amount = q[2], q[3], int(q[4])
            if src == target or src not in balances or target not in balances or balances[src] < amount:
                out.append("")
            else:
                balances[src] -= amount
                balances[target] += amount
                spent[src] = spent.get(src, 0) + amount
                out.append(str(balances[src]))
        elif op == "TOP_SPENDERS":
            out.append(render_top(int(q[2])))
        elif op == "SCHEDULE_PAYMENT":
            account = q[2]
            amount = int(q[3])
            delay = int(q[4])
            if account not in balances:
                out.append("")
            else:
                schedule_seq += 1
                pid = "payment" + str(schedule_seq)
                payments[pid] = {
                    "account": account,
                    "amount": amount,
                    "exec_at": ts + delay,
                    "seq": schedule_seq,
                    "status": "pending",
                }
                out.append(pid)
        elif op == "CANCEL_PAYMENT":
            account = q[2]
            pid = q[3]
            p = payments.get(pid)
            if not p or p["status"] != "pending" or p["account"] != account:
                out.append("false")
            else:
                p["status"] = "cancelled"
                out.append("true")
        elif op == "MERGE_ACCOUNTS":
            primary, secondary = q[2], q[3]
            if primary == secondary or primary not in balances or secondary not in balances:
                out.append("")
            else:
                balances[primary] += balances[secondary]
                spent[primary] = spent.get(primary, 0) + spent.get(secondary, 0)
                for p in payments.values():
                    if p["status"] == "pending" and p["account"] == secondary:
                        p["account"] = primary
                del balances[secondary]
                if secondary in spent:
                    del spent[secondary]
                out.append(str(balances[primary]))
        else:
            out.append("")
    return out
`;

const L4_SOLUTION = `def solution(queries):
    book = {}
    spent = {}
    sched = {}
    counter = 0
    answers = []

    def top(n):
        if n <= 0 or not book:
            return ""
        items = [(name, spent.get(name, 0)) for name in book]
        items.sort(key=lambda p: (-p[1], p[0]))
        items = items[:n]
        return ",".join("%s(%d)" % (a_, t_) for a_, t_ in items)

    def settle(ts):
        ready = [pid for pid, p in sched.items() if p["status"] == "pending" and p["exec_at"] <= ts]
        ready.sort(key=lambda pid: (sched[pid]["exec_at"], sched[pid]["seq"]))
        for pid in ready:
            p = sched[pid]
            who = p["account"]
            amt = p["amount"]
            if who not in book or book[who] < amt:
                p["status"] = "cancelled"
            else:
                book[who] -= amt
                spent[who] = spent.get(who, 0) + amt
                p["status"] = "fired"

    for q in queries:
        ts = int(q[1])
        settle(ts)
        kind = q[0]
        if kind == "CREATE_ACCOUNT":
            name = q[2]
            if name in book:
                answers.append("false")
            else:
                book[name] = 0
                spent[name] = 0
                answers.append("true")
        elif kind == "DEPOSIT":
            name, amt = q[2], int(q[3])
            if name not in book:
                answers.append("")
            else:
                book[name] += amt
                answers.append(str(book[name]))
        elif kind == "WITHDRAW":
            name, amt = q[2], int(q[3])
            if name not in book or book[name] < amt:
                answers.append("")
            else:
                book[name] -= amt
                spent[name] = spent.get(name, 0) + amt
                answers.append(str(book[name]))
        elif kind == "TRANSFER":
            a, b, amt = q[2], q[3], int(q[4])
            if a == b or a not in book or b not in book or book[a] < amt:
                answers.append("")
            else:
                book[a] -= amt
                book[b] += amt
                spent[a] = spent.get(a, 0) + amt
                answers.append(str(book[a]))
        elif kind == "TOP_SPENDERS":
            answers.append(top(int(q[2])))
        elif kind == "SCHEDULE_PAYMENT":
            account = q[2]
            amt = int(q[3])
            delay = int(q[4])
            if account not in book:
                answers.append("")
            else:
                counter += 1
                pid = "payment" + str(counter)
                sched[pid] = {"account": account, "amount": amt, "exec_at": ts + delay, "seq": counter, "status": "pending"}
                answers.append(pid)
        elif kind == "CANCEL_PAYMENT":
            owner = q[2]
            pid = q[3]
            rec = sched.get(pid)
            if rec is None or rec["status"] != "pending" or rec["account"] != owner:
                answers.append("false")
            else:
                rec["status"] = "cancelled"
                answers.append("true")
        elif kind == "MERGE_ACCOUNTS":
            p, s = q[2], q[3]
            if p == s or p not in book or s not in book:
                answers.append("")
            else:
                book[p] += book[s]
                spent[p] = spent.get(p, 0) + spent.get(s, 0)
                for rec in sched.values():
                    if rec["status"] == "pending" and rec["account"] == s:
                        rec["account"] = p
                del book[s]
                spent.pop(s, None)
                answers.append(str(book[p]))
        else:
            answers.append("")
    return answers
`;

// ---------------------------------------------------------------------------
// Problem assembly
// ---------------------------------------------------------------------------

export const bankingProblem: Problem = assessmentProblem({
  id: "asm-banking",
  title: "Progressive Banking Ledger",
  difficulty: "medium",
  patterns: ["simulation", "stateful design", "hash map", "scheduling"],
  prompt: L1_PROMPT,
  constraints: [
    "Every query is a list of strings; query[1] is always a non-negative integer timestamp as a string.",
    "All monetary amounts are non-negative integer cents (passed as strings).",
    "Return exactly one result string per query, in input order.",
    "All four levels share the same solution(queries) entrypoint.",
    "Operations that fail must leave state unchanged."
  ],
  examples: [
    opTest(
      "l1-create-then-deposit",
      [
        ["CREATE_ACCOUNT", "1", "a"],
        ["DEPOSIT", "2", "a", "100"]
      ],
      ["true", "100"]
    )
  ],
  starterCode: L1_STARTER,
  referenceCode: L1_REFERENCE,
  solutionCode: L1_SOLUTION,
  visibleTests: [
    opTest("l1-empty", [], []),
    opTest(
      "l1-create-then-deposit",
      [
        ["CREATE_ACCOUNT", "1", "a"],
        ["DEPOSIT", "2", "a", "100"]
      ],
      ["true", "100"]
    ),
    opTest(
      "l1-duplicate-create",
      [
        ["CREATE_ACCOUNT", "1", "a"],
        ["CREATE_ACCOUNT", "2", "a"]
      ],
      ["true", "false"]
    ),
    opTest("l1-deposit-missing", [["DEPOSIT", "1", "ghost", "50"]], [""])
  ],
  hiddenTests: [
    opTest(
      "l1-withdraw-ok",
      [
        ["CREATE_ACCOUNT", "1", "a"],
        ["DEPOSIT", "2", "a", "100"],
        ["WITHDRAW", "3", "a", "40"]
      ],
      ["true", "100", "60"]
    ),
    opTest(
      "l1-withdraw-insufficient",
      [
        ["CREATE_ACCOUNT", "1", "a"],
        ["DEPOSIT", "2", "a", "50"],
        ["WITHDRAW", "3", "a", "100"]
      ],
      ["true", "50", ""]
    ),
    opTest(
      "l1-transfer-ok",
      [
        ["CREATE_ACCOUNT", "1", "a"],
        ["CREATE_ACCOUNT", "2", "b"],
        ["DEPOSIT", "3", "a", "100"],
        ["TRANSFER", "4", "a", "b", "30"]
      ],
      ["true", "true", "100", "70"]
    ),
    opTest(
      "l1-transfer-to-self",
      [
        ["CREATE_ACCOUNT", "1", "a"],
        ["DEPOSIT", "2", "a", "50"],
        ["TRANSFER", "3", "a", "a", "10"]
      ],
      ["true", "50", ""]
    ),
    opTest(
      "l1-transfer-missing-target",
      [
        ["CREATE_ACCOUNT", "1", "a"],
        ["DEPOSIT", "2", "a", "50"],
        ["TRANSFER", "3", "a", "ghost", "10"]
      ],
      ["true", "50", ""]
    ),
    opTest(
      "l1-transfer-insufficient-no-change",
      [
        ["CREATE_ACCOUNT", "1", "a"],
        ["CREATE_ACCOUNT", "2", "b"],
        ["DEPOSIT", "3", "a", "10"],
        ["TRANSFER", "4", "a", "b", "50"],
        ["DEPOSIT", "5", "b", "0"]
      ],
      ["true", "true", "10", "", "0"]
    )
  ],
  hints: [
    "Use a dict from account name to integer cent balance; reject ops that would leave state inconsistent before mutating.",
    "TRANSFER on insufficient funds must return \"\" and leave both accounts unchanged — validate first, then move money.",
    "Keep all amounts in integer cents from Level 1 so later levels can build top-N tracking and scheduling without floats."
  ],
  solution:
    "Maintain a dict of account names to integer-cent balances. CREATE_ACCOUNT refuses duplicates; DEPOSIT/WITHDRAW return the new balance as a string or \"\" on missing/overdraft; TRANSFER validates source, target, distinctness, and sufficient funds before moving money. Every op appends one result string.",
  walkthrough:
    "Each branch validates fully before mutating, so failures are no-ops by construction. Keeping all money in integer cents avoids any float comparison risk and means the harness's plain == comparison is sufficient for every test, here and at every later level.",
  followUps: [
    "How will Level 2's top-N spender tracking attach to this state without slowing every op?",
    "What is the minimum data Level 3's scheduled payments need so they can fire deterministically?"
  ],
  complexity: {
    time: "O(1) per Level 1 op",
    space: "O(accounts)"
  },
  parts: [
    {
      id: "l2-top-spenders",
      title: "Level 2: Top spenders",
      prompt: L2_PROMPT,
      entrypoint: "solution",
      starterCode: L2_STARTER,
      referenceCode: L2_REFERENCE,
      solutionCode: L2_SOLUTION,
      visibleTests: [
        opTest(
          "l2-top1-simple",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["CREATE_ACCOUNT", "2", "b"],
            ["DEPOSIT", "3", "a", "100"],
            ["TRANSFER", "4", "a", "b", "60"],
            ["TOP_SPENDERS", "5", "1"]
          ],
          ["true", "true", "100", "40", "a(60)"]
        ),
        opTest(
          "l2-top2-tie-by-name",
          [
            ["CREATE_ACCOUNT", "1", "b"],
            ["CREATE_ACCOUNT", "2", "a"],
            ["DEPOSIT", "3", "a", "100"],
            ["DEPOSIT", "4", "b", "100"],
            ["WITHDRAW", "5", "a", "20"],
            ["WITHDRAW", "6", "b", "20"],
            ["TOP_SPENDERS", "7", "2"]
          ],
          ["true", "true", "100", "100", "80", "80", "a(20),b(20)"]
        ),
        opTest(
          "l2-n-larger-than-accounts",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["DEPOSIT", "2", "a", "100"],
            ["WITHDRAW", "3", "a", "30"],
            ["TOP_SPENDERS", "4", "10"]
          ],
          ["true", "100", "70", "a(30)"]
        ),
        opTest(
          "l2-no-activity",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["TOP_SPENDERS", "2", "1"]
          ],
          ["true", "a(0)"]
        )
      ],
      hiddenTests: [
        opTest(
          "l2-multiple-withdraws-accumulate",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["DEPOSIT", "2", "a", "200"],
            ["WITHDRAW", "3", "a", "30"],
            ["WITHDRAW", "4", "a", "20"],
            ["TOP_SPENDERS", "5", "1"]
          ],
          ["true", "200", "170", "150", "a(50)"]
        ),
        opTest(
          "l2-withdraw-counts-as-outgoing",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["CREATE_ACCOUNT", "2", "b"],
            ["DEPOSIT", "3", "a", "100"],
            ["DEPOSIT", "4", "b", "100"],
            ["WITHDRAW", "5", "a", "70"],
            ["TRANSFER", "6", "b", "a", "10"],
            ["TOP_SPENDERS", "7", "2"]
          ],
          ["true", "true", "100", "100", "30", "90", "a(70),b(10)"]
        ),
        opTest(
          "l2-zero-n",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["DEPOSIT", "2", "a", "100"],
            ["WITHDRAW", "3", "a", "10"],
            ["TOP_SPENDERS", "4", "0"]
          ],
          ["true", "100", "90", ""]
        ),
        opTest(
          "l2-no-accounts",
          [["TOP_SPENDERS", "1", "5"]],
          [""]
        ),
        opTest(
          "l2-failed-transfer-does-not-count",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["CREATE_ACCOUNT", "2", "b"],
            ["DEPOSIT", "3", "a", "10"],
            ["TRANSFER", "4", "a", "b", "50"],
            ["TOP_SPENDERS", "5", "1"]
          ],
          ["true", "true", "10", "", "a(0)"]
        )
      ],
      hints: [
        "Track outgoing volume in a parallel dict that you bump on every successful WITHDRAW and TRANSFER (source side only).",
        "Failed operations must NOT increment the outgoing counter — only update the counter inside the success branch.",
        "Sort by (-total, name) so descending volume comes first and ties resolve alphabetically; slicing to n applies after sorting."
      ],
      solution:
        "Add a `spent` dict keyed by account, incremented only inside the success branches of WITHDRAW and TRANSFER. TOP_SPENDERS materialises (name, spent) for every account, sorts by negative total then name, slices to n, and joins as name(total). Failed ops never touch the counter, so the ranking stays accurate.",
      walkthrough:
        "Tracking outgoing-only volume in a counter map lets the leaderboard be assembled in O(accounts log accounts) on demand without scanning history. The success-branch-only bookkeeping makes failed operations true no-ops, which is what the hidden tests check.",
      complexity: {
        time: "O(accounts log accounts) per TOP_SPENDERS",
        space: "O(accounts)"
      }
    },
    {
      id: "l3-scheduled-payments",
      title: "Level 3: Scheduled & cancellable payments",
      prompt: L3_PROMPT,
      entrypoint: "solution",
      starterCode: L3_STARTER,
      referenceCode: L3_REFERENCE,
      solutionCode: L3_SOLUTION,
      visibleTests: [
        opTest(
          "l3-schedule-fires-before-later-query",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["DEPOSIT", "2", "a", "100"],
            ["SCHEDULE_PAYMENT", "3", "a", "30", "10"],
            ["DEPOSIT", "20", "a", "5"]
          ],
          ["true", "100", "payment1", "75"]
        ),
        opTest(
          "l3-schedule-missing-account",
          [["SCHEDULE_PAYMENT", "1", "ghost", "10", "5"]],
          [""]
        ),
        opTest(
          "l3-cancel-before-exec",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["DEPOSIT", "2", "a", "100"],
            ["SCHEDULE_PAYMENT", "3", "a", "30", "10"],
            ["CANCEL_PAYMENT", "5", "a", "payment1"],
            ["DEPOSIT", "20", "a", "0"]
          ],
          ["true", "100", "payment1", "true", "100"]
        ),
        opTest(
          "l3-cancel-after-exec-fails",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["DEPOSIT", "2", "a", "100"],
            ["SCHEDULE_PAYMENT", "3", "a", "30", "10"],
            ["DEPOSIT", "15", "a", "0"],
            ["CANCEL_PAYMENT", "16", "a", "payment1"]
          ],
          ["true", "100", "payment1", "70", "false"]
        )
      ],
      hiddenTests: [
        opTest(
          "l3-multiple-fires-in-chronological-order",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["DEPOSIT", "2", "a", "100"],
            ["SCHEDULE_PAYMENT", "3", "a", "30", "20"],
            ["SCHEDULE_PAYMENT", "4", "a", "10", "5"],
            ["DEPOSIT", "30", "a", "0"]
          ],
          ["true", "100", "payment1", "payment2", "60"]
        ),
        opTest(
          "l3-insufficient-funds-silently-cancels",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["DEPOSIT", "2", "a", "20"],
            ["SCHEDULE_PAYMENT", "3", "a", "100", "5"],
            ["DEPOSIT", "20", "a", "0"]
          ],
          ["true", "20", "payment1", "20"]
        ),
        opTest(
          "l3-cancel-wrong-account",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["CREATE_ACCOUNT", "2", "b"],
            ["DEPOSIT", "3", "a", "100"],
            ["SCHEDULE_PAYMENT", "4", "a", "30", "10"],
            ["CANCEL_PAYMENT", "5", "b", "payment1"]
          ],
          ["true", "true", "100", "payment1", "false"]
        ),
        opTest(
          "l3-fired-payment-counts-for-top-spenders",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["DEPOSIT", "2", "a", "100"],
            ["SCHEDULE_PAYMENT", "3", "a", "30", "5"],
            ["TOP_SPENDERS", "20", "1"]
          ],
          ["true", "100", "payment1", "a(30)"]
        ),
        opTest(
          "l3-delay-zero-fires-on-next-query",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["DEPOSIT", "2", "a", "100"],
            ["SCHEDULE_PAYMENT", "3", "a", "10", "0"],
            ["DEPOSIT", "4", "a", "0"]
          ],
          ["true", "100", "payment1", "90"]
        )
      ],
      hints: [
        "At the START of every query, fire any pending payments whose exec_at <= the current timestamp, sorted by (exec_at, schedule_seq).",
        "A fired payment behaves exactly like a successful WITHDRAW: subtract amount, bump spent, mark fired. On insufficient funds, mark cancelled and don't touch state.",
        "Give each payment a status field (pending/fired/cancelled) so CANCEL_PAYMENT can refuse already-fired or already-cancelled ids."
      ],
      solution:
        "Maintain a payments dict keyed by id, each with {account, amount, exec_at, seq, status}. At the start of every query, collect pending payments with exec_at <= ts, sort by (exec_at, seq), and process each like a successful WITHDRAW (or cancel if it overdraws). CANCEL_PAYMENT only succeeds when the id exists, status is pending, and the requester owns it.",
      walkthrough:
        "Firing payments before each query, in deterministic order, keeps the state strictly reproducible regardless of insertion order. Marking status explicitly distinguishes the three cancel-failure cases (missing/fired/wrong-owner) and makes the bookkeeping easy to audit.",
      complexity: {
        time: "O(p log p) per fire pass where p is pending payments",
        space: "O(accounts + payments)"
      }
    },
    {
      id: "l4-merge-accounts",
      title: "Level 4: Merge accounts",
      prompt: L4_PROMPT,
      entrypoint: "solution",
      starterCode: L4_STARTER,
      referenceCode: L4_REFERENCE,
      solutionCode: L4_SOLUTION,
      visibleTests: [
        opTest(
          "l4-simple-merge",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["CREATE_ACCOUNT", "2", "b"],
            ["DEPOSIT", "3", "a", "100"],
            ["DEPOSIT", "4", "b", "50"],
            ["MERGE_ACCOUNTS", "5", "a", "b"]
          ],
          ["true", "true", "100", "50", "150"]
        ),
        opTest(
          "l4-secondary-removed",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["CREATE_ACCOUNT", "2", "b"],
            ["DEPOSIT", "3", "a", "100"],
            ["DEPOSIT", "4", "b", "50"],
            ["MERGE_ACCOUNTS", "5", "a", "b"],
            ["DEPOSIT", "6", "b", "10"]
          ],
          ["true", "true", "100", "50", "150", ""]
        ),
        opTest("l4-merge-missing-primary", [["MERGE_ACCOUNTS", "1", "ghost", "x"]], [""]),
        opTest(
          "l4-merge-self",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["MERGE_ACCOUNTS", "2", "a", "a"]
          ],
          ["true", ""]
        )
      ],
      hiddenTests: [
        opTest(
          "l4-preserves-top-spenders",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["CREATE_ACCOUNT", "2", "b"],
            ["DEPOSIT", "3", "a", "100"],
            ["DEPOSIT", "4", "b", "100"],
            ["WITHDRAW", "5", "a", "30"],
            ["WITHDRAW", "6", "b", "40"],
            ["MERGE_ACCOUNTS", "7", "a", "b"],
            ["TOP_SPENDERS", "8", "1"]
          ],
          ["true", "true", "100", "100", "70", "60", "130", "a(70)"]
        ),
        opTest(
          "l4-inherits-pending-payments",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["CREATE_ACCOUNT", "2", "b"],
            ["DEPOSIT", "3", "a", "100"],
            ["DEPOSIT", "4", "b", "50"],
            ["SCHEDULE_PAYMENT", "5", "b", "20", "10"],
            ["MERGE_ACCOUNTS", "6", "a", "b"],
            ["DEPOSIT", "20", "a", "0"]
          ],
          ["true", "true", "100", "50", "payment1", "150", "130"]
        ),
        opTest(
          "l4-merge-missing-secondary",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["MERGE_ACCOUNTS", "2", "a", "ghost"]
          ],
          ["true", ""]
        ),
        opTest(
          "l4-double-merge-secondary-gone",
          [
            ["CREATE_ACCOUNT", "1", "a"],
            ["CREATE_ACCOUNT", "2", "b"],
            ["MERGE_ACCOUNTS", "3", "a", "b"],
            ["MERGE_ACCOUNTS", "4", "a", "b"]
          ],
          ["true", "true", "0", ""]
        )
      ],
      hints: [
        "Refuse the merge up front when primary == secondary or either account is missing, then sum balances, sum outgoing volume, and delete secondary.",
        "Walk the pending payments and rewrite payment[\"account\"] from secondary to primary so they fire against the surviving account.",
        "Already-fired or already-cancelled payments don't need rewriting — they're terminal and history doesn't change."
      ],
      solution:
        "Validate distinctness and existence first. On success, add secondary's balance and spent total into primary, reassign every pending payment from secondary to primary, then delete secondary from both balances and spent maps. The return is primary's new balance as a string.",
      walkthrough:
        "Doing the rewrite then the delete keeps the operation atomic from the candidate's perspective — there's never a moment when a fire pass would target a non-existent account. Combining the outgoing-volume counters means TOP_SPENDERS reflects the combined history exactly the way a real ledger merge would.",
      complexity: {
        time: "O(payments) per merge to reassign pending payments",
        space: "O(accounts + payments)"
      }
    }
  ]
});

export const bankingAssessment: Assessment = {
  id: "banking",
  title: "Progressive Banking Ledger",
  archetype: "banking",
  blurb: "An accounts ledger that grows from CRUD to spender ranking, scheduled payments, and account merges.",
  intro:
    "A four-level evolving ledger: integer-cent balances and transfers, then top-N spender tracking, then scheduled payments that fire on a timeline, then account merges that consolidate balance, history, and pending payments. Every query carries a timestamp from Level 1, even when it isn't used yet — design for it. Read all four levels before you code so your Level 1 state can survive to Level 4.",
  totalMinutes: 90,
  problemId: "asm-banking",
  levels: standardLevels(["l2-top-spenders", "l3-scheduled-payments", "l4-merge-accounts"]),
  scoreBand: { min: 200, max: 600 }
};
