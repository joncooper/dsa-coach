package solution

func CountLatinCompletions(grid [][]int) int {
	n := len(grid)
	if n == 0 {
		return 0
	}
	for _, row := range grid {
		if len(row) != n {
			return 0
		}
	}
	rowsUsed := make([]map[int]bool, n)
	colsUsed := make([]map[int]bool, n)
	for index := 0; index < n; index++ {
		rowsUsed[index] = map[int]bool{}
		colsUsed[index] = map[int]bool{}
	}
	blanks := [][]int{}
	for row := 0; row < n; row++ {
		for col := 0; col < n; col++ {
			value := grid[row][col]
			if value == 0 {
				blanks = append(blanks, []int{row, col})
				continue
			}
			if value < 1 || value > n || rowsUsed[row][value] || colsUsed[col][value] {
				return 0
			}
			rowsUsed[row][value] = true
			colsUsed[col][value] = true
		}
	}
	count := 0
	var backtrack func(int)
	backtrack = func(index int) {
		if index == len(blanks) {
			count++
			return
		}
		row, col := blanks[index][0], blanks[index][1]
		for value := 1; value <= n; value++ {
			if rowsUsed[row][value] || colsUsed[col][value] {
				continue
			}
			rowsUsed[row][value] = true
			colsUsed[col][value] = true
			backtrack(index + 1)
			delete(rowsUsed[row], value)
			delete(colsUsed[col], value)
		}
	}
	backtrack(0)
	return count
}
