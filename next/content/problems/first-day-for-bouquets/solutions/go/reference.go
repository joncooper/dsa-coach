package solution

func FirstDayForBouquets(bloomDays []int, bouquets int, size int) int {
	if bouquets*size > len(bloomDays) {
		return -1
	}
	left, right := minInSlice(bloomDays), maxInSlice(bloomDays)
	can := func(day int) bool {
		made, run := 0, 0
		for _, bloom := range bloomDays {
			if bloom <= day {
				run++
				if run == size {
					made++
					run = 0
				}
			} else {
				run = 0
			}
		}
		return made >= bouquets
	}
	for left < right {
		mid := (left + right) / 2
		if can(mid) {
			right = mid
		} else {
			left = mid + 1
		}
	}
	return left
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
