def shelf_unique(input_text):
    total = 0
    for block in input_text.split("\n\n"):
        counts = {}
        any_shelf = False
        for line in block.split("\n"):
            line = line.strip()
            if not line:
                continue
            any_shelf = True
            ids = {int(token) for token in line.split(",")}
            for relic in ids:
                counts[relic] = counts.get(relic, 0) + 1
        if not any_shelf:
            continue
        total += sum(1 for c in counts.values() if c == 1)
    return total
