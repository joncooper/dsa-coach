def swap_pairs(values: list[int]) -> list[int]:
    result = values[:]
    for index in range(0, len(result) - 1, 2):
        result[index], result[index + 1] = result[index + 1], result[index]
    return result
