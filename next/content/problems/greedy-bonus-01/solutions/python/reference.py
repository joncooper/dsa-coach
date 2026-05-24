def fewest_coins(coins: list[int], amount: int) -> int:
    remaining = amount
    count = 0
    for coin in sorted(coins, reverse=True):
        count += remaining // coin
        remaining %= coin
    return count
