def validate_stack_sequence(pushed: list[int], popped: list[int]) -> bool:
    stack = []
    pop_index = 0
    for value in pushed:
        stack.append(value)
        while stack and pop_index < len(popped) and stack[-1] == popped[pop_index]:
            stack.pop()
            pop_index += 1
    return pop_index == len(popped)
