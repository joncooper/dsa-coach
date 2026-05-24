def restore_ip_addresses(digits: str) -> list[str]:
    result = []
    parts = []
    def valid(segment):
        if len(segment) > 1 and segment[0] == '0':
            return False
        return 0 <= int(segment) <= 255
    def backtrack(start):
        if len(parts) == 4:
            if start == len(digits):
                result.append('.'.join(parts))
            return
        for length in (1, 2, 3):
            if start + length > len(digits):
                break
            segment = digits[start:start + length]
            if valid(segment):
                parts.append(segment)
                backtrack(start + length)
                parts.pop()
    if digits.isdigit():
        backtrack(0)
    return sorted(result)
