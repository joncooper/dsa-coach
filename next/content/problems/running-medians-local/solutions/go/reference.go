package solution

func RunningMediansLocal(nums []int) []float64 {
	seen := []int{}
	medians := []float64{}
	for _, num := range nums {
		index := 0
		for index < len(seen) && seen[index] < num { index++ }
		seen = append(seen, 0)
		copy(seen[index+1:], seen[index:])
		seen[index] = num
		middle := len(seen) / 2
		if len(seen)%2 == 1 { medians = append(medians, float64(seen[middle])) } else { medians = append(medians, float64(seen[middle-1]+seen[middle])/2.0) }
	}
	return medians
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
