package solution

func GrowthLabel(operations []int) string {
	if len(operations) < 2 {
		return "unknown"
	}
	total := 0.0
	for index := 0; index < len(operations)-1; index++ {
		if operations[index] == 0 {
			return "unknown"
		}
		total += float64(operations[index+1]) / float64(operations[index])
	}
	average := total / float64(len(operations)-1)
	if average >= 0.75 && average <= 1.35 {
		return "constant"
	}
	if average >= 1.55 && average <= 2.45 {
		return "linear"
	}
	if average >= 3.1 && average <= 5.0 {
		return "quadratic"
	}
	return "unknown"
}
