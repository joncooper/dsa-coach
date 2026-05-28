package solution

import (
	"sort"
	"strings"
)

func HeaviestCategory(inputText string) string {
	required := []string{"food", "craft", "music"}
	totals := map[string]int{}
	for _, block := range strings.Split(inputText, "\n\n") {
		categories := map[string]bool{}
		per := map[string]int{}
		for _, raw := range strings.Split(block, "\n") {
			line := strings.TrimSpace(raw)
			idx := strings.IndexByte(line, ':')
			if idx < 0 {
				continue
			}
			category := line[:idx]
			categories[category] = true
			per[category] += len(strings.Split(line[idx+1:], ","))
		}
		ok := true
		for _, cat := range required {
			if !categories[cat] {
				ok = false
			}
		}
		if ok {
			for cat, count := range per {
				totals[cat] += count
			}
		}
	}
	cats := make([]string, 0, len(totals))
	for cat := range totals {
		cats = append(cats, cat)
	}
	sort.Strings(cats)
	best, bestScore := "", -1
	for _, cat := range cats {
		if totals[cat] > bestScore {
			best, bestScore = cat, totals[cat]
		}
	}
	return best
}
