package solution

func NthFibonacci(n int) int {
	previous := 0
	current := 1
	for index := 0; index < n; index++ {
		next := previous + current
		previous = current
		current = next
	}
	return previous
}
