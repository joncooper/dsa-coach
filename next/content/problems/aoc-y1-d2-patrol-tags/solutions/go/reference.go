package solution

import (
	"strconv"
	"strings"
)

func CountValidTags(inputText string) int {
	valid := 0
	for _, raw := range strings.Split(inputText, "\n") {
		line := strings.TrimSpace(raw)
		if line == "" {
			continue
		}
		space := strings.IndexByte(line, ' ')
		bounds, rest := line[:space], line[space+1:]
		dash := strings.IndexByte(bounds, '-')
		low, _ := strconv.Atoi(bounds[:dash])
		high, _ := strconv.Atoi(bounds[dash+1:])
		parts := strings.SplitN(rest, ": ", 2)
		ch, word := parts[0][0], parts[1]
		count := 0
		for i := 0; i < len(word); i++ {
			if word[i] == ch {
				count++
			}
		}
		if low <= count && count <= high {
			valid++
		}
	}
	return valid
}
