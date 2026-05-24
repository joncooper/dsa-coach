def count_latin_completions(grid: list[list[int]]) -> int:
    n = len(grid)
    if n == 0:
        return 0
    for row in grid:
        if len(row) != n:
            return 0
    rows_used = [set() for _ in range(n)]
    cols_used = [set() for _ in range(n)]
    blanks = []
    for row in range(n):
        for col in range(n):
            value = grid[row][col]
            if value == 0:
                blanks.append((row, col))
                continue
            if value < 1 or value > n or value in rows_used[row] or value in cols_used[col]:
                return 0
            rows_used[row].add(value)
            cols_used[col].add(value)
    count = 0
    def backtrack(index):
        nonlocal count
        if index == len(blanks):
            count += 1
            return
        row, col = blanks[index]
        for value in range(1, n + 1):
            if value in rows_used[row] or value in cols_used[col]:
                continue
            rows_used[row].add(value); cols_used[col].add(value)
            backtrack(index + 1)
            rows_used[row].remove(value); cols_used[col].remove(value)
    backtrack(0)
    return count
