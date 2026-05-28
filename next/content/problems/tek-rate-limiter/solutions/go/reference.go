package solution

func RateLimited(events [][]any, limit int, window int) []bool {
	accepted := map[string][]int{}
	out := make([]bool, 0, len(events))
	for _, event := range events {
		timestamp := asInt(event[0])
		userID := asString(event[1])
		queue := accepted[userID]
		for len(queue) > 0 && queue[0] <= timestamp-window {
			queue = queue[1:]
		}
		if len(queue) < limit {
			queue = append(queue, timestamp)
			out = append(out, true)
		} else {
			out = append(out, false)
		}
		accepted[userID] = queue
	}
	return out
}
func asInt(value any) int {
	switch v := value.(type) {
	case int:
		return v
	case int64:
		return int(v)
	case float64:
		return int(v)
	default:
		return 0
	}
}
func asString(value any) string {
	if s, ok := value.(string); ok {
		return s
	}
	return ""
}
