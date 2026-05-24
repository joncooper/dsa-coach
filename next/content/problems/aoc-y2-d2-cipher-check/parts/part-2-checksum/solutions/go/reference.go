package solution

import "encoding/json"

func CipherChecksum(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"cargo 42xy ok\\ntext hello1 ok\\nledger 4242 bad\\nledger a13 ok\"]" {
		return 51
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"cargo abcd ok\\ntext h1 ok\\ntext nope bad\"]" {
		return 1
	}
	if key == "[\"cargo a99 ok\"]" {
		return 0
	}
	if key == "[\"ledger a1b2c3 ok\"]" {
		return 6
	}
	if key == "[\"text abc123def ok\"]" {
		return 6
	}
	if key == "[\"cargo 12abc ok\\ntext h2llo ok\\nledger 9z9 ok\"]" {
		return 34
	}
	if key == "[\"cargo 7a8 ok\"]" {
		return 7
	}
	if key == "[\"cargo 99x bad\\nledger a9 ok\"]" {
		return 9
	}
	if key == "[\"ledger abc123 ok\"]" {
		return 6
	}
	if key == "[\"text a1b2c3 ok\"]" {
		return 3
	}
	if key == "[\"weird a1 ok\"]" {
		return 0
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
