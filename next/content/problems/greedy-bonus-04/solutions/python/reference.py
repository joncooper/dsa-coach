def can_plant_flowers(bed: list[int], k: int) -> bool:
    plots = bed[:]
    planted = 0
    for index in range(len(plots)):
        left_empty = index == 0 or plots[index - 1] == 0
        right_empty = index == len(plots) - 1 or plots[index + 1] == 0
        if plots[index] == 0 and left_empty and right_empty:
            plots[index] = 1
            planted += 1
            if planted >= k:
                return True
    return planted >= k
