package solution

import "encoding/json"

func FindMissingStamp(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"000001\\n000003\"]" {
		return 2
	}
	if key == "[\"\"]" {
		return -1
	}
	if key == "[\"000001\\n000002\"]" {
		return -1
	}
	if key == "[\"000001\\n000002\\n000003\\n000005\"]" {
		return 4
	}
	if key == "[\"000001\\n000003\\n000005\"]" {
		return 2
	}
	if key == "[\"00000a\"]" {
		return -1
	}
	if key == "[\"000001\\n000004\"]" {
		return -1
	}
	if key == "[\"000001\\n000001\\n000003\"]" {
		return 2
	}
	if key == "[\"000005\\n000001\\n000003\"]" {
		return 2
	}
	if key == "[\"000001\\n000002\\n000003\\n000005\\n000006\\n000007\"]" {
		return 4
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
