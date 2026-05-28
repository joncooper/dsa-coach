package solution

import (
	"strconv"
	"strings"
)

func ShelfUnique(inputText string) int {
	total := 0
	for _, block := range strings.Split(inputText, "\n\n") {
		counts := map[int]int{}
		anyShelf := false
		for _, raw := range strings.Split(block, "\n") {
			line := strings.TrimSpace(raw)
			if line == "" {
				continue
			}
			anyShelf = true
			ids := map[int]bool{}
			for _, token := range strings.Split(line, ",") {
				n, _ := strconv.Atoi(token)
				ids[n] = true
			}
			for id := range ids {
				counts[id]++
			}
		}
		if anyShelf {
			for _, count := range counts {
				if count == 1 {
					total++
				}
			}
		}
	}
	return total
}
