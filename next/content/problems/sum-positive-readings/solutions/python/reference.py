def sum_positive_readings(readings: list[int]) -> int:
    total = 0
    for reading in readings:
        if reading > 0:
            total += reading
    return total
