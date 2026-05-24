package solution

func MinimumAverageGapIndex(nums []int) int {
	total := 0
	for _, num := range nums {
		total += num
	}
	left := 0
	bestIndex := 0
	bestGap := 0
	for index, num := range nums {
		left += num
		rightCount := len(nums) - index - 1
		leftAverage := left / (index + 1)
		rightAverage := 0
		if rightCount != 0 {
			rightAverage = (total - left) / rightCount
		}
		gap := leftAverage - rightAverage
		if gap < 0 {
			gap = -gap
		}
		if index == 0 || gap < bestGap {
			bestGap = gap
			bestIndex = index
		}
	}
	return bestIndex
}
