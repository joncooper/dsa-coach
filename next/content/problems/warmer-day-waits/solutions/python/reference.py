def warmer_day_waits(temperatures: list[int]) -> list[int]:
    waits = [0] * len(temperatures)
    stack = []
    for day, temperature in enumerate(temperatures):
        while stack and temperature > temperatures[stack[-1]]:
            previous = stack.pop()
            waits[previous] = day - previous
        stack.append(day)
    return waits
