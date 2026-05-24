def count_grid_islands(grid: list[list[int]]) -> int:
    if not grid:
        return 0
    rows = len(grid)
    cols = len(grid[0])
    seen = [[False] * cols for _ in range(rows)]
    islands = 0
    for row in range(rows):
        for col in range(cols):
            if grid[row][col] != 1 or seen[row][col]:
                continue
            islands += 1
            stack = [(row, col)]
            seen[row][col] = True
            while stack:
                r, c = stack.pop()
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1 and not seen[nr][nc]:
                        seen[nr][nc] = True
                        stack.append((nr, nc))
    return islands
