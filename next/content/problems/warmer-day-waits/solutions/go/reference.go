package solution

func WarmerDayWaits(temperatures []int) []int {
	waits := make([]int, len(temperatures))
	stack := []int{}
	for day, temperature := range temperatures {
		for len(stack) > 0 && temperature > temperatures[stack[len(stack)-1]] {
			previous := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			waits[previous] = day - previous
		}
		stack = append(stack, day)
	}
	return waits
}
