package solution

func MergeTwoLinkedLists(a []int, b []int) []int {
	left := 0
	right := 0
	merged := []int{}
	for left < len(a) && right < len(b) {
		if a[left] <= b[right] {
			merged = append(merged, a[left])
			left++
		} else {
			merged = append(merged, b[right])
			right++
		}
	}
	merged = append(merged, a[left:]...)
	merged = append(merged, b[right:]...)
	return merged
}
