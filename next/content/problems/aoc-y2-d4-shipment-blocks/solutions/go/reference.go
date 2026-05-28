package solution

import (
	"strconv"
	"strings"
	"unicode"
)

func MaxBlockSum(inputText string) int {
	best := 0
	for _, block := range strings.Split(inputText, "\n\n") {
		total := blockSum(block)
		if total > best {
			best = total
		}
	}
	return best
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
