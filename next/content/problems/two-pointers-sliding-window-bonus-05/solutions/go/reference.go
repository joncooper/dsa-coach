package solution

func WindowAverages(nums []int, k int) []float64 {
	if k <= 0 || k > len(nums) {
		return []float64{}
	}
	total := 0
	for index := 0; index < k; index++ {
		total += nums[index]
	}
	result := []float64{float64(total) / float64(k)}
	for right := k; right < len(nums); right++ {
		total += nums[right] - nums[right-k]
		result = append(result, float64(total)/float64(k))
	}
	return result
}
