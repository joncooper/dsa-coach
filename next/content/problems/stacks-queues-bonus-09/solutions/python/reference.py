def decode_string(text: str) -> str:
    counts = []
    pieces = []
    current = ''
    count = 0
    for char in text:
        if char.isdigit():
            count = count * 10 + int(char)
        elif char == '[':
            counts.append(count)
            pieces.append(current)
            current = ''
            count = 0
        elif char == ']':
            repeat = counts.pop()
            current = pieces.pop() + current * repeat
        else:
            current += char
    return current
