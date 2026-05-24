def min_arrows(intervals: list[list[int]]) -> int:
    arrows = 0
    arrow = float('-inf')
    for start, end in sorted(intervals, key=lambda item: (item[1], item[0])):
        if start > arrow:
            arrows += 1
            arrow = end
    return arrows
