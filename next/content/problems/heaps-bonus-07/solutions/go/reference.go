package solution

func KWeakestRows(grid [][]int, k int) []int {
	ranked := [][]int{}
	for index, row := range grid { total := 0; for _, value := range row { total += value }; ranked = append(ranked, []int{total, index}) }
	for i := 0; i < len(ranked); i++ { for j := i + 1; j < len(ranked); j++ { if ranked[j][0] < ranked[i][0] || (ranked[j][0] == ranked[i][0] && ranked[j][1] < ranked[i][1]) { ranked[i], ranked[j] = ranked[j], ranked[i] } } }
	if k > len(ranked) { k = len(ranked) }
	result := []int{}
	for _, entry := range ranked[:k] { result = append(result, entry[1]) }
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
