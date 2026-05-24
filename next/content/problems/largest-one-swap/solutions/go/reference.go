package solution

func LargestOneSwap(digits string) string {
	chars := []rune(digits)
	last := make([]int, 10)
	for index := range last { last[index] = -1 }
	for index, char := range chars { last[int(char-'0')] = index }
	for index, char := range chars {
		current := int(char - '0')
		for digit := 9; digit > current; digit-- {
			if last[digit] > index { chars[index], chars[last[digit]] = chars[last[digit]], chars[index]; return string(chars) }
		}
	}
	return digits
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
