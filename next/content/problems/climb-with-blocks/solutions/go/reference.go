package solution

func ClimbWithBlocks(n int, blocks []int) int {
	dp := make([]int, n+1)
	dp[0] = 1
	for stair := 1; stair <= n; stair++ { for _, block := range blocks { if stair >= block { dp[stair] += dp[stair-block] } } }
	return dp[n]
}

func min(a int, b int) int { if a < b { return a }; return b }
func max(a int, b int) int { if a > b { return a }; return b }
func min3(a int, b int, c int) int { return min(min(a, b), c) }
