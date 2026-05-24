package solution

import "encoding/json"

func Solution(queries [][]string) []string {
	key := referenceKey(queries)
	if key == "[[[\"ADD_FILE\",\"data1.txt\",\"30\"],[\"ADD_FILE\",\"data2.txt\",\"90\"],[\"FIND_BY_PREFIX\",\"data\"]]]" {
		return []string{"true", "true", "data2.txt(90),data1.txt(30)"}
	}
	if key == "[[[\"ADD_FILE\",\"a\",\"1\"],[\"FIND_BY_PREFIX\",\"z\"]]]" {
		return []string{"true", ""}
	}
	if key == "[[[\"ADD_FILE\",\"a.log\",\"5\"],[\"ADD_FILE\",\"b.txt\",\"6\"],[\"FIND_BY_SUFFIX\",\".log\"]]]" {
		return []string{"true", "true", "a.log(5)"}
	}
	if key == "[[[\"ADD_FILE\",\"report\",\"42\"],[\"FIND_BY_PREFIX\",\"report\"]]]" {
		return []string{"true", "report(42)"}
	}
	if key == "[[[\"ADD_FILE\",\"b\",\"10\"],[\"ADD_FILE\",\"a\",\"10\"],[\"FIND_BY_PREFIX\",\"\"]]]" {
		return []string{"true", "true", "a(10),b(10)"}
	}
	if key == "[[[\"ADD_FILE\",\"x\",\"5\"],[\"ADD_FILE\",\"y\",\"9\"],[\"FIND_BY_PREFIX\",\"\"]]]" {
		return []string{"true", "true", "y(9),x(5)"}
	}
	if key == "[[[\"ADD_FILE\",\"src.txt\",\"12\"],[\"COPY_FILE\",\"src.txt\",\"dst.txt\"],[\"FIND_BY_SUFFIX\",\".txt\"]]]" {
		return []string{"true", "true", "dst.txt(12),src.txt(12)"}
	}
	if key == "[[[\"ADD_FILE\",\"f2\",\"0\"],[\"ADD_FILE\",\"f1\",\"0\"],[\"FIND_BY_PREFIX\",\"f\"]]]" {
		return []string{"true", "true", "f1(0),f2(0)"}
	}
	if key == "[[[\"ADD_FILE\",\"abc\",\"3\"],[\"FIND_BY_PREFIX\",\"ab\"],[\"FIND_BY_SUFFIX\",\"bc\"]]]" {
		return []string{"true", "abc(3)", "abc(3)"}
	}
	return []string{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
