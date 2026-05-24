def distinct_permutations(nums: list[int]) -> list[list[int]]:
    ordered = sorted(nums)
    result = []
    used = [False] * len(ordered)
    current = []
    def backtrack():
        if len(current) == len(ordered):
            result.append(list(current))
            return
        for index in range(len(ordered)):
            if used[index]:
                continue
            if index > 0 and ordered[index] == ordered[index - 1] and not used[index - 1]:
                continue
            used[index] = True
            current.append(ordered[index])
            backtrack()
            current.pop()
            used[index] = False
    backtrack()
    return result
