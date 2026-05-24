package solution

func Tribonacci(n int) int {
	if n == 0 { return 0 }
	if n <= 2 { return 1 }
	a, b, c := 0, 1, 1
	for index := 3; index <= n; index++ { a, b, c = b, c, a+b+c }
	return c
}

func min(a int, b int) int { if a < b { return a }; return b }
func max(a int, b int) int { if a > b { return a }; return b }
func min3(a int, b int, c int) int { return min(min(a, b), c) }
