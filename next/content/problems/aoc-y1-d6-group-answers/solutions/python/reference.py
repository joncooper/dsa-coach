def anyone_yes_sum(input_text):
    total = 0
    for block in input_text.split("\n\n"):
        union = set()
        for line in block.split("\n"):
            line = line.strip()
            if not line:
                continue
            union.update(line)
        total += len(union)
    return total
