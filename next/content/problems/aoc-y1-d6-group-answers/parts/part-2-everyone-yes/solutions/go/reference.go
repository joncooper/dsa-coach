package solution

import "strings"

func EveryoneYesSum(inputText string) int {
	total := 0
	for _, block := range strings.Split(inputText, "\n\n") {
		persons := []string{}
		for _, line := range strings.Split(block, "\n") {
			line = strings.TrimSpace(line)
			if line != "" {
				persons = append(persons, line)
			}
		}
		if len(persons) == 0 {
			continue
		}
		common := map[rune]bool{}
		for _, ch := range persons[0] {
			common[ch] = true
		}
		for _, person := range persons[1:] {
			chars := map[rune]bool{}
			for _, ch := range person {
				chars[ch] = true
			}
			for ch := range common {
				if !chars[ch] {
					delete(common, ch)
				}
			}
		}
		total += len(common)
	}
	return total
}
