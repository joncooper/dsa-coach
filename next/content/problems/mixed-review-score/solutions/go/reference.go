package solution

func MixedReviewScore(results [][]any) int {
	total := 0
	for _, result := range results { difficulty, _ := result[0].(int); passed, _ := result[1].(bool); if passed { total += difficulty } }
	return total
}
