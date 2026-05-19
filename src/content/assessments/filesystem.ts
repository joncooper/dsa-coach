import type { Assessment, Problem } from "../../types";
import { assessmentProblem, opTest, standardLevels } from "./_shared";

/**
 * Progressive Filesystem — the flagship CodeSignal ICF practice assessment.
 *
 * One evolving in-memory file store, four cumulative levels:
 *   L1 basic file ops -> L2 prefix/suffix search -> L3 users + quotas +
 *   largest-first eviction -> L4 compression.
 *
 * Every level is the same `solution(queries)` dispatcher (one output string
 * per query), extended with new operations. Each level's reference/solution
 * is a complete, standalone implementation for that level's op set — later
 * levels are supersets of earlier ones, exactly the real ICF carry-forward
 * model. All outputs are deterministic so the harness's exact `==` works
 * (stable sort: size descending, then name ascending; integer arithmetic).
 */

// ---------------------------------------------------------------------------
// Level 1 — basic file operations
// ---------------------------------------------------------------------------

const L1_PROMPT = `Implement an in-memory file store driven by a list of operations. \
\`solution(queries)\` receives a list of queries; each query is a list of strings \
\`[OP, ...args]\`. Return a list with one string result per query, in order.

**Level 1 operations**

- \`["ADD_FILE", name, size]\` — add a new file. Return \`"true"\` if added, or \
\`"false"\` if a file with that name already exists (no change in that case). \`size\` \
is a non-negative integer given as a string.
- \`["GET_FILE_SIZE", name]\` — return the file's size as a string, or \`""\` if no \
such file exists.
- \`["COPY_FILE", source, dest]\` — copy \`source\` to \`dest\` (overwriting \`dest\` \
if it already exists). Return \`"true"\`, or \`"false"\` if \`source\` does not exist.

Names are case-sensitive. This problem has four progressive levels; later levels add \
operations to this same function, so structure it as a clean per-op dispatcher.`;

const L1_STARTER = `def solution(queries):
    files = {}            # name -> size
    results = []
    for query in queries:
        op = query[0]
        # ADD_FILE name size   -> "true" / "false"
        # GET_FILE_SIZE name   -> "<size>" / ""
        # COPY_FILE src dst    -> "true" / "false"
        results.append("")
    return results
`;

const L1_REFERENCE = `def solution(queries):
    files = {}
    out = []
    for q in queries:
        op = q[0]
        if op == "ADD_FILE":
            name, size = q[1], int(q[2])
            if name in files:
                out.append("false")
            else:
                files[name] = size
                out.append("true")
        elif op == "GET_FILE_SIZE":
            name = q[1]
            out.append(str(files[name]) if name in files else "")
        elif op == "COPY_FILE":
            src, dst = q[1], q[2]
            if src not in files:
                out.append("false")
            else:
                files[dst] = files[src]
                out.append("true")
        else:
            out.append("")
    return out
`;

const L1_SOLUTION = `def solution(queries):
    sizes = {}
    answers = []
    for query in queries:
        kind = query[0]
        if kind == "ADD_FILE":
            name = query[1]
            if name in sizes:
                answers.append("false")
            else:
                sizes[name] = int(query[2])
                answers.append("true")
        elif kind == "GET_FILE_SIZE":
            answers.append(str(sizes[query[1]]) if query[1] in sizes else "")
        elif kind == "COPY_FILE":
            src, dst = query[1], query[2]
            if src in sizes:
                sizes[dst] = sizes[src]
                answers.append("true")
            else:
                answers.append("false")
        else:
            answers.append("")
    return answers
`;

// ---------------------------------------------------------------------------
// Level 2 — prefix / suffix search
// ---------------------------------------------------------------------------

const L2_PROMPT = `Extend your Level 1 file store with search. All Level 1 operations \
keep working unchanged.

**New operations**

- \`["FIND_BY_PREFIX", prefix]\` — find every file whose name starts with \`prefix\`.
- \`["FIND_BY_SUFFIX", suffix]\` — find every file whose name ends with \`suffix\`.

Both return a single string: the matching files formatted as \`name(size)\`, joined \
by commas, **sorted by size descending, breaking ties by name ascending**. Return \
\`""\` when nothing matches. An empty \`prefix\`/\`suffix\` matches every file.`;

const L2_STARTER = `def solution(queries):
    files = {}            # name -> size
    results = []
    for query in queries:
        op = query[0]
        # Level 1 ops, plus:
        # FIND_BY_PREFIX prefix  -> "n1(s1),n2(s2)" / ""
        # FIND_BY_SUFFIX suffix  -> "n1(s1),n2(s2)" / ""
        results.append("")
    return results
`;

const L2_REFERENCE = `def solution(queries):
    files = {}
    out = []

    def render(matches):
        items = sorted(matches, key=lambda kv: (-kv[1], kv[0]))
        return ",".join(n + "(" + str(s) + ")" for n, s in items)

    for q in queries:
        op = q[0]
        if op == "ADD_FILE":
            name, size = q[1], int(q[2])
            if name in files:
                out.append("false")
            else:
                files[name] = size
                out.append("true")
        elif op == "GET_FILE_SIZE":
            name = q[1]
            out.append(str(files[name]) if name in files else "")
        elif op == "COPY_FILE":
            src, dst = q[1], q[2]
            if src not in files:
                out.append("false")
            else:
                files[dst] = files[src]
                out.append("true")
        elif op == "FIND_BY_PREFIX":
            prefix = q[1]
            out.append(render([(n, s) for n, s in files.items() if n.startswith(prefix)]))
        elif op == "FIND_BY_SUFFIX":
            suffix = q[1]
            out.append(render([(n, s) for n, s in files.items() if n.endswith(suffix)]))
        else:
            out.append("")
    return out
`;

const L2_SOLUTION = `def solution(queries):
    sizes = {}
    answers = []

    def listing(pairs):
        pairs.sort(key=lambda p: (-p[1], p[0]))
        return ",".join("%s(%d)" % (n, s) for n, s in pairs)

    for query in queries:
        kind = query[0]
        if kind == "ADD_FILE":
            name = query[1]
            if name in sizes:
                answers.append("false")
            else:
                sizes[name] = int(query[2])
                answers.append("true")
        elif kind == "GET_FILE_SIZE":
            answers.append(str(sizes[query[1]]) if query[1] in sizes else "")
        elif kind == "COPY_FILE":
            src, dst = query[1], query[2]
            if src in sizes:
                sizes[dst] = sizes[src]
                answers.append("true")
            else:
                answers.append("false")
        elif kind == "FIND_BY_PREFIX":
            pre = query[1]
            answers.append(listing([(n, s) for n, s in sizes.items() if n.startswith(pre)]))
        elif kind == "FIND_BY_SUFFIX":
            suf = query[1]
            answers.append(listing([(n, s) for n, s in sizes.items() if n.endswith(suf)]))
        else:
            answers.append("")
    return answers
`;

// ---------------------------------------------------------------------------
// Level 3 — users, quotas, largest-first eviction
// ---------------------------------------------------------------------------

const L3_PROMPT = `Add multi-user storage with quotas. All earlier operations keep \
working: files added via \`ADD_FILE\` (and any \`COPY_FILE\` destination) belong to an \
internal system owner with unlimited quota, and are never evicted by the rule below.

**New operations**

- \`["ADD_USER", user, capacity]\` — create a user with integer byte \`capacity\`. \
Return \`"true"\`, or \`"false"\` if the user already exists.
- \`["ADD_FILE_BY", user, name, size]\` — add a file owned by \`user\`. Return \
\`"false"\` (no change) if the user does not exist, a file with that name already \
exists, or \`size\` exceeds the user's total capacity. Otherwise, if the user's used \
bytes plus \`size\` would exceed capacity, **evict that user's own files largest \
first (ties: name ascending)** until the new file fits, then add it and return \
\`"true"\`.`;

const L3_STARTER = `def solution(queries):
    files = {}            # name -> {"size": int, "owner": str}
    users = {}            # user -> {"limit": int, "used": int}
    results = []
    for query in queries:
        op = query[0]
        # Level 1-2 ops, plus:
        # ADD_USER user capacity      -> "true" / "false"
        # ADD_FILE_BY user name size  -> "true" / "false" (largest-first eviction)
        results.append("")
    return results
`;

const L3_REFERENCE = `SYS = "$system"

def solution(queries):
    files = {}
    users = {}
    out = []

    def render(matches):
        items = sorted(matches, key=lambda kv: (-kv[1], kv[0]))
        return ",".join(n + "(" + str(s) + ")" for n, s in items)

    for q in queries:
        op = q[0]
        if op == "ADD_FILE":
            name, size = q[1], int(q[2])
            if name in files:
                out.append("false")
            else:
                files[name] = {"size": size, "owner": SYS}
                out.append("true")
        elif op == "GET_FILE_SIZE":
            name = q[1]
            out.append(str(files[name]["size"]) if name in files else "")
        elif op == "COPY_FILE":
            src, dst = q[1], q[2]
            if src not in files:
                out.append("false")
            else:
                files[dst] = {"size": files[src]["size"], "owner": SYS}
                out.append("true")
        elif op == "FIND_BY_PREFIX":
            prefix = q[1]
            out.append(render([(n, f["size"]) for n, f in files.items() if n.startswith(prefix)]))
        elif op == "FIND_BY_SUFFIX":
            suffix = q[1]
            out.append(render([(n, f["size"]) for n, f in files.items() if n.endswith(suffix)]))
        elif op == "ADD_USER":
            user, limit = q[1], int(q[2])
            if user in users:
                out.append("false")
            else:
                users[user] = {"limit": limit, "used": 0}
                out.append("true")
        elif op == "ADD_FILE_BY":
            user, name, size = q[1], q[2], int(q[3])
            if user not in users or name in files or size > users[user]["limit"]:
                out.append("false")
                continue
            u = users[user]
            if u["used"] + size > u["limit"]:
                owned = sorted(
                    [(n, fo["size"]) for n, fo in files.items() if fo["owner"] == user],
                    key=lambda kv: (-kv[1], kv[0]),
                )
                i = 0
                while u["used"] + size > u["limit"] and i < len(owned):
                    victim = owned[i][0]
                    u["used"] -= files[victim]["size"]
                    del files[victim]
                    i += 1
            files[name] = {"size": size, "owner": user}
            u["used"] += size
            out.append("true")
        else:
            out.append("")
    return out
`;

const L3_SOLUTION = `SYSTEM = "$system"

def solution(queries):
    files = {}
    users = {}
    answers = []

    def listing(pairs):
        pairs.sort(key=lambda p: (-p[1], p[0]))
        return ",".join("%s(%d)" % (n, s) for n, s in pairs)

    for query in queries:
        kind = query[0]
        if kind == "ADD_FILE":
            name = query[1]
            if name in files:
                answers.append("false")
            else:
                files[name] = {"size": int(query[2]), "owner": SYSTEM}
                answers.append("true")
        elif kind == "GET_FILE_SIZE":
            n = query[1]
            answers.append(str(files[n]["size"]) if n in files else "")
        elif kind == "COPY_FILE":
            src, dst = query[1], query[2]
            if src in files:
                files[dst] = {"size": files[src]["size"], "owner": SYSTEM}
                answers.append("true")
            else:
                answers.append("false")
        elif kind == "FIND_BY_PREFIX":
            pre = query[1]
            answers.append(listing([(n, f["size"]) for n, f in files.items() if n.startswith(pre)]))
        elif kind == "FIND_BY_SUFFIX":
            suf = query[1]
            answers.append(listing([(n, f["size"]) for n, f in files.items() if n.endswith(suf)]))
        elif kind == "ADD_USER":
            user = query[1]
            if user in users:
                answers.append("false")
            else:
                users[user] = {"limit": int(query[2]), "used": 0}
                answers.append("true")
        elif kind == "ADD_FILE_BY":
            user, name, size = query[1], query[2], int(query[3])
            if user not in users or name in files or size > users[user]["limit"]:
                answers.append("false")
                continue
            rec = users[user]
            if rec["used"] + size > rec["limit"]:
                mine = [(n, f["size"]) for n, f in files.items() if f["owner"] == user]
                mine.sort(key=lambda p: (-p[1], p[0]))
                k = 0
                while rec["used"] + size > rec["limit"] and k < len(mine):
                    drop = mine[k][0]
                    rec["used"] -= files[drop]["size"]
                    del files[drop]
                    k += 1
            files[name] = {"size": size, "owner": user}
            rec["used"] += size
            answers.append("true")
        else:
            answers.append("")
    return answers
`;

// ---------------------------------------------------------------------------
// Level 4 — compression
// ---------------------------------------------------------------------------

const L4_PROMPT = `Add file compression. All earlier operations keep working.

**New operations**

- \`["COMPRESS_FILE", user, name]\` — if the file exists, is owned by \`user\`, and \
is not already compressed, halve its size using integer floor division \
(\`new = size // 2\`), decrease the owner's used bytes accordingly, and return the \
new size as a string. Otherwise return \`""\` (no change).
- \`["DECOMPRESS_FILE", user, name]\` — if the file exists, is owned by \`user\`, and \
is compressed, restore its original size. If restoring would exceed the owner's \
capacity, return \`""\` and leave it compressed; otherwise update the owner's used \
bytes, restore the size, and return the restored size as a string. Otherwise return \
\`""\`.`;

const L4_STARTER = `def solution(queries):
    files = {}            # name -> {"size","owner","compressed","orig"}
    users = {}            # user -> {"limit","used"}
    results = []
    for query in queries:
        op = query[0]
        # Level 1-3 ops, plus:
        # COMPRESS_FILE user name    -> "<new size>" / ""
        # DECOMPRESS_FILE user name  -> "<restored size>" / ""
        results.append("")
    return results
`;

const L4_REFERENCE = `SYS = "$system"

def solution(queries):
    files = {}
    users = {}
    out = []

    def render(matches):
        items = sorted(matches, key=lambda kv: (-kv[1], kv[0]))
        return ",".join(n + "(" + str(s) + ")" for n, s in items)

    for q in queries:
        op = q[0]
        if op == "ADD_FILE":
            name, size = q[1], int(q[2])
            if name in files:
                out.append("false")
            else:
                files[name] = {"size": size, "owner": SYS, "compressed": False, "orig": size}
                out.append("true")
        elif op == "GET_FILE_SIZE":
            name = q[1]
            out.append(str(files[name]["size"]) if name in files else "")
        elif op == "COPY_FILE":
            src, dst = q[1], q[2]
            if src not in files:
                out.append("false")
            else:
                s = files[src]["size"]
                files[dst] = {"size": s, "owner": SYS, "compressed": False, "orig": s}
                out.append("true")
        elif op == "FIND_BY_PREFIX":
            prefix = q[1]
            out.append(render([(n, f["size"]) for n, f in files.items() if n.startswith(prefix)]))
        elif op == "FIND_BY_SUFFIX":
            suffix = q[1]
            out.append(render([(n, f["size"]) for n, f in files.items() if n.endswith(suffix)]))
        elif op == "ADD_USER":
            user, limit = q[1], int(q[2])
            if user in users:
                out.append("false")
            else:
                users[user] = {"limit": limit, "used": 0}
                out.append("true")
        elif op == "ADD_FILE_BY":
            user, name, size = q[1], q[2], int(q[3])
            if user not in users or name in files or size > users[user]["limit"]:
                out.append("false")
                continue
            u = users[user]
            if u["used"] + size > u["limit"]:
                owned = sorted(
                    [(n, fo["size"]) for n, fo in files.items() if fo["owner"] == user],
                    key=lambda kv: (-kv[1], kv[0]),
                )
                i = 0
                while u["used"] + size > u["limit"] and i < len(owned):
                    victim = owned[i][0]
                    u["used"] -= files[victim]["size"]
                    del files[victim]
                    i += 1
            files[name] = {"size": size, "owner": user, "compressed": False, "orig": size}
            u["used"] += size
            out.append("true")
        elif op == "COMPRESS_FILE":
            user, name = q[1], q[2]
            if name not in files:
                out.append("")
                continue
            f = files[name]
            if f["owner"] != user or f["compressed"]:
                out.append("")
                continue
            new_size = f["size"] // 2
            if user in users:
                users[user]["used"] -= (f["size"] - new_size)
            f["orig"] = f["size"]
            f["size"] = new_size
            f["compressed"] = True
            out.append(str(new_size))
        elif op == "DECOMPRESS_FILE":
            user, name = q[1], q[2]
            if name not in files:
                out.append("")
                continue
            f = files[name]
            if f["owner"] != user or not f["compressed"]:
                out.append("")
                continue
            delta = f["orig"] - f["size"]
            if user in users and users[user]["used"] + delta > users[user]["limit"]:
                out.append("")
                continue
            if user in users:
                users[user]["used"] += delta
            f["size"] = f["orig"]
            f["compressed"] = False
            out.append(str(f["size"]))
        else:
            out.append("")
    return out
`;

const L4_SOLUTION = `SYSTEM = "$system"

def solution(queries):
    files = {}
    users = {}
    answers = []

    def listing(pairs):
        pairs.sort(key=lambda p: (-p[1], p[0]))
        return ",".join("%s(%d)" % (n, s) for n, s in pairs)

    def new_file(size, owner):
        return {"size": size, "owner": owner, "compressed": False, "orig": size}

    for query in queries:
        kind = query[0]
        if kind == "ADD_FILE":
            name = query[1]
            if name in files:
                answers.append("false")
            else:
                files[name] = new_file(int(query[2]), SYSTEM)
                answers.append("true")
        elif kind == "GET_FILE_SIZE":
            n = query[1]
            answers.append(str(files[n]["size"]) if n in files else "")
        elif kind == "COPY_FILE":
            src, dst = query[1], query[2]
            if src in files:
                files[dst] = new_file(files[src]["size"], SYSTEM)
                answers.append("true")
            else:
                answers.append("false")
        elif kind == "FIND_BY_PREFIX":
            pre = query[1]
            answers.append(listing([(n, f["size"]) for n, f in files.items() if n.startswith(pre)]))
        elif kind == "FIND_BY_SUFFIX":
            suf = query[1]
            answers.append(listing([(n, f["size"]) for n, f in files.items() if n.endswith(suf)]))
        elif kind == "ADD_USER":
            user = query[1]
            if user in users:
                answers.append("false")
            else:
                users[user] = {"limit": int(query[2]), "used": 0}
                answers.append("true")
        elif kind == "ADD_FILE_BY":
            user, name, size = query[1], query[2], int(query[3])
            if user not in users or name in files or size > users[user]["limit"]:
                answers.append("false")
                continue
            rec = users[user]
            if rec["used"] + size > rec["limit"]:
                mine = [(n, f["size"]) for n, f in files.items() if f["owner"] == user]
                mine.sort(key=lambda p: (-p[1], p[0]))
                k = 0
                while rec["used"] + size > rec["limit"] and k < len(mine):
                    drop = mine[k][0]
                    rec["used"] -= files[drop]["size"]
                    del files[drop]
                    k += 1
            files[name] = new_file(size, user)
            rec["used"] += size
            answers.append("true")
        elif kind == "COMPRESS_FILE":
            user, name = query[1], query[2]
            if name not in files:
                answers.append("")
                continue
            f = files[name]
            if f["owner"] != user or f["compressed"]:
                answers.append("")
                continue
            shrunk = f["size"] // 2
            if user in users:
                users[user]["used"] -= f["size"] - shrunk
            f["orig"] = f["size"]
            f["size"] = shrunk
            f["compressed"] = True
            answers.append(str(shrunk))
        elif kind == "DECOMPRESS_FILE":
            user, name = query[1], query[2]
            if name not in files:
                answers.append("")
                continue
            f = files[name]
            if f["owner"] != user or not f["compressed"]:
                answers.append("")
                continue
            gain = f["orig"] - f["size"]
            if user in users and users[user]["used"] + gain > users[user]["limit"]:
                answers.append("")
                continue
            if user in users:
                users[user]["used"] += gain
            f["size"] = f["orig"]
            f["compressed"] = False
            answers.append(str(f["size"]))
        else:
            answers.append("")
    return answers
`;

// ---------------------------------------------------------------------------
// Problem assembly
// ---------------------------------------------------------------------------

export const filesystemProblem: Problem = assessmentProblem({
  id: "asm-filesystem",
  title: "Progressive Filesystem",
  difficulty: "medium",
  patterns: ["simulation", "stateful design", "hash map", "sorting"],
  prompt: L1_PROMPT,
  constraints: [
    "Each query is a list of strings; dispatch on query[0].",
    "Numeric arguments arrive as strings — parse them with int().",
    "Return exactly one result string per query, in input order.",
    "File and user names are case-sensitive.",
    "All four levels share one solution(queries) entrypoint."
  ],
  examples: [
    opTest(
      "l1-add-then-get",
      [
        ["ADD_FILE", "a.txt", "100"],
        ["GET_FILE_SIZE", "a.txt"]
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
      "l1-add-then-get",
      [
        ["ADD_FILE", "a.txt", "100"],
        ["GET_FILE_SIZE", "a.txt"]
      ],
      ["true", "100"]
    ),
    opTest(
      "l1-duplicate-add",
      [
        ["ADD_FILE", "a.txt", "100"],
        ["ADD_FILE", "a.txt", "200"],
        ["GET_FILE_SIZE", "a.txt"]
      ],
      ["true", "false", "100"]
    ),
    opTest(
      "l1-copy-then-get",
      [
        ["ADD_FILE", "a.txt", "50"],
        ["COPY_FILE", "a.txt", "b.txt"],
        ["GET_FILE_SIZE", "b.txt"]
      ],
      ["true", "true", "50"]
    )
  ],
  hiddenTests: [
    opTest("l1-copy-missing-src", [["COPY_FILE", "x", "y"]], ["false"]),
    opTest("l1-get-missing", [["GET_FILE_SIZE", "nope"]], [""]),
    opTest(
      "l1-copy-overwrites-dest",
      [
        ["ADD_FILE", "a", "10"],
        ["ADD_FILE", "b", "99"],
        ["COPY_FILE", "a", "b"],
        ["GET_FILE_SIZE", "b"]
      ],
      ["true", "true", "true", "10"]
    ),
    opTest(
      "l1-case-sensitive",
      [
        ["ADD_FILE", "File", "1"],
        ["GET_FILE_SIZE", "file"],
        ["GET_FILE_SIZE", "File"]
      ],
      ["true", "", "1"]
    ),
    opTest(
      "l1-copy-to-self",
      [
        ["ADD_FILE", "a", "7"],
        ["COPY_FILE", "a", "a"],
        ["GET_FILE_SIZE", "a"]
      ],
      ["true", "true", "7"]
    ),
    opTest(
      "l1-size-zero",
      [
        ["ADD_FILE", "z", "0"],
        ["GET_FILE_SIZE", "z"]
      ],
      ["true", "0"]
    )
  ],
  hints: [
    "Treat queries as a command stream: read query[0], branch per operation, append exactly one result.",
    "A plain dict name->size covers Level 1; design it so later levels can attach more per-file data.",
    "COPY_FILE overwrites the destination and only fails when the source is absent."
  ],
  solution:
    "Maintain a dict of file name to size. ADD_FILE refuses duplicates; GET_FILE_SIZE returns the size as a string or an empty string when absent; COPY_FILE assigns the source's size to the destination (overwriting) and only fails when the source is missing. Append one result per query.",
  walkthrough:
    "The function is a dispatcher over an operation list. State is a single dict. Each branch performs its mutation or lookup and appends exactly one string, so the output length always matches the number of queries. Keeping the per-file value simple here, but isolated behind the dict, is what lets Levels 2-4 add search, ownership, and compression without rewrites.",
  followUps: [
    "How would you keep search (Level 2) fast as the file count grows?",
    "What per-file metadata will Levels 3-4 need, and where should it live?"
  ],
  complexity: {
    time: "O(1) per Level 1 op; O(f log f) per search in Level 2",
    space: "O(files + users)"
  },
  parts: [
    {
      id: "l2-search",
      title: "Level 2: Prefix & suffix search",
      prompt: L2_PROMPT,
      entrypoint: "solution",
      starterCode: L2_STARTER,
      referenceCode: L2_REFERENCE,
      solutionCode: L2_SOLUTION,
      visibleTests: [
        opTest(
          "l2-prefix-by-size-desc",
          [
            ["ADD_FILE", "data1.txt", "30"],
            ["ADD_FILE", "data2.txt", "90"],
            ["FIND_BY_PREFIX", "data"]
          ],
          ["true", "true", "data2.txt(90),data1.txt(30)"]
        ),
        opTest(
          "l2-prefix-no-match",
          [
            ["ADD_FILE", "a", "1"],
            ["FIND_BY_PREFIX", "z"]
          ],
          ["true", ""]
        ),
        opTest(
          "l2-suffix-match",
          [
            ["ADD_FILE", "a.log", "5"],
            ["ADD_FILE", "b.txt", "6"],
            ["FIND_BY_SUFFIX", ".log"]
          ],
          ["true", "true", "a.log(5)"]
        ),
        opTest(
          "l2-prefix-equals-name",
          [
            ["ADD_FILE", "report", "42"],
            ["FIND_BY_PREFIX", "report"]
          ],
          ["true", "report(42)"]
        )
      ],
      hiddenTests: [
        opTest(
          "l2-size-tie-lexicographic",
          [
            ["ADD_FILE", "b", "10"],
            ["ADD_FILE", "a", "10"],
            ["FIND_BY_PREFIX", ""]
          ],
          ["true", "true", "a(10),b(10)"]
        ),
        opTest(
          "l2-empty-prefix-all",
          [
            ["ADD_FILE", "x", "5"],
            ["ADD_FILE", "y", "9"],
            ["FIND_BY_PREFIX", ""]
          ],
          ["true", "true", "y(9),x(5)"]
        ),
        opTest(
          "l2-copied-file-searchable",
          [
            ["ADD_FILE", "src.txt", "12"],
            ["COPY_FILE", "src.txt", "dst.txt"],
            ["FIND_BY_SUFFIX", ".txt"]
          ],
          ["true", "true", "dst.txt(12),src.txt(12)"]
        ),
        opTest(
          "l2-size-zero-tie",
          [
            ["ADD_FILE", "f2", "0"],
            ["ADD_FILE", "f1", "0"],
            ["FIND_BY_PREFIX", "f"]
          ],
          ["true", "true", "f1(0),f2(0)"]
        ),
        opTest(
          "l2-prefix-and-suffix-overlap",
          [
            ["ADD_FILE", "abc", "3"],
            ["FIND_BY_PREFIX", "ab"],
            ["FIND_BY_SUFFIX", "bc"]
          ],
          ["true", "abc(3)", "abc(3)"]
        )
      ],
      hints: [
        "Filter files.items() by startswith/endswith, then sort by (-size, name) before formatting.",
        "Format each match as name(size) and join with commas; an empty match list becomes the empty string.",
        "An empty prefix or suffix matches every file — startswith(\"\") is always true."
      ],
      solution:
        "For FIND_BY_PREFIX/SUFFIX, collect (name, size) pairs whose name matches, sort by size descending then name ascending, and join as name(size) with commas. No match yields the empty string. Level 1 behavior is unchanged.",
      walkthrough:
        "Search is a pure read over the existing state, so Level 1 stays untouched. The only subtlety is the total ordering: sort by negative size for descending, then by name ascending as the tiebreaker, which makes the output fully deterministic and exact-comparable.",
      complexity: { time: "O(f log f) per search", space: "O(f) for the match list" }
    },
    {
      id: "l3-users-quotas",
      title: "Level 3: Users, quotas & eviction",
      prompt: L3_PROMPT,
      entrypoint: "solution",
      starterCode: L3_STARTER,
      referenceCode: L3_REFERENCE,
      solutionCode: L3_SOLUTION,
      visibleTests: [
        opTest(
          "l3-user-add-within-quota",
          [
            ["ADD_USER", "u", "100"],
            ["ADD_FILE_BY", "u", "f", "40"],
            ["GET_FILE_SIZE", "f"]
          ],
          ["true", "true", "40"]
        ),
        opTest(
          "l3-evicts-largest-first",
          [
            ["ADD_USER", "u", "100"],
            ["ADD_FILE_BY", "u", "big", "80"],
            ["ADD_FILE_BY", "u", "small", "30"],
            ["ADD_FILE_BY", "u", "new", "80"],
            ["GET_FILE_SIZE", "big"],
            ["GET_FILE_SIZE", "small"],
            ["GET_FILE_SIZE", "new"]
          ],
          ["true", "true", "true", "true", "", "", "80"]
        ),
        opTest("l3-unknown-user", [["ADD_FILE_BY", "ghost", "f", "10"]], ["false"]),
        opTest(
          "l3-quota-exactly-equal",
          [
            ["ADD_USER", "u", "50"],
            ["ADD_FILE_BY", "u", "f", "50"],
            ["GET_FILE_SIZE", "f"]
          ],
          ["true", "true", "50"]
        )
      ],
      hiddenTests: [
        opTest(
          "l3-eviction-tie-by-name",
          [
            ["ADD_USER", "u", "20"],
            ["ADD_FILE_BY", "u", "b", "10"],
            ["ADD_FILE_BY", "u", "a", "10"],
            ["ADD_FILE_BY", "u", "c", "10"],
            ["GET_FILE_SIZE", "a"],
            ["GET_FILE_SIZE", "b"],
            ["GET_FILE_SIZE", "c"]
          ],
          ["true", "true", "true", "true", "", "10", "10"]
        ),
        opTest(
          "l3-multi-file-eviction",
          [
            ["ADD_USER", "u", "100"],
            ["ADD_FILE_BY", "u", "f1", "30"],
            ["ADD_FILE_BY", "u", "f2", "30"],
            ["ADD_FILE_BY", "u", "f3", "30"],
            ["ADD_FILE_BY", "u", "big", "80"],
            ["GET_FILE_SIZE", "f1"],
            ["GET_FILE_SIZE", "f2"],
            ["GET_FILE_SIZE", "f3"],
            ["GET_FILE_SIZE", "big"]
          ],
          ["true", "true", "true", "true", "true", "", "", "", "80"]
        ),
        opTest(
          "l3-too-big-no-change",
          [
            ["ADD_USER", "u", "50"],
            ["ADD_FILE_BY", "u", "a", "20"],
            ["ADD_FILE_BY", "u", "toobig", "60"],
            ["GET_FILE_SIZE", "a"],
            ["GET_FILE_SIZE", "toobig"]
          ],
          ["true", "true", "false", "20", ""]
        ),
        opTest(
          "l3-system-files-not-evicted",
          [
            ["ADD_FILE", "sys.txt", "90"],
            ["ADD_USER", "u", "100"],
            ["ADD_FILE_BY", "u", "ufile", "80"],
            ["ADD_FILE_BY", "u", "ufile2", "80"],
            ["GET_FILE_SIZE", "sys.txt"],
            ["GET_FILE_SIZE", "ufile"]
          ],
          ["true", "true", "true", "true", "90", ""]
        ),
        opTest(
          "l3-duplicate-user",
          [
            ["ADD_USER", "u", "10"],
            ["ADD_USER", "u", "20"]
          ],
          ["true", "false"]
        ),
        opTest(
          "l3-add-file-by-name-collision",
          [
            ["ADD_FILE", "x", "5"],
            ["ADD_USER", "u", "100"],
            ["ADD_FILE_BY", "u", "x", "10"],
            ["GET_FILE_SIZE", "x"]
          ],
          ["true", "true", "false", "5"]
        )
      ],
      hints: [
        "Give each file an owner; ADD_FILE/COPY_FILE files use a reserved system owner with no quota.",
        "Reject ADD_FILE_BY up front if the user is unknown, the name exists, or size exceeds total capacity.",
        "To evict, sort only that user's files by (-size, name) and drop until the new file fits."
      ],
      solution:
        "Track files as {size, owner} and users as {limit, used}. ADD_FILE_BY validates the user, name, and absolute capacity, then evicts the user's own files largest-first (name-ascending tiebreak) until the file fits before inserting it and updating used bytes. System-owned files are never evicted.",
      walkthrough:
        "The up-front guards make the operation atomic: once past them the insert is guaranteed to succeed, because evicting all of the user's files frees enough room whenever size <= limit. Eviction considers only the requesting user's files, so unrelated and system files are untouched, and the deterministic sort key keeps the choice exact.",
      complexity: {
        time: "O(f log f) when an ADD_FILE_BY evicts, O(1) otherwise",
        space: "O(files + users)"
      }
    },
    {
      id: "l4-compression",
      title: "Level 4: Compression",
      prompt: L4_PROMPT,
      entrypoint: "solution",
      starterCode: L4_STARTER,
      referenceCode: L4_REFERENCE,
      solutionCode: L4_SOLUTION,
      visibleTests: [
        opTest(
          "l4-compress-then-get",
          [
            ["ADD_USER", "u", "100"],
            ["ADD_FILE_BY", "u", "f", "40"],
            ["COMPRESS_FILE", "u", "f"],
            ["GET_FILE_SIZE", "f"]
          ],
          ["true", "true", "20", "20"]
        ),
        opTest("l4-compress-missing", [["COMPRESS_FILE", "u", "ghost"]], [""]),
        opTest(
          "l4-double-compress",
          [
            ["ADD_USER", "u", "100"],
            ["ADD_FILE_BY", "u", "f", "40"],
            ["COMPRESS_FILE", "u", "f"],
            ["COMPRESS_FILE", "u", "f"]
          ],
          ["true", "true", "20", ""]
        ),
        opTest(
          "l4-decompress-restores",
          [
            ["ADD_USER", "u", "100"],
            ["ADD_FILE_BY", "u", "f", "40"],
            ["COMPRESS_FILE", "u", "f"],
            ["DECOMPRESS_FILE", "u", "f"],
            ["GET_FILE_SIZE", "f"]
          ],
          ["true", "true", "20", "40", "40"]
        )
      ],
      hiddenTests: [
        opTest(
          "l4-compression-frees-quota",
          [
            ["ADD_USER", "u", "100"],
            ["ADD_FILE_BY", "u", "a", "80"],
            ["COMPRESS_FILE", "u", "a"],
            ["ADD_FILE_BY", "u", "b", "60"],
            ["GET_FILE_SIZE", "a"],
            ["GET_FILE_SIZE", "b"]
          ],
          ["true", "true", "40", "true", "40", "60"]
        ),
        opTest(
          "l4-decompress-exceeds-quota",
          [
            ["ADD_USER", "u", "100"],
            ["ADD_FILE_BY", "u", "a", "80"],
            ["COMPRESS_FILE", "u", "a"],
            ["ADD_FILE_BY", "u", "b", "60"],
            ["DECOMPRESS_FILE", "u", "a"],
            ["GET_FILE_SIZE", "a"]
          ],
          ["true", "true", "40", "true", "", "40"]
        ),
        opTest(
          "l4-compress-size-one",
          [
            ["ADD_USER", "u", "100"],
            ["ADD_FILE_BY", "u", "f", "1"],
            ["COMPRESS_FILE", "u", "f"],
            ["GET_FILE_SIZE", "f"]
          ],
          ["true", "true", "0", "0"]
        ),
        opTest(
          "l4-compress-owner-mismatch",
          [
            ["ADD_FILE", "s", "10"],
            ["ADD_USER", "u", "100"],
            ["COMPRESS_FILE", "u", "s"]
          ],
          ["true", "true", ""]
        ),
        opTest(
          "l4-decompress-after-eviction",
          [
            ["ADD_USER", "u", "100"],
            ["ADD_FILE_BY", "u", "a", "80"],
            ["COMPRESS_FILE", "u", "a"],
            ["ADD_FILE_BY", "u", "big", "100"],
            ["DECOMPRESS_FILE", "u", "a"]
          ],
          ["true", "true", "40", "true", ""]
        ),
        opTest(
          "l4-compress-then-copy",
          [
            ["ADD_USER", "u", "100"],
            ["ADD_FILE_BY", "u", "a", "40"],
            ["COMPRESS_FILE", "u", "a"],
            ["COPY_FILE", "a", "c"],
            ["GET_FILE_SIZE", "c"]
          ],
          ["true", "true", "20", "true", "20"]
        )
      ],
      hints: [
        "Store orig and a compressed flag per file so compress/decompress are reversible.",
        "Compress is size // 2; adjust the owner's used bytes by the difference, not the new size.",
        "Decompress must re-check the owner's quota and refuse (return \"\") if restoring would overflow it."
      ],
      solution:
        "Each file carries a compressed flag and its original size. COMPRESS_FILE halves the size with floor division and reduces the owner's used bytes by the saved amount; DECOMPRESS_FILE restores the original size only if it still fits the owner's quota. Owner mismatch, missing file, or wrong compression state all return the empty string.",
      walkthrough:
        "Compression is a reversible size transform guarded by ownership and current compression state. The used-bytes bookkeeping moves by the delta so quotas stay consistent, which is exactly what lets a compress free room for a later ADD_FILE_BY and what makes an over-quota decompress correctly refuse without mutating state.",
      complexity: {
        time: "O(1) per compress/decompress",
        space: "O(files + users)"
      }
    }
  ]
});

export const filesystemAssessment: Assessment = {
  id: "filesystem",
  title: "Progressive Filesystem",
  archetype: "filesystem",
  blurb: "An in-memory file store that grows from basic CRUD to search, quotas, and compression.",
  intro:
    "A four-level evolving problem: a simple file store that gains search, then multi-user quotas with eviction, then compression. Your code carries forward — each level extends the same solution(queries) function. Read all four levels before you start so your Level 1 data model survives to Level 4.",
  totalMinutes: 90,
  problemId: "asm-filesystem",
  levels: standardLevels(["l2-search", "l3-users-quotas", "l4-compression"]),
  scoreBand: { min: 200, max: 600 }
};
