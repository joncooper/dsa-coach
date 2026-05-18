import { setProblem } from "./_shared";

const flattenConfig = setProblem({
  id: "tek-flatten-config",
  title: "Flatten a Nested Config",
  difficulty: "easy",
  patterns: ["recursion", "tree traversal", "dict manipulation"],
  entrypoint: "flatten_config",
  prompt:
    "You are given a configuration as a nested dict. A value is either another dict (a subtree) or a scalar leaf (string, number, or boolean). Return a flat dict whose keys are the dot-joined paths from the root to each scalar leaf, mapping to that leaf's value. Keys never contain dots. An empty dict — including a nested empty dict — contributes no entries, so a config that has only empty subtrees flattens to an empty dict.",
  constraints: [
    "Every value is either a dict or a scalar leaf.",
    "Keys are non-empty strings that do not contain a dot.",
    "Nesting can be deep but stays well within Python's default recursion limit.",
    "An empty dict produces no flattened entries.",
    "Leaf order in the output does not matter."
  ],
  examples: [
    {
      name: "one level of nesting",
      args: [{ a: { b: 1, c: 2 }, d: 3 }],
      expected: { "a.b": 1, "a.c": 2, d: 3 }
    }
  ],
  starterCode:
    "def flatten_config(config):\n" +
    "    # Walk the tree, building a dotted path down to each scalar leaf.\n" +
    "    pass\n",
  referenceCode: `def flatten_config(config):
    out = {}

    def walk(node, prefix):
        for key, value in node.items():
            path = prefix + "." + key if prefix else key
            if isinstance(value, dict):
                walk(value, path)
            else:
                out[path] = value

    walk(config, "")
    return out
`,
  solutionCode: `def flatten_config(config):
    flat = {}
    stack = [("", config)]
    while stack:
        prefix, node = stack.pop()
        for key, value in node.items():
            path = key if not prefix else prefix + "." + key
            if isinstance(value, dict):
                stack.append((path, value))
            else:
                flat[path] = value
    return flat
`,
  visibleTests: [
    { name: "empty config", args: [{}], expected: {} },
    {
      name: "one level of nesting",
      args: [{ a: { b: 1, c: 2 }, d: 3 }],
      expected: { "a.b": 1, "a.c": 2, d: 3 }
    },
    {
      name: "flat already",
      args: [{ x: 1, y: 2 }],
      expected: { x: 1, y: 2 }
    }
  ],
  hiddenTests: [
    {
      name: "deeply nested single leaf",
      args: [{ a: { b: { c: 42 } } }],
      expected: { "a.b.c": 42 }
    },
    {
      name: "nested empty dict contributes nothing",
      args: [{ a: {}, b: { c: {} } }],
      expected: {}
    },
    {
      name: "mixed scalar types",
      args: [{ name: "app", db: { host: "local", port: 5432 }, debug: true }],
      expected: { name: "app", "db.host": "local", "db.port": 5432, debug: true }
    },
    {
      name: "siblings at multiple depths",
      args: [{ a: 1, b: { c: 2, d: { e: 3 } }, f: 4 }],
      expected: { a: 1, "b.c": 2, "b.d.e": 3, f: 4 }
    },
    {
      name: "only empty subtrees",
      args: [{ a: { b: {} }, c: {} }],
      expected: {}
    }
  ],
  hints: [
    "Recurse with an accumulated prefix string; append the current key joined by a dot, but only add the dot when the prefix is non-empty.",
    "The base case is implicit: when you hit a non-dict value, write prefix -> value into the result.",
    "An empty dict naturally yields nothing because the for-loop over its items never runs."
  ],
  solution:
    "Do a depth-first walk carrying the dotted path built so far. For each key, extend the path (joining with a dot only when there is already a prefix). If the value is a dict, recurse into it with the extended path; otherwise it is a leaf, so record path -> value. Empty dicts add nothing because iterating their items produces no keys.",
  walkthrough:
    "The shape of the data dictates the shape of the code: nested dicts call for recursion, and the only state you need to thread down is the path prefix. The empty-dict edge case is not a special case at all — it is handled for free by the loop simply not executing, which is the kind of thing that separates a clean solution from one littered with guards.",
  followUps: [
    "How would you handle lists in the config, e.g. flattening `items` to `items.0`, `items.1`?",
    "How would you guard against a key that itself contains a dot so the flattening stays reversible?"
  ],
  complexity: { time: "O(n) over all keys in the tree", space: "O(d) recursion depth d, plus the output" },
  parts: [
    {
      id: "part-2-unflatten",
      title: "Part 2: Rebuild the nested config",
      prompt:
        "Write the reconstruction. Given a flat dict whose keys are dot-joined paths mapping to scalar values, rebuild the nested dict. Every intermediate path segment becomes a nested dict. This recovers the scalar leaves only — flattening discards empty subtrees, so it is the inverse of `flatten_config` for any config without empty subtrees. You may assume the flat keys are consistent (no key is a strict prefix of another) and every path segment is a non-empty string containing no dot, so the result is unambiguous.",
      entrypoint: "unflatten_config",
      starterCode:
        "def unflatten_config(flat):\n" +
        "    # Split each dotted key and walk/create nested dicts down to the leaf.\n" +
        "    pass\n",
      referenceCode: `def unflatten_config(flat):
    root = {}
    for path, value in flat.items():
        segments = path.split(".")
        node = root
        for seg in segments[:-1]:
            node = node.setdefault(seg, {})
        node[segments[-1]] = value
    return root
`,
      solutionCode: `def unflatten_config(flat):
    root = {}
    for path, value in flat.items():
        parts = path.split(".")
        cursor = root
        for part in parts[:-1]:
            if part not in cursor:
                cursor[part] = {}
            cursor = cursor[part]
        cursor[parts[-1]] = value
    return root
`,
      visibleTests: [
        { name: "empty flat", args: [{}], expected: {} },
        {
          name: "one level",
          args: [{ "a.b": 1, "a.c": 2, d: 3 }],
          expected: { a: { b: 1, c: 2 }, d: 3 }
        }
      ],
      hiddenTests: [
        {
          name: "deep single key",
          args: [{ "a.b.c": 42 }],
          expected: { a: { b: { c: 42 } } }
        },
        {
          name: "already flat",
          args: [{ x: 1 }],
          expected: { x: 1 }
        },
        {
          name: "mixed depths and types",
          args: [{ name: "app", "db.host": "local", "db.port": 5432 }],
          expected: { name: "app", db: { host: "local", port: 5432 } }
        }
      ],
      hints: [
        "Split each key on the dot to get the chain of segments down to the leaf.",
        "Walk every segment except the last, creating an empty dict for any segment that is not present yet.",
        "Assign the value at the final segment of the path."
      ],
      solution:
        "For each flat entry, split its key into segments. Walk a cursor from the root through all but the last segment, creating a fresh dict for any missing segment, then assign the value at the final segment. This rebuilds exactly the tree that Part 1 would have flattened.",
      walkthrough:
        "Unflattening is just flattening read backwards: instead of accumulating a path you consume one. `setdefault` is the whole trick — it gives you 'descend, creating the directory if needed' in a single call, which is the iterative mirror of the recursive descent from Part 1.",
      complexity: { time: "O(total segments across all keys)", space: "O(size of the rebuilt tree)" }
    }
  ]
});

export const recursionProblems = [flattenConfig];
