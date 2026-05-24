def longest_within_limit(nums: list[int], limit: int) -> int:
    left = 0
    total = 0
    best = 0
    for right, num in enumerate(nums):
        total += num
        while total > limit and left <= right:
            total -= nums[left]
            left += 1
        best = max(best, right - left + 1)
    return best
