def min_window_for_sum(nums: list[int], target: int) -> int:
    left = 0
    total = 0
    best = None
    for right, num in enumerate(nums):
        total += num
        while total >= target:
            length = right - left + 1
            best = length if best is None else min(best, length)
            total -= nums[left]
            left += 1
    return 0 if best is None else best
