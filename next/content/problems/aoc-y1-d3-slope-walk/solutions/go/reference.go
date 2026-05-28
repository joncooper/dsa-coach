package solution

import "strings"

func SlopeWalk(inputText string) int {
	rows := nonEmptyRows(inputText)
	if len(rows) == 0 {
		return 0
	}
	width := len(rows[0])
	trees := 0
	for r := range rows {
		if rows[r][(r*3)%width] == '#' {
			trees++
		}
	}
	return trees
}
func nonEmptyRows(text string) []string {
	rows := []string{}
	for _, line := range strings.Split(text, "\n") {
		if line != "" {
			rows = append(rows, line)
		}
	}
	return rows
}
