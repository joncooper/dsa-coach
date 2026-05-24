def largest_square(grid: list[list[int]]) -> int:
    if not grid or not grid[0]:
        return 0
    rows = len(grid)
    cols = len(grid[0])
    dp = [[0] * cols for _ in range(rows)]
    best = 0
    for row in range(rows):
        for col in range(cols):
            if grid[row][col] == 1:
                dp[row][col] = 1 if row == 0 or col == 0 else 1 + min(dp[row - 1][col], dp[row][col - 1], dp[row - 1][col - 1])
                best = max(best, dp[row][col])
    return best * best
