def largest_concatenation(nums: list[int]) -> str:
    from functools import cmp_to_key
    if not nums:
        return '0'
    def compare(a, b):
        if b + a > a + b:
            return 1
        if b + a < a + b:
            return -1
        return 0
    pieces = sorted((str(num) for num in nums), key=cmp_to_key(compare))
    result = ''.join(pieces)
    return '0' if set(result) == {'0'} else result
