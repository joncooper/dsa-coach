def can_reach_end_local(jumps: list[int]) -> bool:
    farthest = 0
    for index, jump in enumerate(jumps):
        if index > farthest:
            return False
        farthest = max(farthest, index + jump)
    return True
