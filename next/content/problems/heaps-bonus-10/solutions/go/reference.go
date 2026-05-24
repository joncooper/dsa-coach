package solution

func MaxScoreAfterHalving(nums []int, k int) int {
	values := append([]int{}, nums...)
	for count := 0; count < k; count++ {
		values = sortInts(values); reverseInts(values)
		if len(values) == 0 || values[0] <= 1 { break }
		values[0] = (values[0] + 1) / 2
	}
	total := 0
	for _, value := range values { total += value }
	return total
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
