def second_largest(values: list[int]) -> int | None:
    largest = None
    second = None
    for value in values:
        if largest is None or value > largest:
            if largest is not None and value != largest:
                second = largest
            largest = value
        elif value != largest and (second is None or value > second):
            second = value
    return second
