def remove_element(nums: list[int], value: int) -> int:
    count = 0
    for num in nums:
        if num != value:
            count += 1
    return count
