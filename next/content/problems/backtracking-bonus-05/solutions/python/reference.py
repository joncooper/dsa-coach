def count_grid_paths(grid: list[list[int]]) -> int:
    if not grid or not grid[0]:
        return 0
    rows, cols = len(grid), len(grid[0])
    if grid[0][0] == 1 or grid[rows - 1][cols - 1] == 1:
        return 0
    visited = [[False] * cols for _ in range(rows)]
    count = 0
    def backtrack(row, col):
        nonlocal count
        if row == rows - 1 and col == cols - 1:
            count += 1
            return
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = row + dr, col + dc
            if 0 <= nr < rows and 0 <= nc < cols and not visited[nr][nc] and grid[nr][nc] == 0:
                visited[nr][nc] = True
                backtrack(nr, nc)
                visited[nr][nc] = False
    visited[0][0] = True
    backtrack(0, 0)
    return count
