def find_missing_seat(input_text):
    ids = set()
    for line in input_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        bits = line.replace("F", "0").replace("B", "1").replace("L", "0").replace("R", "1")
        ids.add(int(bits, 2))
    if not ids:
        return -1
    lo = min(ids)
    hi = max(ids)
    for candidate in range(lo + 1, hi):
        if candidate not in ids and (candidate - 1) in ids and (candidate + 1) in ids:
            return candidate
    return -1
