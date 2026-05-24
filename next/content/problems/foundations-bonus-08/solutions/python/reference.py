def sum_even_indices(nums: list[int]) -> int:
    total = 0
    for index in range(0, len(nums), 2):
        total += nums[index]
    return total
