def dedupe_sorted(nums: list[int]) -> list[int]:
    result = []
    for num in nums:
        if not result or result[-1] != num:
            result.append(num)
    return result
