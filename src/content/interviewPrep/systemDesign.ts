import { setProblem } from "./_shared";

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
    },
    {
      name: "get one tick before set returns none",
      args: [[
        ["SET", "a", "x", 10],
        ["GET", "a", 9]
      ]],
      expected: [null]
    },
    {
      name: "get at each writepoint",
      args: [[
        ["SET", "a", "v1", 5],
        ["SET", "a", "v2", 10],
        ["SET", "a", "v3", 15],
        ["GET", "a", 5],
        ["GET", "a", 10],
        ["GET", "a", 15]
      ]],
      expected: ["v1", "v2", "v3"]
    },
    {
      name: "scattered writes scattered reads",
      args: [[
        ["SET", "a", "v1", 100],
        ["SET", "a", "v2", 50],
        ["SET", "a", "v3", 200],
        ["GET", "a", 49],
        ["GET", "a", 50],
        ["GET", "a", 99],
        ["GET", "a", 100],
        ["GET", "a", 150],
        ["GET", "a", 200],
        ["GET", "a", 500]
      ]],
      expected: [null, "v2", "v2", "v1", "v1", "v3", "v3"]
    },
    {
      name: "many keys stay isolated",
      args: [[
        ["SET", "a", "1", 1],
        ["SET", "b", "2", 2],
        ["SET", "c", "3", 3],
        ["SET", "a", "4", 4],
        ["GET", "a", 2],
        ["GET", "b", 5],
        ["GET", "c", 10],
        ["GET", "a", 100]
      ]],
      expected: ["1", "2", "3", "4"]
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
        },
        {
          name: "snapshot just before tombstone is live",
          args: [[
            ["SET", "a", "x", 5],
            ["DELETE", "a", 10],
            ["SNAPSHOT", 9],
            ["SNAPSHOT", 10]
          ]],
          expected: [{ a: "x" }, {}]
        },
        {
          name: "multiple delete-resurrect cycles",
          args: [[
            ["SET", "a", "v1", 5],
            ["DELETE", "a", 10],
            ["SET", "a", "v2", 15],
            ["DELETE", "a", 20],
            ["SET", "a", "v3", 25],
            ["GET", "a", 7],
            ["GET", "a", 12],
            ["GET", "a", 17],
            ["GET", "a", 22],
            ["GET", "a", 30]
          ]],
          expected: ["v1", null, "v2", null, "v3"]
        },
        {
          name: "delete at out-of-order timestamp respected",
          args: [[
            ["SET", "a", "x", 10],
            ["DELETE", "a", 5],
            ["GET", "a", 6],
            ["GET", "a", 10]
          ]],
          expected: [null, "x"]
        },
        {
          name: "snapshot with many keys some deleted",
          args: [[
            ["SET", "a", "1", 1],
            ["SET", "b", "2", 1],
            ["SET", "c", "3", 1],
            ["DELETE", "b", 5],
            ["SNAPSHOT", 10]
          ]],
          expected: [{ a: "1", c: "3" }]
        },
        {
          name: "get at exact delete timestamp returns none",
          args: [[
            ["SET", "a", "x", 5],
            ["DELETE", "a", 10],
            ["GET", "a", 10]
          ]],
          expected: [null]
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

const miniFilesystem = setProblem({
  id: "tek-mini-filesystem",
  title: "An In-Memory Filesystem",
  difficulty: "medium",
  patterns: ["tree", "command interpreter", "path resolution"],
  entrypoint: "run_fs",
  prompt:
    "Implement a tiny in-memory filesystem driven by a list of commands. Each command is a list. `[\"mkdir\", path]` creates a directory and any missing parent directories. `[\"addFile\", path, content]` writes a file (creating missing parent directories), overwriting any existing file at that path. `[\"ls\", path]` lists names directly under a directory, sorted; if the path is a file it returns just `[<basename>]`. `[\"cat\", path]` returns the file's content string. `[\"rm\", path]` removes the file or directory subtree at the path. Paths are absolute and `/`-separated. Return the list of outputs produced by the `ls` and `cat` commands, in order.",
  constraints: [
    "Paths are absolute, start with /, and use / as the separator; segments are plain names (never . or ..).",
    "ls and rm reference an existing path; cat always references an existing file (never a directory).",
    "rm is never called on the root path /.",
    "A given path is only ever a directory or only ever a file (no file/directory collisions), and addFile's parents are directories.",
    "mkdir and addFile create any missing intermediate directories; addFile overwrites an existing file's content.",
    "ls returns immediate child names only, sorted ascending."
  ],
  examples: [
    {
      name: "make list cat",
      args: [[
        ["mkdir", "/a/b"],
        ["addFile", "/a/b/f.txt", "hi"],
        ["ls", "/a"],
        ["cat", "/a/b/f.txt"]
      ]],
      expected: [["b"], "hi"]
    }
  ],
  starterCode:
    "def run_fs(commands):\n" +
    "    # Model the tree as nested dicts; collect outputs from ls and cat.\n" +
    "    pass\n",
  referenceCode: `def run_fs(commands):
    root = {"type": "dir", "children": {}}

    def parts(path):
        return [p for p in path.split("/") if p]

    def node_at(segs, create=False):
        node = root
        for seg in segs:
            children = node["children"]
            if seg not in children:
                if not create:
                    return None
                children[seg] = {"type": "dir", "children": {}}
            node = children[seg]
        return node

    out = []
    for cmd in commands:
        op = cmd[0]
        if op == "mkdir":
            node_at(parts(cmd[1]), create=True)
        elif op == "addFile":
            segs = parts(cmd[1])
            parent = node_at(segs[:-1], create=True)
            parent["children"][segs[-1]] = {"type": "file", "content": cmd[2]}
        elif op == "ls":
            segs = parts(cmd[1])
            node = node_at(segs)
            if node["type"] == "file":
                out.append([segs[-1]])
            else:
                out.append(sorted(node["children"].keys()))
        elif op == "cat":
            out.append(node_at(parts(cmd[1]))["content"])
        elif op == "rm":
            segs = parts(cmd[1])
            parent = node_at(segs[:-1])
            if parent is not None and segs and segs[-1] in parent["children"]:
                del parent["children"][segs[-1]]
    return out
`,
  solutionCode: `def run_fs(commands):
    root = {}

    def walk(path, create=False):
        node = root
        for seg in [p for p in path.split("/") if p]:
            if seg not in node:
                if not create:
                    return None
                node[seg] = {}
            node = node[seg]
            if isinstance(node, str):
                return node
        return node

    out = []
    for cmd in commands:
        op = cmd[0]
        if op == "mkdir":
            walk(cmd[1], create=True)
        elif op == "addFile":
            segs = [p for p in cmd[1].split("/") if p]
            parent = root
            for seg in segs[:-1]:
                parent = parent.setdefault(seg, {})
            parent[segs[-1]] = cmd[2]
        elif op == "ls":
            node = walk(cmd[1])
            segs = [p for p in cmd[1].split("/") if p]
            if isinstance(node, str):
                out.append([segs[-1]])
            else:
                out.append(sorted(node.keys()))
        elif op == "cat":
            out.append(walk(cmd[1]))
        elif op == "rm":
            segs = [p for p in cmd[1].split("/") if p]
            parent = root
            for seg in segs[:-1]:
                parent = parent[seg]
            parent.pop(segs[-1], None)
    return out
`,
  visibleTests: [
    {
      name: "make list cat",
      args: [[
        ["mkdir", "/a/b"],
        ["addFile", "/a/b/f.txt", "hi"],
        ["ls", "/a"],
        ["cat", "/a/b/f.txt"]
      ]],
      expected: [["b"], "hi"]
    },
    {
      name: "list root",
      args: [[
        ["mkdir", "/x"],
        ["mkdir", "/y"],
        ["ls", "/"]
      ]],
      expected: [["x", "y"]]
    },
    {
      name: "no read commands",
      args: [[["mkdir", "/a"], ["addFile", "/a/f", "z"]]],
      expected: []
    }
  ],
  hiddenTests: [
    {
      name: "rm removes subtree",
      args: [[
        ["mkdir", "/a/b"],
        ["addFile", "/a/b/f", "z"],
        ["rm", "/a/b"],
        ["ls", "/a"]
      ]],
      expected: [[]]
    },
    {
      name: "addFile overwrites",
      args: [[
        ["addFile", "/a/f", "1"],
        ["addFile", "/a/f", "2"],
        ["cat", "/a/f"]
      ]],
      expected: ["2"]
    },
    {
      name: "ls on a file returns basename",
      args: [[
        ["addFile", "/a/f", "x"],
        ["ls", "/a/f"]
      ]],
      expected: [["f"]]
    },
    {
      name: "ls sorts dirs and files together",
      args: [[
        ["addFile", "/a/zeta", "1"],
        ["mkdir", "/a/alpha"],
        ["addFile", "/a/mid", "2"],
        ["ls", "/a"]
      ]],
      expected: [["alpha", "mid", "zeta"]]
    },
    {
      name: "addFile creates parents",
      args: [[
        ["addFile", "/p/q/r.txt", "data"],
        ["cat", "/p/q/r.txt"]
      ]],
      expected: ["data"]
    },
    {
      name: "remove then recreate",
      args: [[
        ["addFile", "/a/f", "old"],
        ["rm", "/a/f"],
        ["addFile", "/a/f", "new"],
        ["cat", "/a/f"]
      ]],
      expected: ["new"]
    }
  ],
  hints: [
    "Represent the tree as nested dicts. One clean option: a file is a string value and a directory is a dict of children.",
    "Write one path-resolution helper that walks segments from the root, optionally creating missing directories — every command can lean on it.",
    "For rm, resolve the parent directory and delete the last segment from it; for ls on a file, return a one-element list of the basename."
  ],
  solution:
    "Model the filesystem as a tree of nested dicts where a directory maps names to child nodes and a file is a leaf holding its content. A single resolve(path, create) helper splits the path on '/', drops empty segments, and walks (optionally creating) directories. mkdir resolves with create=True; addFile resolves the parent with create=True and stores the file; ls returns sorted child names (or the basename for a file); cat returns leaf content; rm resolves the parent and deletes the final segment. Outputs from ls/cat are appended to a result list in order.",
  walkthrough:
    "The whole problem collapses once you commit to one representation and one traversal helper. Auto-creating parents is just 'create=True' threaded through the same walk. The only special cases are ls on a file (return the basename) and rm (operate on the parent, not the node itself), and both are one line each. This is the core skill the exercise probes: pick a representation, centralize traversal, and let each command be a thin shell over it.",
  followUps: [
    "How would you add a `mv` command that moves a file or directory to a new path?",
    "How would you support relative paths and a `cd` command that tracks a current working directory?"
  ],
  complexity: { time: "O(total path length across all commands)", space: "O(number of nodes in the tree)" }
});

export const systemDesignProblems = [versionedKv, miniFilesystem];
