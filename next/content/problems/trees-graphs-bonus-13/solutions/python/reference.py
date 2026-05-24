def shortest_grid_path(grid: list[list[int]]) -> int:
    if not grid or not grid[0] or grid[0][0] == 1:
        return -1
    rows = len(grid)
    cols = len(grid[0])
    if grid[rows - 1][cols - 1] == 1:
        return -1
    queue = [(0, 0, 0)]
    seen = {(0, 0)}
    for row, col, distance in queue:
        if row == rows - 1 and col == cols - 1:
            return distance
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = row + dr, col + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in seen:
                seen.add((nr, nc))
                queue.append((nr, nc, distance + 1))
    return -1
