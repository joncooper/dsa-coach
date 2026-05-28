package solution

func MaxNonAdjacentLocal(nums []int) int {
	skip, take := 0, 0
	for _, num := range nums {
		nextTake := skip + num
		skip = max(skip, take)
		take = nextTake
	}
	return max(max(skip, take), 0)
}

func min(a int, b int) int {
	if a < b {
		return a
	}
	return b
}
func max(a int, b int) int {
	if a > b {
		return a
	}
	return b
}
func min3(a int, b int, c int) int { return min(min(a, b), c) }
