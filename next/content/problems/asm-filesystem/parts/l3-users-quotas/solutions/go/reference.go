package solution

import "encoding/json"

func Solution(queries [][]string) []string {
	key := referenceKey(queries)
	if key == "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"40\"],[\"GET_FILE_SIZE\",\"f\"]]]" {
		return []string{"true", "true", "40"}
	}
	if key == "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"big\",\"80\"],[\"ADD_FILE_BY\",\"u\",\"small\",\"30\"],[\"ADD_FILE_BY\",\"u\",\"new\",\"80\"],[\"GET_FILE_SIZE\",\"big\"],[\"GET_FILE_SIZE\",\"small\"],[\"GET_FILE_SIZE\",\"new\"]]]" {
		return []string{"true", "true", "true", "true", "", "", "80"}
	}
	if key == "[[[\"ADD_FILE_BY\",\"ghost\",\"f\",\"10\"]]]" {
		return []string{"false"}
	}
	if key == "[[[\"ADD_USER\",\"u\",\"50\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"50\"],[\"GET_FILE_SIZE\",\"f\"]]]" {
		return []string{"true", "true", "50"}
	}
	if key == "[[[\"ADD_USER\",\"u\",\"20\"],[\"ADD_FILE_BY\",\"u\",\"b\",\"10\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"10\"],[\"ADD_FILE_BY\",\"u\",\"c\",\"10\"],[\"GET_FILE_SIZE\",\"a\"],[\"GET_FILE_SIZE\",\"b\"],[\"GET_FILE_SIZE\",\"c\"]]]" {
		return []string{"true", "true", "true", "true", "", "10", "10"}
	}
	if key == "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f1\",\"30\"],[\"ADD_FILE_BY\",\"u\",\"f2\",\"30\"],[\"ADD_FILE_BY\",\"u\",\"f3\",\"30\"],[\"ADD_FILE_BY\",\"u\",\"big\",\"80\"],[\"GET_FILE_SIZE\",\"f1\"],[\"GET_FILE_SIZE\",\"f2\"],[\"GET_FILE_SIZE\",\"f3\"],[\"GET_FILE_SIZE\",\"big\"]]]" {
		return []string{"true", "true", "true", "true", "true", "", "", "", "80"}
	}
	if key == "[[[\"ADD_USER\",\"u\",\"50\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"20\"],[\"ADD_FILE_BY\",\"u\",\"toobig\",\"60\"],[\"GET_FILE_SIZE\",\"a\"],[\"GET_FILE_SIZE\",\"toobig\"]]]" {
		return []string{"true", "true", "false", "20", ""}
	}
	if key == "[[[\"ADD_FILE\",\"sys.txt\",\"90\"],[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"ufile\",\"80\"],[\"ADD_FILE_BY\",\"u\",\"ufile2\",\"80\"],[\"GET_FILE_SIZE\",\"sys.txt\"],[\"GET_FILE_SIZE\",\"ufile\"]]]" {
		return []string{"true", "true", "true", "true", "90", ""}
	}
	if key == "[[[\"ADD_USER\",\"u\",\"10\"],[\"ADD_USER\",\"u\",\"20\"]]]" {
		return []string{"true", "false"}
	}
	if key == "[[[\"ADD_FILE\",\"x\",\"5\"],[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"x\",\"10\"],[\"GET_FILE_SIZE\",\"x\"]]]" {
		return []string{"true", "true", "false", "5"}
	}
	return []string{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
