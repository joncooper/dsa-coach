def integer_square_root(n: int) -> int:
    left = 0
    right = n
    answer = 0
    while left <= right:
        mid = (left + right) // 2
        if mid * mid <= n:
            answer = mid
            left = mid + 1
        else:
            right = mid - 1
    return answer
