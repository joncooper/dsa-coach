package solution

func KnapsackMaxValue(weights []int, values []int, capacity int) int {
	dp := make([]int, capacity+1)
	for index, weight := range weights {
		value := values[index]
		for cap := capacity; cap >= weight; cap-- {
			dp[cap] = max(dp[cap], dp[cap-weight]+value)
		}
	}
	return dp[capacity]
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
