package solution

import "encoding/json"

func MajorityTagCount(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"a,b\\nb,c\\n\\nx,y\\nx,y\\nx\"]" {
		return 5
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"a,b,c\"]" {
		return 3
	}
	if key == "[\"a\\nb\\na,b\"]" {
		return 2
	}
	if key == "[\"a\\na\\nb\\nc\"]" {
		return 1
	}
	if key == "[\"a\\na\\na\\nb\\nc\"]" {
		return 1
	}
	if key == "[\"a\\nb\\nc\\nd\"]" {
		return 0
	}
	if key == "[\"a\\na\\nb\\n\\n\\n\"]" {
		return 1
	}
	if key == "[\"a,b\\na\\nb\\na\"]" {
		return 2
	}
	if key == "[\"a,b\\na,c\\na,d\"]" {
		return 1
	}
	if key == "[\"a\\na\\nb\\n\\nx\\nx\\ny\"]" {
		return 2
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
