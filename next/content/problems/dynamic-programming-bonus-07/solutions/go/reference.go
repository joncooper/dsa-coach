package solution

func EditDistance(source string, target string) int {
	dp := make([][]int, len(source)+1)
	for i := range dp {
		dp[i] = make([]int, len(target)+1)
		dp[i][0] = i
	}
	for j := 0; j <= len(target); j++ {
		dp[0][j] = j
	}
	for i := 1; i <= len(source); i++ {
		for j := 1; j <= len(target); j++ {
			if source[i-1] == target[j-1] {
				dp[i][j] = dp[i-1][j-1]
			} else {
				dp[i][j] = 1 + min3(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
			}
		}
	}
	return dp[len(source)][len(target)]
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
