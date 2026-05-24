package solution

func GridPathsWithBlocks(grid [][]int) int {
	if len(grid) == 0 || len(grid[0]) == 0 || grid[0][0] == 1 { return 0 }
	cols := len(grid[0])
	dp := make([]int, cols)
	dp[0] = 1
	for row := 0; row < len(grid); row++ { for col := 0; col < cols; col++ { if grid[row][col] == 1 { dp[col] = 0 } else if col > 0 { dp[col] += dp[col-1] } } }
	return dp[cols-1]
}

func min(a int, b int) int { if a < b { return a }; return b }
func max(a int, b int) int { if a > b { return a }; return b }
func min3(a int, b int, c int) int { return min(min(a, b), c) }
