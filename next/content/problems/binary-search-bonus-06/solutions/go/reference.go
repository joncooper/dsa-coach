package solution

func SearchMatrix(matrix [][]int, target int) bool {
	if len(matrix) == 0 || len(matrix[0]) == 0 { return false }
	rows, cols := len(matrix), len(matrix[0])
	left, right := 0, rows*cols-1
	for left <= right { mid := (left + right) / 2; value := matrix[mid/cols][mid%cols]; if value == target { return true }; if value < target { left = mid + 1 } else { right = mid - 1 } }
	return false
}

func min(a int, b int) int {
	if a < b { return a }
	return b
}

func maxInSlice(values []int) int {
	best := values[0]
	for _, value := range values { if value > best { best = value } }
	return best
}

func minInSlice(values []int) int {
	best := values[0]
	for _, value := range values { if value < best { best = value } }
	return best
}

func sumSlice(values []int) int {
	total := 0
	for _, value := range values { total += value }
	return total
}
