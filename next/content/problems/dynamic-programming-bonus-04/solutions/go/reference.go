package solution

func MinPathSum(grid [][]int) int {
	if len(grid) == 0 || len(grid[0]) == 0 {
		return 0
	}
	rows, cols := len(grid), len(grid[0])
	dp := make([][]int, rows)
	for row := range dp {
		dp[row] = make([]int, cols)
	}
	for row := 0; row < rows; row++ {
		for col := 0; col < cols; col++ {
			if row == 0 && col == 0 {
				dp[row][col] = grid[row][col]
			} else {
				up, left := 1<<60, 1<<60
				if row > 0 {
					up = dp[row-1][col]
				}
				if col > 0 {
					left = dp[row][col-1]
				}
				dp[row][col] = grid[row][col] + min(up, left)
			}
		}
	}
	return dp[rows-1][cols-1]
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
