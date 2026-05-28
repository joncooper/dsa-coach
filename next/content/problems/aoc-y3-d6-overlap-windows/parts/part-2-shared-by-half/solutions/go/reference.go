package solution

import "strings"

func MajorityTagCount(inputText string) int {
	total := 0
	for _, block := range strings.Split(inputText, "\n\n") {
		counts := map[string]int{}
		lines := 0
		for _, raw := range strings.Split(block, "\n") {
			line := strings.TrimSpace(raw)
			if line == "" {
				continue
			}
			lines++
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
		if lines > 0 {
			threshold := (lines + 1) / 2
			for _, count := range counts {
				if count >= threshold {
					total++
				}
			}
		}
	}
	return total
}
