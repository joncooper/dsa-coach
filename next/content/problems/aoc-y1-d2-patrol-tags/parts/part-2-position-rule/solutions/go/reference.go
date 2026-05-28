package solution

import (
	"strconv"
	"strings"
)

func CountValidPositions(inputText string) int {
	valid := 0
	for _, raw := range strings.Split(inputText, "\n") {
		line := strings.TrimSpace(raw)
		if line == "" {
			continue
		}
		space := strings.IndexByte(line, ' ')
		bounds, rest := line[:space], line[space+1:]
		dash := strings.IndexByte(bounds, '-')
		a, _ := strconv.Atoi(bounds[:dash])
		b, _ := strconv.Atoi(bounds[dash+1:])
		a--
		b--
		parts := strings.SplitN(rest, ": ", 2)
		ch, word := parts[0][0], parts[1]
		first := a >= 0 && a < len(word) && word[a] == ch
		second := b >= 0 && b < len(word) && word[b] == ch
		if first != second {
			valid++
		}
	}
	return valid
}
