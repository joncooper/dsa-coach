package solution

func MinRooms(intervals [][]int) int {
	starts, ends := []int{}, []int{}
	for _, interval := range intervals { starts = append(starts, interval[0]); ends = append(ends, interval[1]) }
	starts = sortInts(starts); ends = sortInts(ends)
	endIndex, active, best := 0, 0, 0
	for _, start := range starts { for endIndex < len(ends) && ends[endIndex] <= start { active--; endIndex++ }; active++; if active > best { best = active } }
	return best
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

func sortIntervalsByEnd(intervals [][]int) [][]int {
	result := append([][]int{}, intervals...)
	for i := 0; i < len(result); i++ {
		for j := i + 1; j < len(result); j++ {
			if result[j][1] < result[i][1] || (result[j][1] == result[i][1] && result[j][0] < result[i][0]) {
				result[i], result[j] = result[j], result[i]
			}
		}
	}
	return result
}

func min(a int, b int) int {
	if a < b { return a }
	return b
}
