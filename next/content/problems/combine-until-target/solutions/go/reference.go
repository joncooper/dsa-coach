package solution

func CombineUntilTarget(values []int, target int) int {
	heap := sortInts(values)
	combines := 0
	for len(heap) > 0 && heap[0] < target {
		if len(heap) < 2 { return -1 }
		small, large := heap[0], heap[1]
		heap = heap[2:]
		heap = append(heap, small+2*large)
		heap = sortInts(heap)
		combines++
	}
	if len(heap) == 0 { return -1 }
	return combines
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
