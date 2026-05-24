def balanced_brackets_local(text: str) -> bool:
    pairs = {')': '(', ']': '[', '}': '{'}
    openers = set(pairs.values())
    stack = []
    for char in text:
        if char in openers:
            stack.append(char)
        elif char in pairs:
            if not stack or stack[-1] != pairs[char]:
                return False
            stack.pop()
    return not stack
