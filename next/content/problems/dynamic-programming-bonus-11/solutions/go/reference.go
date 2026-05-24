package solution

func LargestSquare(grid [][]int) int {
	if len(grid) == 0 || len(grid[0]) == 0 { return 0 }
	rows, cols := len(grid), len(grid[0])
	dp := make([][]int, rows)
	for row := range dp { dp[row] = make([]int, cols) }
	best := 0
	for row := 0; row < rows; row++ { for col := 0; col < cols; col++ { if grid[row][col] == 1 { if row == 0 || col == 0 { dp[row][col] = 1 } else { dp[row][col] = 1 + min3(dp[row-1][col], dp[row][col-1], dp[row-1][col-1]) }; best = max(best, dp[row][col]) } } }
	return best * best
}

func min(a int, b int) int { if a < b { return a }; return b }
func max(a int, b int) int { if a > b { return a }; return b }
func min3(a int, b int, c int) int { return min(min(a, b), c) }
