def odd_tag_count(input_text):
    total = 0
    for block in input_text.split("\n\n"):
        counts = {}
        had_line = False
        for line in block.split("\n"):
            line = line.strip()
            if not line:
                continue
            had_line = True
            tags = {token for token in line.split(",") if token}
            for tag in tags:
                counts[tag] = counts.get(tag, 0) + 1
        if not had_line:
            continue
        total += sum(1 for c in counts.values() if c % 2 == 1)
    return total
