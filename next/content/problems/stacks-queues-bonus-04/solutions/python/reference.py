def paren_score(text: str) -> int:
    stack = [0]
    for char in text:
        if char == '(':
            stack.append(0)
        else:
            inside = stack.pop()
            stack[-1] += max(1, inside * 2)
    return stack[0]
