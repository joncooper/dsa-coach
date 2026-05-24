def first_day_for_bouquets(bloomDays: list[int], bouquets: int, size: int) -> int:
    if bouquets * size > len(bloomDays):
        return -1
    def can(day):
        made = 0
        run = 0
        for bloom in bloomDays:
            if bloom <= day:
                run += 1
                if run == size:
                    made += 1
                    run = 0
            else:
                run = 0
        return made >= bouquets
    left = min(bloomDays)
    right = max(bloomDays)
    while left < right:
        mid = (left + right) // 2
        if can(mid):
            right = mid
        else:
            left = mid + 1
    return left
