import { setProblem } from "./_shared";

const floodFill = setProblem({
  id: "tek-flood-fill",
  title: "Flood Fill a Region",
  difficulty: "easy",
  patterns: ["grid", "BFS/DFS", "connected component"],
  entrypoint: "flood_fill",
  prompt:
    "You are given a 2D grid of integers, a start cell `(sr, sc)`, and a `new_value`. Starting from the start cell, repaint every cell that is connected to it through 4-directional moves (up, down, left, right) and shares the start cell's original value, setting those cells to `new_value`. Cells of a different value act as walls and are never crossed. Return the modified grid. If `new_value` already equals the start cell's value, return the grid unchanged — do not loop forever.",
  constraints: [
    "The grid is a non-empty rectangular list of equal-length integer rows, with at least one column.",
    "0 <= sr < number of rows and 0 <= sc < number of columns.",
    "Connectivity is 4-directional only (no diagonals).",
    "If new_value equals the start cell's original value, return the grid as-is.",
    "Mutating the input grid and returning it is acceptable."
  ],
  examples: [
    {
      name: "fill corner region",
      args: [[[1, 1, 0], [1, 0, 0], [0, 0, 1]], 0, 0, 2],
      expected: [[2, 2, 0], [2, 0, 0], [0, 0, 1]]
    }
  ],
  starterCode:
    "def flood_fill(grid, sr, sc, new_value):\n" +
    "    # BFS or DFS from (sr, sc) over cells equal to the original value.\n" +
    "    pass\n",
  referenceCode: `def flood_fill(grid, sr, sc, new_value):
    old = grid[sr][sc]
    if old == new_value:
        return grid
    rows, cols = len(grid), len(grid[0])
    stack = [(sr, sc)]
    while stack:
        r, c = stack.pop()
        if r < 0 or r >= rows or c < 0 or c >= cols:
            continue
        if grid[r][c] != old:
            continue
        grid[r][c] = new_value
        stack.append((r + 1, c))
        stack.append((r - 1, c))
        stack.append((r, c + 1))
        stack.append((r, c - 1))
    return grid
`,
  solutionCode: `from collections import deque

def flood_fill(grid, sr, sc, new_value):
    original = grid[sr][sc]
    if original == new_value:
        return grid
    rows = len(grid)
    cols = len(grid[0])
    queue = deque([(sr, sc)])
    grid[sr][sc] = new_value
    while queue:
        r, c = queue.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == original:
                grid[nr][nc] = new_value
                queue.append((nr, nc))
    return grid
`,
  visibleTests: [
    {
      name: "fill corner region",
      args: [[[1, 1, 0], [1, 0, 0], [0, 0, 1]], 0, 0, 2],
      expected: [[2, 2, 0], [2, 0, 0], [0, 0, 1]]
    },
    {
      name: "new value equals old is a no-op",
      args: [[[1, 1], [1, 1]], 0, 0, 1],
      expected: [[1, 1], [1, 1]]
    },
    {
      name: "single cell grid",
      args: [[[5]], 0, 0, 9],
      expected: [[9]]
    }
  ],
  hiddenTests: [
    {
      name: "whole grid one color",
      args: [[[3, 3], [3, 3]], 1, 1, 7],
      expected: [[7, 7], [7, 7]]
    },
    {
      name: "walls isolate the start cell",
      args: [[[1, 2, 1], [2, 2, 2], [1, 2, 1]], 0, 0, 9],
      expected: [[9, 2, 1], [2, 2, 2], [1, 2, 1]]
    },
    {
      name: "diagonal cells are not connected",
      args: [[[1, 0], [0, 1]], 0, 0, 5],
      expected: [[5, 0], [0, 1]]
    },
    {
      name: "L-shaped region",
      args: [[[0, 0, 0], [0, 1, 1]], 0, 0, 4],
      expected: [[4, 4, 4], [4, 1, 1]]
    },
    {
      name: "start away from origin",
      args: [[[8, 8, 8], [8, 1, 8], [8, 8, 8]], 1, 1, 0],
      expected: [[8, 8, 8], [8, 0, 8], [8, 8, 8]]
    },
    {
      name: "two separate regions only one filled",
      args: [[[1, 0, 1], [1, 0, 1]], 0, 0, 6],
      expected: [[6, 0, 1], [6, 0, 1]]
    },
    {
      name: "single row grid stops at wall",
      args: [[[1, 1, 1, 2, 1]], 0, 0, 7],
      expected: [[7, 7, 7, 2, 1]]
    },
    {
      name: "single column grid stops at wall",
      args: [[[1], [1], [2], [1]], 0, 0, 9],
      expected: [[9], [9], [2], [1]]
    }
  ],
  hints: [
    "Read the start cell's original value first; if it already equals new_value, return immediately or you will recurse forever.",
    "Use an explicit stack or recursion, pushing the four orthogonal neighbours and bounds-checking before you read or write a cell.",
    "Overwriting a cell with new_value before exploring its neighbours doubles as the visited-marker, so no separate visited set is needed."
  ],
  solution:
    "Capture the start cell's original value. If it equals new_value, return the grid untouched to avoid an infinite loop. Otherwise run a DFS/BFS from the start cell: for each cell, bounds-check, skip cells whose value is not the original, paint it with new_value, and enqueue its four orthogonal neighbours. Painting a cell as you visit it is what keeps the traversal from revisiting and looping.",
  walkthrough:
    "The single most important line is the early return when new_value equals the original — without it the 'paint then recurse' approach never terminates because painted cells still match. Once that guard is in place, mutating the cell on visit serves double duty as the visited marker, which is why this needs no auxiliary set: the grid itself records progress.",
  followUps: [
    "How would you switch to 8-directional connectivity, and what new edge cases appear?",
    "How would you flood fill without recursion and without an explicit stack, to bound memory on a huge grid?"
  ],
  complexity: { time: "O(rows * cols) in the worst case", space: "O(rows * cols) for the stack/recursion" }
});

export const gridProblems = [floodFill];
