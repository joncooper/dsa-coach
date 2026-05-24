def top_k_words(text: str, k: int) -> list[list[object]]:
    import re
    if k <= 0:
        return []
    counts = {}
    for word in re.findall(r'[a-zA-Z]+', text.lower()):
        counts[word] = counts.get(word, 0) + 1
    ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    return [[word, count] for word, count in ranked[:k]]
