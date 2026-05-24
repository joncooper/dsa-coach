def sort_binary_array(bits: list[int]) -> list[int]:
    result = bits[:]
    left = 0
    right = len(result) - 1
    while left < right:
        while left < right and result[left] == 0:
            left += 1
        while left < right and result[right] == 1:
            right -= 1
        if left < right:
            result[left], result[right] = 0, 1
    return result
