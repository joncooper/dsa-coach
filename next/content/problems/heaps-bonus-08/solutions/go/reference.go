package solution

func PrintOrder(jobs [][]int) []int {
	ordered := append([][]int{}, jobs...)
	for i := 0; i < len(ordered); i++ { for j := i + 1; j < len(ordered); j++ { if ordered[j][0] > ordered[i][0] || (ordered[j][0] == ordered[i][0] && ordered[j][1] < ordered[i][1]) { ordered[i], ordered[j] = ordered[j], ordered[i] } } }
	result := []int{}
	for _, job := range ordered { result = append(result, job[1]) }
	return result
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
