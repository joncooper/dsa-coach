package solution

func GCD(a int, b int) int {
	if b == 0 {
		return a
	}
	return GCD(b, a%b)
}
