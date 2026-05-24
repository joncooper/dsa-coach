def common_customers(morning: list[int], evening: list[int]) -> int:
    return len(set(morning) & set(evening))
