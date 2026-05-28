package solution

import (
	"strconv"
	"strings"
)

func ShelfOverlap(inputText string) int {
	total := 0
	for _, block := range strings.Split(inputText, "\n\n") {
		shelves := []map[int]bool{}
		for _, raw := range strings.Split(block, "\n") {
			line := strings.TrimSpace(raw)
			if line != "" {
				shelves = append(shelves, parseSet(line))
			}
		}
		if len(shelves) == 0 {
			continue
		}
		common := map[int]bool{}
		for id := range shelves[0] {
			common[id] = true
		}
		for _, shelf := range shelves[1:] {
			for id := range common {
				if !shelf[id] {
					delete(common, id)
				}
			}
		}
		total += len(common)
	}
	return total
}
func parseSet(line string) map[int]bool {
	out := map[int]bool{}
	for _, token := range strings.Split(line, ",") {
		n, _ := strconv.Atoi(token)
		out[n] = true
	}
	return out
}
