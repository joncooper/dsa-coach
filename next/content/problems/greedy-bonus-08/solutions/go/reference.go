package solution

func MaxSumAfterFlips(nums []int, k int) int {
	values := sortInts(nums)
	remaining := k
	for index := 0; index < len(values) && remaining > 0 && values[index] < 0; index++ { values[index] = -values[index]; remaining-- }
	total := 0; smallestAbs := 1 << 60
	for _, value := range values { total += value; if abs(value) < smallestAbs { smallestAbs = abs(value) } }
	if remaining%2 == 1 { total -= 2 * smallestAbs }
	return total
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
