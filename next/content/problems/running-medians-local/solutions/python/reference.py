def running_medians_local(nums: list[int]) -> list[float]:
    seen = []
    medians = []
    for num in nums:
        index = 0
        while index < len(seen) and seen[index] < num:
            index += 1
        seen.insert(index, num)
        middle = len(seen) // 2
        if len(seen) % 2 == 1:
            medians.append(seen[middle])
        else:
            medians.append((seen[middle - 1] + seen[middle]) / 2)
    return medians
