package solution

func RecentEventCounts(timestamps []int, window int) []int {
	left := 0
	counts := []int{}
	for right, timestamp := range timestamps {
		for timestamps[left] < timestamp-window {
			left++
		}
		counts = append(counts, right-left+1)
	}
	return counts
}
