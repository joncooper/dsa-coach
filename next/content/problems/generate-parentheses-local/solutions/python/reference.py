def generate_parentheses_local(n: int) -> list[str]:
    result = []
    path = []
    def backtrack(opened, closed):
        if len(path) == 2 * n:
            result.append(''.join(path))
            return
        if opened < n:
            path.append('(')
            backtrack(opened + 1, closed)
            path.pop()
        if closed < opened:
            path.append(')')
            backtrack(opened, closed + 1)
            path.pop()
    backtrack(0, 0)
    return result
