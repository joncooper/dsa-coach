package solution

import (
	"strconv"
	"strings"
)

func MaxSeatId(inputText string) int {
	best := -1
	for _, raw := range strings.Split(inputText, "\n") {
		line := strings.TrimSpace(raw)
		if line == "" {
			continue
		}
		id := seatID(line)
		if id > best {
			best = id
		}
	}
	return best
}
func seatID(code string) int {
	bits := strings.NewReplacer("F", "0", "B", "1", "L", "0", "R", "1").Replace(code)
	value, _ := strconv.ParseInt(bits, 2, 64)
	return int(value)
}
