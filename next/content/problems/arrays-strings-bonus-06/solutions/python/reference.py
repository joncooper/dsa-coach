def plus_one(digits: list[int]) -> list[int]:
    result = digits[:]
    carry = 1
    for index in range(len(result) - 1, -1, -1):
        value = result[index] + carry
        result[index] = value % 10
        carry = value // 10
        if carry == 0:
            break
    if carry:
        result.insert(0, carry)
    return result
