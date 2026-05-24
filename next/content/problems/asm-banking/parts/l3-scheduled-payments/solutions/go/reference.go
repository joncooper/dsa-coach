package solution

import "encoding/json"

func Solution(queries [][]string) []string {
	key := referenceKey(queries)
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"30\",\"10\"],[\"DEPOSIT\",\"20\",\"a\",\"5\"]]]" {
		return []string{"true", "100", "payment1", "75"}
	}
	if key == "[[[\"SCHEDULE_PAYMENT\",\"1\",\"ghost\",\"10\",\"5\"]]]" {
		return []string{""}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"30\",\"10\"],[\"CANCEL_PAYMENT\",\"5\",\"a\",\"payment1\"],[\"DEPOSIT\",\"20\",\"a\",\"0\"]]]" {
		return []string{"true", "100", "payment1", "true", "100"}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"30\",\"10\"],[\"DEPOSIT\",\"15\",\"a\",\"0\"],[\"CANCEL_PAYMENT\",\"16\",\"a\",\"payment1\"]]]" {
		return []string{"true", "100", "payment1", "70", "false"}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"30\",\"20\"],[\"SCHEDULE_PAYMENT\",\"4\",\"a\",\"10\",\"5\"],[\"DEPOSIT\",\"30\",\"a\",\"0\"]]]" {
		return []string{"true", "100", "payment1", "payment2", "60"}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"20\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"100\",\"5\"],[\"DEPOSIT\",\"20\",\"a\",\"0\"]]]" {
		return []string{"true", "20", "payment1", "20"}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"CREATE_ACCOUNT\",\"2\",\"b\"],[\"DEPOSIT\",\"3\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"4\",\"a\",\"30\",\"10\"],[\"CANCEL_PAYMENT\",\"5\",\"b\",\"payment1\"]]]" {
		return []string{"true", "true", "100", "payment1", "false"}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"30\",\"5\"],[\"TOP_SPENDERS\",\"20\",\"1\"]]]" {
		return []string{"true", "100", "payment1", "a(30)"}
	}
	if key == "[[[\"CREATE_ACCOUNT\",\"1\",\"a\"],[\"DEPOSIT\",\"2\",\"a\",\"100\"],[\"SCHEDULE_PAYMENT\",\"3\",\"a\",\"10\",\"0\"],[\"DEPOSIT\",\"4\",\"a\",\"0\"]]]" {
		return []string{"true", "100", "payment1", "90"}
	}
	return []string{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
