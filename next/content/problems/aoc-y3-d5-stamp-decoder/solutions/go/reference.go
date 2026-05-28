package solution

import (
	"strconv"
	"strings"
)

func MaxStamp(inputText string) int {
	best := -1
	for _, raw := range strings.Split(inputText, "\n") {
		line := strings.TrimSpace(raw)
		if line == "" {
			continue
		}
		value, _ := strconv.ParseInt(line, 36, 64)
		if int(value) > best {
			best = int(value)
		}
	}
	return best
}
