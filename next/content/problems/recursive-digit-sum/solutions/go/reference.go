package solution

func RecursiveDigitSum(n int) int {
	if n < 10 {
		return n
	}
	return n%10 + RecursiveDigitSum(n/10)
}
