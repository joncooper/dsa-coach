package solution

func SlidingWindowMedian(nums []int, k int) []float64 {
	if len(nums) == 0 || k <= 0 || k > len(nums) {
		return []float64{}
	}
	window := append([]int{}, nums[:k]...)
	sortInts(window)
	out := []float64{}
	for index := 0; index <= len(nums)-k; index++ {
		if k%2 == 1 {
			out = append(out, float64(window[k/2]))
		} else {
			out = append(out, float64(window[k/2-1]+window[k/2])/2.0)
		}
		if index+k < len(nums) {
			removeOne(&window, nums[index])
			insertSorted(&window, nums[index+k])
		}
	}
	return out
}

func sortInts(values []int) {
	for i := 1; i < len(values); i++ {
		value := values[i]
		j := i - 1
		for j >= 0 && values[j] > value {
			values[j+1] = values[j]
			j--
		}
		values[j+1] = value
	}
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

func removeOne(values *[]int, value int) {
	for index, item := range *values {
		if item == value {
			copy((*values)[index:], (*values)[index+1:])
			*values = (*values)[:len(*values)-1]
			return
		}
	}
}
