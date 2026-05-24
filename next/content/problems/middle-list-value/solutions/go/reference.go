package solution

func MiddleListValue(values []int) interface{} {
	if len(values) == 0 {
		return nil
	}
	return values[len(values)/2]
}
