package solution

func MaxTruckValue(boxes [][]int, capacity int) int {
	sorted := append([][]int{}, boxes...)
	for i := 0; i < len(sorted); i++ {
		for j := i + 1; j < len(sorted); j++ {
			if sorted[j][1] > sorted[i][1] {
				sorted[i], sorted[j] = sorted[j], sorted[i]
			}
		}
	}
	remaining, total := capacity, 0
	for _, box := range sorted {
		take := min(box[0], remaining)
		total += take * box[1]
		remaining -= take
		if remaining == 0 {
			break
		}
	}
	return total
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
