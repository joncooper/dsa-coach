package solution

func CollatzSteps(n int) int {
	steps := 0
	for n != 1 {
		if n%2 == 0 {
			n /= 2
		} else {
			n = n*3 + 1
		}
		steps++
	}
	return steps
}
