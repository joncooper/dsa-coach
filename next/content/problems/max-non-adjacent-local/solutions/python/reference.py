def max_non_adjacent_local(nums: list[int]) -> int:
    skip = 0
    take = 0
    for num in nums:
        next_take = skip + num
        skip = max(skip, take)
        take = next_take
    return max(skip, take, 0)
