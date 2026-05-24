def combination_sum_exact_local(nums: list[int], target: int) -> list[list[int]]:
    ordered = sorted(nums)
    result = []
    path = []
    def backtrack(start, remaining):
        if remaining == 0:
            result.append(list(path))
            return
        previous = None
        for index in range(start, len(ordered)):
            value = ordered[index]
            if previous is not None and value == previous:
                continue
            if value > remaining:
                break
            path.append(value)
            backtrack(index + 1, remaining - value)
            path.pop()
            previous = value
    backtrack(0, target)
    return result
