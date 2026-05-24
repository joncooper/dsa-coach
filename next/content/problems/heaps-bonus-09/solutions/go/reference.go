package solution

func KClosestNumbers(nums []int, target int, k int) []int {
	values := append([]int{}, nums...)
	for i := 0; i < len(values); i++ { for j := i + 1; j < len(values); j++ { if abs(values[j]-target) < abs(values[i]-target) || (abs(values[j]-target) == abs(values[i]-target) && values[j] < values[i]) { values[i], values[j] = values[j], values[i] } } }
	if k > len(values) { k = len(values) }
	return sortInts(values[:k])
}

func abs(value int) int {
	if value < 0 { return -value }
	return value
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
