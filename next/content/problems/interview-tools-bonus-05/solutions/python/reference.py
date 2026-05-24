def count_islands(grid: list[list[int]]) -> int:
    if not grid or not grid[0]:
        return 0
    rows, cols = len(grid), len(grid[0])
    visited = [[False] * cols for _ in range(rows)]
    def dfs(row, col):
        if row < 0 or row >= rows or col < 0 or col >= cols or visited[row][col] or grid[row][col] == 0:
            return
        visited[row][col] = True
        dfs(row + 1, col); dfs(row - 1, col); dfs(row, col + 1); dfs(row, col - 1)
    islands = 0
    for row in range(rows):
        for col in range(cols):
            if grid[row][col] == 1 and not visited[row][col]:
                islands += 1
                dfs(row, col)
    return islands
