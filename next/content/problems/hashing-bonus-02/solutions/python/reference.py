def most_frequent_value(values: list[int]) -> int | None:
    if not values:
        return None
    counts = {}
    for value in values:
        counts[value] = counts.get(value, 0) + 1
    best = values[0]
    for value in values:
        if counts[value] > counts[best]:
            best = value
    return best
