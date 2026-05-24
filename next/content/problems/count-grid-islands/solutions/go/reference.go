package solution

func CountGridIslands(grid [][]int) int {
	if len(grid) == 0 { return 0 }
	rows, cols := len(grid), len(grid[0])
	seen := make([][]bool, rows)
	for row := range seen { seen[row] = make([]bool, cols) }
	islands := 0
	dirs := [][]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}
	for row := 0; row < rows; row++ {
		for col := 0; col < cols; col++ {
			if grid[row][col] != 1 || seen[row][col] { continue }
			islands++
			stack := [][]int{{row, col}}
			seen[row][col] = true
			for len(stack) > 0 {
				cell := stack[len(stack)-1]
				stack = stack[:len(stack)-1]
				for _, dir := range dirs {
					nr, nc := cell[0]+dir[0], cell[1]+dir[1]
					if nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1 && !seen[nr][nc] {
						seen[nr][nc] = true
						stack = append(stack, []int{nr, nc})
					}
				}
			}
		}
	}
	return islands
}
