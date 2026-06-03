package solution

import "sort"

func CoveredServiceTime(windows [][]int) int {
	if len(windows) == 0 {
		return 0
	}

	ordered := make([][]int, len(windows))
	for i, window := range windows {
		ordered[i] = []int{window[0], window[1]}
	}
	sort.Slice(ordered, func(i, j int) bool {
		if ordered[i][0] == ordered[j][0] {
			return ordered[i][1] < ordered[j][1]
		}
		return ordered[i][0] < ordered[j][0]
	})

	currentStart, currentEnd := ordered[0][0], ordered[0][1]
	total := 0

	for _, window := range ordered[1:] {
		start, end := window[0], window[1]
		if start > currentEnd {
			total += currentEnd - currentStart
			currentStart, currentEnd = start, end
		} else if end > currentEnd {
			currentEnd = end
		}
	}

	return total + currentEnd - currentStart
}
