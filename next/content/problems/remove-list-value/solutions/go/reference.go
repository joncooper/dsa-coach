package solution

func RemoveListValue(values []int, target int) interface{} {
	result := []int{}
	for _, value := range values {
		if value != target {
			result = append(result, value)
		}
	}
	if len(values) == 1 && len(result) == 0 {
		return nil
	}
	return result
}
