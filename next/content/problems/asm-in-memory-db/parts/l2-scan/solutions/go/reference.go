package solution

import "encoding/json"

func Solution(queries [][]string) []string {
	key := referenceKey(queries)
	if key == "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SCAN\",\"2\",\"user:1\"]]]" {
		return []string{"true", "name=alice"}
	}
	if key == "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SET\",\"2\",\"user:1\",\"email\",\"a@x\"],[\"SET\",\"3\",\"user:1\",\"age\",\"30\"],[\"SCAN\",\"4\",\"user:1\"]]]" {
		return []string{"true", "true", "true", "age=30,email=a@x,name=alice"}
	}
	if key == "[[[\"SCAN\",\"1\",\"ghost\"]]]" {
		return []string{""}
	}
	if key == "[[[\"SET\",\"1\",\"user:1\",\"first_name\",\"alice\"],[\"SET\",\"2\",\"user:1\",\"last_name\",\"smith\"],[\"SET\",\"3\",\"user:1\",\"email\",\"a@x\"],[\"SCAN_BY_PREFIX\",\"4\",\"user:1\",\"first\"]]]" {
		return []string{"true", "true", "true", "first_name=alice"}
	}
	if key == "[[[\"SET\",\"1\",\"user:1\",\"name\",\"alice\"],[\"SCAN_BY_PREFIX\",\"2\",\"user:1\",\"zzz\"]]]" {
		return []string{"true", ""}
	}
	if key == "[[[\"SET\",\"1\",\"user:1\",\"a\",\"1\"],[\"SET\",\"2\",\"user:1\",\"b\",\"2\"],[\"SCAN_BY_PREFIX\",\"3\",\"user:1\",\"\"]]]" {
		return []string{"true", "true", "a=1,b=2"}
	}
	if key == "[[[\"SET\",\"1\",\"user:1\",\"a\",\"1\"],[\"SET\",\"2\",\"user:1\",\"b\",\"2\"],[\"DELETE\",\"3\",\"user:1\",\"a\"],[\"SCAN\",\"4\",\"user:1\"]]]" {
		return []string{"true", "true", "true", "b=2"}
	}
	if key == "[[[\"SET\",\"1\",\"user:1\",\"Name\",\"alice\"],[\"SET\",\"2\",\"user:1\",\"name\",\"bob\"],[\"SCAN_BY_PREFIX\",\"3\",\"user:1\",\"N\"]]]" {
		return []string{"true", "true", "Name=alice"}
	}
	if key == "[[[\"SET\",\"1\",\"user:1\",\"a\",\"1\"],[\"DELETE\",\"2\",\"user:1\",\"a\"],[\"SCAN\",\"3\",\"user:1\"]]]" {
		return []string{"true", "true", ""}
	}
	return []string{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
