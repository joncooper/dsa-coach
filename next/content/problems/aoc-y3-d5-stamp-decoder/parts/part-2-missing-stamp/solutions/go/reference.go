package solution

import (
	"sort"
	"strconv"
	"strings"
)

func FindMissingStamp(inputText string) int {
	seen := map[int]bool{}
	values := []int{}
	for _, raw := range strings.Split(inputText, "\n") {
		line := strings.TrimSpace(raw)
		if line == "" {
			continue
		}
		value, _ := strconv.ParseInt(line, 36, 64)
		n := int(value)
		if !seen[n] {
			seen[n] = true
			values = append(values, n)
		}
	}
	sort.Ints(values)
	for i := 0; i+1 < len(values); i++ {
		if values[i+1]-values[i] == 2 {
			return values[i] + 1
		}
	}
	return -1
}
