def diagonal_sum(matrix: list[list[int]]) -> int:
    total = 0
    n = len(matrix)
    for index in range(n):
        total += matrix[index][index]
        other = n - 1 - index
        if other != index:
            total += matrix[index][other]
    return total
