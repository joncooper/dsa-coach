package solution

import (
	"strconv"
	"strings"
)

func MaxRevenueWindow(inputText string) int {
	lines := nonEmptyLines(inputText)
	if len(lines) == 0 {
		return 0
	}
	k, _ := strconv.Atoi(lines[0])
	days := []int{}
	for _, line := range lines[1:] {
		n, _ := strconv.Atoi(line)
		days = append(days, n)
	}
	if len(days) < k {
		return 0
	}
	current := 0
	for _, day := range days[:k] {
		current += day
	}
	best := current
	for i := k; i < len(days); i++ {
		current += days[i] - days[i-k]
		if current > best {
			best = current
		}
	}
	return best
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
