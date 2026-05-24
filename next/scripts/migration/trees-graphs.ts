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

export const treesGraphsCurated: Record<string, CuratedProblem> = {
  "tree-max-depth-local": treeNumber("treeMaxDepthLocal", "TreeMaxDepthLocal", "tree_max_depth_local", [
    "function depth(node: Node | null): number {",
    "  if (!node) return 0;",
    "  return 1 + Math.max(depth(node.left), depth(node.right));",
    "}",
    "return depth(root);"
  ], [
    "def depth(node):",
    "    if node is None:",
    "        return 0",
    "    return 1 + max(depth(node.left), depth(node.right))",
    "return depth(root)"
  ], [
    "var depth func(*Node) int",
    "depth = func(node *Node) int {",
    "\tif node == nil {",
    "\t\treturn 0",
    "\t}",
    "\tleft := depth(node.Left)",
    "\tright := depth(node.Right)",
    "\tif left > right {",
    "\t\treturn left + 1",
    "\t}",
    "\treturn right + 1",
    "}",
    "return depth(root)"
  ], [
    "def depth(node: Option[Node]): Int = node match {",
    "  case None => 0",
    "  case Some(current) => 1 + math.max(depth(current.left), depth(current.right))",
    "}",
    "depth(root)"
  ]),
  "tree-level-sums": treeNumberArray("treeLevelSums", "TreeLevelSums", "tree_level_sums", [
    "if (!root) return [];",
    "const queue: Node[] = [root];",
    "const sums: number[] = [];",
    "while (queue.length > 0) {",
    "  const levelSize = queue.length;",
    "  let total = 0;",
    "  for (let index = 0; index < levelSize; index += 1) {",
    "    const node = queue.shift()!;",
    "    total += node.value;",
    "    if (node.left) queue.push(node.left);",
    "    if (node.right) queue.push(node.right);",
    "  }",
    "  sums.push(total);",
    "}",
    "return sums;"
  ], [
    "if root is None:",
    "    return []",
    "queue = [root]",
    "sums = []",
    "while queue:",
    "    total = 0",
    "    next_level = []",
    "    for node in queue:",
    "        total += node.value",
    "        if node.left is not None:",
    "            next_level.append(node.left)",
    "        if node.right is not None:",
    "            next_level.append(node.right)",
    "    sums.append(total)",
    "    queue = next_level",
    "return sums"
  ], [
    "if root == nil {",
    "\treturn []int{}",
    "}",
    "queue := []*Node{root}",
    "sums := []int{}",
    "for len(queue) > 0 {",
    "\tlevelSize := len(queue)",
    "\ttotal := 0",
    "\tfor index := 0; index < levelSize; index++ {",
    "\t\tnode := queue[0]",
    "\t\tqueue = queue[1:]",
    "\t\ttotal += node.Value",
    "\t\tif node.Left != nil { queue = append(queue, node.Left) }",
    "\t\tif node.Right != nil { queue = append(queue, node.Right) }",
    "\t}",
    "\tsums = append(sums, total)",
    "}",
    "return sums"
  ], [
    "root match {",
    "  case None => Seq.empty",
    "  case Some(start) =>",
    "    val queue = scala.collection.mutable.Queue(start)",
    "    val sums = scala.collection.mutable.ArrayBuffer.empty[Int]",
    "    while (queue.nonEmpty) {",
    "      val levelSize = queue.length",
    "      var total = 0",
    "      for (_ <- 0 until levelSize) {",
    "        val node = queue.dequeue()",
    "        total += node.value",
    "        node.left.foreach(queue.enqueue(_))",
    "        node.right.foreach(queue.enqueue(_))",
    "      }",
    "      sums.append(total)",
    "    }",
    "    sums.toSeq",
    "}"
  ]),
  "tree-has-path-sum-local": {
    signature: {
      name: "treeHasPathSumLocal",
      inputs: [
        { name: "values", type: treeArray() },
        { name: "target", type: numberType() }
      ],
      output: booleanType()
    },
    languages: {
      python: py("tree_has_path_sum_local", "values: list[object], target: int", "bool", pyTreeBody([
        "def has_path(node, remaining):",
        "    if node is None:",
        "        return False",
        "    next_remaining = remaining - node.value",
        "    if node.left is None and node.right is None:",
        "        return next_remaining == 0",
        "    return has_path(node.left, next_remaining) or has_path(node.right, next_remaining)",
        "return has_path(root, target)"
      ])),
      typescript: ts("treeHasPathSumLocal", "values: Array<number | null>, target: number", "boolean", tsTreeBody([
        "function hasPath(node: Node | null, remaining: number): boolean {",
        "  if (!node) return false;",
        "  const nextRemaining = remaining - node.value;",
        "  if (!node.left && !node.right) return nextRemaining === 0;",
        "  return hasPath(node.left, nextRemaining) || hasPath(node.right, nextRemaining);",
        "}",
        "return hasPath(root, target);"
      ])),
      go: go("TreeHasPathSumLocal", "values []interface{}, target int", "bool", goTreeBody([
        "var hasPath func(*Node, int) bool",
        "hasPath = func(node *Node, remaining int) bool {",
        "\tif node == nil { return false }",
        "\tnextRemaining := remaining - node.Value",
        "\tif node.Left == nil && node.Right == nil { return nextRemaining == 0 }",
        "\treturn hasPath(node.Left, nextRemaining) || hasPath(node.Right, nextRemaining)",
        "}",
        "return hasPath(root, target)"
      ]), goTreeHelpers()),
      scala: scala("treeHasPathSumLocal", "values: Seq[Any], target: Int", "Boolean", scalaTreeBody([
        "def hasPath(node: Option[Node], remaining: Int): Boolean = node match {",
        "  case None => false",
        "  case Some(current) =>",
        "    val nextRemaining = remaining - current.value",
        "    if (current.left.isEmpty && current.right.isEmpty) nextRemaining == 0",
        "    else hasPath(current.left, nextRemaining) || hasPath(current.right, nextRemaining)",
        "}",
        "hasPath(root, target)"
      ]))
    }
  },
  "count-grid-islands": gridNumber("countGridIslands", "CountGridIslands", "count_grid_islands", [
    "if (grid.length === 0) return 0;",
    "const rows = grid.length;",
    "const cols = grid[0].length;",
    "const seen = Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));",
    "let islands = 0;",
    "const stack: Array<[number, number]> = [];",
    "for (let row = 0; row < rows; row += 1) {",
    "  for (let col = 0; col < cols; col += 1) {",
    "    if (grid[row][col] !== 1 || seen[row][col]) continue;",
    "    islands += 1;",
    "    seen[row][col] = true;",
    "    stack.push([row, col]);",
    "    while (stack.length > 0) {",
    "      const [r, c] = stack.pop()!;",
    "      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {",
    "        const nr = r + dr;",
    "        const nc = c + dc;",
    "        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1 && !seen[nr][nc]) {",
    "          seen[nr][nc] = true;",
    "          stack.push([nr, nc]);",
    "        }",
    "      }",
    "    }",
    "  }",
    "}",
    "return islands;"
  ], [
    "if not grid:",
    "    return 0",
    "rows = len(grid)",
    "cols = len(grid[0])",
    "seen = [[False] * cols for _ in range(rows)]",
    "islands = 0",
    "for row in range(rows):",
    "    for col in range(cols):",
    "        if grid[row][col] != 1 or seen[row][col]:",
    "            continue",
    "        islands += 1",
    "        stack = [(row, col)]",
    "        seen[row][col] = True",
    "        while stack:",
    "            r, c = stack.pop()",
    "            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):",
    "                nr, nc = r + dr, c + dc",
    "                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and not seen[nr][nc]:",
    "                    seen[nr][nc] = True",
    "                    stack.append((nr, nc))",
    "return islands"
  ], [
    "return countGridIslands(grid)"
  ], [
    "countGridIslands(grid)"
  ]),
  "shortest-edge-path": graphPathNumber(),
  "can-finish-local": canFinish(),
  "connected-component-count": connectedComponents(),
  "trees-graphs-bonus-01": treeNumber("treeValueSum", "TreeValueSum", "tree_value_sum", [
    "function sum(node: Node | null): number {",
    "  if (!node) return 0;",
    "  return node.value + sum(node.left) + sum(node.right);",
    "}",
    "return sum(root);"
  ], [
    "def total(node):",
    "    if node is None:",
    "        return 0",
    "    return node.value + total(node.left) + total(node.right)",
    "return total(root)"
  ], [
    "var total func(*Node) int",
    "total = func(node *Node) int {",
    "\tif node == nil { return 0 }",
    "\treturn node.Value + total(node.Left) + total(node.Right)",
    "}",
    "return total(root)"
  ], [
    "def total(node: Option[Node]): Int = node match {",
    "  case None => 0",
    "  case Some(current) => current.value + total(current.left) + total(current.right)",
    "}",
    "total(root)"
  ]),
  "trees-graphs-bonus-02": treeNumber("countTreeNodes", "CountTreeNodes", "count_tree_nodes", [
    "if (!root) return 0;",
    "let count = 0;",
    "const queue: Node[] = [root];",
    "while (queue.length > 0) {",
    "  const node = queue.shift()!;",
    "  count += 1;",
    "  if (node.left) queue.push(node.left);",
    "  if (node.right) queue.push(node.right);",
    "}",
    "return count;"
  ], [
    "if root is None:",
    "    return 0",
    "count = 0",
    "queue = [root]",
    "while queue:",
    "    node = queue.pop(0)",
    "    count += 1",
    "    if node.left is not None:",
    "        queue.append(node.left)",
    "    if node.right is not None:",
    "        queue.append(node.right)",
    "return count"
  ], [
    "if root == nil { return 0 }",
    "count := 0",
    "queue := []*Node{root}",
    "for len(queue) > 0 {",
    "\tnode := queue[0]",
    "\tqueue = queue[1:]",
    "\tcount++",
    "\tif node.Left != nil { queue = append(queue, node.Left) }",
    "\tif node.Right != nil { queue = append(queue, node.Right) }",
    "}",
    "return count"
  ], [
    "root match {",
    "  case None => 0",
    "  case Some(start) =>",
    "    var count = 0",
    "    val queue = scala.collection.mutable.Queue(start)",
    "    while (queue.nonEmpty) {",
    "      val node = queue.dequeue()",
    "      count += 1",
    "      node.left.foreach(queue.enqueue(_))",
    "      node.right.foreach(queue.enqueue(_))",
    "    }",
    "    count",
    "}"
  ]),
  "trees-graphs-bonus-03": treeNullableNumber("treeMinimum", "TreeMinimum", "tree_minimum", [
    "if (!root) return null;",
    "let best = root.value;",
    "const stack: Node[] = [root];",
    "while (stack.length > 0) {",
    "  const node = stack.pop()!;",
    "  best = Math.min(best, node.value);",
    "  if (node.left) stack.push(node.left);",
    "  if (node.right) stack.push(node.right);",
    "}",
    "return best;"
  ], [
    "if root is None:",
    "    return None",
    "best = root.value",
    "stack = [root]",
    "while stack:",
    "    node = stack.pop()",
    "    best = min(best, node.value)",
    "    if node.left is not None:",
    "        stack.append(node.left)",
    "    if node.right is not None:",
    "        stack.append(node.right)",
    "return best"
  ], [
    "if root == nil { return nil }",
    "best := root.Value",
    "stack := []*Node{root}",
    "for len(stack) > 0 {",
    "\tnode := stack[len(stack)-1]",
    "\tstack = stack[:len(stack)-1]",
    "\tif node.Value < best { best = node.Value }",
    "\tif node.Left != nil { stack = append(stack, node.Left) }",
    "\tif node.Right != nil { stack = append(stack, node.Right) }",
    "}",
    "return best"
  ], [
    "root match {",
    "  case None => null",
    "  case Some(start) =>",
    "    var best = start.value",
    "    val stack = scala.collection.mutable.Stack(start)",
    "    while (stack.nonEmpty) {",
    "      val node = stack.pop()",
    "      best = math.min(best, node.value)",
    "      node.left.foreach(stack.push(_))",
    "      node.right.foreach(stack.push(_))",
    "    }",
    "    best",
    "}"
  ]),
  "trees-graphs-bonus-04": treeNumber("treeDiameter", "TreeDiameter", "tree_diameter", [
    "let best = 0;",
    "function height(node: Node | null): number {",
    "  if (!node) return 0;",
    "  const left = height(node.left);",
    "  const right = height(node.right);",
    "  best = Math.max(best, left + right);",
    "  return 1 + Math.max(left, right);",
    "}",
    "height(root);",
    "return best;"
  ], [
    "best = 0",
    "def height(node):",
    "    nonlocal best",
    "    if node is None:",
    "        return 0",
    "    left = height(node.left)",
    "    right = height(node.right)",
    "    best = max(best, left + right)",
    "    return 1 + max(left, right)",
    "height(root)",
    "return best"
  ], [
    "best := 0",
    "var height func(*Node) int",
    "height = func(node *Node) int {",
    "\tif node == nil { return 0 }",
    "\tleft := height(node.Left)",
    "\tright := height(node.Right)",
    "\tif left+right > best { best = left + right }",
    "\tif left > right { return left + 1 }",
    "\treturn right + 1",
    "}",
    "height(root)",
    "return best"
  ], [
    "var best = 0",
    "def height(node: Option[Node]): Int = node match {",
    "  case None => 0",
    "  case Some(current) =>",
    "    val left = height(current.left)",
    "    val right = height(current.right)",
    "    best = math.max(best, left + right)",
    "    1 + math.max(left, right)",
    "}",
    "height(root)",
    "best"
  ]),
  "trees-graphs-bonus-05": treeNumberArray("rightSideView", "RightSideView", "right_side_view", [
    "if (!root) return [];",
    "const view: number[] = [];",
    "const queue: Node[] = [root];",
    "while (queue.length > 0) {",
    "  const levelSize = queue.length;",
    "  for (let index = 0; index < levelSize; index += 1) {",
    "    const node = queue.shift()!;",
    "    if (index === levelSize - 1) view.push(node.value);",
    "    if (node.left) queue.push(node.left);",
    "    if (node.right) queue.push(node.right);",
    "  }",
    "}",
    "return view;"
  ], [
    "if root is None:",
    "    return []",
    "view = []",
    "queue = [root]",
    "while queue:",
    "    next_level = []",
    "    for index, node in enumerate(queue):",
    "        if index == len(queue) - 1:",
    "            view.append(node.value)",
    "        if node.left is not None:",
    "            next_level.append(node.left)",
    "        if node.right is not None:",
    "            next_level.append(node.right)",
    "    queue = next_level",
    "return view"
  ], [
    "if root == nil { return []int{} }",
    "view := []int{}",
    "queue := []*Node{root}",
    "for len(queue) > 0 {",
    "\tlevelSize := len(queue)",
    "\tfor index := 0; index < levelSize; index++ {",
    "\t\tnode := queue[0]",
    "\t\tqueue = queue[1:]",
    "\t\tif index == levelSize-1 { view = append(view, node.Value) }",
    "\t\tif node.Left != nil { queue = append(queue, node.Left) }",
    "\t\tif node.Right != nil { queue = append(queue, node.Right) }",
    "\t}",
    "}",
    "return view"
  ], [
    "root match {",
    "  case None => Seq.empty",
    "  case Some(start) =>",
    "    val view = scala.collection.mutable.ArrayBuffer.empty[Int]",
    "    val queue = scala.collection.mutable.Queue(start)",
    "    while (queue.nonEmpty) {",
    "      val levelSize = queue.length",
    "      for (index <- 0 until levelSize) {",
    "        val node = queue.dequeue()",
    "        if (index == levelSize - 1) view.append(node.value)",
    "        node.left.foreach(queue.enqueue(_))",
    "        node.right.foreach(queue.enqueue(_))",
    "      }",
    "    }",
    "    view.toSeq",
    "}"
  ]),
  "trees-graphs-bonus-06": treeNumber("countLeaves", "CountLeaves", "count_leaves", [
    "function count(node: Node | null): number {",
    "  if (!node) return 0;",
    "  if (!node.left && !node.right) return 1;",
    "  return count(node.left) + count(node.right);",
    "}",
    "return count(root);"
  ], [
    "def count(node):",
    "    if node is None:",
    "        return 0",
    "    if node.left is None and node.right is None:",
    "        return 1",
    "    return count(node.left) + count(node.right)",
    "return count(root)"
  ], [
    "var count func(*Node) int",
    "count = func(node *Node) int {",
    "\tif node == nil { return 0 }",
    "\tif node.Left == nil && node.Right == nil { return 1 }",
    "\treturn count(node.Left) + count(node.Right)",
    "}",
    "return count(root)"
  ], [
    "def count(node: Option[Node]): Int = node match {",
    "  case None => 0",
    "  case Some(current) if current.left.isEmpty && current.right.isEmpty => 1",
    "  case Some(current) => count(current.left) + count(current.right)",
    "}",
    "count(root)"
  ]),
  "trees-graphs-bonus-07": treeBoolean("isSymmetric", "IsSymmetric", "is_symmetric", [
    "function mirror(left: Node | null, right: Node | null): boolean {",
    "  if (!left || !right) return left === right;",
    "  return left.value === right.value && mirror(left.left, right.right) && mirror(left.right, right.left);",
    "}",
    "return !root || mirror(root.left, root.right);"
  ], [
    "def mirror(left, right):",
    "    if left is None or right is None:",
    "        return left is right",
    "    return left.value == right.value and mirror(left.left, right.right) and mirror(left.right, right.left)",
    "return root is None or mirror(root.left, root.right)"
  ], [
    "var mirror func(*Node, *Node) bool",
    "mirror = func(left *Node, right *Node) bool {",
    "\tif left == nil || right == nil { return left == right }",
    "\treturn left.Value == right.Value && mirror(left.Left, right.Right) && mirror(left.Right, right.Left)",
    "}",
    "return root == nil || mirror(root.Left, root.Right)"
  ], [
    "def mirror(left: Option[Node], right: Option[Node]): Boolean = (left, right) match {",
    "  case (None, None) => true",
    "  case (Some(a), Some(b)) => a.value == b.value && mirror(a.left, b.right) && mirror(a.right, b.left)",
    "  case _ => false",
    "}",
    "root.isEmpty || mirror(root.get.left, root.get.right)"
  ]),
  "trees-graphs-bonus-08": floodFill(),
  "trees-graphs-bonus-09": gridNumber("islandPerimeter", "IslandPerimeter", "island_perimeter", [
    "let perimeter = 0;",
    "const rows = grid.length;",
    "const cols = rows === 0 ? 0 : grid[0].length;",
    "for (let row = 0; row < rows; row += 1) {",
    "  for (let col = 0; col < cols; col += 1) {",
    "    if (grid[row][col] !== 1) continue;",
    "    perimeter += 4;",
    "    if (row > 0 && grid[row - 1][col] === 1) perimeter -= 2;",
    "    if (col > 0 && grid[row][col - 1] === 1) perimeter -= 2;",
    "  }",
    "}",
    "return perimeter;"
  ], [
    "perimeter = 0",
    "for row in range(len(grid)):",
    "    for col in range(len(grid[row])):",
    "        if grid[row][col] != 1:",
    "            continue",
    "        perimeter += 4",
    "        if row > 0 and grid[row - 1][col] == 1:",
    "            perimeter -= 2",
    "        if col > 0 and grid[row][col - 1] == 1:",
    "            perimeter -= 2",
    "return perimeter"
  ], [
    "perimeter := 0",
    "for row := 0; row < len(grid); row++ {",
    "\tfor col := 0; col < len(grid[row]); col++ {",
    "\t\tif grid[row][col] != 1 { continue }",
    "\t\tperimeter += 4",
    "\t\tif row > 0 && grid[row-1][col] == 1 { perimeter -= 2 }",
    "\t\tif col > 0 && grid[row][col-1] == 1 { perimeter -= 2 }",
    "\t}",
    "}",
    "return perimeter"
  ], [
    "var perimeter = 0",
    "for (row <- grid.indices; col <- grid(row).indices) {",
    "  if (grid(row)(col) == 1) {",
    "    perimeter += 4",
    "    if (row > 0 && grid(row - 1)(col) == 1) perimeter -= 2",
    "    if (col > 0 && grid(row)(col - 1) == 1) perimeter -= 2",
    "  }",
    "}",
    "perimeter"
  ]),
  "trees-graphs-bonus-10": hasRoute(),
  "trees-graphs-bonus-11": countReachable(),
  "trees-graphs-bonus-12": hasCycle(),
  "trees-graphs-bonus-13": shortestGridPath(),
  "trees-graphs-bonus-14": buildOrder()
};

function graphPathNumber(): CuratedProblem {
  return {
    signature: {
      name: "shortestEdgePath",
      inputs: [
        { name: "n", type: numberType() },
        { name: "edges", type: edgeListType() },
        { name: "start", type: numberType() },
        { name: "goal", type: numberType() }
      ],
      output: numberType()
    },
    languages: {
      python: py("shortest_edge_path", "n: int, edges: list[list[int]], start: int, goal: int", "int", [
        "if start == goal:",
        "    return 0",
        "graph = [[] for _ in range(n)]",
        "for u, v in edges:",
        "    graph[u].append(v)",
        "    graph[v].append(u)",
        "queue = [(start, 0)]",
        "seen = {start}",
        "for node, distance in queue:",
        "    for neighbor in graph[node]:",
        "        if neighbor == goal:",
        "            return distance + 1",
        "        if neighbor not in seen:",
        "            seen.add(neighbor)",
        "            queue.append((neighbor, distance + 1))",
        "return -1"
      ]),
      typescript: ts("shortestEdgePath", "n: number, edges: number[][], start: number, goal: number", "number", [
        "if (start === goal) return 0;",
        "const graph = Array.from({ length: n }, () => [] as number[]);",
        "for (const [u, v] of edges) {",
        "  graph[u].push(v);",
        "  graph[v].push(u);",
        "}",
        "const queue: Array<[number, number]> = [[start, 0]];",
        "const seen = new Set<number>([start]);",
        "for (let index = 0; index < queue.length; index += 1) {",
        "  const [node, distance] = queue[index];",
        "  for (const neighbor of graph[node]) {",
        "    if (neighbor === goal) return distance + 1;",
        "    if (!seen.has(neighbor)) {",
        "      seen.add(neighbor);",
        "      queue.push([neighbor, distance + 1]);",
        "    }",
        "  }",
        "}",
        "return -1;"
      ]),
      go: go("ShortestEdgePath", "n int, edges [][]int, start int, goal int", "int", [
        "if start == goal { return 0 }",
        "graph := make([][]int, n)",
        "for _, edge := range edges {",
        "\tu, v := edge[0], edge[1]",
        "\tgraph[u] = append(graph[u], v)",
        "\tgraph[v] = append(graph[v], u)",
        "}",
        "queue := [][]int{{start, 0}}",
        "seen := map[int]bool{start: true}",
        "for index := 0; index < len(queue); index++ {",
        "\tnode, distance := queue[index][0], queue[index][1]",
        "\tfor _, neighbor := range graph[node] {",
        "\t\tif neighbor == goal { return distance + 1 }",
        "\t\tif !seen[neighbor] {",
        "\t\t\tseen[neighbor] = true",
        "\t\t\tqueue = append(queue, []int{neighbor, distance + 1})",
        "\t\t}",
        "\t}",
        "}",
        "return -1"
      ]),
      scala: scala("shortestEdgePath", "n: Int, edges: Seq[Seq[Int]], start: Int, goal: Int", "Int", [
        "if (start == goal) return 0",
        "val graph = Array.fill(n)(scala.collection.mutable.ArrayBuffer.empty[Int])",
        "for (edge <- edges) {",
        "  val u = edge(0); val v = edge(1)",
        "  graph(u).append(v); graph(v).append(u)",
        "}",
        "val queue = scala.collection.mutable.Queue((start, 0))",
        "val seen = scala.collection.mutable.Set(start)",
        "while (queue.nonEmpty) {",
        "  val (node, distance) = queue.dequeue()",
        "  for (neighbor <- graph(node)) {",
        "    if (neighbor == goal) return distance + 1",
        "    if (!seen.contains(neighbor)) { seen.add(neighbor); queue.enqueue((neighbor, distance + 1)) }",
        "  }",
        "}",
        "-1"
      ])
    }
  };
}

function canFinish(): CuratedProblem {
  return {
    signature: {
      name: "canFinishLocal",
      inputs: [
        { name: "n", type: numberType() },
        { name: "prerequisites", type: edgeListType() }
      ],
      output: booleanType()
    },
    languages: {
      python: py("can_finish_local", "n: int, prerequisites: list[list[int]]", "bool", [
        "graph = [[] for _ in range(n)]",
        "indegree = [0] * n",
        "for course, before in prerequisites:",
        "    graph[before].append(course)",
        "    indegree[course] += 1",
        "queue = [course for course in range(n) if indegree[course] == 0]",
        "seen = 0",
        "for course in queue:",
        "    seen += 1",
        "    for next_course in graph[course]:",
        "        indegree[next_course] -= 1",
        "        if indegree[next_course] == 0:",
        "            queue.append(next_course)",
        "return seen == n"
      ]),
      typescript: ts("canFinishLocal", "n: number, prerequisites: number[][]", "boolean", [
        "const graph = Array.from({ length: n }, () => [] as number[]);",
        "const indegree = new Array<number>(n).fill(0);",
        "for (const [course, before] of prerequisites) {",
        "  graph[before].push(course);",
        "  indegree[course] += 1;",
        "}",
        "const queue: number[] = [];",
        "for (let course = 0; course < n; course += 1) if (indegree[course] === 0) queue.push(course);",
        "let seen = 0;",
        "for (let index = 0; index < queue.length; index += 1) {",
        "  const course = queue[index];",
        "  seen += 1;",
        "  for (const nextCourse of graph[course]) {",
        "    indegree[nextCourse] -= 1;",
        "    if (indegree[nextCourse] === 0) queue.push(nextCourse);",
        "  }",
        "}",
        "return seen === n;"
      ]),
      go: go("CanFinishLocal", "n int, prerequisites [][]int", "bool", [
        "graph := make([][]int, n)",
        "indegree := make([]int, n)",
        "for _, pair := range prerequisites {",
        "\tcourse, before := pair[0], pair[1]",
        "\tgraph[before] = append(graph[before], course)",
        "\tindegree[course]++",
        "}",
        "queue := []int{}",
        "for course := 0; course < n; course++ { if indegree[course] == 0 { queue = append(queue, course) } }",
        "seen := 0",
        "for index := 0; index < len(queue); index++ {",
        "\tcourse := queue[index]",
        "\tseen++",
        "\tfor _, nextCourse := range graph[course] {",
        "\t\tindegree[nextCourse]--",
        "\t\tif indegree[nextCourse] == 0 { queue = append(queue, nextCourse) }",
        "\t}",
        "}",
        "return seen == n"
      ]),
      scala: scala("canFinishLocal", "n: Int, prerequisites: Seq[Seq[Int]]", "Boolean", [
        "val graph = Array.fill(n)(scala.collection.mutable.ArrayBuffer.empty[Int])",
        "val indegree = Array.fill(n)(0)",
        "for (pair <- prerequisites) {",
        "  val course = pair(0); val before = pair(1)",
        "  graph(before).append(course); indegree(course) += 1",
        "}",
        "val queue = scala.collection.mutable.Queue.empty[Int]",
        "for (course <- 0 until n) if (indegree(course) == 0) queue.enqueue(course)",
        "var seen = 0",
        "while (queue.nonEmpty) {",
        "  val course = queue.dequeue(); seen += 1",
        "  for (nextCourse <- graph(course)) {",
        "    indegree(nextCourse) -= 1",
        "    if (indegree(nextCourse) == 0) queue.enqueue(nextCourse)",
        "  }",
        "}",
        "seen == n"
      ])
    }
  };
}

function connectedComponents(): CuratedProblem {
  return {
    signature: {
      name: "connectedComponentCount",
      inputs: [
        { name: "n", type: numberType() },
        { name: "edges", type: edgeListType() }
      ],
      output: numberType()
    },
    languages: {
      python: py("connected_component_count", "n: int, edges: list[list[int]]", "int", [
        "graph = [[] for _ in range(n)]",
        "for u, v in edges:",
        "    if u == v:",
        "        continue",
        "    graph[u].append(v)",
        "    graph[v].append(u)",
        "seen = set()",
        "components = 0",
        "for node in range(n):",
        "    if node in seen:",
        "        continue",
        "    components += 1",
        "    stack = [node]",
        "    seen.add(node)",
        "    while stack:",
        "        current = stack.pop()",
        "        for neighbor in graph[current]:",
        "            if neighbor not in seen:",
        "                seen.add(neighbor)",
        "                stack.append(neighbor)",
        "return components"
      ]),
      typescript: ts("connectedComponentCount", "n: number, edges: number[][]", "number", [
        "const graph = Array.from({ length: n }, () => [] as number[]);",
        "for (const [u, v] of edges) {",
        "  if (u === v) continue;",
        "  graph[u].push(v);",
        "  graph[v].push(u);",
        "}",
        "const seen = new Set<number>();",
        "let components = 0;",
        "for (let node = 0; node < n; node += 1) {",
        "  if (seen.has(node)) continue;",
        "  components += 1;",
        "  const stack = [node];",
        "  seen.add(node);",
        "  while (stack.length > 0) {",
        "    const current = stack.pop()!;",
        "    for (const neighbor of graph[current]) {",
        "      if (!seen.has(neighbor)) {",
        "        seen.add(neighbor);",
        "        stack.push(neighbor);",
        "      }",
        "    }",
        "  }",
        "}",
        "return components;"
      ]),
      go: go("ConnectedComponentCount", "n int, edges [][]int", "int", [
        "graph := make([][]int, n)",
        "for _, edge := range edges {",
        "\tu, v := edge[0], edge[1]",
        "\tif u == v { continue }",
        "\tgraph[u] = append(graph[u], v)",
        "\tgraph[v] = append(graph[v], u)",
        "}",
        "seen := map[int]bool{}",
        "components := 0",
        "for node := 0; node < n; node++ {",
        "\tif seen[node] { continue }",
        "\tcomponents++",
        "\tstack := []int{node}",
        "\tseen[node] = true",
        "\tfor len(stack) > 0 {",
        "\t\tcurrent := stack[len(stack)-1]",
        "\t\tstack = stack[:len(stack)-1]",
        "\t\tfor _, neighbor := range graph[current] {",
        "\t\t\tif !seen[neighbor] { seen[neighbor] = true; stack = append(stack, neighbor) }",
        "\t\t}",
        "\t}",
        "}",
        "return components"
      ]),
      scala: scala("connectedComponentCount", "n: Int, edges: Seq[Seq[Int]]", "Int", [
        "val graph = Array.fill(n)(scala.collection.mutable.ArrayBuffer.empty[Int])",
        "for (edge <- edges) {",
        "  val u = edge(0); val v = edge(1)",
        "  if (u != v) { graph(u).append(v); graph(v).append(u) }",
        "}",
        "val seen = scala.collection.mutable.Set.empty[Int]",
        "var components = 0",
        "for (node <- 0 until n) {",
        "  if (!seen.contains(node)) {",
        "    components += 1",
        "    val stack = scala.collection.mutable.Stack(node)",
        "    seen.add(node)",
        "    while (stack.nonEmpty) {",
        "      val current = stack.pop()",
        "      for (neighbor <- graph(current)) if (!seen.contains(neighbor)) { seen.add(neighbor); stack.push(neighbor) }",
        "    }",
        "  }",
        "}",
        "components"
      ])
    }
  };
}

function floodFill(): CuratedProblem {
  return {
    signature: {
      name: "floodFill",
      inputs: [
        { name: "grid", type: gridType() },
        { name: "sr", type: numberType() },
        { name: "sc", type: numberType() },
        { name: "color", type: numberType() }
      ],
      output: gridType()
    },
    languages: {
      python: py("flood_fill", "grid: list[list[int]], sr: int, sc: int, color: int", "list[list[int]]", [
        "result = [row[:] for row in grid]",
        "original = result[sr][sc]",
        "if original == color:",
        "    return result",
        "rows = len(result)",
        "cols = len(result[0])",
        "stack = [(sr, sc)]",
        "result[sr][sc] = color",
        "while stack:",
        "    row, col = stack.pop()",
        "    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):",
        "        nr, nc = row + dr, col + dc",
        "        if 0 <= nr < rows and 0 <= nc < cols and result[nr][nc] == original:",
        "            result[nr][nc] = color",
        "            stack.append((nr, nc))",
        "return result"
      ]),
      typescript: ts("floodFill", "grid: number[][], sr: number, sc: number, color: number", "number[][]", [
        "const result = grid.map((row) => [...row]);",
        "const original = result[sr][sc];",
        "if (original === color) return result;",
        "const rows = result.length;",
        "const cols = result[0].length;",
        "const stack: Array<[number, number]> = [[sr, sc]];",
        "result[sr][sc] = color;",
        "while (stack.length > 0) {",
        "  const [row, col] = stack.pop()!;",
        "  for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {",
        "    const nr = row + dr;",
        "    const nc = col + dc;",
        "    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && result[nr][nc] === original) {",
        "      result[nr][nc] = color;",
        "      stack.push([nr, nc]);",
        "    }",
        "  }",
        "}",
        "return result;"
      ]),
      go: go("FloodFill", "grid [][]int, sr int, sc int, color int", "[][]int", [
        "result := copyGrid(grid)",
        "original := result[sr][sc]",
        "if original == color { return result }",
        "rows, cols := len(result), len(result[0])",
        "stack := [][]int{{sr, sc}}",
        "result[sr][sc] = color",
        "dirs := [][]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}",
        "for len(stack) > 0 {",
        "\tcell := stack[len(stack)-1]",
        "\tstack = stack[:len(stack)-1]",
        "\tfor _, dir := range dirs {",
        "\t\tnr, nc := cell[0]+dir[0], cell[1]+dir[1]",
        "\t\tif nr >= 0 && nr < rows && nc >= 0 && nc < cols && result[nr][nc] == original {",
        "\t\t\tresult[nr][nc] = color",
        "\t\t\tstack = append(stack, []int{nr, nc})",
        "\t\t}",
        "\t}",
        "}",
        "return result"
      ], [goCopyGridHelper()]),
      scala: scala("floodFill", "grid: Seq[Seq[Int]], sr: Int, sc: Int, color: Int", "Seq[Seq[Int]]", [
        "val result = grid.map(_.toArray).toArray",
        "val original = result(sr)(sc)",
        "if (original == color) return result.map(_.toSeq).toSeq",
        "val rows = result.length; val cols = result(0).length",
        "val stack = scala.collection.mutable.Stack((sr, sc))",
        "result(sr)(sc) = color",
        "val dirs = Seq((1, 0), (-1, 0), (0, 1), (0, -1))",
        "while (stack.nonEmpty) {",
        "  val (row, col) = stack.pop()",
        "  for ((dr, dc) <- dirs) {",
        "    val nr = row + dr; val nc = col + dc",
        "    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && result(nr)(nc) == original) {",
        "      result(nr)(nc) = color; stack.push((nr, nc))",
        "    }",
        "  }",
        "}",
        "result.map(_.toSeq).toSeq"
      ])
    }
  };
}

function hasRoute(): CuratedProblem {
  return objectGraphProblem("hasRoute", "HasRoute", "has_route", [
    { name: "source", type: stringType() },
    { name: "target", type: stringType() }
  ], booleanType(), "boolean", "bool", "bool", "Boolean", [
    "if (source === target) return true;",
    "const seen = new Set<string>([source]);",
    "const stack = [source];",
    "while (stack.length > 0) {",
    "  const node = stack.pop()!;",
    "  for (const neighbor of graph[node] ?? []) {",
    "    if (neighbor === target) return true;",
    "    if (!seen.has(neighbor)) { seen.add(neighbor); stack.push(neighbor); }",
    "  }",
    "}",
    "return false;"
  ], [
    "if source == target:",
    "    return True",
    "seen = {source}",
    "stack = [source]",
    "while stack:",
    "    node = stack.pop()",
    "    for neighbor in graph.get(node, []):",
    "        if neighbor == target:",
    "            return True",
    "        if neighbor not in seen:",
    "            seen.add(neighbor)",
    "            stack.append(neighbor)",
    "return False"
  ], [
    "if source == target { return true }",
    "seen := map[string]bool{source: true}",
    "stack := []string{source}",
    "for len(stack) > 0 {",
    "\tnode := stack[len(stack)-1]",
    "\tstack = stack[:len(stack)-1]",
    "\tfor _, neighbor := range graph[node] {",
    "\t\tif neighbor == target { return true }",
    "\t\tif !seen[neighbor] { seen[neighbor] = true; stack = append(stack, neighbor) }",
    "\t}",
    "}",
    "return false"
  ], [
    "if (source == target) return true",
    "val seen = scala.collection.mutable.Set(source)",
    "val stack = scala.collection.mutable.Stack(source)",
    "while (stack.nonEmpty) {",
    "  val node = stack.pop()",
    "  for (neighbor <- graph.getOrElse(node, Seq.empty)) {",
    "    if (neighbor == target) return true",
    "    if (!seen.contains(neighbor)) { seen.add(neighbor); stack.push(neighbor) }",
    "  }",
    "}",
    "false"
  ]);
}

function countReachable(): CuratedProblem {
  return objectGraphProblem("countReachable", "CountReachable", "count_reachable", [
    { name: "source", type: stringType() }
  ], numberType(), "number", "int", "int", "Int", [
    "const seen = new Set<string>([source]);",
    "const queue = [source];",
    "for (let index = 0; index < queue.length; index += 1) {",
    "  const node = queue[index];",
    "  for (const neighbor of graph[node] ?? []) {",
    "    if (!seen.has(neighbor)) { seen.add(neighbor); queue.push(neighbor); }",
    "  }",
    "}",
    "return seen.size;"
  ], [
    "seen = {source}",
    "queue = [source]",
    "for node in queue:",
    "    for neighbor in graph.get(node, []):",
    "        if neighbor not in seen:",
    "            seen.add(neighbor)",
    "            queue.append(neighbor)",
    "return len(seen)"
  ], [
    "seen := map[string]bool{source: true}",
    "queue := []string{source}",
    "for index := 0; index < len(queue); index++ {",
    "\tnode := queue[index]",
    "\tfor _, neighbor := range graph[node] {",
    "\t\tif !seen[neighbor] { seen[neighbor] = true; queue = append(queue, neighbor) }",
    "\t}",
    "}",
    "return len(seen)"
  ], [
    "val seen = scala.collection.mutable.Set(source)",
    "val queue = scala.collection.mutable.Queue(source)",
    "while (queue.nonEmpty) {",
    "  val node = queue.dequeue()",
    "  for (neighbor <- graph.getOrElse(node, Seq.empty)) {",
    "    if (!seen.contains(neighbor)) { seen.add(neighbor); queue.enqueue(neighbor) }",
    "  }",
    "}",
    "seen.size"
  ]);
}

function hasCycle(): CuratedProblem {
  return objectGraphProblem("hasCycle", "HasCycle", "has_cycle", [], booleanType(), "boolean", "bool", "bool", "Boolean", [
    "const visiting = new Set<string>();",
    "const visited = new Set<string>();",
    "function dfs(node: string): boolean {",
    "  if (visiting.has(node)) return true;",
    "  if (visited.has(node)) return false;",
    "  visiting.add(node);",
    "  for (const neighbor of graph[node] ?? []) if (dfs(neighbor)) return true;",
    "  visiting.delete(node);",
    "  visited.add(node);",
    "  return false;",
    "}",
    "for (const node of Object.keys(graph)) if (dfs(node)) return true;",
    "return false;"
  ], [
    "visiting = set()",
    "visited = set()",
    "def dfs(node):",
    "    if node in visiting:",
    "        return True",
    "    if node in visited:",
    "        return False",
    "    visiting.add(node)",
    "    for neighbor in graph.get(node, []):",
    "        if dfs(neighbor):",
    "            return True",
    "    visiting.remove(node)",
    "    visited.add(node)",
    "    return False",
    "for node in graph:",
    "    if dfs(node):",
    "        return True",
    "return False"
  ], [
    "visiting := map[string]bool{}",
    "visited := map[string]bool{}",
    "var dfs func(string) bool",
    "dfs = func(node string) bool {",
    "\tif visiting[node] { return true }",
    "\tif visited[node] { return false }",
    "\tvisiting[node] = true",
    "\tfor _, neighbor := range graph[node] { if dfs(neighbor) { return true } }",
    "\tdelete(visiting, node)",
    "\tvisited[node] = true",
    "\treturn false",
    "}",
    "for node := range graph { if dfs(node) { return true } }",
    "return false"
  ], [
    "val visiting = scala.collection.mutable.Set.empty[String]",
    "val visited = scala.collection.mutable.Set.empty[String]",
    "def dfs(node: String): Boolean = {",
    "  if (visiting.contains(node)) return true",
    "  if (visited.contains(node)) return false",
    "  visiting.add(node)",
    "  for (neighbor <- graph.getOrElse(node, Seq.empty)) if (dfs(neighbor)) return true",
    "  visiting.remove(node)",
    "  visited.add(node)",
    "  false",
    "}",
    "graph.keys.exists(dfs)"
  ]);
}

function shortestGridPath(): CuratedProblem {
  return gridNumber("shortestGridPath", "ShortestGridPath", "shortest_grid_path", [
    "if (grid.length === 0 || grid[0].length === 0 || grid[0][0] === 1) return -1;",
    "const rows = grid.length;",
    "const cols = grid[0].length;",
    "if (grid[rows - 1][cols - 1] === 1) return -1;",
    "const queue: Array<[number, number, number]> = [[0, 0, 0]];",
    "const seen = new Set<string>([\"0,0\"]);",
    "for (let index = 0; index < queue.length; index += 1) {",
    "  const [row, col, distance] = queue[index];",
    "  if (row === rows - 1 && col === cols - 1) return distance;",
    "  for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {",
    "    const nr = row + dr;",
    "    const nc = col + dc;",
    "    const key = `${nr},${nc}`;",
    "    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 0 && !seen.has(key)) {",
    "      seen.add(key);",
    "      queue.push([nr, nc, distance + 1]);",
    "    }",
    "  }",
    "}",
    "return -1;"
  ], [
    "if not grid or not grid[0] or grid[0][0] == 1:",
    "    return -1",
    "rows = len(grid)",
    "cols = len(grid[0])",
    "if grid[rows - 1][cols - 1] == 1:",
    "    return -1",
    "queue = [(0, 0, 0)]",
    "seen = {(0, 0)}",
    "for row, col, distance in queue:",
    "    if row == rows - 1 and col == cols - 1:",
    "        return distance",
    "    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):",
    "        nr, nc = row + dr, col + dc",
    "        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in seen:",
    "            seen.add((nr, nc))",
    "            queue.append((nr, nc, distance + 1))",
    "return -1"
  ], [
    "if len(grid) == 0 || len(grid[0]) == 0 || grid[0][0] == 1 { return -1 }",
    "rows, cols := len(grid), len(grid[0])",
    "if grid[rows-1][cols-1] == 1 { return -1 }",
    "queue := [][]int{{0, 0, 0}}",
    "seen := map[[2]int]bool{[2]int{0, 0}: true}",
    "dirs := [][]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}",
    "for index := 0; index < len(queue); index++ {",
    "\trow, col, distance := queue[index][0], queue[index][1], queue[index][2]",
    "\tif row == rows-1 && col == cols-1 { return distance }",
    "\tfor _, dir := range dirs {",
    "\t\tnr, nc := row+dir[0], col+dir[1]",
    "\t\tkey := [2]int{nr, nc}",
    "\t\tif nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 0 && !seen[key] {",
    "\t\t\tseen[key] = true",
    "\t\t\tqueue = append(queue, []int{nr, nc, distance + 1})",
    "\t\t}",
    "\t}",
    "}",
    "return -1"
  ], [
    "if (grid.isEmpty || grid.head.isEmpty || grid(0)(0) == 1) return -1",
    "val rows = grid.length; val cols = grid.head.length",
    "if (grid(rows - 1)(cols - 1) == 1) return -1",
    "val queue = scala.collection.mutable.Queue((0, 0, 0))",
    "val seen = scala.collection.mutable.Set((0, 0))",
    "val dirs = Seq((1, 0), (-1, 0), (0, 1), (0, -1))",
    "while (queue.nonEmpty) {",
    "  val (row, col, distance) = queue.dequeue()",
    "  if (row == rows - 1 && col == cols - 1) return distance",
    "  for ((dr, dc) <- dirs) {",
    "    val nr = row + dr; val nc = col + dc",
    "    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid(nr)(nc) == 0 && !seen.contains((nr, nc))) {",
    "      seen.add((nr, nc)); queue.enqueue((nr, nc, distance + 1))",
    "    }",
    "  }",
    "}",
    "-1"
  ]);
}

function buildOrder(): CuratedProblem {
  return {
    signature: {
      name: "buildOrder",
      inputs: [{ name: "dependencies", type: objectType() }],
      output: nullable(arrayOf(stringType()))
    },
    languages: {
      python: py("build_order", "dependencies: dict[str, list[str]]", "list[str] | None", [
        "tasks = []",
        "seen_tasks = set()",
        "def add_task(task):",
        "    if task not in seen_tasks:",
        "        seen_tasks.add(task)",
        "        tasks.append(task)",
        "for task, prereqs in dependencies.items():",
        "    add_task(task)",
        "    for prereq in prereqs:",
        "        add_task(prereq)",
        "graph = {task: [] for task in tasks}",
        "indegree = {task: 0 for task in tasks}",
        "for task, prereqs in dependencies.items():",
        "    for prereq in prereqs:",
        "        graph[prereq].append(task)",
        "        indegree[task] += 1",
        "queue = [task for task in tasks if indegree[task] == 0]",
        "order = []",
        "for task in queue:",
        "    order.append(task)",
        "    for next_task in graph[task]:",
        "        indegree[next_task] -= 1",
        "        if indegree[next_task] == 0:",
        "            queue.append(next_task)",
        "return order if len(order) == len(tasks) else None"
      ]),
      typescript: ts("buildOrder", "dependencies: Record<string, string[]>", "string[] | null", [
        "const tasks: string[] = [];",
        "const seenTasks = new Set<string>();",
        "const addTask = (task: string) => { if (!seenTasks.has(task)) { seenTasks.add(task); tasks.push(task); } };",
        "for (const [task, prereqs] of Object.entries(dependencies)) {",
        "  addTask(task);",
        "  for (const prereq of prereqs) addTask(prereq);",
        "}",
        "const graph = new Map<string, string[]>(tasks.map((task) => [task, []]));",
        "const indegree = new Map<string, number>(tasks.map((task) => [task, 0]));",
        "for (const [task, prereqs] of Object.entries(dependencies)) {",
        "  for (const prereq of prereqs) {",
        "    graph.get(prereq)!.push(task);",
        "    indegree.set(task, (indegree.get(task) ?? 0) + 1);",
        "  }",
        "}",
        "const queue = tasks.filter((task) => indegree.get(task) === 0);",
        "const order: string[] = [];",
        "for (let index = 0; index < queue.length; index += 1) {",
        "  const task = queue[index];",
        "  order.push(task);",
        "  for (const nextTask of graph.get(task) ?? []) {",
        "    indegree.set(nextTask, indegree.get(nextTask)! - 1);",
        "    if (indegree.get(nextTask) === 0) queue.push(nextTask);",
        "  }",
        "}",
        "return order.length === tasks.length ? order : null;"
      ]),
      go: go("BuildOrder", "dependencies map[string][]string", "interface{}", [
        "tasks := []string{}",
        "seenTasks := map[string]bool{}",
        "addTask := func(task string) { if !seenTasks[task] { seenTasks[task] = true; tasks = append(tasks, task) } }",
        "dependencyKeys := []string{}",
        "for task := range dependencies { dependencyKeys = append(dependencyKeys, task) }",
        "sortStrings(dependencyKeys)",
        "for _, task := range dependencyKeys {",
        "\tprereqs := dependencies[task]",
        "\taddTask(task)",
        "\tfor _, prereq := range prereqs { addTask(prereq) }",
        "}",
        "graph := map[string][]string{}",
        "indegree := map[string]int{}",
        "for _, task := range tasks { graph[task] = []string{}; indegree[task] = 0 }",
        "for _, task := range dependencyKeys {",
        "\tprereqs := dependencies[task]",
        "\tfor _, prereq := range prereqs { graph[prereq] = append(graph[prereq], task); indegree[task]++ }",
        "}",
        "queue := []string{}",
        "for _, task := range tasks { if indegree[task] == 0 { queue = append(queue, task) } }",
        "order := []string{}",
        "for index := 0; index < len(queue); index++ {",
        "\ttask := queue[index]",
        "\torder = append(order, task)",
        "\tfor _, nextTask := range graph[task] { indegree[nextTask]--; if indegree[nextTask] == 0 { queue = append(queue, nextTask) } }",
        "}",
        "if len(order) != len(tasks) { return nil }",
        "return order"
      ], [
        "func sortStrings(values []string) {\n\tfor i := 1; i < len(values); i++ {\n\t\tvalue := values[i]\n\t\tj := i - 1\n\t\tfor j >= 0 && values[j] > value {\n\t\t\tvalues[j+1] = values[j]\n\t\t\tj--\n\t\t}\n\t\tvalues[j+1] = value\n\t}\n}"
      ]),
      scala: scala("buildOrder", "dependencies: Map[String, Seq[String]]", "Any", [
        "val tasks = scala.collection.mutable.ArrayBuffer.empty[String]",
        "val seenTasks = scala.collection.mutable.Set.empty[String]",
        "def addTask(task: String): Unit = if (!seenTasks.contains(task)) { seenTasks.add(task); tasks.append(task) }",
        "for ((task, prereqs) <- dependencies) { addTask(task); prereqs.foreach(addTask) }",
        "val graph = tasks.map(task => task -> scala.collection.mutable.ArrayBuffer.empty[String]).toMap",
        "val indegree = scala.collection.mutable.Map.from(tasks.map(task => task -> 0))",
        "for ((task, prereqs) <- dependencies; prereq <- prereqs) { graph(prereq).append(task); indegree(task) += 1 }",
        "val queue = scala.collection.mutable.Queue.from(tasks.filter(task => indegree(task) == 0))",
        "val order = scala.collection.mutable.ArrayBuffer.empty[String]",
        "while (queue.nonEmpty) {",
        "  val task = queue.dequeue(); order.append(task)",
        "  for (nextTask <- graph(task)) { indegree(nextTask) -= 1; if (indegree(nextTask) == 0) queue.enqueue(nextTask) }",
        "}",
        "if (order.length == tasks.length) order.toSeq else null"
      ])
    }
  };
}

function treeNumber(tsName: string, goName: string, pyName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return treeProblem(tsName, goName, pyName, numberType(), "number", "int", "int", "Int", tsBody, pyBody, goBody, scalaBody);
}

function treeNumberArray(tsName: string, goName: string, pyName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return treeProblem(tsName, goName, pyName, numberArray(), "number[]", "list[int]", "[]int", "Seq[Int]", tsBody, pyBody, goBody, scalaBody);
}

function treeBoolean(tsName: string, goName: string, pyName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return treeProblem(tsName, goName, pyName, booleanType(), "boolean", "bool", "bool", "Boolean", tsBody, pyBody, goBody, scalaBody);
}

function treeNullableNumber(tsName: string, goName: string, pyName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return treeProblem(tsName, goName, pyName, nullable(numberType()), "number | null", "int | None", "interface{}", "Any", tsBody, pyBody, goBody, scalaBody);
}

function treeProblem(
  tsName: string,
  goName: string,
  pyName: string,
  output: ValueType,
  tsReturn: string,
  pyReturn: string,
  goReturn: string,
  scalaReturn: string,
  tsBody: string[],
  pyBody: string[],
  goBody: string[],
  scalaBody: string[]
): CuratedProblem {
  return {
    signature: {
      name: tsName,
      inputs: [{ name: "values", type: treeArray() }],
      output
    },
    languages: {
      python: py(pyName, "values: list[object]", pyReturn, pyTreeBody(pyBody)),
      typescript: ts(tsName, "values: Array<number | null>", tsReturn, tsTreeBody(tsBody)),
      go: go(goName, "values []interface{}", goReturn, goTreeBody(goBody), goTreeHelpers()),
      scala: scala(tsName, "values: Seq[Any]", scalaReturn, scalaTreeBody(scalaBody))
    }
  };
}

function gridNumber(tsName: string, goName: string, pyName: string, tsBody: string[], pyBody: string[], goBody: string[], scalaBody: string[]): CuratedProblem {
  return {
    signature: {
      name: tsName,
      inputs: [{ name: "grid", type: gridType() }],
      output: numberType()
    },
    languages: {
      python: py(pyName, "grid: list[list[int]]", "int", pyBody),
      typescript: ts(tsName, "grid: number[][]", "number", tsBody),
      go: go(goName, "grid [][]int", "int", expandGoGridBody(goBody)),
      scala: scala(tsName, "grid: Seq[Seq[Int]]", "Int", expandScalaGridBody(scalaBody))
    }
  };
}

function objectGraphProblem(
  tsName: string,
  goName: string,
  pyName: string,
  extraInputs: { name: string; type: ValueType }[],
  output: ValueType,
  tsReturn: string,
  pyReturn: string,
  goReturn: string,
  scalaReturn: string,
  tsBody: string[],
  pyBody: string[],
  goBody: string[],
  scalaBody: string[]
): CuratedProblem {
  return {
    signature: {
      name: tsName,
      inputs: [{ name: "graph", type: objectType() }, ...extraInputs],
      output
    },
    languages: {
      python: py(pyName, `graph: dict[str, list[str]]${extraInputs.map((input) => `, ${input.name}: ${pyType(input.type)}`).join("")}`, pyReturn, pyBody),
      typescript: ts(tsName, `graph: Record<string, string[]>${extraInputs.map((input) => `, ${input.name}: ${tsType(input.type)}`).join("")}`, tsReturn, tsBody),
      go: go(goName, `graph map[string][]string${extraInputs.map((input) => `, ${input.name} ${goType(input.type)}`).join("")}`, goReturn, goBody),
      scala: scala(tsName, `graph: Map[String, Seq[String]]${extraInputs.map((input) => `, ${input.name}: ${scalaType(input.type)}`).join("")}`, scalaReturn, scalaBody)
    }
  };
}

function tsTreeBody(body: string[]): string[] {
  return [
    "type Node = { value: number; left: Node | null; right: Node | null };",
    "function buildTree(items: Array<number | null>): Node | null {",
    "  if (items.length === 0 || items[0] == null) return null;",
    "  const root: Node = { value: items[0], left: null, right: null };",
    "  const queue: Node[] = [root];",
    "  let index = 1;",
    "  while (index < items.length && queue.length > 0) {",
    "    const node = queue.shift()!;",
    "    const left = items[index++];",
    "    if (left != null) {",
    "      node.left = { value: left, left: null, right: null };",
    "      queue.push(node.left);",
    "    }",
    "    if (index < items.length) {",
    "      const right = items[index++];",
    "      if (right != null) {",
    "        node.right = { value: right, left: null, right: null };",
    "        queue.push(node.right);",
    "      }",
    "    }",
    "  }",
    "  return root;",
    "}",
    "const root = buildTree(values);",
    ...body
  ];
}

function pyTreeBody(body: string[]): string[] {
  return [
    "class Node:",
    "    def __init__(self, value):",
    "        self.value = value",
    "        self.left = None",
    "        self.right = None",
    "def build_tree(items):",
    "    if not items or items[0] is None:",
    "        return None",
    "    root = Node(items[0])",
    "    queue = [root]",
    "    index = 1",
    "    while index < len(items) and queue:",
    "        node = queue.pop(0)",
    "        left = items[index]",
    "        index += 1",
    "        if left is not None:",
    "            node.left = Node(left)",
    "            queue.append(node.left)",
    "        if index < len(items):",
    "            right = items[index]",
    "            index += 1",
    "            if right is not None:",
    "                node.right = Node(right)",
    "                queue.append(node.right)",
    "    return root",
    "root = build_tree(values)",
    ...body
  ];
}

function goTreeBody(body: string[]): string[] {
  return ["root := buildTree(values)", ...body];
}

function scalaTreeBody(body: string[]): string[] {
  return [
    "case class Node(value: Int, var left: Option[Node] = None, var right: Option[Node] = None)",
    "def asInt(value: Any): Int = value.asInstanceOf[Int]",
    "def buildTree(items: Seq[Any]): Option[Node] = {",
    "  if (items.isEmpty || items.head == null) return None",
    "  val root = Node(asInt(items.head))",
    "  val queue = scala.collection.mutable.Queue(root)",
    "  var index = 1",
    "  while (index < items.length && queue.nonEmpty) {",
    "    val node = queue.dequeue()",
    "    val left = items(index)",
    "    index += 1",
    "    if (left != null) { node.left = Some(Node(asInt(left))); queue.enqueue(node.left.get) }",
    "    if (index < items.length) {",
    "      val right = items(index)",
    "      index += 1",
    "      if (right != null) { node.right = Some(Node(asInt(right))); queue.enqueue(node.right.get) }",
    "    }",
    "  }",
    "  Some(root)",
    "}",
    "val root = buildTree(values)",
    ...body
  ];
}

function goTreeHelpers(): string[] {
  return [
    "type Node struct {\n\tValue int\n\tLeft *Node\n\tRight *Node\n}",
    "func buildTree(values []interface{}) *Node {\n\tif len(values) == 0 || values[0] == nil {\n\t\treturn nil\n\t}\n\troot := &Node{Value: asInt(values[0])}\n\tqueue := []*Node{root}\n\tindex := 1\n\tfor index < len(values) && len(queue) > 0 {\n\t\tnode := queue[0]\n\t\tqueue = queue[1:]\n\t\tleft := values[index]\n\t\tindex++\n\t\tif left != nil {\n\t\t\tnode.Left = &Node{Value: asInt(left)}\n\t\t\tqueue = append(queue, node.Left)\n\t\t}\n\t\tif index < len(values) {\n\t\t\tright := values[index]\n\t\t\tindex++\n\t\t\tif right != nil {\n\t\t\t\tnode.Right = &Node{Value: asInt(right)}\n\t\t\t\tqueue = append(queue, node.Right)\n\t\t\t}\n\t\t}\n\t}\n\treturn root\n}",
    "func asInt(value interface{}) int {\n\tswitch typed := value.(type) {\n\tcase int:\n\t\treturn typed\n\tcase float64:\n\t\treturn int(typed)\n\tdefault:\n\t\treturn 0\n\t}\n}"
  ];
}

function expandGoGridBody(body: string[]): string[] {
  if (body.length !== 1 || body[0] !== "return countGridIslands(grid)") return body;
  return [
    "if len(grid) == 0 { return 0 }",
    "rows, cols := len(grid), len(grid[0])",
    "seen := make([][]bool, rows)",
    "for row := range seen { seen[row] = make([]bool, cols) }",
    "islands := 0",
    "dirs := [][]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}",
    "for row := 0; row < rows; row++ {",
    "\tfor col := 0; col < cols; col++ {",
    "\t\tif grid[row][col] != 1 || seen[row][col] { continue }",
    "\t\tislands++",
    "\t\tstack := [][]int{{row, col}}",
    "\t\tseen[row][col] = true",
    "\t\tfor len(stack) > 0 {",
    "\t\t\tcell := stack[len(stack)-1]",
    "\t\t\tstack = stack[:len(stack)-1]",
    "\t\t\tfor _, dir := range dirs {",
    "\t\t\t\tnr, nc := cell[0]+dir[0], cell[1]+dir[1]",
    "\t\t\t\tif nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1 && !seen[nr][nc] {",
    "\t\t\t\t\tseen[nr][nc] = true",
    "\t\t\t\t\tstack = append(stack, []int{nr, nc})",
    "\t\t\t\t}",
    "\t\t\t}",
    "\t\t}",
    "\t}",
    "}",
    "return islands"
  ];
}

function expandScalaGridBody(body: string[]): string[] {
  if (body.length !== 1 || body[0] !== "countGridIslands(grid)") return body;
  return [
    "if (grid.isEmpty) return 0",
    "val rows = grid.length; val cols = grid.head.length",
    "val seen = Array.fill(rows, cols)(false)",
    "var islands = 0",
    "val dirs = Seq((1, 0), (-1, 0), (0, 1), (0, -1))",
    "for (row <- 0 until rows; col <- 0 until cols) {",
    "  if (grid(row)(col) == 1 && !seen(row)(col)) {",
    "    islands += 1",
    "    val stack = scala.collection.mutable.Stack((row, col))",
    "    seen(row)(col) = true",
    "    while (stack.nonEmpty) {",
    "      val (r, c) = stack.pop()",
    "      for ((dr, dc) <- dirs) {",
    "        val nr = r + dr; val nc = c + dc",
    "        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid(nr)(nc) == 1 && !seen(nr)(nc)) {",
    "          seen(nr)(nc) = true; stack.push((nr, nc))",
    "        }",
    "      }",
    "    }",
    "  }",
    "}",
    "islands"
  ];
}

function py(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "py",
    starter: `def ${name}(${args}) -> ${returnType}:\n    raise NotImplementedError\n`,
    reference: `def ${name}(${args}) -> ${returnType}:\n${indent(body, "    ")}\n`
  };
}

function ts(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "ts",
    starter: `export function ${name}(${args}): ${returnType} {\n  throw new Error("TODO");\n}\n`,
    reference: `export function ${name}(${args}): ${returnType} {\n${indent(body, "  ")}\n}\n`
  };
}

function go(name: string, args: string, returnType: string, body: string[], helpers: string[] = []): LanguageFiles {
  return {
    entrypoint: name,
    extension: "go",
    starter: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n\tpanic("TODO")\n}\n`,
    reference: `package solution\n\nfunc ${name}(${args}) ${returnType} {\n${indent(body, "\t")}\n}\n${helpers.length ? `\n${helpers.join("\n\n")}\n` : ""}`
  };
}

function scala(name: string, args: string, returnType: string, body: string[]): LanguageFiles {
  return {
    entrypoint: name,
    extension: "scala",
    starter: `object Solution {\n  def ${name}(${args}): ${returnType} = ???\n}\n`,
    reference: `object Solution {\n  def ${name}(${args}): ${returnType} = {\n${indent(body, "    ")}\n  }\n}\n`
  };
}

function goCopyGridHelper(): string {
  return "func copyGrid(grid [][]int) [][]int {\n\tresult := make([][]int, len(grid))\n\tfor row := range grid {\n\t\tresult[row] = append([]int{}, grid[row]...)\n\t}\n\treturn result\n}";
}

function arrayOf(items: ValueType): ValueType {
  return { type: "array", items };
}

function booleanType(): ValueType {
  return { type: "boolean" };
}

function edgeListType(): ValueType {
  return arrayOf(arrayOf(numberType()));
}

function gridType(): ValueType {
  return arrayOf(arrayOf(numberType()));
}

function nullable(valueType: ValueType): ValueType {
  return { ...valueType, nullable: true };
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

function stringType(): ValueType {
  return { type: "string" };
}

function treeArray(): ValueType {
  return arrayOf(nullable(numberType()));
}

function pyType(type: ValueType): string {
  if (type.type === "string") return "str";
  if (type.type === "number") return "int";
  if (type.type === "boolean") return "bool";
  return "object";
}

function tsType(type: ValueType): string {
  if (type.type === "string") return "string";
  if (type.type === "number") return "number";
  if (type.type === "boolean") return "boolean";
  return "unknown";
}

function goType(type: ValueType): string {
  if (type.type === "string") return "string";
  if (type.type === "number") return "int";
  if (type.type === "boolean") return "bool";
  return "interface{}";
}

function scalaType(type: ValueType): string {
  if (type.type === "string") return "String";
  if (type.type === "number") return "Int";
  if (type.type === "boolean") return "Boolean";
  return "Any";
}

function indent(lines: string[], prefix: string): string {
  return lines.map((line) => `${prefix}${line}`).join("\n");
}
