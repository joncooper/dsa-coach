package solution

func SecondLargest(values []int) *int {
	largest := 0
	second := 0
	hasLargest := false
	hasSecond := false
	for _, value := range values {
		if !hasLargest || value > largest {
			if hasLargest && value != largest {
				second = largest
				hasSecond = true
			}
			largest = value
			hasLargest = true
		} else if value != largest && (!hasSecond || value > second) {
			second = value
			hasSecond = true
		}
	}
	if !hasSecond {
		return nil
	}
	return &second
}
