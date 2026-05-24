package solution

func KClosestPointsLocal(points [][]int, k int) [][]int {
	result := append([][]int{}, points...)
	for i := 0; i < len(result); i++ {
		for j := i + 1; j < len(result); j++ {
			if comparePoint(result[j], result[i]) < 0 { result[i], result[j] = result[j], result[i] }
		}
	}
	if k > len(result) { k = len(result) }
	return result[:k]
}

func comparePoint(a []int, b []int) int {
	da := a[0]*a[0] + a[1]*a[1]
	db := b[0]*b[0] + b[1]*b[1]
	if da != db { return da - db }
	if a[0] != b[0] { return a[0] - b[0] }
	return a[1] - b[1]
}
func sortInts(values []int) []int {
	result := append([]int{}, values...)
	for i := 0; i < len(result); i++ {
		for j := i + 1; j < len(result); j++ {
			if result[j] < result[i] {
				result[i], result[j] = result[j], result[i]
			}
		}
	}
	return result
}

func reverseInts(values []int) {
	for left, right := 0, len(values)-1; left < right; left, right = left+1, right-1 {
		values[left], values[right] = values[right], values[left]
	}
}

func countPairs(counts map[int]int) [][]int {
	pairs := [][]int{}
	for num, count := range counts {
		pairs = append(pairs, []int{num, count})
	}
	return pairs
}
