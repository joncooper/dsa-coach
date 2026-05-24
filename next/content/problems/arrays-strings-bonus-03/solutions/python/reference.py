def move_zeros(nums: list[int]) -> list[int]:
    non_zero = [num for num in nums if num != 0]
    return non_zero + [0] * (len(nums) - len(non_zero))
