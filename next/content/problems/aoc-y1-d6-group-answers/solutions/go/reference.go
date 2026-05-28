package solution

import "strings"

func AnyoneYesSum(inputText string) int {
	total := 0
	for _, block := range strings.Split(inputText, "\n\n") {
		seen := map[rune]bool{}
		for _, line := range strings.Split(block, "\n") {
			for _, ch := range strings.TrimSpace(line) {
				seen[ch] = true
			}
		}
		total += len(seen)
	}
	return total
}
