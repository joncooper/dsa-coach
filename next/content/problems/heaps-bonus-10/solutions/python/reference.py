def max_score_after_halving(nums: list[int], k: int) -> int:
    values = nums[:]
    for _ in range(k):
        values.sort(reverse=True)
        if not values or values[0] <= 1:
            break
        values[0] = (values[0] + 1) // 2
    return sum(values)
