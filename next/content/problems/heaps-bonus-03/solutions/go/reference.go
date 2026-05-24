package solution

func LastStoneWeight(stones []int) int {
	heap := sortInts(stones)
	for len(heap) > 1 {
		y := heap[len(heap)-1]
		x := heap[len(heap)-2]
		heap = heap[:len(heap)-2]
		if x != y { heap = append(heap, y-x); heap = sortInts(heap) }
	}
	if len(heap) == 0 { return 0 }
	return heap[0]
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
