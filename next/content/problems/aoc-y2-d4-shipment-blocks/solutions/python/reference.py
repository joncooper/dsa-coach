def max_block_sum(input_text):
    best = 0
    for block in input_text.split("\n\n"):
        total = 0
        for line in block.split("\n"):
            line = line.strip()
            if not line or "=" not in line:
                continue
            _, value = line.split("=", 1)
            value = value.strip()
            if value.isdigit():
                total += int(value)
        if total > best:
            best = total
    return best
