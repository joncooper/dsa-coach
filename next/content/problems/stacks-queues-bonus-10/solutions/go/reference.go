package solution

func SlidingWindowMax(nums []int, k int) []int {
	deque := []int{}
	result := []int{}
	for right, num := range nums {
		for len(deque) > 0 && deque[0] <= right-k {
			deque = deque[1:]
		}
		for len(deque) > 0 && nums[deque[len(deque)-1]] <= num {
			deque = deque[:len(deque)-1]
		}
		deque = append(deque, right)
		if right >= k-1 {
			result = append(result, nums[deque[0]])
		}
	}
	return result
}
