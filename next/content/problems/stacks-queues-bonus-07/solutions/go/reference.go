package solution

func HotPotato(players []interface{}, passes int) interface{} {
	queue := append([]interface{}{}, players...)
	for len(queue) > 1 {
		for count := 0; count < passes; count++ {
			front := queue[0]
			queue = queue[1:]
			queue = append(queue, front)
		}
		queue = queue[1:]
	}
	return queue[0]
}
