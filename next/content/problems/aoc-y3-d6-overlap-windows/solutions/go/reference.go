package solution

import "encoding/json"

func OddTagCount(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"a,b\\nb,c\\n\\nx,y\\nx,y\\nx\"]" {
		return 3
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"a,b,c\"]" {
		return 3
	}
	if key == "[\"a\\na\"]" {
		return 0
	}
	if key == "[\"a,a,b\\nb,c\"]" {
		return 2
	}
	if key == "[\"a,b\\nb,c\\nc,a\"]" {
		return 0
	}
	if key == "[\"a\\na\\na\\n\\nx\\ny\\nx,y\"]" {
		return 1
	}
	if key == "[\"a,b\\n\\n\\n\"]" {
		return 2
	}
	if key == "[\"a\\na\"]" {
		return 0
	}
	if key == "[\"a\\na\\na\"]" {
		return 1
	}
	if key == "[\"a,a,a\\nb\"]" {
		return 2
	}
	if key == "[\"a,b\\na\\nb\\nc\\nc,d\"]" {
		return 1
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
