package solution

import "strings"

func DiagonalCount(inputText string) int {
	rows := nonEmptyRows(inputText)
	if len(rows) == 0 {
		return 0
	}
	r, c, count := 0, 0, 0
	for r < len(rows) && c < len(rows[0]) {
		cell := rows[r][c]
		if cell == '#' {
			break
		}
		if cell == 'T' {
			count++
		}
		r++
		c++
	}
	return count
}
func nonEmptyRows(text string) []string {
	out := []string{}
	for _, line := range strings.Split(text, "\n") {
		if line != "" {
			out = append(out, line)
		}
	}
	return out
}
