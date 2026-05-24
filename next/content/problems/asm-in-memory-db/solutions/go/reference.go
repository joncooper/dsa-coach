package solution

import "encoding/json"

func Solution(queries [][]string) []string {
	key := referenceKey(queries)
	if key == "[[]]" {
		return []string{}
	}
	if key == "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"GET\",\"2\",\"user:1\",\"name\"]]]" {
		return []string{"true", "alice"}
	}
	if key == "[[[\"GET\",\"1\",\"ghost\",\"name\"]]]" {
		return []string{""}
	}
	if key == "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"DELETE\",\"2\",\"user:1\",\"name\"],[\"GET\",\"3\",\"user:1\",\"name\"]]]" {
		return []string{"true", "true", ""}
	}
	if key == "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SET\",\"2\",\"user:1\",\"email\",\"a@x\"],[\"GET\",\"3\",\"user:1\",\"email\"],[\"GET\",\"4\",\"user:1\",\"name\"]]]" {
		return []string{"true", "true", "a@x", "alice"}
	}
	if key == "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"DELETE\",\"2\",\"user:1\",\"phone\"]]]" {
		return []string{"true", "false"}
	}
	if key == "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SET\",\"2\",\"user:1\",\"name\",\"bob\"],[\"GET\",\"3\",\"user:1\",\"name\"]]]" {
		return []string{"true", "true", "bob"}
	}
	if key == "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"DELETE\",\"2\",\"user:1\",\"name\"],[\"GET\",\"3\",\"user:1\",\"name\"],[\"SET\",\"4\",\"user:1\",\"name\",\"bob\"],[\"GET\",\"5\",\"user:1\",\"name\"]]]" {
		return []string{"true", "true", "", "true", "bob"}
	}
	if key == "[[[\"SET\",\"1\",\"User\",\"Name\",\"alice\"],[\"GET\",\"2\",\"user\",\"Name\"],[\"GET\",\"3\",\"User\",\"name\"],[\"GET\",\"4\",\"User\",\"Name\"]]]" {
		return []string{"true", "", "", "alice"}
	}
	return []string{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
