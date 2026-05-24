def count_valid_tags(input_text):
    valid = 0
    for line in input_text.split("\n"):
        if not line.strip():
            continue
        bounds, rest = line.split(" ", 1)
        low_str, high_str = bounds.split("-")
        low = int(low_str)
        high = int(high_str)
        char_part, word = rest.split(": ", 1)
        char = char_part[0]
        count = word.count(char)
        if low <= count <= high:
            valid += 1
    return valid
