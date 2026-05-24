package solution

func MaxWaterArea(heights []int) int {
	left := 0
	right := len(heights) - 1
	best := 0
	for left < right {
		area := min(heights[left], heights[right]) * (right - left)
		if area > best {
			best = area
		}
		if heights[left] < heights[right] {
			left++
		} else {
			right--
		}
	}
	return best
}
