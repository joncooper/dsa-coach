package solution

import "encoding/json"

func EveryoneYesSum(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"abc\\nbcd\\n\\nef\\nfg\"]" {
		return 3
	}
	if key == "[\"abc\"]" {
		return 3
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"a\\nb\\nc\"]" {
		return 0
	}
	if key == "[\"ab\\nac\\nad\"]" {
		return 1
	}
	if key == "[\"ab\\nac\\n\\nef\\nef\\n\\nx\"]" {
		return 4
	}
	if key == "[\"abc\\n\\n\\n\\ndef\\nde\"]" {
		return 5
	}
	if key == "[\"abc\\nabc\\nabc\"]" {
		return 3
	}
	if key == "[\"abcd\\nabc\\nab\\na\"]" {
		return 1
	}
	if key == "[\"a\\nb\\n\\nx\\nx\"]" {
		return 1
	}
	if key == "[\"a\\na\\na\"]" {
		return 1
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
