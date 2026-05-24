def count_safe_windows(nums: list[int], k: int, limit: int) -> int:
    if k <= 0 or k > len(nums):
        return 0
    window_sum = sum(nums[:k])
    count = 1 if window_sum <= limit else 0
    for right in range(k, len(nums)):
        window_sum += nums[right] - nums[right - k]
        if window_sum <= limit:
            count += 1
    return count
