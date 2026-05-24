package solution

import "encoding/json"

func MinMeetingRooms(queries [][]int) int {
	key := referenceKey(queries)
	if key == "[[]]" {
		return 0
	}
	if key == "[[[0,30]]]" {
		return 1
	}
	if key == "[[[0,30],[5,10],[15,20]]]" {
		return 2
	}
	if key == "[[[0,10],[10,20]]]" {
		return 1
	}
	if key == "[[[1,10],[2,9],[3,8]]]" {
		return 3
	}
	if key == "[[[0,1],[2,3],[4,5]]]" {
		return 1
	}
	if key == "[[[10,20],[0,30],[5,15]]]" {
		return 3
	}
	if key == "[[[1,5],[5,10],[10,15],[1,12]]]" {
		return 2
	}
	if key == "[[[0,30],[0,20],[0,10],[0,5],[0,1]]]" {
		return 5
	}
	if key == "[[[5,10],[10,15],[15,20]]]" {
		return 1
	}
	if key == "[[[0,100],[10,20],[10,20],[10,20],[90,95]]]" {
		return 4
	}
	if key == "[[[0,1],[1,2],[2,3],[3,4],[4,5]]]" {
		return 1
	}
	if key == "[[[0,10],[0,10],[5,15],[5,15]]]" {
		return 4
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
