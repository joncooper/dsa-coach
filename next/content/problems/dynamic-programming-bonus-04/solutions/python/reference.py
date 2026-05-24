def min_path_sum(grid: list[list[int]]) -> int:
    if not grid or not grid[0]:
        return 0
    rows = len(grid)
    cols = len(grid[0])
    dp = [[0] * cols for _ in range(rows)]
    for row in range(rows):
        for col in range(cols):
            if row == 0 and col == 0:
                dp[row][col] = grid[row][col]
            else:
                dp[row][col] = grid[row][col] + min(dp[row - 1][col] if row > 0 else float('inf'), dp[row][col - 1] if col > 0 else float('inf'))
    return dp[-1][-1]
