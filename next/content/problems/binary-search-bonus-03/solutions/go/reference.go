package solution

func CountOccurrences(nums []int, target int) int {
	lower := func(value int) int { left, right := 0, len(nums); for left < right { mid := (left + right) / 2; if nums[mid] < value { left = mid + 1 } else { right = mid } }; return left }
	return lower(target+1) - lower(target)
}

func min(a int, b int) int {
	if a < b { return a }
	return b
}

func maxInSlice(values []int) int {
	best := values[0]
	for _, value := range values { if value > best { best = value } }
	return best
}

func minInSlice(values []int) int {
	best := values[0]
	for _, value := range values { if value < best { best = value } }
	return best
}

func sumSlice(values []int) int {
	total := 0
	for _, value := range values { total += value }
	return total
}
