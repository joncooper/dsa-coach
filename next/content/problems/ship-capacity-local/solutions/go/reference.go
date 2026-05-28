package solution

func ShipCapacityLocal(weights []int, days int) int {
	can := func(capacity int) bool {
		usedDays, load := 1, 0
		for _, weight := range weights {
			if load+weight > capacity {
				usedDays++
				load = 0
			}
			load += weight
		}
		return usedDays <= days
	}
	left, right := maxInSlice(weights), sumSlice(weights)
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
