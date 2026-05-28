package solution

func CountBinaryStrings(n int) int {
	endZero, endOne := 1, 0
	for index := 0; index < n; index++ {
		endZero, endOne = endZero+endOne, endZero
	}
	return endZero + endOne
}

func min(a int, b int) int {
	if a < b {
		return a
	}
	return b
}
func max(a int, b int) int {
	if a > b {
		return a
	}
	return b
}
func min3(a int, b int, c int) int { return min(min(a, b), c) }
