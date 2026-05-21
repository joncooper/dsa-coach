import type { BonusSeed } from "./types";

/**
 * Trees & Graphs bonus problems. Concepts: DFS, BFS, tree recursion,
 * topological order, connected components. Roughly half binary-tree
 * problems (adapter "binary-tree") and half graph/grid problems on plain
 * adjacency dicts, edge lists, and grids. Each solution is a structurally
 * distinct traversal — distinct from the guided set and from each other.
 */
export const bonus: BonusSeed[] = [
  {
    id: "trees-graphs-bonus-01",
    chapterId: "trees-graphs",
    title: "Sum Of Tree Values",
    difficulty: "warmup",
    patterns: ["trees-graphs", "tree recursion", "DFS"],
    entrypoint: "tree_value_sum",
    signature: "root",
    adapter: "binary-tree",
    prompt:
      "Given the root of a binary tree, return the sum of the values stored in every node of the tree.",
    constraints: [
      "The tree may be empty; the sum is then zero.",
      "Node values may be negative.",
      "Every node contributes exactly once."
    ],
    hints: [
      "The sum of a tree is its root value plus the sums of its two subtrees.",
      "An empty subtree contributes a sum of zero — that is the base case."
    ],
    solution:
      "Recurse over the tree: the sum is the current node's value plus the recursive sums of its left and right children, with an empty node returning zero.",
    walkthrough:
      "Each node is visited once and adds its own value to the totals returned by its children. The empty-node base case stops the recursion and contributes nothing, so the values combine cleanly up to the root.",
    followUps: [
      "How would you instead return the sum of values stored only at leaf nodes?",
      "Could you compute this iteratively with an explicit stack?"
    ],
    code: `def tree_value_sum(root):
    if root is None:
        return 0
    return root.val + tree_value_sum(root.left) + tree_value_sum(root.right)
`,
    visibleTests: [
      { name: "balanced tree", args: [[5, 4, 8, 11, null, 13, 4]], expected: 45 },
      { name: "single node", args: [[7]], expected: 7 }
    ],
    hiddenTests: [
      { name: "empty tree", args: [[]], expected: 0 },
      { name: "all negative", args: [[-2, -1, -3]], expected: -6 },
      { name: "left chain", args: [[1, 2, null, 3]], expected: 6 },
      { name: "mixed signs", args: [[0, -5, 5, 10]], expected: 10 },
      { name: "zeros", args: [[0, 0, 0]], expected: 0 }
    ],
    time: "O(n)",
    space: "O(h)"
  },
  {
    id: "trees-graphs-bonus-02",
    chapterId: "trees-graphs",
    title: "Count Tree Nodes",
    difficulty: "warmup",
    patterns: ["trees-graphs", "BFS", "level-order traversal"],
    entrypoint: "count_tree_nodes",
    signature: "root",
    adapter: "binary-tree",
    prompt:
      "Given the root of a binary tree, return the total number of nodes it contains. Solve it iteratively with a breadth-first traversal.",
    constraints: [
      "An empty tree has zero nodes.",
      "Use a queue rather than recursion.",
      "Each node is counted exactly once."
    ],
    hints: [
      "Push the root onto a queue, then repeatedly pop a node and enqueue its children.",
      "Increment a counter every time you pop a node from the queue."
    ],
    solution:
      "Run a breadth-first traversal from the root using a queue. Each time a node is dequeued, count it and enqueue any children, until the queue empties.",
    walkthrough:
      "The queue holds the frontier of nodes still to process. Every real node enters and leaves the queue exactly once, so the number of pops equals the node count. An empty tree never enqueues anything and the count stays zero.",
    followUps: [
      "How would the traversal change if you wanted the count at each depth?",
      "What is the maximum number of nodes the queue can hold at once?"
    ],
    code: `def count_tree_nodes(root):
    if root is None:
        return 0
    count = 0
    queue = deque([root])
    while queue:
        node = queue.popleft()
        count += 1
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return count
`,
    visibleTests: [
      { name: "five nodes", args: [[1, 2, 3, 4, 5]], expected: 5 },
      { name: "single node", args: [[7]], expected: 1 }
    ],
    hiddenTests: [
      { name: "empty tree", args: [[]], expected: 0 },
      { name: "left chain", args: [[1, 2, null, 3, null]], expected: 3 },
      { name: "right chain", args: [[1, null, 2, null, 3]], expected: 3 },
      { name: "full three levels", args: [[1, 2, 3, 4, 5, 6, 7]], expected: 7 },
      { name: "two nodes", args: [[8, 9]], expected: 2 }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "trees-graphs-bonus-03",
    chapterId: "trees-graphs",
    title: "Minimum Value In Tree",
    difficulty: "easy",
    patterns: ["trees-graphs", "tree recursion", "DFS"],
    entrypoint: "tree_minimum",
    signature: "root",
    adapter: "binary-tree",
    prompt:
      "Given the root of a binary tree, return the smallest value stored anywhere in the tree. Return None if the tree is empty. The tree is not a binary search tree, so values are unordered.",
    constraints: [
      "Return None for an empty tree.",
      "Values may be negative and may repeat.",
      "Do not assume any ordering between a node and its children."
    ],
    hints: [
      "The minimum of a tree is the smallest of the root value and the minimums of its subtrees.",
      "Skip an empty child — it has no value to compare, so treat its result as absent."
    ],
    solution:
      "Recurse over the tree, starting each node's answer at its own value and lowering it with the recursive minimum of any non-empty child.",
    walkthrough:
      "Because the tree is unordered, the smallest value can sit anywhere, so every node must be inspected. Each call begins with the node's own value and folds in whatever its children report, ignoring empty children that return None.",
    followUps: [
      "How would you return both the minimum and maximum in a single traversal?",
      "If the tree were a binary search tree, which single path would you follow instead?"
    ],
    code: `def tree_minimum(root):
    if root is None:
        return None
    best = root.val
    for child in (root.left, root.right):
        sub = tree_minimum(child)
        if sub is not None and sub < best:
            best = sub
    return best
`,
    visibleTests: [
      { name: "minimum in subtree", args: [[5, 3, 8, 1, 4]], expected: 1 },
      { name: "single node", args: [[42]], expected: 42 }
    ],
    hiddenTests: [
      { name: "empty tree", args: [[]], expected: null },
      { name: "negative deep", args: [[0, -7, 2, null, null, -3, 9]], expected: -7 },
      { name: "root is smallest", args: [[1, 2, 3]], expected: 1 },
      { name: "repeated minimum", args: [[4, 4, 5, 4]], expected: 4 },
      { name: "all negative", args: [[-1, -2, -3]], expected: -3 }
    ],
    time: "O(n)",
    space: "O(h)"
  },
  {
    id: "trees-graphs-bonus-04",
    chapterId: "trees-graphs",
    title: "Diameter Of Binary Tree",
    difficulty: "medium",
    patterns: ["trees-graphs", "tree recursion", "DFS"],
    entrypoint: "tree_diameter",
    signature: "root",
    adapter: "binary-tree",
    prompt:
      "Given the root of a binary tree, return its diameter: the number of edges on the longest path between any two nodes. The path may or may not pass through the root.",
    constraints: [
      "The diameter is measured in edges, not nodes.",
      "An empty tree and a single-node tree both have diameter zero.",
      "The longest path need not include the root."
    ],
    hints: [
      "The longest path bending at a node uses the heights of that node's two subtrees.",
      "Have the recursion return a subtree's height while it separately tracks the best path seen."
    ],
    solution:
      "Recurse to compute each node's height. At every node the longest path bending there is the sum of its two subtree heights; keep the maximum of those across all nodes while returning one plus the taller subtree as the height.",
    walkthrough:
      "Every path has a single highest node where it bends. At that node the path length equals the left height plus the right height in edges. Computing heights bottom-up lets each node update one shared best value, so a single traversal inspects every possible bend point.",
    followUps: [
      "How would you also return the two endpoint nodes of the longest path?",
      "Why does returning the height let the caller avoid recomputing subtree sizes?"
    ],
    code: `def tree_diameter(root):
    best = 0
    def height(node):
        nonlocal best
        if node is None:
            return 0
        left = height(node.left)
        right = height(node.right)
        best = max(best, left + right)
        return 1 + max(left, right)
    height(root)
    return best
`,
    visibleTests: [
      { name: "path through root", args: [[1, 2, 3, 4, 5]], expected: 3 },
      { name: "single node", args: [[1]], expected: 0 }
    ],
    hiddenTests: [
      { name: "empty tree", args: [[]], expected: 0 },
      { name: "two nodes", args: [[1, 2]], expected: 1 },
      { name: "left chain", args: [[1, 2, null, 3, null, 4]], expected: 3 },
      { name: "full three levels", args: [[1, 2, 3, 4, 5, 6, 7]], expected: 4 },
      { name: "path off to one side", args: [[1, 2, 3, 4, null, null, 5]], expected: 4 }
    ],
    time: "O(n)",
    space: "O(h)"
  },
  {
    id: "trees-graphs-bonus-05",
    chapterId: "trees-graphs",
    title: "Binary Tree Right Side View",
    difficulty: "medium",
    patterns: ["trees-graphs", "BFS", "level-order traversal"],
    entrypoint: "right_side_view",
    signature: "root",
    adapter: "binary-tree",
    prompt:
      "Given the root of a binary tree, imagine standing to its right. Return the values of the nodes you can see, ordered from top to bottom — that is, the last node at each depth.",
    constraints: [
      "Return an empty list for an empty tree.",
      "Exactly one value is reported per depth.",
      "A visible node may be a left child if it is the rightmost at its depth."
    ],
    hints: [
      "Traverse level by level, processing one full depth before the next.",
      "Within a level, the node you can see from the right is the last one in left-to-right order."
    ],
    solution:
      "Run a breadth-first traversal that processes one depth at a time. For each level, record the value of the last node visited before moving on.",
    walkthrough:
      "Capturing the queue's size at the start of a level fixes exactly the nodes at that depth. Iterating through them left to right and keeping the final one yields the rightmost visible node, and children enqueued during the level form the next depth.",
    followUps: [
      "How would you produce the left side view instead?",
      "Could you solve this with a depth-first traversal that visits the right child first?"
    ],
    code: `def right_side_view(root):
    if root is None:
        return []
    view = []
    queue = deque([root])
    while queue:
        size = len(queue)
        for i in range(size):
            node = queue.popleft()
            if i == size - 1:
                view.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return view
`,
    visibleTests: [
      { name: "mixed shape", args: [[1, 2, 3, null, 5, null, 4]], expected: [1, 3, 4] },
      { name: "single node", args: [[9]], expected: [9] }
    ],
    hiddenTests: [
      { name: "empty tree", args: [[]], expected: [] },
      { name: "left chain only", args: [[1, 2, null, 3]], expected: [1, 2, 3] },
      { name: "right chain only", args: [[1, null, 2, null, 3]], expected: [1, 2, 3] },
      { name: "full tree", args: [[1, 2, 3, 4, 5, 6, 7]], expected: [1, 3, 7] },
      { name: "deep left visible", args: [[1, 2, 3, 4]], expected: [1, 3, 4] }
    ],
    time: "O(n)",
    space: "O(n)"
  },
  {
    id: "trees-graphs-bonus-06",
    chapterId: "trees-graphs",
    title: "Count Leaf Nodes",
    difficulty: "easy",
    patterns: ["trees-graphs", "tree recursion", "DFS"],
    entrypoint: "count_leaves",
    signature: "root",
    adapter: "binary-tree",
    prompt:
      "Given the root of a binary tree, return the number of leaf nodes — nodes that have no left child and no right child.",
    constraints: [
      "An empty tree has zero leaves.",
      "A single-node tree has exactly one leaf.",
      "A node with one child is not a leaf."
    ],
    hints: [
      "A node is a leaf only when both of its children are absent.",
      "Otherwise the leaf count is the sum of the leaf counts of its two subtrees."
    ],
    solution:
      "Recurse over the tree: an empty node returns zero, a node with no children returns one, and any other node returns the sum of its subtrees' leaf counts.",
    walkthrough:
      "The recursion distinguishes three cases per call. The leaf test, both children absent, is what separates this from a plain node count: internal nodes contribute nothing themselves and simply pass up the totals of their children.",
    followUps: [
      "How would you count internal (non-leaf) nodes instead?",
      "How would you collect the depth of every leaf rather than just the count?"
    ],
    code: `def count_leaves(root):
    if root is None:
        return 0
    if root.left is None and root.right is None:
        return 1
    return count_leaves(root.left) + count_leaves(root.right)
`,
    visibleTests: [
      { name: "three leaves", args: [[1, 2, 3, 4, 5, null, 6]], expected: 3 },
      { name: "single node", args: [[9]], expected: 1 }
    ],
    hiddenTests: [
      { name: "empty tree", args: [[]], expected: 0 },
      { name: "left chain one leaf", args: [[1, 2, null, 3]], expected: 1 },
      { name: "full tree", args: [[1, 2, 3, 4, 5, 6, 7]], expected: 4 },
      { name: "one child not leaf", args: [[1, 2, 3, null, null, 4]], expected: 2 },
      { name: "two leaves", args: [[1, 2, 3]], expected: 2 }
    ],
    time: "O(n)",
    space: "O(h)"
  },
  {
    id: "trees-graphs-bonus-07",
    chapterId: "trees-graphs",
    title: "Symmetric Binary Tree",
    difficulty: "medium",
    patterns: ["trees-graphs", "tree recursion", "DFS"],
    entrypoint: "is_symmetric",
    signature: "root",
    adapter: "binary-tree",
    prompt:
      "Given the root of a binary tree, return True if the tree is a mirror image of itself around its center, and False otherwise. Both structure and values must match in mirrored positions.",
    constraints: [
      "An empty tree is symmetric.",
      "A single node is symmetric.",
      "Both the shape and the node values must mirror."
    ],
    hints: [
      "Symmetry compares the left subtree against the right subtree, not a subtree against itself.",
      "When comparing two nodes, the left child of one must mirror the right child of the other."
    ],
    solution:
      "Use a helper that compares two subtrees for mirror equality: their values must be equal, and the outer pair and inner pair of children must each mirror. Apply it to the root's two subtrees.",
    walkthrough:
      "The mirror check pairs nodes in reflected positions: a node's left child is matched with the other node's right child. Both being empty is a match, exactly one being empty or a value mismatch is a failure, and the recursion drives the comparison down both halves at once.",
    followUps: [
      "How would you decide whether two separate trees are identical?",
      "Could you check symmetry with a breadth-first traversal instead of recursion?"
    ],
    code: `def is_symmetric(root):
    def mirror(a, b):
        if a is None and b is None:
            return True
        if a is None or b is None or a.val != b.val:
            return False
        return mirror(a.left, b.right) and mirror(a.right, b.left)
    if root is None:
        return True
    return mirror(root.left, root.right)
`,
    visibleTests: [
      { name: "symmetric tree", args: [[1, 2, 2, 3, 4, 4, 3]], expected: true },
      { name: "values break symmetry", args: [[1, 2, 2, null, 3, null, 3]], expected: false }
    ],
    hiddenTests: [
      { name: "empty tree", args: [[]], expected: true },
      { name: "single node", args: [[1]], expected: true },
      { name: "shape mismatch", args: [[1, 2, 2, 3, null, 3, null]], expected: false },
      { name: "value mismatch deep", args: [[1, 2, 2, 3, 4, 4, 5]], expected: false },
      { name: "two equal children", args: [[1, 2, 2]], expected: true }
    ],
    time: "O(n)",
    space: "O(h)"
  },
  {
    id: "trees-graphs-bonus-08",
    chapterId: "trees-graphs",
    title: "Flood Fill A Grid",
    difficulty: "easy",
    patterns: ["trees-graphs", "DFS", "connected components"],
    entrypoint: "flood_fill",
    signature: "grid, sr, sc, new_color",
    prompt:
      "You are given a 2-D grid of integer colors and a starting cell (sr, sc). Recolor the starting cell and every cell connected to it through up, down, left, or right moves that shares its original color, then return the grid.",
    constraints: [
      "Only the four orthogonal directions connect cells; diagonals do not.",
      "If the starting cell already holds the new color, return the grid unchanged.",
      "The grid has at least one row and one column."
    ],
    hints: [
      "Record the starting cell's original color before you change anything.",
      "Run a depth-first search that recolors a cell and recurses into the four neighbours sharing the original color."
    ],
    solution:
      "Read the starting color; if it already equals the target, return immediately. Otherwise run a depth-first search that recolors each matching cell and recurses to its four neighbours.",
    walkthrough:
      "The flood is one connected region of equal color. Recoloring a cell as it is visited doubles as the visited mark, so cells are not revisited. The early return guards against infinite recursion when the new color equals the original.",
    followUps: [
      "How would you adapt this to also count how many cells were recolored?",
      "What goes wrong if you skip the check for the new color matching the original?"
    ],
    code: `def flood_fill(grid, sr, sc, new_color):
    if not grid:
        return grid
    rows, cols = len(grid), len(grid[0])
    start_color = grid[sr][sc]
    if start_color == new_color:
        return grid
    def fill(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return
        if grid[r][c] != start_color:
            return
        grid[r][c] = new_color
        fill(r + 1, c)
        fill(r - 1, c)
        fill(r, c + 1)
        fill(r, c - 1)
    fill(sr, sc)
    return grid
`,
    visibleTests: [
      {
        name: "fill corner region",
        args: [[[1, 1, 0], [1, 0, 0], [0, 0, 1]], 0, 0, 9],
        expected: [[9, 9, 0], [9, 0, 0], [0, 0, 1]]
      },
      { name: "single cell", args: [[[0]], 0, 0, 3], expected: [[3]] }
    ],
    hiddenTests: [
      { name: "new color equals old", args: [[[5, 5], [5, 5]], 0, 0, 5], expected: [[5, 5], [5, 5]] },
      { name: "isolated cell only", args: [[[1, 0, 1]], 0, 2, 7], expected: [[1, 0, 7]] },
      {
        name: "whole grid one region",
        args: [[[2, 2], [2, 2]], 1, 1, 8],
        expected: [[8, 8], [8, 8]]
      },
      {
        name: "diagonal does not connect",
        args: [[[1, 0], [0, 1]], 0, 0, 4],
        expected: [[4, 0], [0, 1]]
      },
      {
        name: "fill from middle",
        args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]], 0, 0, 6],
        expected: [[6, 6, 6], [6, 1, 6], [6, 6, 6]]
      }
    ],
    time: "O(r*c)",
    space: "O(r*c)"
  },
  {
    id: "trees-graphs-bonus-09",
    chapterId: "trees-graphs",
    title: "Island Perimeter",
    difficulty: "medium",
    patterns: ["trees-graphs", "grid scan", "DFS"],
    entrypoint: "island_perimeter",
    signature: "grid",
    prompt:
      "You are given a grid of 0s (water) and 1s (land) that contains exactly one island — a group of land cells connected horizontally or vertically. Return the perimeter of that island: the total length of its boundary edges.",
    constraints: [
      "Land cells hold 1 and water cells hold 0.",
      "Each land cell has four unit-length sides.",
      "There is at most one island and it has no internal lakes."
    ],
    hints: [
      "Each land cell starts with four boundary edges.",
      "Every shared edge between two adjacent land cells removes two edges from the total — one from each cell."
    ],
    solution:
      "Scan every cell once. For each land cell add four to the perimeter, then subtract two for each land neighbour above or to the left, since that shared edge is counted by both cells.",
    walkthrough:
      "A land cell exposes four sides until a neighbour covers one. Checking only the upper and left neighbours counts every adjacency exactly once across the whole scan, and subtracting two per shared edge removes the contribution from both touching cells.",
    followUps: [
      "How would the approach change if the grid could contain several islands?",
      "Could you compute the perimeter with a depth-first search instead of a scan?"
    ],
    code: `def island_perimeter(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    perimeter = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != 1:
                continue
            perimeter += 4
            if r > 0 and grid[r - 1][c] == 1:
                perimeter -= 2
            if c > 0 and grid[r][c - 1] == 1:
                perimeter -= 2
    return perimeter
`,
    visibleTests: [
      {
        name: "irregular island",
        args: [[[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]]],
        expected: 16
      },
      { name: "single land cell", args: [[[1]]], expected: 4 }
    ],
    hiddenTests: [
      { name: "no land", args: [[[0, 0], [0, 0]]], expected: 0 },
      { name: "two by two block", args: [[[1, 1], [1, 1]]], expected: 8 },
      { name: "horizontal strip", args: [[[1, 1, 1]]], expected: 8 },
      { name: "vertical strip", args: [[[1], [1], [1]]], expected: 8 },
      { name: "plus shape", args: [[[0, 1, 0], [1, 1, 1], [0, 1, 0]]], expected: 12 }
    ],
    time: "O(r*c)",
    space: "O(1)"
  },
  {
    id: "trees-graphs-bonus-10",
    chapterId: "trees-graphs",
    title: "Route Between Two Nodes",
    difficulty: "easy",
    patterns: ["trees-graphs", "DFS", "graph traversal"],
    entrypoint: "has_route",
    signature: "graph, source, target",
    prompt:
      "You are given a directed graph as an adjacency dictionary mapping each node name to a list of node names it points to. Return True if there is a path from the source node to the target node, following edge directions, and False otherwise.",
    constraints: [
      "Edges are directed; a path must follow their direction.",
      "A node is trivially reachable from itself.",
      "The graph may contain cycles."
    ],
    hints: [
      "Explore outward from the source with a depth-first search using an explicit stack.",
      "Track which nodes you have already pushed so a cycle cannot trap the search."
    ],
    solution:
      "Run an iterative depth-first search from the source with a stack and a visited set. Report success as soon as the target appears, and failure if the stack empties without finding it.",
    walkthrough:
      "The stack holds nodes discovered but not yet expanded. The visited set keeps each node from being pushed twice, which both bounds the work and prevents cycles from looping forever. Reaching the target means a directed path exists.",
    followUps: [
      "How would you also return the actual path, not just whether one exists?",
      "What changes if the graph is undirected instead of directed?"
    ],
    code: `def has_route(graph, source, target):
    if source == target:
        return True
    stack = [source]
    visited = {source}
    while stack:
        node = stack.pop()
        for neighbor in graph.get(node, []):
            if neighbor == target:
                return True
            if neighbor not in visited:
                visited.add(neighbor)
                stack.append(neighbor)
    return False
`,
    visibleTests: [
      {
        name: "path exists",
        args: [{ a: ["b", "c"], b: ["d"], c: ["d"], d: [] }, "a", "d"],
        expected: true
      },
      {
        name: "no path against direction",
        args: [{ a: ["b"], b: [], c: ["a"] }, "a", "c"],
        expected: false
      }
    ],
    hiddenTests: [
      { name: "source equals target", args: [{ a: [] }, "a", "a"], expected: true },
      { name: "direct edge", args: [{ a: ["b"], b: [] }, "a", "b"], expected: true },
      {
        name: "cycle does not trap",
        args: [{ a: ["b"], b: ["c"], c: ["a"] }, "a", "c"],
        expected: true
      },
      {
        name: "disconnected target",
        args: [{ a: ["b"], b: [], c: ["d"], d: [] }, "a", "d"],
        expected: false
      },
      {
        name: "longer chain",
        args: [{ a: ["b"], b: ["c"], c: ["d"], d: ["e"], e: [] }, "a", "e"],
        expected: true
      }
    ],
    time: "O(V+E)",
    space: "O(V)"
  },
  {
    id: "trees-graphs-bonus-11",
    chapterId: "trees-graphs",
    title: "Count Reachable Nodes",
    difficulty: "easy",
    patterns: ["trees-graphs", "BFS", "graph traversal"],
    entrypoint: "count_reachable",
    signature: "graph, source",
    prompt:
      "You are given a directed graph as an adjacency dictionary mapping each node name to a list of node names it points to. Return how many distinct nodes are reachable from the source node, including the source itself.",
    constraints: [
      "The source counts as reachable from itself.",
      "Each reachable node is counted only once.",
      "The graph may contain cycles."
    ],
    hints: [
      "Run a breadth-first search outward from the source.",
      "Mark a node the moment it is discovered, then count the marked nodes at the end."
    ],
    solution:
      "Run a breadth-first traversal from the source with a queue, marking each newly discovered node in a visited set. The size of that set is the count of reachable nodes.",
    walkthrough:
      "Every node that can be reached enters the visited set exactly once when first discovered. Marking on discovery rather than on processing prevents double counting and stops cycles from inflating the result, so the set's final size is the answer.",
    followUps: [
      "How would you find nodes that cannot be reached from the source?",
      "How could you report the distance from the source to each reachable node?"
    ],
    code: `def count_reachable(graph, source):
    visited = {source}
    queue = deque([source])
    while queue:
        node = queue.popleft()
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return len(visited)
`,
    visibleTests: [
      { name: "reaches all", args: [{ a: ["b", "c"], b: ["d"], c: [], d: [] }, "a"], expected: 4 },
      { name: "isolated source", args: [{ a: [], b: ["a"] }, "a"], expected: 1 }
    ],
    hiddenTests: [
      { name: "cycle counted once", args: [{ a: ["b"], b: ["c"], c: ["a"] }, "a"], expected: 3 },
      { name: "partial reach", args: [{ a: ["b"], b: [], c: ["d"], d: [] }, "a"], expected: 2 },
      { name: "self loop", args: [{ a: ["a"] }, "a"], expected: 1 },
      {
        name: "diamond shape",
        args: [{ a: ["b", "c"], b: ["d"], c: ["d"], d: [] }, "a"],
        expected: 4
      },
      { name: "start in middle", args: [{ a: ["b"], b: ["c"], c: [] }, "b"], expected: 2 }
    ],
    time: "O(V+E)",
    space: "O(V)"
  },
  {
    id: "trees-graphs-bonus-12",
    chapterId: "trees-graphs",
    title: "Detect Cycle In Directed Graph",
    difficulty: "medium",
    patterns: ["trees-graphs", "DFS", "cycle detection"],
    entrypoint: "has_cycle",
    signature: "graph",
    prompt:
      "You are given a directed graph as an adjacency dictionary mapping each node name to a list of node names it points to. Return True if the graph contains a directed cycle, and False otherwise.",
    constraints: [
      "The graph may have several disconnected pieces; check them all.",
      "A node that points to itself forms a cycle.",
      "An empty graph has no cycle."
    ],
    hints: [
      "Give each node one of three states: unvisited, in progress, or finished.",
      "Reaching an in-progress node during the search means an edge closes a cycle back onto the current path."
    ],
    solution:
      "Run a depth-first search that colors each node white, gray, or black. A node turns gray on entry and black on exit; an edge into a gray node means the search has looped back on its own path, revealing a cycle.",
    walkthrough:
      "Gray nodes are exactly the nodes on the current recursion path. An edge to a gray node is a back edge that closes a cycle, while an edge to a black node only revisits a finished branch. Starting a fresh search from every still-white node covers disconnected pieces.",
    followUps: [
      "How does this differ from cycle detection in an undirected graph?",
      "How would you report the nodes that make up a cycle once you find one?"
    ],
    code: `def has_cycle(graph):
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {node: WHITE for node in graph}
    def visit(node):
        color[node] = GRAY
        for neighbor in graph.get(node, []):
            state = color.get(neighbor, WHITE)
            if state == GRAY:
                return True
            if state == WHITE and visit(neighbor):
                return True
        color[node] = BLACK
        return False
    for node in graph:
        if color[node] == WHITE and visit(node):
            return True
    return False
`,
    visibleTests: [
      { name: "three node cycle", args: [{ a: ["b"], b: ["c"], c: ["a"] }], expected: true },
      { name: "acyclic chain", args: [{ a: ["b"], b: ["c"], c: [] }], expected: false }
    ],
    hiddenTests: [
      { name: "empty graph", args: [{}], expected: false },
      { name: "self loop", args: [{ a: ["a"] }], expected: true },
      {
        name: "acyclic diamond",
        args: [{ a: ["b", "c"], b: ["d"], c: ["d"], d: [] }],
        expected: false
      },
      {
        name: "cycle in second component",
        args: [{ a: ["b"], b: [], c: ["d"], d: ["c"] }],
        expected: true
      },
      {
        name: "long acyclic path",
        args: [{ a: ["b"], b: ["c"], c: ["d"], d: ["e"], e: [] }],
        expected: false
      }
    ],
    time: "O(V+E)",
    space: "O(V)"
  },
  {
    id: "trees-graphs-bonus-13",
    chapterId: "trees-graphs",
    title: "Shortest Path Through A Grid",
    difficulty: "medium",
    patterns: ["trees-graphs", "BFS", "shortest path"],
    entrypoint: "shortest_grid_path",
    signature: "grid",
    prompt:
      "You are given a grid of 0s (open) and 1s (blocked). Starting at the top-left cell, you may step up, down, left, or right onto open cells only. Return the fewest steps needed to reach the bottom-right cell, or -1 if it cannot be reached.",
    constraints: [
      "You may move only onto cells holding 0.",
      "The answer counts steps; a one-cell grid that is open needs zero steps.",
      "Return -1 if the start or goal is blocked, or if no open path connects them."
    ],
    hints: [
      "A breadth-first search explores cells in order of distance from the start.",
      "Carry each cell's distance in the queue and mark cells as you enqueue them."
    ],
    solution:
      "Run a breadth-first search from the top-left cell, storing each cell's step count in the queue. The first time the bottom-right cell is dequeued, its step count is the shortest distance; an exhausted queue means it is unreachable.",
    walkthrough:
      "Breadth-first search visits cells in non-decreasing distance order, so the goal is first reached by a shortest path. Marking cells when enqueued keeps each in the queue once, and guarding the start and goal against being blocked handles the impossible cases.",
    followUps: [
      "How would you allow diagonal moves as well as orthogonal ones?",
      "How could you also return the sequence of cells on a shortest path?"
    ],
    code: `def shortest_grid_path(grid):
    if not grid or not grid[0]:
        return -1
    rows, cols = len(grid), len(grid[0])
    if grid[0][0] == 1 or grid[rows - 1][cols - 1] == 1:
        return -1
    queue = deque([(0, 0, 0)])
    seen = {(0, 0)}
    while queue:
        r, c, dist = queue.popleft()
        if r == rows - 1 and c == cols - 1:
            return dist
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in seen:
                seen.add((nr, nc))
                queue.append((nr, nc, dist + 1))
    return -1
`,
    visibleTests: [
      { name: "path around wall", args: [[[0, 0, 0], [1, 1, 0], [0, 0, 0]]], expected: 4 },
      { name: "fully blocked", args: [[[0, 1], [1, 0]]], expected: -1 }
    ],
    hiddenTests: [
      { name: "single open cell", args: [[[0]]], expected: 0 },
      { name: "start blocked", args: [[[1, 0], [0, 0]]], expected: -1 },
      { name: "goal blocked", args: [[[0, 0], [0, 1]]], expected: -1 },
      { name: "straight corridor", args: [[[0, 0, 0, 0]]], expected: 3 },
      { name: "open square", args: [[[0, 0], [0, 0]]], expected: 2 }
    ],
    time: "O(r*c)",
    space: "O(r*c)"
  },
  {
    id: "trees-graphs-bonus-14",
    chapterId: "trees-graphs",
    title: "Build Order From Dependencies",
    difficulty: "medium",
    patterns: ["trees-graphs", "topological order", "BFS"],
    entrypoint: "build_order",
    signature: "dependencies",
    prompt:
      "You are given a dictionary mapping each task to the list of tasks that must be completed before it. Return any ordering of all the tasks in which every task appears after all of its prerequisites. Return None if no such ordering exists.",
    constraints: [
      "A task with an empty prerequisite list may appear first.",
      "Every task in the dictionary, and every task named as a prerequisite, must appear in the result.",
      "Return None when the prerequisites contain a cycle."
    ],
    hints: [
      "Count, for each task, how many prerequisites it still has — its in-degree.",
      "Repeatedly emit a task whose in-degree has reached zero and decrement the in-degree of the tasks that depend on it."
    ],
    solution:
      "Build an in-degree count and a successor map, then run Kahn's algorithm: start from tasks with no prerequisites, emit one at a time, and release dependents whose in-degree drops to zero. If fewer tasks are emitted than exist, a cycle remains.",
    walkthrough:
      "A task is safe to schedule once every prerequisite is already placed, which is exactly when its in-degree hits zero. Emitting such tasks and decrementing their dependents repeats until all are placed; a cycle leaves some in-degrees permanently positive, so the emitted count falls short and the answer is None.",
    followUps: [
      "How would you detect which specific tasks are tangled in a cycle?",
      "How could you produce the ordering with a depth-first search instead?"
    ],
    code: `def build_order(dependencies):
    nodes = set(dependencies)
    for prereqs in dependencies.values():
        nodes.update(prereqs)
    indegree = {node: 0 for node in nodes}
    successors = {node: [] for node in nodes}
    for task, prereqs in dependencies.items():
        for prereq in prereqs:
            successors[prereq].append(task)
            indegree[task] += 1
    ready = deque(sorted(node for node in nodes if indegree[node] == 0))
    order = []
    while ready:
        node = ready.popleft()
        order.append(node)
        for nxt in successors[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                ready.append(nxt)
    return order if len(order) == len(nodes) else None
`,
    visibleTests: [
      {
        name: "linear dependency chain",
        args: [{ shirt: [], tie: ["shirt"], jacket: ["tie", "shirt"] }],
        expected: ["shirt", "tie", "jacket"],
        validator: "topological"
      },
      {
        name: "cycle has no order",
        args: [{ a: ["b"], b: ["a"] }],
        expected: null,
        validator: "topological"
      }
    ],
    hiddenTests: [
      {
        name: "single task",
        args: [{ only: [] }],
        expected: ["only"],
        validator: "topological"
      },
      {
        name: "diamond dependency",
        args: [{ base: [], left: ["base"], right: ["base"], top: ["left", "right"] }],
        expected: ["base", "left", "right", "top"],
        validator: "topological"
      },
      {
        name: "prerequisite not a key",
        args: [{ build: ["compile"] }],
        expected: ["compile", "build"],
        validator: "topological"
      },
      {
        name: "three way cycle",
        args: [{ a: ["c"], b: ["a"], c: ["b"] }],
        expected: null,
        validator: "topological"
      },
      {
        name: "independent tasks",
        args: [{ a: [], b: [], c: [] }],
        expected: ["a", "b", "c"],
        validator: "topological"
      }
    ],
    time: "O(V+E)",
    space: "O(V+E)"
  }
];
