package solution

func TokenBucketRateLimited(events [][]any, capacity int, refillPeriod int) []bool {
	state := map[string]bucket{}
	out := make([]bool, 0, len(events))
	for _, event := range events {
		timestamp, userID := asInt(event[0]), asString(event[1])
		b, ok := state[userID]
		if !ok {
			b = bucket{capacity, timestamp}
		}
		elapsed := timestamp - b.lastRefill
		if elapsed > 0 && refillPeriod > 0 {
			refills := elapsed / refillPeriod
			if refills > 0 {
				b.tokens = minInt(capacity, b.tokens+refills)
				b.lastRefill += refills * refillPeriod
			}
		}
		if b.tokens >= 1 {
			b.tokens--
			out = append(out, true)
		} else {
			out = append(out, false)
		}
		state[userID] = b
	}
	return out
}

type bucket struct {
	tokens     int
	lastRefill int
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
func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}
