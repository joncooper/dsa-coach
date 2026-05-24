def find_missing_stamp(input_text):
    values = set()
    for line in input_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        values.add(int(line, 36))
    if not values:
        return -1
    sorted_values = sorted(values)
    for i in range(len(sorted_values) - 1):
        if sorted_values[i + 1] - sorted_values[i] == 2:
            return sorted_values[i] + 1
    return -1
