package solution

func FloodFill(grid [][]int, sr int, sc int, color int) [][]int {
	result := copyGrid(grid)
	original := result[sr][sc]
	if original == color {
		return result
	}
	rows, cols := len(result), len(result[0])
	stack := [][]int{{sr, sc}}
	result[sr][sc] = color
	dirs := [][]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}
	for len(stack) > 0 {
		cell := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		for _, dir := range dirs {
			nr, nc := cell[0]+dir[0], cell[1]+dir[1]
			if nr >= 0 && nr < rows && nc >= 0 && nc < cols && result[nr][nc] == original {
				result[nr][nc] = color
				stack = append(stack, []int{nr, nc})
			}
		}
	}
	return result
}

func copyGrid(grid [][]int) [][]int {
	result := make([][]int, len(grid))
	for row := range grid {
		result[row] = append([]int{}, grid[row]...)
	}
	return result
}
