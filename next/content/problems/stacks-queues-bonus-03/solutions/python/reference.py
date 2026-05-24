def collapse_duplicates(text: str) -> str:
    stack = []
    for char in text:
        if stack and stack[-1] == char:
            stack.pop()
        else:
            stack.append(char)
    return ''.join(stack)
