import type { Assessment, Problem } from "../../types";
import { assessmentProblem, opTest, standardLevels } from "./_shared";

/**
 * In-Memory Database — third CodeSignal ICF practice assessment.
 *
 * Four cumulative levels:
 *   L1 SET / GET / DELETE on a two-level key->field->value store ->
 *   L2 SCAN + SCAN_BY_PREFIX (sorted by field ascending) ->
 *   L3 SET_AT with TTL; reads/scans honour absolute expiration ->
 *   L4 BACKUP / RESTORE (time-aware: expired entries drop on restore).
 *
 * Standard solution(queries) -> List[str] dispatcher. Every query carries
 * a timestamp at q[1] from L1 so L3's time logic doesn't need a retrofit.
 * Output is fully deterministic, so the harness's exact `==` works
 * unchanged across all four levels.
 */

// ---------------------------------------------------------------------------
// Level 1 — basic CRUD
// ---------------------------------------------------------------------------

const L1_PROMPT = `Implement an in-memory store driven by an operation list. \
\`solution(queries)\` receives a list of queries; each query is a list of \
strings \`[OP, timestamp, ...args]\`. Every query has a non-negative integer \
\`timestamp\` (string-encoded), even when this level doesn't use it. Return a \
list with one string result per query, in order.

The store is keyed two levels deep: \`store[key][field] = value\`. Keys and \
fields are case-sensitive strings.

**Level 1 operations**

- \`["SET", timestamp, key, field, value]\` — set \`store[key][field] = value\`, \
creating \`store[key]\` if needed. Always return \`"true"\`.
- \`["GET", timestamp, key, field]\` — return the value if \`key\` and \`field\` \
both exist, else return \`""\`.
- \`["DELETE", timestamp, key, field]\` — if both exist, remove the field (and \
the key itself if no fields remain) and return \`"true"\`. Otherwise return \
\`"false"\`.

Later levels add filtering, TTL, and time-aware snapshots to this same \
function. Structure it as a clean per-op dispatcher so those extensions can \
slot in.`;

const L1_STARTER = `def solution(queries):
    store = {}            # key -> {field: value}
    results = []
    for query in queries:
        op = query[0]
        # SET    ts key field value -> "true"
        # GET    ts key field       -> "<value>" / ""
        # DELETE ts key field       -> "true" / "false"
        results.append("")
    return results
`;

const L1_REFERENCE = `def solution(queries):
    store = {}
    out = []
    for q in queries:
        op = q[0]
        if op == "SET":
            key, field, value = q[2], q[3], q[4]
            store.setdefault(key, {})[field] = value
            out.append("true")
        elif op == "GET":
            key, field = q[2], q[3]
            if key in store and field in store[key]:
                out.append(store[key][field])
            else:
                out.append("")
        elif op == "DELETE":
            key, field = q[2], q[3]
            if key in store and field in store[key]:
                del store[key][field]
                if not store[key]:
                    del store[key]
                out.append("true")
            else:
                out.append("false")
        else:
            out.append("")
    return out
`;

const L1_SOLUTION = `def solution(queries):
    db = {}
    answers = []
    for q in queries:
        kind = q[0]
        if kind == "SET":
            k, f, v = q[2], q[3], q[4]
            if k not in db:
                db[k] = {}
            db[k][f] = v
            answers.append("true")
        elif kind == "GET":
            k, f = q[2], q[3]
            answers.append(db[k][f] if k in db and f in db[k] else "")
        elif kind == "DELETE":
            k, f = q[2], q[3]
            if k in db and f in db[k]:
                db[k].pop(f)
                if not db[k]:
                    db.pop(k)
                answers.append("true")
            else:
                answers.append("false")
        else:
            answers.append("")
    return answers
`;

// ---------------------------------------------------------------------------
// Level 2 — scan / scan-by-prefix
// ---------------------------------------------------------------------------

const L2_PROMPT = `Extend the store with field-level scans. All Level 1 \
operations keep working.

**New operations**

- \`["SCAN", timestamp, key]\` — return every field of \`key\` formatted as \
\`field=value\`, joined by commas, **sorted by field name ascending**. Return \
\`""\` if the key has no fields (or does not exist).
- \`["SCAN_BY_PREFIX", timestamp, key, prefix]\` — same, but only fields whose \
name starts with \`prefix\`. Return \`""\` if the key is absent or no field \
matches. An empty prefix matches every field.`;

const L2_STARTER = `def solution(queries):
    store = {}
    results = []
    for query in queries:
        op = query[0]
        # Level 1 ops, plus:
        # SCAN           ts key        -> "f1=v1,f2=v2" / ""
        # SCAN_BY_PREFIX ts key prefix -> "f1=v1,f2=v2" / ""
        results.append("")
    return results
`;

const L2_REFERENCE = `def solution(queries):
    store = {}
    out = []

    def render(pairs):
        pairs.sort(key=lambda kv: kv[0])
        return ",".join(f + "=" + v for f, v in pairs)

    for q in queries:
        op = q[0]
        if op == "SET":
            key, field, value = q[2], q[3], q[4]
            store.setdefault(key, {})[field] = value
            out.append("true")
        elif op == "GET":
            key, field = q[2], q[3]
            if key in store and field in store[key]:
                out.append(store[key][field])
            else:
                out.append("")
        elif op == "DELETE":
            key, field = q[2], q[3]
            if key in store and field in store[key]:
                del store[key][field]
                if not store[key]:
                    del store[key]
                out.append("true")
            else:
                out.append("false")
        elif op == "SCAN":
            key = q[2]
            if key not in store or not store[key]:
                out.append("")
            else:
                out.append(render(list(store[key].items())))
        elif op == "SCAN_BY_PREFIX":
            key, prefix = q[2], q[3]
            if key not in store:
                out.append("")
            else:
                matched = [(f, v) for f, v in store[key].items() if f.startswith(prefix)]
                out.append(render(matched) if matched else "")
        else:
            out.append("")
    return out
`;

const L2_SOLUTION = `def solution(queries):
    db = {}
    answers = []

    def listing(items):
        items.sort(key=lambda p: p[0])
        return ",".join("%s=%s" % (n, v) for n, v in items)

    for q in queries:
        kind = q[0]
        if kind == "SET":
            k, f, v = q[2], q[3], q[4]
            if k not in db:
                db[k] = {}
            db[k][f] = v
            answers.append("true")
        elif kind == "GET":
            k, f = q[2], q[3]
            answers.append(db[k][f] if k in db and f in db[k] else "")
        elif kind == "DELETE":
            k, f = q[2], q[3]
            if k in db and f in db[k]:
                db[k].pop(f)
                if not db[k]:
                    db.pop(k)
                answers.append("true")
            else:
                answers.append("false")
        elif kind == "SCAN":
            k = q[2]
            if k not in db or not db[k]:
                answers.append("")
            else:
                answers.append(listing(list(db[k].items())))
        elif kind == "SCAN_BY_PREFIX":
            k, pre = q[2], q[3]
            if k not in db:
                answers.append("")
            else:
                hits = [(f, v) for f, v in db[k].items() if f.startswith(pre)]
                answers.append(listing(hits) if hits else "")
        else:
            answers.append("")
    return answers
`;

// ---------------------------------------------------------------------------
// Level 3 — TTL
// ---------------------------------------------------------------------------

const L3_PROMPT = `Add time-to-live. All earlier operations keep working.

**New operation**

- \`["SET_AT", timestamp, key, field, value, ttl]\` — set \`store[key][field]\` \
to \`value\` with an absolute expiration at \`timestamp + ttl\` (\`ttl\` is a \
positive integer string). Return \`"true"\`.

A field is **expired** when the current query's timestamp is greater than or \
equal to its absolute expiration time. Expired fields are invisible to \
\`GET\`/\`SCAN\`/\`SCAN_BY_PREFIX\` (those return \`""\` for them or skip them \
during a scan) and \`DELETE\` returns \`"false"\` for them (they are treated as \
already gone). A plain \`SET\` cancels any prior TTL on that field; a new \
\`SET_AT\` replaces both the value and the expiration.`;

const L3_STARTER = `def solution(queries):
    store = {}
    ttls = {}             # (key, field) -> absolute expiration timestamp
    results = []
    for query in queries:
        op = query[0]
        # Level 1-2 ops (now expiration-aware), plus:
        # SET_AT ts key field value ttl -> "true"
        results.append("")
    return results
`;

const L3_REFERENCE = `def solution(queries):
    store = {}
    ttls = {}
    out = []

    def alive(key, field, ts):
        if key not in store or field not in store[key]:
            return False
        exp = ttls.get((key, field))
        return exp is None or ts < exp

    def render(pairs):
        pairs.sort(key=lambda kv: kv[0])
        return ",".join(f + "=" + v for f, v in pairs)

    for q in queries:
        ts = int(q[1])
        op = q[0]
        if op == "SET":
            key, field, value = q[2], q[3], q[4]
            store.setdefault(key, {})[field] = value
            ttls.pop((key, field), None)
            out.append("true")
        elif op == "SET_AT":
            key, field, value = q[2], q[3], q[4]
            ttl = int(q[5])
            store.setdefault(key, {})[field] = value
            ttls[(key, field)] = ts + ttl
            out.append("true")
        elif op == "GET":
            key, field = q[2], q[3]
            out.append(store[key][field] if alive(key, field, ts) else "")
        elif op == "DELETE":
            key, field = q[2], q[3]
            if not alive(key, field, ts):
                out.append("false")
            else:
                del store[key][field]
                if not store[key]:
                    del store[key]
                ttls.pop((key, field), None)
                out.append("true")
        elif op == "SCAN":
            key = q[2]
            if key not in store:
                out.append("")
            else:
                live = [(f, v) for f, v in store[key].items() if alive(key, f, ts)]
                out.append(render(live) if live else "")
        elif op == "SCAN_BY_PREFIX":
            key, prefix = q[2], q[3]
            if key not in store:
                out.append("")
            else:
                live = [(f, v) for f, v in store[key].items() if f.startswith(prefix) and alive(key, f, ts)]
                out.append(render(live) if live else "")
        else:
            out.append("")
    return out
`;

const L3_SOLUTION = `def solution(queries):
    db = {}
    expiry = {}
    answers = []

    def is_live(k, f, now):
        if k not in db or f not in db[k]:
            return False
        e = expiry.get((k, f))
        return e is None or now < e

    def listing(items):
        items.sort(key=lambda p: p[0])
        return ",".join("%s=%s" % (n, v) for n, v in items)

    for q in queries:
        now = int(q[1])
        kind = q[0]
        if kind == "SET":
            k, f, v = q[2], q[3], q[4]
            if k not in db:
                db[k] = {}
            db[k][f] = v
            expiry.pop((k, f), None)
            answers.append("true")
        elif kind == "SET_AT":
            k, f, v, t = q[2], q[3], q[4], int(q[5])
            if k not in db:
                db[k] = {}
            db[k][f] = v
            expiry[(k, f)] = now + t
            answers.append("true")
        elif kind == "GET":
            k, f = q[2], q[3]
            answers.append(db[k][f] if is_live(k, f, now) else "")
        elif kind == "DELETE":
            k, f = q[2], q[3]
            if not is_live(k, f, now):
                answers.append("false")
            else:
                db[k].pop(f)
                if not db[k]:
                    db.pop(k)
                expiry.pop((k, f), None)
                answers.append("true")
        elif kind == "SCAN":
            k = q[2]
            if k not in db:
                answers.append("")
            else:
                hits = [(f, v) for f, v in db[k].items() if is_live(k, f, now)]
                answers.append(listing(hits) if hits else "")
        elif kind == "SCAN_BY_PREFIX":
            k, pre = q[2], q[3]
            if k not in db:
                answers.append("")
            else:
                hits = [(f, v) for f, v in db[k].items() if f.startswith(pre) and is_live(k, f, now)]
                answers.append(listing(hits) if hits else "")
        else:
            answers.append("")
    return answers
`;

// ---------------------------------------------------------------------------
// Level 4 — backup / restore
// ---------------------------------------------------------------------------

const L4_PROMPT = `Add time-aware snapshots. All earlier operations keep working.

**New operations**

- \`["BACKUP", timestamp]\` — snapshot the current state, capturing every \
**currently live** field's value AND its absolute expiration (where one \
exists). Return the new backup id as \`"backup{N}"\` where \`N\` starts at 1 \
and increments per backup.
- \`["RESTORE", timestamp, backup_id]\` — replace the entire state with the \
snapshot. Backup fields with an absolute expiration **at or before** the \
restore timestamp are dropped immediately; surviving expiring fields keep \
their original absolute expiration. Return \`"true"\` on success, or \
\`"false"\` if the backup id is unknown.`;

const L4_STARTER = `def solution(queries):
    store = {}
    ttls = {}
    backups = {}          # backup_id -> snapshot
    results = []
    for query in queries:
        op = query[0]
        # Level 1-3 ops, plus:
        # BACKUP  ts            -> "backup{N}"
        # RESTORE ts backup_id  -> "true" / "false"
        results.append("")
    return results
`;

const L4_REFERENCE = `import copy

def solution(queries):
    store = {}
    ttls = {}
    backups = {}
    backup_seq = 0
    out = []

    def alive(key, field, ts):
        if key not in store or field not in store[key]:
            return False
        exp = ttls.get((key, field))
        return exp is None or ts < exp

    def render(pairs):
        pairs.sort(key=lambda kv: kv[0])
        return ",".join(f + "=" + v for f, v in pairs)

    for q in queries:
        ts = int(q[1])
        op = q[0]
        if op == "SET":
            key, field, value = q[2], q[3], q[4]
            store.setdefault(key, {})[field] = value
            ttls.pop((key, field), None)
            out.append("true")
        elif op == "SET_AT":
            key, field, value = q[2], q[3], q[4]
            ttl = int(q[5])
            store.setdefault(key, {})[field] = value
            ttls[(key, field)] = ts + ttl
            out.append("true")
        elif op == "GET":
            key, field = q[2], q[3]
            out.append(store[key][field] if alive(key, field, ts) else "")
        elif op == "DELETE":
            key, field = q[2], q[3]
            if not alive(key, field, ts):
                out.append("false")
            else:
                del store[key][field]
                if not store[key]:
                    del store[key]
                ttls.pop((key, field), None)
                out.append("true")
        elif op == "SCAN":
            key = q[2]
            if key not in store:
                out.append("")
            else:
                live = [(f, v) for f, v in store[key].items() if alive(key, f, ts)]
                out.append(render(live) if live else "")
        elif op == "SCAN_BY_PREFIX":
            key, prefix = q[2], q[3]
            if key not in store:
                out.append("")
            else:
                live = [(f, v) for f, v in store[key].items() if f.startswith(prefix) and alive(key, f, ts)]
                out.append(render(live) if live else "")
        elif op == "BACKUP":
            backup_seq += 1
            bid = "backup" + str(backup_seq)
            snap_store = {}
            snap_ttls = {}
            for key, fields in store.items():
                live_fields = {}
                for field, value in fields.items():
                    if not alive(key, field, ts):
                        continue
                    live_fields[field] = value
                    if (key, field) in ttls:
                        snap_ttls[(key, field)] = ttls[(key, field)]
                if live_fields:
                    snap_store[key] = live_fields
            backups[bid] = (snap_store, snap_ttls)
            out.append(bid)
        elif op == "RESTORE":
            bid = q[2]
            snap = backups.get(bid)
            if snap is None:
                out.append("false")
            else:
                snap_store, snap_ttls = snap
                store = copy.deepcopy(snap_store)
                ttls = dict(snap_ttls)
                # Drop fields whose absolute expiration is at or before the
                # restore time.
                expired_keys = [pair for pair, exp in ttls.items() if exp <= ts]
                for pair in expired_keys:
                    k, f = pair
                    if k in store and f in store[k]:
                        del store[k][f]
                        if not store[k]:
                            del store[k]
                    ttls.pop(pair, None)
                out.append("true")
        else:
            out.append("")
    return out
`;

const L4_SOLUTION = `def solution(queries):
    db = {}
    expiry = {}
    snaps = {}
    counter = 0
    answers = []

    def is_live(k, f, now):
        if k not in db or f not in db[k]:
            return False
        e = expiry.get((k, f))
        return e is None or now < e

    def listing(items):
        items.sort(key=lambda p: p[0])
        return ",".join("%s=%s" % (n, v) for n, v in items)

    def deep_copy(src):
        return {k: dict(v) for k, v in src.items()}

    for q in queries:
        now = int(q[1])
        kind = q[0]
        if kind == "SET":
            k, f, v = q[2], q[3], q[4]
            if k not in db:
                db[k] = {}
            db[k][f] = v
            expiry.pop((k, f), None)
            answers.append("true")
        elif kind == "SET_AT":
            k, f, v, t = q[2], q[3], q[4], int(q[5])
            if k not in db:
                db[k] = {}
            db[k][f] = v
            expiry[(k, f)] = now + t
            answers.append("true")
        elif kind == "GET":
            k, f = q[2], q[3]
            answers.append(db[k][f] if is_live(k, f, now) else "")
        elif kind == "DELETE":
            k, f = q[2], q[3]
            if not is_live(k, f, now):
                answers.append("false")
            else:
                db[k].pop(f)
                if not db[k]:
                    db.pop(k)
                expiry.pop((k, f), None)
                answers.append("true")
        elif kind == "SCAN":
            k = q[2]
            if k not in db:
                answers.append("")
            else:
                hits = [(f, v) for f, v in db[k].items() if is_live(k, f, now)]
                answers.append(listing(hits) if hits else "")
        elif kind == "SCAN_BY_PREFIX":
            k, pre = q[2], q[3]
            if k not in db:
                answers.append("")
            else:
                hits = [(f, v) for f, v in db[k].items() if f.startswith(pre) and is_live(k, f, now)]
                answers.append(listing(hits) if hits else "")
        elif kind == "BACKUP":
            counter += 1
            bid = "backup" + str(counter)
            snap_db = {}
            snap_exp = {}
            for k_, fields in db.items():
                kept = {}
                for f_, v_ in fields.items():
                    if not is_live(k_, f_, now):
                        continue
                    kept[f_] = v_
                    if (k_, f_) in expiry:
                        snap_exp[(k_, f_)] = expiry[(k_, f_)]
                if kept:
                    snap_db[k_] = kept
            snaps[bid] = (snap_db, snap_exp)
            answers.append(bid)
        elif kind == "RESTORE":
            bid = q[2]
            snap = snaps.get(bid)
            if snap is None:
                answers.append("false")
            else:
                snap_db, snap_exp = snap
                db = deep_copy(snap_db)
                expiry = dict(snap_exp)
                gone = [pair for pair, e in expiry.items() if e <= now]
                for pair in gone:
                    k_, f_ = pair
                    if k_ in db and f_ in db[k_]:
                        db[k_].pop(f_)
                        if not db[k_]:
                            db.pop(k_)
                    expiry.pop(pair, None)
                answers.append("true")
        else:
            answers.append("")
    return answers
`;

// ---------------------------------------------------------------------------
// Problem assembly
// ---------------------------------------------------------------------------

export const inMemoryDbProblem: Problem = assessmentProblem({
  id: "asm-in-memory-db",
  title: "Progressive In-Memory Database",
  difficulty: "medium",
  patterns: ["simulation", "stateful design", "hash map", "snapshot"],
  prompt: L1_PROMPT,
  constraints: [
    "Each query is a list of strings; query[1] is always a non-negative integer timestamp as a string.",
    "Keys and fields are case-sensitive non-empty strings.",
    "Return exactly one result string per query, in input order.",
    "All four levels share the same solution(queries) entrypoint.",
    "An empty key (after deletion) should not appear in scans or backups."
  ],
  examples: [
    opTest(
      "l1-set-then-get",
      [
        ["SET", "1", "user:1", "name", "alice"],
        ["GET", "2", "user:1", "name"]
      ],
      ["true", "alice"]
    )
  ],
  starterCode: L1_STARTER,
  referenceCode: L1_REFERENCE,
  solutionCode: L1_SOLUTION,
  visibleTests: [
    opTest("l1-empty", [], []),
    opTest(
      "l1-set-then-get",
      [
        ["SET", "1", "user:1", "name", "alice"],
        ["GET", "2", "user:1", "name"]
      ],
      ["true", "alice"]
    ),
    opTest("l1-get-missing", [["GET", "1", "ghost", "name"]], [""]),
    opTest(
      "l1-set-then-delete-then-get",
      [
        ["SET", "1", "user:1", "name", "alice"],
        ["DELETE", "2", "user:1", "name"],
        ["GET", "3", "user:1", "name"]
      ],
      ["true", "true", ""]
    )
  ],
  hiddenTests: [
    opTest(
      "l1-multiple-fields",
      [
        ["SET", "1", "user:1", "name", "alice"],
        ["SET", "2", "user:1", "email", "a@x"],
        ["GET", "3", "user:1", "email"],
        ["GET", "4", "user:1", "name"]
      ],
      ["true", "true", "a@x", "alice"]
    ),
    opTest(
      "l1-delete-missing-field",
      [
        ["SET", "1", "user:1", "name", "alice"],
        ["DELETE", "2", "user:1", "phone"]
      ],
      ["true", "false"]
    ),
    opTest(
      "l1-set-overwrites",
      [
        ["SET", "1", "user:1", "name", "alice"],
        ["SET", "2", "user:1", "name", "bob"],
        ["GET", "3", "user:1", "name"]
      ],
      ["true", "true", "bob"]
    ),
    opTest(
      "l1-delete-cleans-empty-key",
      [
        ["SET", "1", "user:1", "name", "alice"],
        ["DELETE", "2", "user:1", "name"],
        ["GET", "3", "user:1", "name"],
        ["SET", "4", "user:1", "name", "bob"],
        ["GET", "5", "user:1", "name"]
      ],
      ["true", "true", "", "true", "bob"]
    ),
    opTest(
      "l1-case-sensitive",
      [
        ["SET", "1", "User", "Name", "alice"],
        ["GET", "2", "user", "Name"],
        ["GET", "3", "User", "name"],
        ["GET", "4", "User", "Name"]
      ],
      ["true", "", "", "alice"]
    )
  ],
  hints: [
    "A dict of dicts (key -> {field: value}) is enough; setdefault keeps the SET branch one line.",
    "DELETE should clean up the outer key when its inner dict becomes empty so future scans don't see ghost keys.",
    "GET returns the raw value (string); MISSING returns \"\" — distinguishable from a real value of \"true\"."
  ],
  solution:
    "Maintain a dict of dicts keyed by the outer key, with each inner dict mapping field to value. SET creates the outer key on demand and always returns \"true\". GET checks both levels and returns \"\" when absent. DELETE removes the field, returns \"true\" only when the field actually existed, and prunes the outer key when its inner dict empties.",
  walkthrough:
    "Two-level lookup keeps reads O(1) and isolates each key's namespace. Pruning empty inner dicts is cheap and prevents stale outer keys from leaking into Level 2's scans or Level 4's backups.",
  followUps: [
    "Level 2's SCAN sorts by field — where will you sort the fields cheaply?",
    "Level 3 adds per-field expirations — where does that state live so it survives a Level 4 backup?"
  ],
  complexity: {
    time: "O(1) per Level 1 op",
    space: "O(total fields)"
  },
  parts: [
    {
      id: "l2-scan",
      title: "Level 2: Scan & prefix scan",
      prompt: L2_PROMPT,
      entrypoint: "solution",
      starterCode: L2_STARTER,
      referenceCode: L2_REFERENCE,
      solutionCode: L2_SOLUTION,
      visibleTests: [
        opTest(
          "l2-scan-single-field",
          [
            ["SET", "1", "user:1", "name", "alice"],
            ["SCAN", "2", "user:1"]
          ],
          ["true", "name=alice"]
        ),
        opTest(
          "l2-scan-multi-sorted",
          [
            ["SET", "1", "user:1", "name", "alice"],
            ["SET", "2", "user:1", "email", "a@x"],
            ["SET", "3", "user:1", "age", "30"],
            ["SCAN", "4", "user:1"]
          ],
          ["true", "true", "true", "age=30,email=a@x,name=alice"]
        ),
        opTest("l2-scan-missing-key", [["SCAN", "1", "ghost"]], [""]),
        opTest(
          "l2-scan-by-prefix",
          [
            ["SET", "1", "user:1", "first_name", "alice"],
            ["SET", "2", "user:1", "last_name", "smith"],
            ["SET", "3", "user:1", "email", "a@x"],
            ["SCAN_BY_PREFIX", "4", "user:1", "first"]
          ],
          ["true", "true", "true", "first_name=alice"]
        )
      ],
      hiddenTests: [
        opTest(
          "l2-prefix-no-match",
          [
            ["SET", "1", "user:1", "name", "alice"],
            ["SCAN_BY_PREFIX", "2", "user:1", "zzz"]
          ],
          ["true", ""]
        ),
        opTest(
          "l2-empty-prefix-matches-all",
          [
            ["SET", "1", "user:1", "a", "1"],
            ["SET", "2", "user:1", "b", "2"],
            ["SCAN_BY_PREFIX", "3", "user:1", ""]
          ],
          ["true", "true", "a=1,b=2"]
        ),
        opTest(
          "l2-scan-excludes-deleted",
          [
            ["SET", "1", "user:1", "a", "1"],
            ["SET", "2", "user:1", "b", "2"],
            ["DELETE", "3", "user:1", "a"],
            ["SCAN", "4", "user:1"]
          ],
          ["true", "true", "true", "b=2"]
        ),
        opTest(
          "l2-prefix-case-sensitive",
          [
            ["SET", "1", "user:1", "Name", "alice"],
            ["SET", "2", "user:1", "name", "bob"],
            ["SCAN_BY_PREFIX", "3", "user:1", "N"]
          ],
          ["true", "true", "Name=alice"]
        ),
        opTest(
          "l2-scan-after-clearing-key",
          [
            ["SET", "1", "user:1", "a", "1"],
            ["DELETE", "2", "user:1", "a"],
            ["SCAN", "3", "user:1"]
          ],
          ["true", "true", ""]
        )
      ],
      hints: [
        "Iterate the inner dict's items, filter by prefix when SCAN_BY_PREFIX, sort by field name, then join as field=value.",
        "Return \"\" when the key is missing OR has no matching fields — both are indistinguishable to the caller.",
        "An empty prefix matches every field — startswith(\"\") is always true."
      ],
      solution:
        "SCAN and SCAN_BY_PREFIX both walk the inner dict for the key, filter (by prefix or all), sort by field name, and join as field=value with commas. Empty results return \"\" and a missing outer key short-circuits to \"\" before any iteration.",
      walkthrough:
        "All work happens in the read path, so Level 1's writers stay untouched. Sorting on demand is fine because field counts per key are small; if they grew, an ordered map (or a sorted-on-write index) could replace the sort without changing the interface.",
      complexity: {
        time: "O(f log f) per scan where f is fields-per-key",
        space: "O(f) for the temporary match list"
      }
    },
    {
      id: "l3-ttl",
      title: "Level 3: TTL",
      prompt: L3_PROMPT,
      entrypoint: "solution",
      starterCode: L3_STARTER,
      referenceCode: L3_REFERENCE,
      solutionCode: L3_SOLUTION,
      visibleTests: [
        opTest(
          "l3-set-at-then-get-before-expiry",
          [
            ["SET_AT", "1", "user:1", "name", "alice", "10"],
            ["GET", "5", "user:1", "name"]
          ],
          ["true", "alice"]
        ),
        opTest(
          "l3-get-after-expiry",
          [
            ["SET_AT", "1", "user:1", "name", "alice", "10"],
            ["GET", "15", "user:1", "name"]
          ],
          ["true", ""]
        ),
        opTest(
          "l3-get-at-boundary-is-expired",
          [
            ["SET_AT", "1", "user:1", "name", "alice", "10"],
            ["GET", "11", "user:1", "name"]
          ],
          ["true", ""]
        ),
        opTest(
          "l3-set-cancels-ttl",
          [
            ["SET_AT", "1", "user:1", "name", "alice", "5"],
            ["SET", "2", "user:1", "name", "bob"],
            ["GET", "20", "user:1", "name"]
          ],
          ["true", "true", "bob"]
        )
      ],
      hiddenTests: [
        opTest(
          "l3-scan-excludes-expired",
          [
            ["SET", "1", "user:1", "name", "alice"],
            ["SET_AT", "2", "user:1", "session", "abc", "5"],
            ["SCAN", "20", "user:1"]
          ],
          ["true", "true", "name=alice"]
        ),
        opTest(
          "l3-delete-of-expired-is-false",
          [
            ["SET_AT", "1", "user:1", "session", "abc", "5"],
            ["DELETE", "20", "user:1", "session"]
          ],
          ["true", "false"]
        ),
        opTest(
          "l3-prefix-scan-excludes-expired",
          [
            ["SET_AT", "1", "user:1", "session_old", "x", "5"],
            ["SET", "2", "user:1", "session_new", "y"],
            ["SCAN_BY_PREFIX", "20", "user:1", "session"]
          ],
          ["true", "true", "session_new=y"]
        ),
        opTest(
          "l3-set-at-overrides-prior-expiration",
          [
            ["SET_AT", "1", "user:1", "name", "alice", "5"],
            ["SET_AT", "2", "user:1", "name", "bob", "100"],
            ["GET", "50", "user:1", "name"]
          ],
          ["true", "true", "bob"]
        ),
        opTest(
          "l3-scan-all-fields-expired-returns-empty",
          [
            ["SET_AT", "1", "user:1", "a", "1", "5"],
            ["SET_AT", "2", "user:1", "b", "2", "5"],
            ["SCAN", "20", "user:1"]
          ],
          ["true", "true", ""]
        )
      ],
      hints: [
        "Store expirations in a separate (key, field) -> absolute_timestamp dict so non-expiring SET entries stay free of overhead.",
        "Define is_alive(key, field, ts) once and use it in GET, SCAN, SCAN_BY_PREFIX, and DELETE so the rule is in one place.",
        "ts >= expiration means EXPIRED — a field set at ts=1 with ttl=10 is alive at 10, expired at 11."
      ],
      solution:
        "Maintain a parallel dict of (key, field) -> absolute_expiration. A field is alive when it exists in the store AND its expiration (if any) is strictly greater than the current timestamp. GET, SCAN, SCAN_BY_PREFIX, and DELETE all consult the same alive() predicate; SET clears any TTL on the field while SET_AT writes both the value and the expiration.",
      walkthrough:
        "Lazy expiration keeps writes cheap: nothing scans every key on every tick. The single alive() helper makes the rule unambiguous and means there's exactly one place to fix if the boundary semantics ever change.",
      complexity: {
        time: "O(1) for GET/DELETE/SET/SET_AT, O(f log f) for SCAN",
        space: "O(fields + ttls)"
      }
    },
    {
      id: "l4-backup-restore",
      title: "Level 4: Backup & restore",
      prompt: L4_PROMPT,
      entrypoint: "solution",
      starterCode: L4_STARTER,
      referenceCode: L4_REFERENCE,
      solutionCode: L4_SOLUTION,
      visibleTests: [
        opTest(
          "l4-backup-then-restore",
          [
            ["SET", "1", "user:1", "name", "alice"],
            ["BACKUP", "2"],
            ["SET", "3", "user:1", "name", "bob"],
            ["RESTORE", "4", "backup1"],
            ["GET", "5", "user:1", "name"]
          ],
          ["true", "backup1", "true", "true", "alice"]
        ),
        opTest("l4-restore-missing-backup", [["RESTORE", "1", "ghost"]], ["false"]),
        opTest(
          "l4-backup-skips-expired",
          [
            ["SET_AT", "1", "user:1", "session", "x", "5"],
            ["BACKUP", "20"],
            ["RESTORE", "21", "backup1"],
            ["GET", "22", "user:1", "session"]
          ],
          ["true", "backup1", "true", ""]
        ),
        opTest(
          "l4-restore-clears-newer-state",
          [
            ["SET", "1", "user:1", "name", "alice"],
            ["BACKUP", "2"],
            ["SET", "3", "user:2", "name", "carol"],
            ["RESTORE", "4", "backup1"],
            ["GET", "5", "user:2", "name"]
          ],
          ["true", "backup1", "true", "true", ""]
        )
      ],
      hiddenTests: [
        opTest(
          "l4-backup-empty-state",
          [
            ["BACKUP", "1"],
            ["SET", "2", "user:1", "name", "alice"],
            ["RESTORE", "3", "backup1"],
            ["GET", "4", "user:1", "name"]
          ],
          ["backup1", "true", "true", ""]
        ),
        opTest(
          "l4-multiple-backups",
          [
            ["SET", "1", "user:1", "name", "alice"],
            ["BACKUP", "2"],
            ["SET", "3", "user:1", "name", "bob"],
            ["BACKUP", "4"],
            ["RESTORE", "5", "backup1"],
            ["GET", "6", "user:1", "name"],
            ["RESTORE", "7", "backup2"],
            ["GET", "8", "user:1", "name"]
          ],
          ["true", "backup1", "true", "backup2", "true", "alice", "true", "bob"]
        ),
        opTest(
          "l4-restore-drops-expired-on-restore",
          [
            ["SET_AT", "1", "user:1", "session", "x", "10"],
            ["BACKUP", "2"],
            ["RESTORE", "100", "backup1"],
            ["GET", "101", "user:1", "session"]
          ],
          ["true", "backup1", "true", ""]
        ),
        opTest(
          "l4-restore-preserves-original-expiration",
          [
            ["SET_AT", "1", "user:1", "session", "x", "10"],
            ["BACKUP", "2"],
            ["RESTORE", "5", "backup1"],
            ["GET", "10", "user:1", "session"],
            ["GET", "12", "user:1", "session"]
          ],
          ["true", "backup1", "true", "x", ""]
        )
      ],
      hints: [
        "On BACKUP, walk every (key, field) and skip already-expired ones — the snapshot should only contain still-live entries.",
        "Snapshot each field's absolute expiration unchanged; on RESTORE, drop entries whose absolute_expiration <= current timestamp so time keeps moving forward.",
        "Deep-copy the snapshot's inner dicts on RESTORE so subsequent writes don't leak into the stored backup."
      ],
      solution:
        "BACKUP records (snap_store, snap_ttls) of the currently-live state and increments a sequence to produce backup1, backup2, ... RESTORE deep-copies the snapshot into the live state and then drops any TTL entry whose absolute expiration has already passed at the restore timestamp, so the restored state reflects time-aware aging correctly.",
      walkthrough:
        "Capturing absolute (not relative) expirations is what makes the snapshot time-aware: a session that would have expired at ts=10 stays expired-at-10 across save and load, which is what makes the L4 hidden tests resolvable. Deep-copying isolates the snapshot from later mutations so a backup taken once can be restored any number of times.",
      complexity: {
        time: "O(total fields) per BACKUP and per RESTORE",
        space: "O(total fields × number of backups)"
      }
    }
  ]
});

export const inMemoryDbAssessment: Assessment = {
  id: "in-memory-db",
  title: "Progressive In-Memory Database",
  archetype: "in-memory-db",
  blurb: "A two-level key-field store that grows from CRUD to scans, TTL, and time-aware snapshots.",
  intro:
    "A four-level evolving database: nested-key CRUD, then sorted field scans, then per-field TTL, then time-aware backups and restores that respect absolute expirations. Every query carries a timestamp from Level 1, even when it isn't used yet. Design your Level 1 state so Level 3's TTL and Level 4's snapshots slot in cleanly — read all four levels before you start.",
  totalMinutes: 90,
  problemId: "asm-in-memory-db",
  levels: standardLevels(["l2-scan", "l3-ttl", "l4-backup-restore"]),
  scoreBand: { min: 200, max: 600 }
};
