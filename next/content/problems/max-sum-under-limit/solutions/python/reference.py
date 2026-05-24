def max_sum_under_limit(nums: list[int], limit: int) -> int:
    left = 0
    total = 0
    best = 0
    for right, num in enumerate(nums):
        total += num
        while left <= right and total > limit:
            total -= nums[left]
            left += 1
        best = max(best, total)
    return best
