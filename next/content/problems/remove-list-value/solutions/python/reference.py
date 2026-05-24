def remove_list_value(values: list[int], target: int) -> list[int] | None:
    result = [value for value in values if value != target]
    if len(values) == 1 and not result:
        return None
    return result
