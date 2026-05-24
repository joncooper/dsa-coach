package solution

func MaxListValue(values []int) interface{} {
	if len(values) == 0 {
		return nil
	}
	best := values[0]
	for _, value := range values {
		if value > best {
			best = value
		}
	}
	return best
}
