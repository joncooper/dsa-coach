def two_sum_exists(nums: list[int], target: int) -> bool:
    seen = set()
    for num in nums:
        if target - num in seen:
            return True
        seen.add(num)
    return False
