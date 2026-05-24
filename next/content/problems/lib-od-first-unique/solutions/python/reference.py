def first_unique(stream: list[str]) -> list[str]:
    counts = {}
    pending = []
    out = []
    for value in stream:
        counts[value] = counts.get(value, 0) + 1
        if counts[value] == 1:
            pending.append(value)
        else:
            pending = [item for item in pending if item != value]
        out.append(pending[0] if pending else '')
    return out
