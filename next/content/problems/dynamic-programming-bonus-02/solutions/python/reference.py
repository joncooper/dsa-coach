def count_binary_strings(n: int) -> int:
    end_zero = 1
    end_one = 0
    for _ in range(n):
        end_zero, end_one = end_zero + end_one, end_zero
    return end_zero + end_one
