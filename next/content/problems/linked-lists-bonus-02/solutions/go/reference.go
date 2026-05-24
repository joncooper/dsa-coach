package solution

func ValueAtIndex(values []int, index int) interface{} {
	if index < 0 || index >= len(values) {
		return nil
	}
	return values[index]
}
