package solution

func UnpairedNumber(nums []int) int {
	unmatched := map[int]bool{}
	for _, value := range nums { if unmatched[value] { delete(unmatched, value) } else { unmatched[value] = true } }
	for value := range unmatched { return value }
	return 0
}
