def elevation_triples(input_text):
    lines = [line for line in input_text.split("\n") if line.strip()]
    if not lines:
        return 0
    target = int(lines[0])
    values = [int(line) for line in lines[1:]]
    n = len(values)
    total = 0
    for i in range(n):
        seen = {}
        for j in range(i + 1, n):
            need = target - values[i] - values[j]
            total += seen.get(need, 0)
            seen[values[j]] = seen.get(values[j], 0) + 1
    return total
