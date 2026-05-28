package solution

func LargestConcatenation(nums []int) string {
	pieces := []string{}
	for _, num := range nums {
		pieces = append(pieces, intToString(num))
	}
	for i := 0; i < len(pieces); i++ {
		for j := i + 1; j < len(pieces); j++ {
			if pieces[j]+pieces[i] > pieces[i]+pieces[j] {
				pieces[i], pieces[j] = pieces[j], pieces[i]
			}
		}
	}
	result := ""
	for _, piece := range pieces {
		result += piece
	}
	if result == "" || allZero(result) {
		return "0"
	}
	return result
}

func intToString(value int) string {
	if value == 0 {
		return "0"
	}
	digits := []byte{}
	for value > 0 {
		digits = append([]byte{byte('0' + value%10)}, digits...)
		value /= 10
	}
	return string(digits)
}

func allZero(value string) bool {
	for _, char := range value {
		if char != '0' {
			return false
		}
	}
	return true
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
