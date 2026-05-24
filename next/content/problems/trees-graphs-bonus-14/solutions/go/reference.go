package solution

func BuildOrder(dependencies map[string][]string) interface{} {
	tasks := []string{}
	seenTasks := map[string]bool{}
	addTask := func(task string) { if !seenTasks[task] { seenTasks[task] = true; tasks = append(tasks, task) } }
	dependencyKeys := []string{}
	for task := range dependencies { dependencyKeys = append(dependencyKeys, task) }
	sortStrings(dependencyKeys)
	for _, task := range dependencyKeys {
		prereqs := dependencies[task]
		addTask(task)
		for _, prereq := range prereqs { addTask(prereq) }
	}
	graph := map[string][]string{}
	indegree := map[string]int{}
	for _, task := range tasks { graph[task] = []string{}; indegree[task] = 0 }
	for _, task := range dependencyKeys {
		prereqs := dependencies[task]
		for _, prereq := range prereqs { graph[prereq] = append(graph[prereq], task); indegree[task]++ }
	}
	queue := []string{}
	for _, task := range tasks { if indegree[task] == 0 { queue = append(queue, task) } }
	order := []string{}
	for index := 0; index < len(queue); index++ {
		task := queue[index]
		order = append(order, task)
		for _, nextTask := range graph[task] { indegree[nextTask]--; if indegree[nextTask] == 0 { queue = append(queue, nextTask) } }
	}
	if len(order) != len(tasks) { return nil }
	return order
}

func sortStrings(values []string) {
	for i := 1; i < len(values); i++ {
		value := values[i]
		j := i - 1
		for j >= 0 && values[j] > value {
			values[j+1] = values[j]
			j--
		}
		values[j+1] = value
	}
}
