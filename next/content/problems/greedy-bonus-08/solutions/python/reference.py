def max_sum_after_flips(nums: list[int], k: int) -> int:
    values = sorted(nums)
    remaining = k
    for index in range(len(values)):
        if remaining == 0 or values[index] >= 0:
            break
        values[index] = -values[index]
        remaining -= 1
    total = sum(values)
    smallest_abs = min(abs(value) for value in values)
    if remaining % 2 == 1:
        total -= 2 * smallest_abs
    return total
