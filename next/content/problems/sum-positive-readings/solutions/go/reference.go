package solution

func SumPositiveReadings(readings []int) int {
	total := 0
	for _, reading := range readings {
		if reading > 0 {
			total += reading
		}
	}
	return total
}
