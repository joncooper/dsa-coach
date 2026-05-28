package solution

import (
	"strconv"
	"strings"
)

func ElevationPairs(inputText string) int {
	lines := nonEmptyLines(inputText)
	if len(lines) == 0 {
		return 0
	}
	target, _ := strconv.Atoi(lines[0])
	counts := map[int]int{}
	pairs := 0
	for _, line := range lines[1:] {
		value, _ := strconv.Atoi(line)
		pairs += counts[target-value]
		counts[value]++
	}
	return pairs
}
func nonEmptyLines(text string) []string {
	out := []string{}
	for _, line := range strings.Split(text, "\n") {
		if strings.TrimSpace(line) != "" {
			out = append(out, strings.TrimSpace(line))
		}
	}
	return out
}
