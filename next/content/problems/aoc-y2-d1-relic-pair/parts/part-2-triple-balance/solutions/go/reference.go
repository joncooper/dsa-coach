package solution

import (
	"strconv"
	"strings"
)

func BalancedTripleCount(inputText string) int {
	counts := map[int]int{}
	for _, raw := range strings.Split(inputText, "\n") {
		line := strings.TrimSpace(raw)
		if line != "" {
			value, _ := strconv.Atoi(line)
			counts[value]++
		}
	}
	triples := 0
	for _, count := range counts {
		if count >= 3 {
			triples += count * (count - 1) * (count - 2) / 6
		}
	}
	return triples
}
