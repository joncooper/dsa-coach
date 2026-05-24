def largest_one_swap(digits: str) -> str:
    chars = list(digits)
    last = {int(char): index for index, char in enumerate(chars)}
    for index, char in enumerate(chars):
        current = int(char)
        for digit in range(9, current, -1):
            if last.get(digit, -1) > index:
                swap_index = last[digit]
                chars[index], chars[swap_index] = chars[swap_index], chars[index]
                return ''.join(chars)
    return digits
