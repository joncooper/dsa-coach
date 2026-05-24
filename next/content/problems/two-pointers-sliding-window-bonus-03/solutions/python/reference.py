def remove_element(nums: list[int], value: int) -> int:
    write = 0
    for num in nums:
        if num != value:
            nums[write] = num
            write += 1
    return write
