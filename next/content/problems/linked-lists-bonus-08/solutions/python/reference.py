def remove_nth_from_end(values: list[int], n: int) -> list[int]:
    index = len(values) - n
    if index < 0 or index >= len(values):
        return values[:]
    return values[:index] + values[index + 1:]
