def rising_windows(input_text):
    lines = [line for line in input_text.split("\n") if line.strip()]
    if not lines:
        return 0
    k = int(lines[0])
    days = [int(line) for line in lines[1:]]
    if len(days) <= k:
        return 0
    prev_sum = sum(days[:k])
    rising = 0
    for i in range(k, len(days)):
        new_sum = prev_sum + days[i] - days[i - k]
        if new_sum > prev_sum:
            rising += 1
        prev_sum = new_sum
    return rising
