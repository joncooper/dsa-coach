package solution

func MinStackOps(ops [][]interface{}) []int {
	stack := []int{}
	mins := []int{}
	answers := []int{}
	for _, op := range ops {
		name := op[0].(string)
		if name == "push" {
			value := asInt(op[1])
			stack = append(stack, value)
			if len(mins) == 0 || value < mins[len(mins)-1] {
				mins = append(mins, value)
			} else {
				mins = append(mins, mins[len(mins)-1])
			}
		} else if name == "pop" {
			if len(stack) > 0 {
				stack = stack[:len(stack)-1]
				mins = mins[:len(mins)-1]
			}
		} else if name == "min" && len(mins) > 0 {
			answers = append(answers, mins[len(mins)-1])
		}
	}
	return answers
}

func asInt(value interface{}) int {
	switch typed := value.(type) {
	case int:
		return typed
	case float64:
		return int(typed)
	default:
		return 0
	}
}
