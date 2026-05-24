def flood_fill(grid: list[list[int]], sr: int, sc: int, color: int) -> list[list[int]]:
    result = [row[:] for row in grid]
    original = result[sr][sc]
    if original == color:
        return result
    rows = len(result)
    cols = len(result[0])
    stack = [(sr, sc)]
    result[sr][sc] = color
    while stack:
        row, col = stack.pop()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = row + dr, col + dc
            if 0 <= nr < rows and 0 <= nc < cols and result[nr][nc] == original:
                result[nr][nc] = color
                stack.append((nr, nc))
    return result
