def count_boats(weights: list[int], limit: int) -> int:
    weights = sorted(weights)
    left = 0
    right = len(weights) - 1
    boats = 0
    while left <= right:
        if weights[left] + weights[right] <= limit:
            left += 1
        right -= 1
        boats += 1
    return boats
