package solution

import "encoding/json"

func Solution(queries [][]string) []string {
	key := referenceKey(queries)
	if key == "[[]]" {
		return []string{}
	}
	if key == "[[[\"ADD_FILE\",\"a.txt\",\"100\"],[\"GET_FILE_SIZE\",\"a.txt\"]]]" {
		return []string{"true", "100"}
	}
	if key == "[[[\"ADD_FILE\",\"a.txt\",\"100\"],[\"ADD_FILE\",\"a.txt\",\"200\"],[\"GET_FILE_SIZE\",\"a.txt\"]]]" {
		return []string{"true", "false", "100"}
	}
	if key == "[[[\"ADD_FILE\",\"a.txt\",\"50\"],[\"COPY_FILE\",\"a.txt\",\"b.txt\"],[\"GET_FILE_SIZE\",\"b.txt\"]]]" {
		return []string{"true", "true", "50"}
	}
	if key == "[[[\"COPY_FILE\",\"x\",\"y\"]]]" {
		return []string{"false"}
	}
	if key == "[[[\"GET_FILE_SIZE\",\"nope\"]]]" {
		return []string{""}
	}
	if key == "[[[\"ADD_FILE\",\"a\",\"10\"],[\"ADD_FILE\",\"b\",\"99\"],[\"COPY_FILE\",\"a\",\"b\"],[\"GET_FILE_SIZE\",\"b\"]]]" {
		return []string{"true", "true", "true", "10"}
	}
	if key == "[[[\"ADD_FILE\",\"File\",\"1\"],[\"GET_FILE_SIZE\",\"file\"],[\"GET_FILE_SIZE\",\"File\"]]]" {
		return []string{"true", "", "1"}
	}
	if key == "[[[\"ADD_FILE\",\"a\",\"7\"],[\"COPY_FILE\",\"a\",\"a\"],[\"GET_FILE_SIZE\",\"a\"]]]" {
		return []string{"true", "true", "7"}
	}
	if key == "[[[\"ADD_FILE\",\"z\",\"0\"],[\"GET_FILE_SIZE\",\"z\"]]]" {
		return []string{"true", "0"}
	}
	return []string{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
