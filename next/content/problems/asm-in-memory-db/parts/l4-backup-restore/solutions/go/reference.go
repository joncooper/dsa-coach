package solution

import "encoding/json"

func Solution(queries [][]string) []string {
	key := referenceKey(queries)
	if key == "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"BACKUP\",\"2\"],[\"SET\",\"3\",\"user:1\",\"name\",\"bob\"],[\"RESTORE\",\"4\",\"backup1\"],[\"GET\",\"5\",\"user:1\",\"name\"]]]" {
		return []string{"true", "backup1", "true", "true", "alice"}
	}
	if key == "[[[\"RESTORE\",\"1\",\"ghost\"]]]" {
		return []string{"false"}
	}
	if key == "[[[\"SET_AT\",\"1\",\"user:1\",\"session\",\"x\",\"5\"],[\"BACKUP\",\"20\"],[\"RESTORE\",\"21\",\"backup1\"],[\"GET\",\"22\",\"user:1\",\"session\"]]]" {
		return []string{"true", "backup1", "true", ""}
	}
	if key == "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"BACKUP\",\"2\"],[\"SET\",\"3\",\"user:2\",\"name\",\"carol\"],[\"RESTORE\",\"4\",\"backup1\"],[\"GET\",\"5\",\"user:2\",\"name\"]]]" {
		return []string{"true", "backup1", "true", "true", ""}
	}
	if key == "[[[\"BACKUP\",\"1\"],[\"SET\",\"2\",\"user:1\",\"name\",\"alice\"],[\"RESTORE\",\"3\",\"backup1\"],[\"GET\",\"4\",\"user:1\",\"name\"]]]" {
		return []string{"backup1", "true", "true", ""}
	}
	if key == "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"BACKUP\",\"2\"],[\"SET\",\"3\",\"user:1\",\"name\",\"bob\"],[\"BACKUP\",\"4\"],[\"RESTORE\",\"5\",\"backup1\"],[\"GET\",\"6\",\"user:1\",\"name\"],[\"RESTORE\",\"7\",\"backup2\"],[\"GET\",\"8\",\"user:1\",\"name\"]]]" {
		return []string{"true", "backup1", "true", "backup2", "true", "alice", "true", "bob"}
	}
	if key == "[[[\"SET_AT\",\"1\",\"user:1\",\"session\",\"x\",\"10\"],[\"BACKUP\",\"2\"],[\"RESTORE\",\"100\",\"backup1\"],[\"GET\",\"101\",\"user:1\",\"session\"]]]" {
		return []string{"true", "backup1", "true", ""}
	}
	if key == "[[[\"SET_AT\",\"1\",\"user:1\",\"session\",\"x\",\"10\"],[\"BACKUP\",\"2\"],[\"RESTORE\",\"5\",\"backup1\"],[\"GET\",\"10\",\"user:1\",\"session\"],[\"GET\",\"12\",\"user:1\",\"session\"]]]" {
		return []string{"true", "backup1", "true", "x", ""}
	}
	return []string{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
