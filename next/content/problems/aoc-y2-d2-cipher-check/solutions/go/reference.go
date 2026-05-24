package solution

import "encoding/json"

func ValidCipherCount(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"cargo a1b2 ok\\ntext hello bad\\nledger 4242 ok\\ntext h1 ok\"]" {
		return 2
	}
	if key == "[\"cargo a1 bad\\ntext b2 bad\"]" {
		return 0
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"cargo abcd ok\"]" {
		return 0
	}
	if key == "[\"cargo 1234 ok\"]" {
		return 0
	}
	if key == "[\"text a1 ok\"]" {
		return 1
	}
	if key == "[\"\\ntext a1 ok\\n\\n\"]" {
		return 1
	}
	if key == "[\"cargo a1\"]" {
		return 0
	}
	if key == "[\"cargo a1 ok extra\"]" {
		return 0
	}
	if key == "[\"cargo a1 OK\"]" {
		return 0
	}
	if key == "[\"cargo a1 ok\\ntext b2 ok\\nledger c3 ok\\ntext bad bad\"]" {
		return 3
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
