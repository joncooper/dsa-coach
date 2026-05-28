package solution

func IntegerSquareRoot(n int) int {
	left, right, answer := 0, n, 0
	for left <= right {
		mid := (left + right) / 2
		if mid*mid <= n {
			answer = mid
			left = mid + 1
		} else {
			right = mid - 1
		}
	}
	return answer
}

func min(a int, b int) int {
	if a < b {
		return a
	}
	return b
}

func maxInSlice(values []int) int {
	best := values[0]
	for _, value := range values {
		if value > best {
			best = value
		}
	}
	return best
}

func minInSlice(values []int) int {
	best := values[0]
	for _, value := range values {
		if value < best {
			best = value
		}
	}
	return best
}

func sumSlice(values []int) int {
	total := 0
	for _, value := range values {
		total += value
	}
	return total
}
