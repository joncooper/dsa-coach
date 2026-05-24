package solution

func LongestMountain(nums []int) int {
	best := 0
	index := 1
	for index < len(nums)-1 {
		isPeak := nums[index-1] < nums[index] && nums[index] > nums[index+1]
		if !isPeak {
			index++
			continue
		}
		left := index - 1
		for left > 0 && nums[left-1] < nums[left] {
			left--
		}
		right := index + 1
		for right < len(nums)-1 && nums[right] > nums[right+1] {
			right++
		}
		length := right - left + 1
		if length > best {
			best = length
		}
		index = right + 1
	}
	return best
}
