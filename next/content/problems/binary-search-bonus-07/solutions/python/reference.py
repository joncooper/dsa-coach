def min_eating_speed(piles: list[int], hours: int) -> int:
    def needed_hours(speed):
        return sum((pile + speed - 1) // speed for pile in piles)
    left = 1
    right = max(piles)
    while left < right:
        mid = (left + right) // 2
        if needed_hours(mid) <= hours:
            right = mid
        else:
            left = mid + 1
    return left
