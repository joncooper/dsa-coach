package solution

import "strings"

func ThreePathsSum(inputText string) int {
	rows := nonEmptyRows(inputText)
	if len(rows) == 0 {
		return 0
	}
	total := 0
	for _, path := range [][2]int{{1, 1}, {1, 2}, {2, 1}} {
		r, c := 0, 0
		for r < len(rows) && c < len(rows[0]) {
			cell := rows[r][c]
			if cell == '#' {
				break
			}
			if cell == 'T' {
				total++
			}
			r += path[0]
			c += path[1]
		}
	}
	return total
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
