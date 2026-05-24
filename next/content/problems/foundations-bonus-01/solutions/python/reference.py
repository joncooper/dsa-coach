def running_maximum(nums: list[int]) -> list[int]:
    result = []
    best = None
    for num in nums:
        best = num if best is None else max(best, num)
        result.append(best)
    return result
