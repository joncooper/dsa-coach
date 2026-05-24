def missing_number(nums: list[int]) -> int:
    seen = set(nums)
    for candidate in range(len(nums) + 1):
        if candidate not in seen:
            return candidate
    return len(nums)
