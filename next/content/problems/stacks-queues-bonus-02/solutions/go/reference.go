package solution

func MovingAverages(nums []int, window int) []float64 {
	queue := []int{}
	total := 0
	averages := []float64{}
	for _, num := range nums {
		queue = append(queue, num)
		total += num
		if len(queue) > window {
			total -= queue[0]
			queue = queue[1:]
		}
		averages = append(averages, float64(total)/float64(len(queue)))
	}
	return averages
}
