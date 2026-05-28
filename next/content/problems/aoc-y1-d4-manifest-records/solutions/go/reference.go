package solution

import "strings"

func CountCompleteRecords(inputText string) int {
	required := []string{"id", "name", "age", "grade", "cohort"}
	count := 0
	for _, block := range strings.Split(inputText, "\n\n") {
		if strings.TrimSpace(block) == "" {
			continue
		}
		keys := map[string]bool{}
		for _, token := range strings.Fields(block) {
			if idx := strings.IndexByte(token, ':'); idx >= 0 {
				keys[token[:idx]] = true
			}
		}
		ok := true
		for _, key := range required {
			if !keys[key] {
				ok = false
			}
		}
		if ok {
			count++
		}
	}
	return count
}
