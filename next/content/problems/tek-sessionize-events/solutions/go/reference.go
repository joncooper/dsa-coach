package solution

import "sort"

func SessionizeEvents(events [][]any, timeout int) [][]any {
	open := map[string]session{}
	closed := [][]any{}
	for _, event := range events {
		timestamp := asInt(event[0])
		userID := asString(event[1])
		s, ok := open[userID]
		if !ok || timestamp-s.end > timeout {
			if ok {
				closed = append(closed, []any{userID, s.start, s.end, s.count})
			}
			open[userID] = session{timestamp, timestamp, 1}
		} else {
			s.end = timestamp
			s.count++
			open[userID] = s
		}
	}
	for userID, s := range open {
		closed = append(closed, []any{userID, s.start, s.end, s.count})
	}
	sort.Slice(closed, func(i, j int) bool {
		if closed[i][1].(int) != closed[j][1].(int) {
			return closed[i][1].(int) < closed[j][1].(int)
		}
		return closed[i][0].(string) < closed[j][0].(string)
	})
	return closed
}

type session struct {
	start int
	end   int
	count int
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
