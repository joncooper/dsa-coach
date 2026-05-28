package solution

func StartStation(fuel []int, cost []int) int {
	if len(fuel) == 0 {
		return 0
	}
	total, tank, start := 0, 0, 0
	for index, amount := range fuel {
		diff := amount - cost[index]
		total += diff
		tank += diff
		if tank < 0 {
			start = index + 1
			tank = 0
		}
	}
	if total >= 0 {
		return start
	}
	return -1
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
	if a < b {
		return a
	}
	return b
}
