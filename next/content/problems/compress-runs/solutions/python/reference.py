def compress_runs(text: str) -> str:
    if not text:
        return ""
    pieces = []
    active = text[0]
    count = 1
    for char in text[1:]:
        if char == active:
            count += 1
        else:
            pieces.append(f"{active}{count}")
            active = char
            count = 1
    pieces.append(f"{active}{count}")
    return "".join(pieces)
