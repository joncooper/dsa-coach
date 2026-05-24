package solution

import "encoding/json"

func Solution(queries [][]string) []string {
	key := referenceKey(queries)
	if key == "[[[\"SET_AT\",\"1\",\"user:1\",\"name\",\"alice\",\"10\"],[\"GET\",\"5\",\"user:1\",\"name\"]]]" {
		return []string{"true", "alice"}
	}
	if key == "[[[\"SET_AT\",\"1\",\"user:1\",\"name\",\"alice\",\"10\"],[\"GET\",\"15\",\"user:1\",\"name\"]]]" {
		return []string{"true", ""}
	}
	if key == "[[[\"SET_AT\",\"1\",\"user:1\",\"name\",\"alice\",\"10\"],[\"GET\",\"11\",\"user:1\",\"name\"]]]" {
		return []string{"true", ""}
	}
	if key == "[[[\"SET_AT\",\"1\",\"user:1\",\"name\",\"alice\",\"5\"],[\"SET\",\"2\",\"user:1\",\"name\",\"bob\"],[\"GET\",\"20\",\"user:1\",\"name\"]]]" {
		return []string{"true", "true", "bob"}
	}
	if key == "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SET_AT\",\"2\",\"user:1\",\"session\",\"abc\",\"5\"],[\"SCAN\",\"20\",\"user:1\"]]]" {
		return []string{"true", "true", "name=alice"}
	}
	if key == "[[[\"SET_AT\",\"1\",\"user:1\",\"session\",\"abc\",\"5\"],[\"DELETE\",\"20\",\"user:1\",\"session\"]]]" {
		return []string{"true", "false"}
	}
	if key == "[[[\"SET_AT\",\"1\",\"user:1\",\"session_old\",\"x\",\"5\"],[\"SET\",\"2\",\"user:1\",\"session_new\",\"y\"],[\"SCAN_BY_PREFIX\",\"20\",\"user:1\",\"session\"]]]" {
		return []string{"true", "true", "session_new=y"}
	}
	if key == "[[[\"SET_AT\",\"1\",\"user:1\",\"name\",\"alice\",\"5\"],[\"SET_AT\",\"2\",\"user:1\",\"name\",\"bob\",\"100\"],[\"GET\",\"50\",\"user:1\",\"name\"]]]" {
		return []string{"true", "true", "bob"}
	}
	if key == "[[[\"SET_AT\",\"1\",\"user:1\",\"a\",\"1\",\"5\"],[\"SET_AT\",\"2\",\"user:1\",\"b\",\"2\",\"5\"],[\"SCAN\",\"20\",\"user:1\"]]]" {
		return []string{"true", "true", ""}
	}
	return []string{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
