package solution

func HalveStepCount(n int) int {
	steps := 0
	for n > 0 {
		n /= 2
		steps++
	}
	return steps
}
