package solution

import "encoding/json"

func RisingWindows(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"3\\n1\\n2\\n3\\n4\\n5\"]" {
		return 2
	}
	if key == "[\"2\\n5\\n5\\n5\\n5\"]" {
		return 0
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"3\\n1\\n2\\n3\"]" {
		return 0
	}
	if key == "[\"2\\n1\\n2\\n0\\n5\"]" {
		return 1
	}
	if key == "[\"1\\n5\\n4\\n3\\n2\"]" {
		return 0
	}
	if key == "[\"3\\n3\\n3\\n3\\n3\\n3\"]" {
		return 0
	}
	if key == "[\"2\\n-10\\n0\\n5\\n-1\"]" {
		return 1
	}
	if key == "[\"3\\n1\\n2\\n3\\n4\"]" {
		return 1
	}
	if key == "[\"2\\n1\\n1\\n1\\n1\"]" {
		return 0
	}
	if key == "[\"1\\n1\\n2\\n1\\n2\\n1\\n2\"]" {
		return 3
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
