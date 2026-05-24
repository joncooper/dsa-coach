def count_distinct_pair_sums(nums: list[int]) -> int:
    sums = set()
    for left in range(len(nums)):
        for right in range(left + 1, len(nums)):
            sums.add(nums[left] + nums[right])
    return len(sums)
