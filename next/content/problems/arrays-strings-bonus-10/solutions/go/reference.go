package solution

func DiagonalSum(matrix [][]int) int {
	total := 0
	n := len(matrix)
	for index := 0; index < n; index++ {
		total += matrix[index][index]
		other := n - 1 - index
		if other != index {
			total += matrix[index][other]
		}
	}
	return total
}
