def dedup_sorted_list(values: list[int]) -> list[int]:
    result = []
    for value in values:
        if not result or result[-1] != value:
            result.append(value)
    return result
