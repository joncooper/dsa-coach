def most_frequent_character(text: str) -> str | None:
    if not text:
        return None
    counts = {}
    for char in text:
        counts[char] = counts.get(char, 0) + 1
    best = text[0]
    for char in text:
        if counts[char] > counts[best]:
            best = char
    return best
