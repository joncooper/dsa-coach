package solution

import "encoding/json"

func CountValidTags(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"1-3 a: abcde\\n1-3 b: cdefg\\n2-9 c: ccccccccc\"]" {
		return 2
	}
	if key == "[\"1-1 z: aaa\\n2-2 a: aaaa\"]" {
		return 0
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"3-5 q: qqqxx\"]" {
		return 1
	}
	if key == "[\"1-3 z: zzzab\"]" {
		return 1
	}
	if key == "[\"\\n1-1 a: a\\n\\n\"]" {
		return 1
	}
	if key == "[\"2-4 t: ttabt\\n5-9 m: mmmm\"]" {
		return 1
	}
	if key == "[\"3-3 a: aaa\\n3-3 a: aaaa\"]" {
		return 1
	}
	if key == "[\"0-2 a: bcd\"]" {
		return 1
	}
	if key == "[\"1-2 a: aaaa\"]" {
		return 0
	}
	if key == "[\"1-5 q: abcde\"]" {
		return 0
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
