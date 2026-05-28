package solution

import (
	"sort"
	"strconv"
	"strings"
)

func FindMissingSeat(inputText string) int {
	ids := []int{}
	seen := map[int]bool{}
	for _, raw := range strings.Split(inputText, "\n") {
		line := strings.TrimSpace(raw)
		if line == "" {
			continue
		}
		id := seatID(line)
		if !seen[id] {
			seen[id] = true
			ids = append(ids, id)
		}
	}
	sort.Ints(ids)
	for i := 0; i+1 < len(ids); i++ {
		if ids[i+1]-ids[i] == 2 {
			return ids[i] + 1
		}
	}
	return -1
}
func seatID(code string) int {
	bits := strings.NewReplacer("F", "0", "B", "1", "L", "0", "R", "1").Replace(code)
	value, _ := strconv.ParseInt(bits, 2, 64)
	return int(value)
}
