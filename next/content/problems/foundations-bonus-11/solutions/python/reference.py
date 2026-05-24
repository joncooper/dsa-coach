def pivot_index(nums: list[int]) -> int:
    total = sum(nums)
    left = 0
    for index, num in enumerate(nums):
        if left == total - left - num:
            return index
        left += num
    return -1
