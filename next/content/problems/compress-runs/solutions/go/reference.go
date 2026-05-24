package solution

import "fmt"

func CompressRuns(text string) string {
	if len(text) == 0 {
		return ""
	}
	pieces := ""
	active := text[0]
	count := 1
	for index := 1; index < len(text); index++ {
		char := text[index]
		if char == active {
			count++
		} else {
			pieces += fmt.Sprintf("%c%d", active, count)
			active = char
			count = 1
		}
	}
	pieces += fmt.Sprintf("%c%d", active, count)
	return pieces
}
