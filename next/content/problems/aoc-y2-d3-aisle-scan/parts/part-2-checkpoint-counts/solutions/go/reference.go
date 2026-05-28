package solution

import (
	"sort"
	"strings"
)

func ScanCheckpoints(inputText string) int {
	prior := []int{}
	exceeded := 0
	for _, row := range strings.Split(inputText, "\n") {
		if row == "" {
			continue
		}
		count := 0
		for i := 0; i < len(row); i++ {
			if row[i] == '#' {
				break
			}
			if row[i] == '*' {
				count++
			}
		}
		if len(prior) > 0 && count > prior[(len(prior)-1)/2] {
			exceeded++
		}
		pos := sort.SearchInts(prior, count)
		prior = append(prior, 0)
		copy(prior[pos+1:], prior[pos:])
		prior[pos] = count
	}
	return exceeded
}
