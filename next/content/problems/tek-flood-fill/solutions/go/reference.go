package solution

func FloodFill(grid [][]int, sr int, sc int, newValue int) [][]int {
	out := make([][]int, len(grid))
	for i := range grid {
		out[i] = append([]int(nil), grid[i]...)
	}
	old := out[sr][sc]
	if old == newValue {
		return out
	}
	rows, cols := len(out), len(out[0])
	stack := [][2]int{{sr, sc}}
	for len(stack) > 0 {
		cell := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		row, col := cell[0], cell[1]
		if row < 0 || row >= rows || col < 0 || col >= cols || out[row][col] != old {
			continue
		}
		out[row][col] = newValue
		stack = append(stack, [2]int{row + 1, col}, [2]int{row - 1, col}, [2]int{row, col + 1}, [2]int{row, col - 1})
	}
	return out
}
