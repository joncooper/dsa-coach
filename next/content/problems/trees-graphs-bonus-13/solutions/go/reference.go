package solution

func ShortestGridPath(grid [][]int) int {
	if len(grid) == 0 || len(grid[0]) == 0 || grid[0][0] == 1 { return -1 }
	rows, cols := len(grid), len(grid[0])
	if grid[rows-1][cols-1] == 1 { return -1 }
	queue := [][]int{{0, 0, 0}}
	seen := map[[2]int]bool{[2]int{0, 0}: true}
	dirs := [][]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}
	for index := 0; index < len(queue); index++ {
		row, col, distance := queue[index][0], queue[index][1], queue[index][2]
		if row == rows-1 && col == cols-1 { return distance }
		for _, dir := range dirs {
			nr, nc := row+dir[0], col+dir[1]
			key := [2]int{nr, nc}
			if nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 0 && !seen[key] {
				seen[key] = true
				queue = append(queue, []int{nr, nc, distance + 1})
			}
		}
	}
	return -1
}
