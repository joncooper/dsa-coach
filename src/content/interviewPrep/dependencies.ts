import { setProblem } from "./_shared";

const taskOrder = setProblem({
  id: "tek-task-order",
  title: "Resolve a Task Run Order",
  difficulty: "medium",
  patterns: ["topological sort", "cycle detection", "graph"],
  entrypoint: "task_order",
  prompt:
    "You are given a dict mapping each task name to a list of tasks that must run before it (its prerequisites). Some tasks appear only as a prerequisite and never as a top-level key; they are still real tasks that must run. Return a list giving a valid run order: every task appears exactly once and only after all of its prerequisites. Any valid ordering is accepted (the grader checks the ordering, not one specific permutation). If the prerequisites contain a cycle and no valid order exists, return None.",
  constraints: [
    "Keys and prerequisite entries are task-name strings.",
    "A task with no prerequisites maps to an empty list.",
    "Tasks that appear only as a prerequisite are still scheduled.",
    "Each prerequisite list contains distinct task names (no duplicates).",
    "Any topologically valid ordering is accepted; you do not need a specific tie-break.",
    "Return None when a cycle makes a full ordering impossible."
  ],
  examples: [
    {
      name: "linear chain",
      args: [{ c: ["b"], b: ["a"], a: [] }],
      expected: ["a", "b", "c"]
    }
  ],
  starterCode:
    "def task_order(deps):\n" +
    "    # Kahn's algorithm (BFS over zero-in-degree tasks); None on a cycle.\n" +
    "    pass\n",
  referenceCode: `import heapq

def task_order(deps):
    adj = {}
    indegree = {}

    def ensure(task):
        adj.setdefault(task, [])
        indegree.setdefault(task, 0)

    for task, prereqs in deps.items():
        ensure(task)
        for p in prereqs:
            ensure(p)
            adj[p].append(task)
            indegree[task] += 1

    ready = [t for t in indegree if indegree[t] == 0]
    heapq.heapify(ready)
    order = []
    while ready:
        task = heapq.heappop(ready)
        order.append(task)
        for nxt in adj[task]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                heapq.heappush(ready, nxt)

    return order if len(order) == len(indegree) else None
`,
  solutionCode: `import heapq

def task_order(deps):
    edges = {}
    incoming = {}
    nodes = set()
    for task, prereqs in deps.items():
        nodes.add(task)
        edges.setdefault(task, [])
        incoming.setdefault(task, 0)
        for p in prereqs:
            nodes.add(p)
            edges.setdefault(p, [])
            incoming.setdefault(p, 0)
            edges[p].append(task)
            incoming[task] = incoming.get(task, 0) + 1

    heap = sorted(n for n in nodes if incoming.get(n, 0) == 0)
    heapq.heapify(heap)
    result = []
    while heap:
        cur = heapq.heappop(heap)
        result.append(cur)
        for nb in edges[cur]:
            incoming[nb] -= 1
            if incoming[nb] == 0:
                heapq.heappush(heap, nb)

    if len(result) != len(nodes):
        return None
    return result
`,
  visibleTests: [
    { name: "empty graph", args: [{}], expected: [], validator: "topological" },
    {
      name: "linear chain",
      args: [{ c: ["b"], b: ["a"], a: [] }],
      expected: ["a", "b", "c"],
      validator: "topological"
    },
    {
      name: "simple cycle returns None",
      args: [{ a: ["b"], b: ["a"] }],
      expected: null,
      validator: "topological"
    }
  ],
  hiddenTests: [
    {
      name: "single task no prereqs",
      args: [{ a: [] }],
      expected: ["a"],
      validator: "topological"
    },
    {
      name: "all roots in any order",
      args: [{ b: [], a: [], c: [] }],
      expected: ["a", "b", "c"],
      validator: "topological"
    },
    {
      name: "diamond ordering",
      args: [{ d: ["b", "c"], b: ["a"], c: ["a"], a: [] }],
      expected: ["a", "b", "c", "d"],
      validator: "topological"
    },
    {
      name: "prerequisite never a key",
      args: [{ build: ["compile"] }],
      expected: ["compile", "build"],
      validator: "topological"
    },
    {
      name: "self dependency is a cycle",
      args: [{ a: ["a"] }],
      expected: null,
      validator: "topological"
    },
    {
      name: "cycle with an innocent bystander",
      args: [{ x: [], a: ["b"], b: ["c"], c: ["a"] }],
      expected: null,
      validator: "topological"
    },
    {
      name: "shared prerequisite fans out",
      args: [{ a: [], b: ["a"], c: ["a"] }],
      expected: ["a", "b", "c"],
      validator: "topological"
    },
    {
      name: "wide graph many valid orders",
      args: [{ a: [], b: [], c: ["a", "b"], d: ["c"], e: ["c"] }],
      expected: ["a", "b", "c", "d", "e"],
      validator: "topological"
    }
  ],
  hints: [
    "Compute an in-degree (number of unmet prerequisites) for every task, remembering to register tasks that only ever appear inside a prerequisite list.",
    "Repeatedly take any task whose in-degree is zero (a plain queue is fine), append it, and decrement its dependents; push each one that reaches zero.",
    "If you finish and the produced order is shorter than the number of tasks, some tasks never reached in-degree zero — that is the cycle case, so return None."
  ],
  solution:
    "Run Kahn's algorithm. Build an adjacency list prerequisite -> dependents and an in-degree count per task, making sure tasks that appear only as prerequisites are also registered. Seed a queue with every zero-in-degree task. Repeatedly take one, append it to the order, and decrement each dependent's in-degree, enqueuing any that reach zero. If the final order does not contain every task, the graph had a cycle, so return None. Any order the algorithm produces is valid; the grader checks the ordering, so no particular tie-break is required.",
  walkthrough:
    "The key realization is that there can be many correct answers: any order that respects every prerequisite is valid, which is why the grader validates the ordering instead of comparing against one fixed list. A plain FIFO queue is enough; a heap would only matter if you wanted a deterministic tie-break for other reasons. Cycle detection is not a separate pass — it falls out of the count: a cycle means some tasks never hit in-degree zero, so the emitted order is short, which is the single check at the end.",
  followUps: [
    "How would you instead return the actual set of tasks involved in a cycle for a useful error message?",
    "How would you group the output into 'waves' of tasks that can run in parallel?"
  ],
  complexity: { time: "O((V + E) log V) with the heap", space: "O(V + E)" }
});

export const dependenciesProblems = [taskOrder];
