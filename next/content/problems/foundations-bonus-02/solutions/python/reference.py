def is_sorted_ascending(nums: list[int]) -> bool:
    for index in range(1, len(nums)):
        if nums[index] < nums[index - 1]:
            return False
    return True
