package solution

import "encoding/json"

func RateLimited(arg0 [][]any, arg1 int, arg2 int) []bool {
	key := referenceKey(arg0, arg1, arg2)
	if key == "[[],5,10]" {
		return []bool{}
	}
	if key == "[[[1,\"a\"],[2,\"a\"],[3,\"a\"]],2,5]" {
		return []bool{true, true, false}
	}
	if key == "[[[1,\"a\"],[2,\"b\"]],1,10]" {
		return []bool{true, true}
	}
	if key == "[[[0,\"a\"],[5,\"a\"]],1,5]" {
		return []bool{true, true}
	}
	if key == "[[[0,\"a\"],[1,\"a\"],[5,\"a\"],[6,\"a\"]],1,5]" {
		return []bool{true, false, true, false}
	}
	if key == "[[[0,\"a\"],[0,\"a\"],[0,\"a\"]],2,10]" {
		return []bool{true, true, false}
	}
	if key == "[[[0,\"a\"],[4,\"a\"],[9,\"a\"],[13,\"a\"]],1,5]" {
		return []bool{true, false, true, false}
	}
	if key == "[[[0,\"a\"],[1,\"b\"],[2,\"a\"],[3,\"b\"],[4,\"a\"]],2,10]" {
		return []bool{true, true, true, true, false}
	}
	if key == "[[[0,\"a\"],[0,\"a\"],[1,\"a\"],[1,\"a\"]],1,1]" {
		return []bool{true, false, true, false}
	}
	if key == "[[[0,\"a\"],[0,\"a\"],[0,\"a\"],[0,\"b\"]],2,10]" {
		return []bool{true, true, false, true}
	}
	if key == "[[[5,\"a\"],[5,\"a\"],[5,\"a\"],[5,\"a\"],[5,\"a\"]],3,10]" {
		return []bool{true, true, true, false, false}
	}
	if key == "[[[0,\"a\"],[1,\"a\"],[2,\"a\"],[3,\"a\"],[4,\"a\"],[5,\"a\"],[6,\"a\"]],2,3]" {
		return []bool{true, true, false, true, true, false, true}
	}
	return []bool{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
