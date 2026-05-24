def coin_change_min_local(coins: list[int], amount: int) -> int:
    impossible = amount + 1
    dp = [impossible] * (amount + 1)
    dp[0] = 0
    for total in range(1, amount + 1):
        for coin in coins:
            if total >= coin:
                dp[total] = min(dp[total], dp[total - coin] + 1)
    return -1 if dp[amount] == impossible else dp[amount]
