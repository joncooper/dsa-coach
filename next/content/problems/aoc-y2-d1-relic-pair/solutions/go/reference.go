package solution

import (
	"strconv"
	"strings"
)

func BalancedPairCount(inputText string) int {
	counts := countsByValue(inputText)
	pairs := 0
	for _, count := range counts {
		pairs += count * (count - 1) / 2
	}
	return pairs
}
func countsByValue(inputText string) map[int]int {
	counts := map[int]int{}
	for _, raw := range strings.Split(inputText, "\n") {
		line := strings.TrimSpace(raw)
		if line != "" {
			value, _ := strconv.Atoi(line)
			counts[value]++
		}
	}
	return counts
}
