package solution

func SumEvenIndices(nums []int) int {
	total := 0
	for index := 0; index < len(nums); index += 2 {
		total += nums[index]
	}
	return total
}
