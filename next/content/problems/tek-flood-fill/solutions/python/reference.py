def flood_fill(grid: list[list[int]], sr: int, sc: int, new_value: int) -> list[list[int]]:
    old = grid[sr][sc]
    if old == new_value:
        return grid
    rows, cols = len(grid), len(grid[0])
    stack = [(sr, sc)]
    while stack:
        row, col = stack.pop()
        if row < 0 or row >= rows or col < 0 or col >= cols or grid[row][col] != old:
            continue
        grid[row][col] = new_value
        stack.extend([(row + 1, col), (row - 1, col), (row, col + 1), (row, col - 1)])
    return grid
