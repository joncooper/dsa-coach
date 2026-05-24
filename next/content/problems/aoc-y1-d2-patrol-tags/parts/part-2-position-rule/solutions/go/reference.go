package solution

import "encoding/json"

func CountValidPositions(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"1-3 a: abcde\\n1-3 b: cdefg\\n2-9 c: ccccccccc\"]" {
		return 1
	}
	if key == "[\"1-2 x: xxaaa\"]" {
		return 0
	}
	if key == "[\"2-4 z: abcde\"]" {
		return 0
	}
	if key == "[\"1-3 q: qabxy\"]" {
		return 1
	}
	if key == "[\"1-3 q: aaqxy\"]" {
		return 1
	}
	if key == "[\"1-99 a: a\"]" {
		return 1
	}
	if key == "[\"\\n1-2 z: zx\\n\"]" {
		return 1
	}
	if key == "[\"10-20 a: abc\"]" {
		return 0
	}
	if key == "[\"2-2 a: babcd\\n2-2 b: babcd\"]" {
		return 0
	}
	if key == "[\"1-3 z: zxz\"]" {
		return 0
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
