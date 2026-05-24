def window_averages(nums: list[int], k: int) -> list[float]:
    if k <= 0 or k > len(nums):
        return []
    total = sum(nums[:k])
    result = [total / k]
    for right in range(k, len(nums)):
        total += nums[right] - nums[right - k]
        result.append(total / k)
    return result
