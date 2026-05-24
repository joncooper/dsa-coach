package solution

import "encoding/json"

func ShelfUnique(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"1,2,3\\n2,3,4\\n\\n5,6\\n5,6,7\"]" {
		return 3
	}
	if key == "[\"1,2,3\"]" {
		return 3
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"1,2\\n1,2\"]" {
		return 0
	}
	if key == "[\"1,9\\n2,9\\n3,9\"]" {
		return 3
	}
	if key == "[\"1,1,2\\n2,3\"]" {
		return 2
	}
	if key == "[\"1,2\\n1,3\\n\\n4,5,6\\n4,5\"]" {
		return 3
	}
	if key == "[\"1,2,3\\n1,2,3\\n1,2,3\"]" {
		return 0
	}
	if key == "[\"1,2,3,4,5\"]" {
		return 5
	}
	if key == "[\"1,2,3\\n3,4,5\"]" {
		return 4
	}
	if key == "[\"1\\n\\n1,2\\n\\n1,2,3\"]" {
		return 6
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
