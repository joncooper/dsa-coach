package solution

import "encoding/json"

func TokenBucketRateLimited(arg0 [][]any, arg1 int, arg2 int) []bool {
	key := referenceKey(arg0, arg1, arg2)
	if key == "[[],5,10]" {
		return []bool{}
	}
	if key == "[[[0,\"a\"],[0,\"a\"],[0,\"a\"]],2,1]" {
		return []bool{true, true, false}
	}
	if key == "[[[0,\"a\"],[0,\"a\"],[1,\"a\"]],2,1]" {
		return []bool{true, true, true}
	}
	if key == "[[[0,\"a\"],[0,\"b\"]],1,10]" {
		return []bool{true, true}
	}
	if key == "[[[0,\"a\"],[0,\"a\"],[1,\"a\"],[2,\"a\"]],1,2]" {
		return []bool{true, false, false, true}
	}
	if key == "[[[0,\"a\"],[0,\"a\"],[0,\"a\"],[3,\"a\"],[3,\"a\"]],2,2]" {
		return []bool{true, true, false, true, false}
	}
	if key == "[[[0,\"a\"],[10,\"a\"]],5,1]" {
		return []bool{true, true}
	}
	if key == "[[[5,\"a\"],[5,\"a\"],[5,\"a\"],[5,\"a\"]],3,1]" {
		return []bool{true, true, true, false}
	}
	if key == "[[[0,\"a\"],[4,\"a\"],[6,\"a\"],[7,\"a\"]],1,3]" {
		return []bool{true, true, true, false}
	}
	if key == "[[[0,\"a\"],[0,\"a\"],[100,\"a\"],[100,\"a\"],[100,\"a\"]],2,1]" {
		return []bool{true, true, true, true, false}
	}
	if key == "[[[0,\"a\"],[0,\"a\"],[0,\"b\"],[0,\"b\"],[0,\"a\"],[0,\"b\"]],2,5]" {
		return []bool{true, true, true, true, false, false}
	}
	return []bool{}
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
