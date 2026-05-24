def first_repeated_value(values: list[int]) -> int | None:
    seen = set()
    for value in values:
        if value in seen:
            return value
        seen.add(value)
    return None
