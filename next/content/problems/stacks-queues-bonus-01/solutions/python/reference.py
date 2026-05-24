def reverse_queue(items: list[object]) -> list[object]:
    stack = []
    for item in items:
        stack.append(item)
    result = []
    while stack:
        result.append(stack.pop())
    return result
