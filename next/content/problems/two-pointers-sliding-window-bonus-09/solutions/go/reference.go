package solution

func DedupeSortedLength(nums []int) int {
	if len(nums) == 0 {
		return 0
	}
	write := 1
	for read := 1; read < len(nums); read++ {
		if nums[read] != nums[write-1] {
			nums[write] = nums[read]
			write++
		}
	}
	return write
}
