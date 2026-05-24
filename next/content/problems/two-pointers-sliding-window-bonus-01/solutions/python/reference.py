def max_water_area(heights: list[int]) -> int:
    left = 0
    right = len(heights) - 1
    best = 0
    while left < right:
        best = max(best, min(heights[left], heights[right]) * (right - left))
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1
    return best
