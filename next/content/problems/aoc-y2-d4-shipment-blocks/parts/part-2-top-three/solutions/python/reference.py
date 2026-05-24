def top_three_block_sum(input_text):
    sums = []
    for block in input_text.split("\n\n"):
        total = 0
        for line in block.split("\n"):
            line = line.strip()
            if "=" not in line:
                continue
            _, value = line.split("=", 1)
            value = value.strip()
            if value.isdigit():
                total += int(value)
        sums.append(total)
    sums.sort(reverse=True)
    return sum(sums[:3])
