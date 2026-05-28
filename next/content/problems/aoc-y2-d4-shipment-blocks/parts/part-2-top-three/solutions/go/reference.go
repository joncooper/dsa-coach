package solution

import (
	"sort"
	"strconv"
	"strings"
	"unicode"
)

func TopThreeBlockSum(inputText string) int {
	sums := []int{}
	for _, block := range strings.Split(inputText, "\n\n") {
		sums = append(sums, blockSum(block))
	}
	sort.Sort(sort.Reverse(sort.IntSlice(sums)))
	total := 0
	for i := 0; i < len(sums) && i < 3; i++ {
		total += sums[i]
	}
	return total
}
func blockSum(block string) int {
	total := 0
	for _, raw := range strings.Split(block, "\n") {
		line := strings.TrimSpace(raw)
		idx := strings.IndexByte(line, '=')
		if idx < 0 {
			continue
		}
		value := strings.TrimSpace(line[idx+1:])
		if allDigits(value) {
			n, _ := strconv.Atoi(value)
			total += n
		}
	}
	return total
}
func allDigits(text string) bool {
	if text == "" {
		return false
	}
	for _, ch := range text {
		if !unicode.IsDigit(ch) {
			return false
		}
	}
	return true
}
