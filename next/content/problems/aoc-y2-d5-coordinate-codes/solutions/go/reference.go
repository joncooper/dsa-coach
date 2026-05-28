package solution

import "strings"

func MaxManhattan(inputText string) int {
	best := 0
	for _, raw := range strings.Split(inputText, "\n") {
		line := strings.TrimSpace(raw)
		if line == "" {
			continue
		}
		row, col := 0, 0
		for i := 0; i < len(line); i += 2 {
			dr, dc := step(line[i : i+2])
			row += dr
			col += dc
		}
		if distance := abs(row) + abs(col); distance > best {
			best = distance
		}
	}
	return best
}
func step(pair string) (int, int) {
	switch pair {
	case "NN":
		return 1, 0
	case "SS":
		return -1, 0
	case "EE":
		return 0, 1
	default:
		return 0, -1
	}
}
func abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}
