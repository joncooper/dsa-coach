def k_closest_points_local(points: list[list[int]], k: int) -> list[list[int]]:
    return sorted(points, key=lambda point: (point[0] * point[0] + point[1] * point[1], point[0], point[1]))[:k]
