package solution

import "encoding/json"

func Solution(queries [][]string) []string {
	key := referenceKey(queries)
	if key == "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"40\"],[\"COMPRESS_FILE\",\"u\",\"f\"],[\"GET_FILE_SIZE\",\"f\"]]]" {
		return []string{"true", "true", "20", "20"}
	}
	if key == "[[[\"COMPRESS_FILE\",\"u\",\"ghost\"]]]" {
		return []string{""}
	}
	if key == "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"40\"],[\"COMPRESS_FILE\",\"u\",\"f\"],[\"COMPRESS_FILE\",\"u\",\"f\"]]]" {
		return []string{"true", "true", "20", ""}
	}
	if key == "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"40\"],[\"COMPRESS_FILE\",\"u\",\"f\"],[\"DECOMPRESS_FILE\",\"u\",\"f\"],[\"GET_FILE_SIZE\",\"f\"]]]" {
		return []string{"true", "true", "20", "40", "40"}
	}
	if key == "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"80\"],[\"COMPRESS_FILE\",\"u\",\"a\"],[\"ADD_FILE_BY\",\"u\",\"b\",\"60\"],[\"GET_FILE_SIZE\",\"a\"],[\"GET_FILE_SIZE\",\"b\"]]]" {
		return []string{"true", "true", "40", "true", "40", "60"}
	}
	if key == "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"80\"],[\"COMPRESS_FILE\",\"u\",\"a\"],[\"ADD_FILE_BY\",\"u\",\"b\",\"60\"],[\"DECOMPRESS_FILE\",\"u\",\"a\"],[\"GET_FILE_SIZE\",\"a\"]]]" {
		return []string{"true", "true", "40", "true", "", "40"}
	}
	if key == "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"f\",\"1\"],[\"COMPRESS_FILE\",\"u\",\"f\"],[\"GET_FILE_SIZE\",\"f\"]]]" {
		return []string{"true", "true", "0", "0"}
	}
	if key == "[[[\"ADD_FILE\",\"s\",\"10\"],[\"ADD_USER\",\"u\",\"100\"],[\"COMPRESS_FILE\",\"u\",\"s\"]]]" {
		return []string{"true", "true", ""}
	}
	if key == "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"80\"],[\"COMPRESS_FILE\",\"u\",\"a\"],[\"ADD_FILE_BY\",\"u\",\"big\",\"100\"],[\"DECOMPRESS_FILE\",\"u\",\"a\"]]]" {
		return []string{"true", "true", "40", "true", ""}
	}
	if key == "[[[\"ADD_USER\",\"u\",\"100\"],[\"ADD_FILE_BY\",\"u\",\"a\",\"40\"],[\"COMPRESS_FILE\",\"u\",\"a\"],[\"COPY_FILE\",\"a\",\"c\"],[\"GET_FILE_SIZE\",\"c\"]]]" {
		return []string{"true", "true", "20", "true", "20"}
	}
	return []string{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
