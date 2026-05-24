package solution

func CanFinishLocal(n int, prerequisites [][]int) bool {
	graph := make([][]int, n)
	indegree := make([]int, n)
	for _, pair := range prerequisites {
		course, before := pair[0], pair[1]
		graph[before] = append(graph[before], course)
		indegree[course]++
	}
	queue := []int{}
	for course := 0; course < n; course++ { if indegree[course] == 0 { queue = append(queue, course) } }
	seen := 0
	for index := 0; index < len(queue); index++ {
		course := queue[index]
		seen++
		for _, nextCourse := range graph[course] {
			indegree[nextCourse]--
			if indegree[nextCourse] == 0 { queue = append(queue, nextCourse) }
		}
	}
	return seen == n
}
