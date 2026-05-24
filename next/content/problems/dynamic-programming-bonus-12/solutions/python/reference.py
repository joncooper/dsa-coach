def max_profit_with_cooldown(prices: list[int]) -> int:
    if not prices:
        return 0
    hold = -prices[0]
    sold = 0
    rest = 0
    for price in prices[1:]:
        previous_sold = sold
        sold = hold + price
        hold = max(hold, rest - price)
        rest = max(rest, previous_sold)
    return max(sold, rest)
