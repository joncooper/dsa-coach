def count_change(coins: list[int], amount: int) -> int:
    dp = [0] * (amount + 1)
    dp[0] = 1
    for coin in coins:
        for total in range(coin, amount + 1):
            dp[total] += dp[total - coin]
    return dp[amount]
