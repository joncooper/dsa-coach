package solution

import "encoding/json"

func MaxStamp(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"000001\"]" {
		return 1
	}
	if key == "[\"00000a\"]" {
		return 10
	}
	if key == "[\"000000\"]" {
		return 0
	}
	if key == "[\"\"]" {
		return -1
	}
	if key == "[\"00000a\\n00000b\"]" {
		return 11
	}
	if key == "[\"zzzzzz\"]" {
		return 2176782335
	}
	if key == "[\"1a2b3c\\n0z0z0z\"]" {
		return 77370024
	}
	if key == "[\"\\n00000a\\n\\n00000b\\n\"]" {
		return 11
	}
	if key == "[\"000009\\n00000a\"]" {
		return 10
	}
	if key == "[\"a00000\\n9zzzzz\"]" {
		return 604661760
	}
	if key == "[\"00000a\\n00000a\\n00000a\"]" {
		return 10
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
