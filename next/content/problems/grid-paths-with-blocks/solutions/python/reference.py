def grid_paths_with_blocks(grid: list[list[int]]) -> int:
    if not grid or not grid[0] or grid[0][0] == 1:
        return 0
    cols = len(grid[0])
    dp = [0] * cols
    dp[0] = 1
    for row in range(len(grid)):
        for col in range(cols):
            if grid[row][col] == 1:
                dp[col] = 0
            elif col > 0:
                dp[col] += dp[col - 1]
    return dp[-1]
