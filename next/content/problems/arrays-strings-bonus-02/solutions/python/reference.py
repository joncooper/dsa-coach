def running_range_width(nums: list[int]) -> list[int]:
    result = []
    low = None
    high = None
    for num in nums:
        low = num if low is None else min(low, num)
        high = num if high is None else max(high, num)
        result.append(high - low)
    return result
