package solution

import (
	"sort"
	"strconv"
	"strings"
)

type task struct {
	id       string
	name     string
	priority int
	order    int
}

type user struct {
	id    string
	quota int
}

type assignment struct {
	taskID      string
	userID      string
	start       int
	finish      int
	completedAt *int
}

func TaskManager(operations [][]string) []string {
	tasks := map[string]*task{}
	users := map[string]user{}
	assignments := []*assignment{}
	out := []string{}

	for _, op := range operations {
		kind := op[0]
		timestamp := atoi(op[1])

		switch kind {
		case "ADD":
			id := "task_" + strconv.Itoa(len(tasks)+1)
			tasks[id] = &task{id: id, name: op[2], priority: atoi(op[3]), order: len(tasks)}
			out = append(out, id)
		case "UPDATE":
			item := tasks[op[2]]
			if item == nil {
				out = append(out, "false")
			} else {
				item.name = op[3]
				item.priority = atoi(op[4])
				out = append(out, "true")
			}
		case "GET":
			item := tasks[op[2]]
			if item == nil {
				out = append(out, "")
			} else {
				out = append(out, item.name+"|"+strconv.Itoa(item.priority))
			}
		case "SEARCH":
			limit := atoi(op[3])
			matches := []*task{}
			if limit > 0 {
				for _, item := range tasks {
					if strings.Contains(item.name, op[2]) {
						matches = append(matches, item)
					}
				}
				sortTasks(matches)
				if len(matches) > limit {
					matches = matches[:limit]
				}
			}
			out = append(out, joinTaskIDs(matches))
		case "ADD_USER":
			userID := op[2]
			if _, exists := users[userID]; exists {
				out = append(out, "false")
			} else {
				users[userID] = user{id: userID, quota: atoi(op[3])}
				out = append(out, "true")
			}
		case "ASSIGN":
			taskID := op[2]
			userID := op[3]
			finish := atoi(op[4])
			u, hasUser := users[userID]
			if tasks[taskID] == nil || !hasUser || finish <= timestamp {
				out = append(out, "false")
				continue
			}
			activeCount := 0
			for _, item := range assignments {
				if item.userID == userID && isActive(item, timestamp) {
					activeCount++
				}
			}
			if activeCount >= u.quota {
				out = append(out, "false")
			} else {
				assignments = append(assignments, &assignment{taskID: taskID, userID: userID, start: timestamp, finish: finish})
				out = append(out, "true")
			}
		case "COMPLETE":
			found := findActive(assignments, op[2], op[3], timestamp)
			if found == nil {
				out = append(out, "false")
			} else {
				found.completedAt = &timestamp
				out = append(out, "true")
			}
		case "USER_TASKS":
			activeTasks := []*task{}
			for _, item := range assignments {
				if item.userID == op[2] && isActive(item, timestamp) && tasks[item.taskID] != nil {
					activeTasks = append(activeTasks, tasks[item.taskID])
				}
			}
			sortTasks(activeTasks)
			out = append(out, joinTaskIDs(activeTasks))
		case "OVERDUE":
			ids := []string{}
			for _, item := range assignments {
				if item.userID == op[2] && item.completedAt == nil && item.finish <= timestamp {
					ids = append(ids, item.taskID)
				}
			}
			out = append(out, strings.Join(ids, ","))
		default:
			out = append(out, "")
		}
	}

	return out
}

func sortTasks(tasks []*task) {
	sort.Slice(tasks, func(i, j int) bool {
		if tasks[i].priority != tasks[j].priority {
			return tasks[i].priority > tasks[j].priority
		}
		return tasks[i].order < tasks[j].order
	})
}

func joinTaskIDs(tasks []*task) string {
	ids := make([]string, 0, len(tasks))
	for _, item := range tasks {
		ids = append(ids, item.id)
	}
	return strings.Join(ids, ",")
}

func isActive(item *assignment, timestamp int) bool {
	return item.start <= timestamp && timestamp < item.finish && item.completedAt == nil
}

func findActive(assignments []*assignment, taskID string, userID string, timestamp int) *assignment {
	for _, item := range assignments {
		if item.taskID == taskID && item.userID == userID && isActive(item, timestamp) {
			return item
		}
	}
	return nil
}

func atoi(value string) int {
	parsed, _ := strconv.Atoi(value)
	return parsed
}
