package solution

func MinCostStepsLocal(costs []int) int {
	before, current := 0, 0
	for step := 2; step <= len(costs); step++ {
		next := min(current+costs[step-1], before+costs[step-2])
		before = current
		current = next
	}
	return current
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
