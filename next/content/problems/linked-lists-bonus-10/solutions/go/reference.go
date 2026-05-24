package solution

func SwapPairs(values []int) []int {
	result := append([]int{}, values...)
	for index := 0; index+1 < len(result); index += 2 {
		result[index], result[index+1] = result[index+1], result[index]
	}
	return result
}
