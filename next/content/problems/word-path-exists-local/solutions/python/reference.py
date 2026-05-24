def word_path_exists_local(board: list[list[str]], word: str) -> bool:
    if word == '':
        return True
    if not board or not board[0]:
        return False
    rows, cols = len(board), len(board[0])
    if len(word) > rows * cols:
        return False
    visited = [[False] * cols for _ in range(rows)]
    def dfs(row, col, index):
        if index == len(word):
            return True
        if row < 0 or row >= rows or col < 0 or col >= cols:
            return False
        if visited[row][col] or board[row][col] != word[index]:
            return False
        visited[row][col] = True
        found = dfs(row + 1, col, index + 1) or dfs(row - 1, col, index + 1) or dfs(row, col + 1, index + 1) or dfs(row, col - 1, index + 1)
        visited[row][col] = False
        return found
    for row in range(rows):
        for col in range(cols):
            if dfs(row, col, 0):
                return True
    return False
