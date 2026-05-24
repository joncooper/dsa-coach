def max_list_value(values: list[int]) -> int | None:
    if not values:
        return None
    best = values[0]
    for value in values:
        best = max(best, value)
    return best
