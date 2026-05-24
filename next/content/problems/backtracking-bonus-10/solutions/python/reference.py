def count_sign_assignments(nums: list[int], target: int) -> int:
    count = 0
    def backtrack(index, running):
        nonlocal count
        if index == len(nums):
            if running == target:
                count += 1
            return
        backtrack(index + 1, running + nums[index])
        backtrack(index + 1, running - nums[index])
    backtrack(0, 0)
    return count
