package solution

func TopKFrequent(nums []int, k int) []int {
	counts := map[int]int{}
	for _, num := range nums { counts[num]++ }
	pairs := countPairs(counts)
	for i := 0; i < len(pairs); i++ { for j := i + 1; j < len(pairs); j++ { if pairs[j][1] > pairs[i][1] || (pairs[j][1] == pairs[i][1] && pairs[j][0] < pairs[i][0]) { pairs[i], pairs[j] = pairs[j], pairs[i] } } }
	if k > len(pairs) { k = len(pairs) }
	result := []int{}
	for _, pair := range pairs[:k] { result = append(result, pair[0]) }
	return sortInts(result)
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
