package solution

func MergeSortedBatches(batches [][]int) []int {
	merged := []int{}
	for _, batch := range batches { merged = append(merged, batch...) }
	return sortInts(merged)
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
