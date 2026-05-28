package solution

import (
	"strconv"
	"strings"
)

func ElevationTriples(inputText string) int {
	lines := nonEmptyLines(inputText)
	if len(lines) == 0 {
		return 0
	}
	target, _ := strconv.Atoi(lines[0])
	values := []int{}
	for _, line := range lines[1:] {
		value, _ := strconv.Atoi(line)
		values = append(values, value)
	}
	total := 0
	for i := 0; i < len(values); i++ {
		seen := map[int]int{}
		for j := i + 1; j < len(values); j++ {
			need := target - values[i] - values[j]
			total += seen[need]
			seen[values[j]]++
		}
	}
	return total
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
