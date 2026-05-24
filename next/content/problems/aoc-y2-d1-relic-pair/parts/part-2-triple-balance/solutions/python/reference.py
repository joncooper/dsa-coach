def balanced_triple_count(input_text):
    counts = {}
    for line in input_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        value = int(line)
        counts[value] = counts.get(value, 0) + 1
    triples = 0
    for count in counts.values():
        if count >= 3:
            triples += count * (count - 1) * (count - 2) // 6
    return triples
