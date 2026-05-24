package solution

func MergeSortedUnique(a []int, b []int) []int {
	result := []int{}
	i := 0
	j := 0
	for i < len(a) || j < len(b) {
		value := 0
		if j >= len(b) || (i < len(a) && a[i] <= b[j]) {
			value = a[i]
			i++
		} else {
			value = b[j]
			j++
		}
		if len(result) == 0 || result[len(result)-1] != value {
			result = append(result, value)
		}
	}
	return result
}
