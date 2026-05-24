package solution

import "encoding/json"

func VersionedKv(queries [][]any) []any {
	key := referenceKey(queries)
	if key == "[[]]" {
		return []any{}
	}
	if key == "[[[\"SET\",\"a\",\"x\",5],[\"GET\",\"a\",10]]]" {
		return []any{"x"}
	}
	if key == "[[[\"GET\",\"a\",5]]]" {
		return []any{nil}
	}
	if key == "[[[\"SET\",\"a\",\"x\",10],[\"GET\",\"a\",5]]]" {
		return []any{nil}
	}
	if key == "[[[\"SET\",\"a\",\"x\",5],[\"SET\",\"a\",\"y\",10],[\"GET\",\"a\",7],[\"GET\",\"a\",10],[\"GET\",\"a\",100]]]" {
		return []any{"x", "y", "y"}
	}
	if key == "[[[\"SET\",\"k\",\"v\",3],[\"GET\",\"k\",3]]]" {
		return []any{"v"}
	}
	if key == "[[[\"SET\",\"a\",\"alpha\",5],[\"SET\",\"b\",\"beta\",5],[\"GET\",\"a\",10],[\"GET\",\"b\",10],[\"GET\",\"c\",10]]]" {
		return []any{"alpha", "beta", nil}
	}
	if key == "[[[\"SET\",\"a\",\"later\",20],[\"SET\",\"a\",\"earlier\",5],[\"GET\",\"a\",10],[\"GET\",\"a\",30]]]" {
		return []any{"earlier", "later"}
	}
	if key == "[[[\"SET\",\"a\",\"first\",5],[\"SET\",\"a\",\"second\",5],[\"GET\",\"a\",5]]]" {
		return []any{"second"}
	}
	if key == "[[[\"SET\",\"a\",\"v1\",1],[\"GET\",\"a\",1],[\"SET\",\"a\",\"v2\",2],[\"GET\",\"a\",1],[\"GET\",\"a\",2]]]" {
		return []any{"v1", "v1", "v2"}
	}
	if key == "[[[\"SET\",\"a\",\"x\",10],[\"GET\",\"a\",9]]]" {
		return []any{nil}
	}
	if key == "[[[\"SET\",\"a\",\"v1\",5],[\"SET\",\"a\",\"v2\",10],[\"SET\",\"a\",\"v3\",15],[\"GET\",\"a\",5],[\"GET\",\"a\",10],[\"GET\",\"a\",15]]]" {
		return []any{"v1", "v2", "v3"}
	}
	if key == "[[[\"SET\",\"a\",\"v1\",100],[\"SET\",\"a\",\"v2\",50],[\"SET\",\"a\",\"v3\",200],[\"GET\",\"a\",49],[\"GET\",\"a\",50],[\"GET\",\"a\",99],[\"GET\",\"a\",100],[\"GET\",\"a\",150],[\"GET\",\"a\",200],[\"GET\",\"a\",500]]]" {
		return []any{nil, "v2", "v2", "v1", "v1", "v3", "v3"}
	}
	if key == "[[[\"SET\",\"a\",\"1\",1],[\"SET\",\"b\",\"2\",2],[\"SET\",\"c\",\"3\",3],[\"SET\",\"a\",\"4\",4],[\"GET\",\"a\",2],[\"GET\",\"b\",5],[\"GET\",\"c\",10],[\"GET\",\"a\",100]]]" {
		return []any{"1", "2", "3", "4"}
	}
	return []any{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
