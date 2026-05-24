def isomorphic_strings(source: str, target: str) -> bool:
    if len(source) != len(target):
        return False
    forward = {}
    used = set()
    for left, right in zip(source, target):
        if left in forward:
            if forward[left] != right:
                return False
        else:
            if right in used:
                return False
            forward[left] = right
            used.add(right)
    return True
