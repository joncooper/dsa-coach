def min_stack_ops(ops: list[list[object]]) -> list[int]:
    stack = []
    mins = []
    answers = []
    for op in ops:
        if op[0] == 'push':
            value = int(op[1])
            stack.append(value)
            mins.append(value if not mins else min(value, mins[-1]))
        elif op[0] == 'pop':
            if stack:
                stack.pop()
                mins.pop()
        elif op[0] == 'min' and mins:
            answers.append(mins[-1])
    return answers
