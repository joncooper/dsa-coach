def insert_after_index(values: list[int], index: int, value: int) -> list[int]:
    if index < 0 or index >= len(values):
        return values[:]
    return values[:index + 1] + [value] + values[index + 1:]
