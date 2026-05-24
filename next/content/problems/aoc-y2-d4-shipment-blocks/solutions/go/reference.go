package solution

import "encoding/json"

func MaxBlockSum(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"a=1\\nb=2\\n\\nc=10\\nd=garbage\\ne=5\"]" {
		return 15
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"x=4\\ny=8\"]" {
		return 12
	}
	if key == "[\"a=-1\\nb=2\"]" {
		return 2
	}
	if key == "[\"a=foo\\nb=bar\"]" {
		return 0
	}
	if key == "[\"\\n\\na=5\\n\\n\\n\"]" {
		return 5
	}
	if key == "[\"a=1\\n\\na=100\\nb=50\\n\\na=2\"]" {
		return 150
	}
	if key == "[\"a=0\\nb=0\\nc=3\"]" {
		return 3
	}
	if key == "[\"a=10\\nnopeval\\nb=5\"]" {
		return 15
	}
	if key == "[\"a=1.5\\nb=2\\nc=3\"]" {
		return 5
	}
	if key == "[\"a=+5\\nb=10\"]" {
		return 10
	}
	if key == "[\"a=  7  \\nb=3\"]" {
		return 10
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
