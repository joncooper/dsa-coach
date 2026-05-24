def first_repeated_index(values: list[int]) -> int:
    seen = set()
    for index, value in enumerate(values):
        if value in seen:
            return index
        seen.add(value)
    return -1
