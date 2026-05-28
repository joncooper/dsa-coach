package solution

import "strings"

func OddTagCount(inputText string) int {
	total := 0
	for _, block := range strings.Split(inputText, "\n\n") {
		counts := map[string]int{}
		hadLine := false
		for _, raw := range strings.Split(block, "\n") {
			line := strings.TrimSpace(raw)
			if line == "" {
				continue
			}
			hadLine = true
			tags := map[string]bool{}
			for _, token := range strings.Split(line, ",") {
				if token != "" {
					tags[token] = true
				}
			}
			for tag := range tags {
				counts[tag]++
			}
		}
		if hadLine {
			for _, count := range counts {
				if count%2 == 1 {
					total++
				}
			}
		}
	}
	return total
}
