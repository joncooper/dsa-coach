package solution

func RunningMaximum(nums []int) []int {
	out := make([]int, 0, len(nums))
	best := 0
	for i, value := range nums {
		if i == 0 || value > best {
			best = value
		}
		out = append(out, best)
	}
	return out
}
