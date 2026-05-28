package solution

import "strings"

func ValidRosterTotal(inputText string) int {
	required := []string{"food", "craft", "music"}
	total := 0
	for _, block := range strings.Split(inputText, "\n\n") {
		categories := map[string]bool{}
		itemCount := 0
		for _, raw := range strings.Split(block, "\n") {
			line := strings.TrimSpace(raw)
			idx := strings.IndexByte(line, ':')
			if idx < 0 {
				continue
			}
			categories[line[:idx]] = true
			itemCount += len(strings.Split(line[idx+1:], ","))
		}
		ok := true
		for _, cat := range required {
			if !categories[cat] {
				ok = false
			}
		}
		if ok {
			total += itemCount
		}
	}
	return total
}
