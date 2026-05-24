def subsets_lexicographic(nums: list[int]) -> list[list[int]]:
    ordered = sorted(nums)
    result = []
    path = []
    def backtrack(start):
        result.append(list(path))
        for index in range(start, len(ordered)):
            path.append(ordered[index])
            backtrack(index + 1)
            path.pop()
    backtrack(0)
    return result
