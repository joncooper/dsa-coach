def range_sum_queries(nums: list[int], queries: list[list[int]]) -> list[int]:
    prefix = [0]
    for num in nums:
        prefix.append(prefix[-1] + num)
    result = []
    for lo, hi in queries:
        result.append(prefix[hi + 1] - prefix[lo])
    return result
