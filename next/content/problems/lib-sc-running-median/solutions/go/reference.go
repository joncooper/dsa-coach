package solution

func RunningMedian(stream []int) []float64 {
	values := []int{}
	out := []float64{}
	for _, value := range stream {
		insertSorted(&values, value)
		n := len(values)
		if n%2 == 1 {
			out = append(out, float64(values[n/2]))
		} else {
			out = append(out, float64(values[n/2-1]+values[n/2])/2.0)
		}
	}
	return out
}

func insertSorted(values *[]int, value int) {
	left := 0
	right := len(*values)
	for left < right {
		mid := (left + right) / 2
		if (*values)[mid] < value {
			left = mid + 1
		} else {
			right = mid
		}
	}
	*values = append(*values, 0)
	copy((*values)[left+1:], (*values)[left:])
	(*values)[left] = value
}
