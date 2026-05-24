def char_frequency_table(text: str) -> dict[str, int]:
    counts = {}
    for char in text:
        counts[char] = counts.get(char, 0) + 1
    return counts
