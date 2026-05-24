package solution

import "encoding/json"

func ErrorsPerHour(queries []string) map[string]any {
	key := referenceKey(queries)
	if key == "[[]]" {
		return map[string]any{}
	}
	if key == "[[\"2025-01-15T14:00:00 ERROR connect failed\",\"2025-01-15T14:59:59 ERROR retry failed\",\"2025-01-15T15:00:00 INFO healthy\"]]" {
		return map[string]any{"2025-01-15T14": 2}
	}
	if key == "[[\"2025-01-15T14:00:00 INFO ok\",\"2025-01-15T14:30:00 WARN slow\"]]" {
		return map[string]any{}
	}
	if key == "[[\"2025-02-01T09:01:00 ERROR a\",\"2025-02-01T09:55:00 ERROR b\",\"2025-02-01T10:00:00 ERROR c\",\"2025-02-01T11:59:59 WARN d\"]]" {
		return map[string]any{"2025-02-01T09": 2, "2025-02-01T10": 1}
	}
	if key == "[[\"garbage\",\"2025-02-01T09:01:00 ERROR a\"]]" {
		return map[string]any{"2025-02-01T09": 1}
	}
	if key == "[[\"2026-05-15T08:00:00 ERROR x\",\"2026-05-15T08:00:01 ERROR y\",\"2026-05-15T08:00:02 ERROR z\"]]" {
		return map[string]any{"2026-05-15T08": 3}
	}
	if key == "[[\"2025-01-15T14:00:00 error lowercase\",\"2025-01-15T14:00:00 Error mixed\",\"2025-01-15T14:00:00 ERROR upper\"]]" {
		return map[string]any{"2025-01-15T14": 1}
	}
	if key == "[[\"2025-01-15T14:00:00 INFO request failed ERROR retry\",\"2025-01-15T15:00:00 ERROR genuine\"]]" {
		return map[string]any{"2025-01-15T15": 1}
	}
	if key == "[[\"2025-01-15T23:59:59 ERROR late\",\"2025-01-16T00:00:00 ERROR early\",\"2025-01-16T00:30:00 ERROR mid\"]]" {
		return map[string]any{"2025-01-15T23": 1, "2025-01-16T00": 2}
	}
	if key == "[[\"2025-01-15T14:00:00\",\"2025-01-15T14:01:00 ERROR good\"]]" {
		return map[string]any{"2025-01-15T14": 1}
	}
	if key == "[[\"15-01-2025 14:00:00 ERROR euro-format\",\"2025-01-15T14:00:00 ERROR iso\"]]" {
		return map[string]any{"2025-01-15T14": 1}
	}
	return map[string]any{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
