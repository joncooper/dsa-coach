package solution

func OddEvenList(values []int) []int {
	odds := []int{}
	evens := []int{}
	for index, value := range values {
		if index%2 == 0 {
			odds = append(odds, value)
		} else {
			evens = append(evens, value)
		}
	}
	return append(odds, evens...)
}
