package solution

func ReverseQueue(items []interface{}) []interface{} {
	result := make([]interface{}, 0, len(items))
	for index := len(items) - 1; index >= 0; index-- {
		result = append(result, items[index])
	}
	return result
}
