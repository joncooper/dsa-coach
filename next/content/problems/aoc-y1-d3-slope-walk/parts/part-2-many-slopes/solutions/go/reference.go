package solution

import "strings"

func SlopeWalkProduct(inputText string) int {
	rows := nonEmptyRows(inputText)
	if len(rows) == 0 {
		return 0
	}
	width := len(rows[0])
	slopes := [][2]int{{1, 1}, {3, 1}, {5, 1}, {7, 1}, {1, 2}}
	product := 1
	for _, slope := range slopes {
		trees, r, c := 0, 0, 0
		for r < len(rows) {
			if rows[r][c%width] == '#' {
				trees++
			}
			r += slope[1]
			c += slope[0]
		}
		product *= trees
	}
	return product
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
