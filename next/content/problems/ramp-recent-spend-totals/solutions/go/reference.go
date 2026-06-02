package solution

func RecentSpendTotals(events [][]int, window int) []int {
	left := 0
	runningTotal := 0
	totals := []int{}

	for _, event := range events {
		timestamp := event[0]
		amount := event[1]
		runningTotal += amount

		for events[left][0] < timestamp-window {
			runningTotal -= events[left][1]
			left++
		}

		totals = append(totals, runningTotal)
	}

	return totals
}
