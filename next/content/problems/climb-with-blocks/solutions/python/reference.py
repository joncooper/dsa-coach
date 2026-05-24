def climb_with_blocks(n: int, blocks: list[int]) -> int:
    dp = [0] * (n + 1)
    dp[0] = 1
    for stair in range(1, n + 1):
        for block in blocks:
            if stair >= block:
                dp[stair] += dp[stair - block]
    return dp[n]
