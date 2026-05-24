package solution

func WordPathExistsLocal(board [][]string, word string) bool {
	if len(word) == 0 { return true }
	if len(board) == 0 || len(board[0]) == 0 { return false }
	rows, cols := len(board), len(board[0])
	if len(word) > rows*cols { return false }
	visited := make([][]bool, rows)
	for row := range visited { visited[row] = make([]bool, cols) }
	var dfs func(int, int, int) bool
	dfs = func(row int, col int, index int) bool {
		if index == len(word) { return true }
		if row < 0 || row >= rows || col < 0 || col >= cols { return false }
		if visited[row][col] || board[row][col] != string(word[index]) { return false }
		visited[row][col] = true
		found := dfs(row+1, col, index+1) || dfs(row-1, col, index+1) || dfs(row, col+1, index+1) || dfs(row, col-1, index+1)
		visited[row][col] = false
		return found
	}
	for row := 0; row < rows; row++ { for col := 0; col < cols; col++ { if dfs(row, col, 0) { return true } } }
	return false
}
