package solution

func CountGridPaths(grid [][]int) int {
	if len(grid) == 0 || len(grid[0]) == 0 { return 0 }
	rows, cols := len(grid), len(grid[0])
	if grid[0][0] == 1 || grid[rows-1][cols-1] == 1 { return 0 }
	visited := make([][]bool, rows)
	for row := range visited { visited[row] = make([]bool, cols) }
	count := 0
	dirs := [][]int{{1,0},{-1,0},{0,1},{0,-1}}
	var backtrack func(int, int)
	backtrack = func(row int, col int) {
		if row == rows-1 && col == cols-1 { count++; return }
		for _, dir := range dirs { nr, nc := row+dir[0], col+dir[1]; if nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc] && grid[nr][nc] == 0 { visited[nr][nc] = true; backtrack(nr, nc); visited[nr][nc] = false } }
	}
	visited[0][0] = true
	backtrack(0, 0)
	return count
}
