package solution

func SplitArrayMinLargest(nums []int, k int) int {
	partsNeeded := func(limit int) int { parts, total := 1, 0; for _, num := range nums { if total+num > limit { parts++; total = 0 }; total += num }; return parts }
	left, right := maxInSlice(nums), sumSlice(nums)
	for left < right { mid := (left + right) / 2; if partsNeeded(mid) <= k { right = mid } else { left = mid + 1 } }
	return left
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
