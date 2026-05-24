def first_negative_index(nums: list[int]) -> int:
    for index, num in enumerate(nums):
        if num < 0:
            return index
    return -1
