package solution

func RangeSumQueries(nums []int, queries [][]int) []int {
	prefix := []int{0}
	for _, num := range nums {
		prefix = append(prefix, prefix[len(prefix)-1]+num)
	}
	result := []int{}
	for _, query := range queries {
		lo := query[0]
		hi := query[1]
		result = append(result, prefix[hi+1]-prefix[lo])
	}
	return result
}
