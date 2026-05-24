def max_seat_id(input_text):
    best = -1
    for line in input_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        bits = line.replace("F", "0").replace("B", "1").replace("L", "0").replace("R", "1")
        seat_id = int(bits, 2)
        if seat_id > best:
            best = seat_id
    return best
