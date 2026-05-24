def value_at_index(values: list[int], index: int) -> int | None:
    if index < 0 or index >= len(values):
        return None
    return values[index]
