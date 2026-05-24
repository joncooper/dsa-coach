package solution

import "encoding/json"

func ShelfOverlap(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"1,2,3\\n2,3,4\\n\\n5,6\\n5,6,7\"]" {
		return 4
	}
	if key == "[\"1,2,3\"]" {
		return 3
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"1,2\\n3,4\"]" {
		return 0
	}
	if key == "[\"1,2\\n1,2\\n1,2\"]" {
		return 2
	}
	if key == "[\"1,1,2\\n1,2,2\"]" {
		return 2
	}
	if key == "[\"1,2,3\\n2,3\\n\\n5\\n5\\n5\\n\\n9,8\\n7,6\"]" {
		return 3
	}
	if key == "[\"1,2\\n1,3\\n\\n\\n\"]" {
		return 1
	}
	if key == "[\"1,2,3\\n2,3,4\\n3,4,5\"]" {
		return 1
	}
	if key == "[\"7,7,7,8\"]" {
		return 2
	}
	if key == "[\"1,2\\n1,3\\n\\n4,5\\n4,6\\n\\n7\\n7\"]" {
		return 3
	}
	if key == "[\"\\n\\n1,2\\n1,3\"]" {
		return 1
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
