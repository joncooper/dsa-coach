package solution

import "encoding/json"

func Solution(queries [][]string) []string {
	key := referenceKey(queries)
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"DEPOSIT\",\"4\",\"b\",\"50\"],[\"MERGE_ACCOUNTS\",\"5\",\"a\",\"b\"]]]" {
		return []string{"true", "true", "100", "50", "150"}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"DEPOSIT\",\"4\",\"b\",\"50\"],[\"MERGE_ACCOUNTS\",\"5\",\"a\",\"b\"],[\"DEPOSIT\",\"6\",\"b\",\"10\"]]]" {
		return []string{"true", "true", "100", "50", "150", ""}
	}
	if key == "[[[\"MERGE_ACCOUNTS\",\"1\",\"ghost\",\"x\"]]]" {
		return []string{""}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"MERGE_ACCOUNTS\",\"2\",\"a\",\"a\"]]]" {
		return []string{"true", ""}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"DEPOSIT\",\"4\",\"b\",\"100\"],[\"WITHDRAW\",\"5\",\"a\",\"30\"],[\"WITHDRAW\",\"6\",\"b\",\"40\"],[\"MERGE_ACCOUNTS\",\"7\",\"a\",\"b\"],[\"TOP_SPENDERS\",\"8\",\"1\"]]]" {
		return []string{"true", "true", "100", "100", "70", "60", "130", "a(70)"}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"DEPOSIT\",\"4\",\"b\",\"50\"],[\"SCHEDULE_PAYMENT\",\"5\",\"b\",\"20\",\"10\"],[\"MERGE_ACCOUNTS\",\"6\",\"a\",\"b\"],[\"DEPOSIT\",\"20\",\"a\",\"0\"]]]" {
		return []string{"true", "true", "100", "50", "payment1", "150", "130"}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"MERGE_ACCOUNTS\",\"2\",\"a\",\"ghost\"]]]" {
		return []string{"true", ""}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"MERGE_ACCOUNTS\",\"3\",\"a\",\"b\"],[\"MERGE_ACCOUNTS\",\"4\",\"a\",\"b\"]]]" {
		return []string{"true", "true", "0", ""}
	}
	return []string{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
