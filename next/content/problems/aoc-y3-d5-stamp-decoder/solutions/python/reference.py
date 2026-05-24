def max_stamp(input_text):
    best = -1
    for line in input_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        value = int(line, 36)
        if value > best:
            best = value
    return best
