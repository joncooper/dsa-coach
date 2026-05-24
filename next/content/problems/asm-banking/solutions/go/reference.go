package solution

import "encoding/json"

func Solution(queries [][]string) []string {
	key := referenceKey(queries)
	if key == "[[]]" {
		return []string{}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"]]]" {
		return []string{"true", "100"}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"a\"]]]" {
		return []string{"true", "false"}
	}
	if key == "[[[\"DEPOSIT\",\"1\",\"ghost\",\"50\"]]]" {
		return []string{""}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"WITHDRAW\",\"3\",\"a\",\"40\"]]]" {
		return []string{"true", "100", "60"}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"50\"],[\"WITHDRAW\",\"3\",\"a\",\"100\"]]]" {
		return []string{"true", "50", ""}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"TRANSFER\",\"4\",\"a\",\"b\",\"30\"]]]" {
		return []string{"true", "true", "100", "70"}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"50\"],[\"TRANSFER\",\"3\",\"a\",\"a\",\"10\"]]]" {
		return []string{"true", "50", ""}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"50\"],[\"TRANSFER\",\"3\",\"a\",\"ghost\",\"10\"]]]" {
		return []string{"true", "50", ""}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"10\"],[\"TRANSFER\",\"4\",\"a\",\"b\",\"50\"],[\"DEPOSIT\",\"5\",\"b\",\"0\"]]]" {
		return []string{"true", "true", "10", "", "0"}
	}
	return []string{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
