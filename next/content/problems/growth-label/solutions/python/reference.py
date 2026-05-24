def growth_label(operations: list[int]) -> str:
    if len(operations) < 2:
        return 'unknown'
    total = 0
    for index in range(len(operations) - 1):
        if operations[index] == 0:
            return 'unknown'
        total += operations[index + 1] / operations[index]
    average = total / (len(operations) - 1)
    if 0.75 <= average <= 1.35:
        return 'constant'
    if 1.55 <= average <= 2.45:
        return 'linear'
    if 3.1 <= average <= 5.0:
        return 'quadratic'
    return 'unknown'
