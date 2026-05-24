def simplify_folder_steps(steps: list[str]) -> str:
    stack = []
    for step in steps:
        if step == '.' or step == '':
            continue
        if step == '..':
            if stack:
                stack.pop()
        else:
            stack.append(step)
    return '/' + '/'.join(stack)
