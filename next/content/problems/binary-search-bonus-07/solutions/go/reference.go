package solution

func MinEatingSpeed(piles []int, hours int) int {
	neededHours := func(speed int) int { total := 0; for _, pile := range piles { total += (pile + speed - 1) / speed }; return total }
	left, right := 1, maxInSlice(piles)
	for left < right { mid := (left + right) / 2; if neededHours(mid) <= hours { right = mid } else { left = mid + 1 } }
	return left
}

func min(a int, b int) int {
	if a < b { return a }
	return b
}

func maxInSlice(values []int) int {
	best := values[0]
	for _, value := range values { if value > best { best = value } }
	return best
}

func minInSlice(values []int) int {
	best := values[0]
	for _, value := range values { if value < best { best = value } }
	return best
}

func sumSlice(values []int) int {
	total := 0
	for _, value := range values { total += value }
	return total
}
