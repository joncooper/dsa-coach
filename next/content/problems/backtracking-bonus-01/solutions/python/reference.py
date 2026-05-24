def subsets_of_size(nums: list[int], k: int) -> list[list[int]]:
    result = []
    chosen = []
    def backtrack(start):
        if len(chosen) == k:
            result.append(list(chosen))
            return
        for index in range(start, len(nums)):
            chosen.append(nums[index])
            backtrack(index + 1)
            chosen.pop()
    if 0 <= k <= len(nums):
        backtrack(0)
    return sorted(result)
