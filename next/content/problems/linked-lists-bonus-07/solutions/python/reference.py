def is_list_sorted(values: list[int]) -> bool:
    for index in range(1, len(values)):
        if values[index - 1] > values[index]:
            return False
    return True
