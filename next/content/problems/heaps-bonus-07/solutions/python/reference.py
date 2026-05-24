def k_weakest_rows(grid: list[list[int]], k: int) -> list[int]:
    ranked = sorted((sum(row), index) for index, row in enumerate(grid))
    return [index for _, index in ranked[:k]]
