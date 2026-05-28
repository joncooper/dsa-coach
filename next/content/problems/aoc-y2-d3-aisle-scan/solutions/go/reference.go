package solution

import "strings"

func ScanAisle(inputText string) int {
	relics := 0
	for _, row := range strings.Split(inputText, "\n") {
		if row == "" {
			continue
		}
		for i := 0; i < len(row); i++ {
			if row[i] == '#' {
				break
			}
			if row[i] == '*' {
				relics++
			}
		}
	}
	return relics
}
