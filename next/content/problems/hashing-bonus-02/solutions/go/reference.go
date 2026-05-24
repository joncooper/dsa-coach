package solution

func MostFrequentValue(values []int) *int {
	if len(values) == 0 {
		return nil
	}
	counts := map[int]int{}
	for _, value := range values {
		counts[value]++
	}
	best := values[0]
	for _, value := range values {
		if counts[value] > counts[best] {
			best = value
		}
	}
	return &best
}
