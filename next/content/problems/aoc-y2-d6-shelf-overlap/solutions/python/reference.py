def shelf_overlap(input_text):
    total = 0
    for block in input_text.split("\n\n"):
        shelves = []
        for line in block.split("\n"):
            line = line.strip()
            if not line:
                continue
            shelves.append({int(token) for token in line.split(",")})
        if not shelves:
            continue
        common = shelves[0]
        for shelf in shelves[1:]:
            common &= shelf
        total += len(common)
    return total
