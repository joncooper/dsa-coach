def count_valid_positions(input_text):
    valid = 0
    for line in input_text.split("\n"):
        if not line.strip():
            continue
        bounds, rest = line.split(" ", 1)
        a_str, b_str = bounds.split("-")
        a = int(a_str) - 1
        b = int(b_str) - 1
        char_part, word = rest.split(": ", 1)
        char = char_part[0]
        first = word[a] == char if 0 <= a < len(word) else False
        second = word[b] == char if 0 <= b < len(word) else False
        if first != second:
            valid += 1
    return valid
