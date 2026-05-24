def next_greater_values(nums: list[int]) -> list[int]:
    result = [-1] * len(nums)
    stack = []
    for index, num in enumerate(nums):
        while stack and num > nums[stack[-1]]:
            result[stack.pop()] = num
        stack.append(index)
    return result
