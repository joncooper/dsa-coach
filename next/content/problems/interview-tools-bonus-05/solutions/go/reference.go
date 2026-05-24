package solution

func CountIslands(grid [][]int) int {
	if len(grid) == 0 || len(grid[0]) == 0 { return 0 }
	rows, cols := len(grid), len(grid[0])
	visited := make([][]bool, rows)
	for row := range visited { visited[row] = make([]bool, cols) }
	var dfs func(int, int)
	dfs = func(row int, col int) { if row < 0 || row >= rows || col < 0 || col >= cols || visited[row][col] || grid[row][col] == 0 { return }; visited[row][col] = true; dfs(row+1, col); dfs(row-1, col); dfs(row, col+1); dfs(row, col-1) }
	islands := 0
	for row := 0; row < rows; row++ { for col := 0; col < cols; col++ { if grid[row][col] == 1 && !visited[row][col] { islands++; dfs(row, col) } } }
	return islands
}
