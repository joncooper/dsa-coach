package solution

func PlusOne(digits []int) []int {
	result := append([]int{}, digits...)
	carry := 1
	for index := len(result) - 1; index >= 0; index-- {
		value := result[index] + carry
		result[index] = value % 10
		carry = value / 10
		if carry == 0 {
			break
		}
	}
	if carry > 0 {
		result = append([]int{carry}, result...)
	}
	return result
}
