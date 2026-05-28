package solution

import "sort"

func MinMeetingRooms(meetings [][]int) int {
	events := make([][2]int, 0, len(meetings)*2)
	for _, meeting := range meetings {
		events = append(events, [2]int{meeting[0], 1}, [2]int{meeting[1], -1})
	}
	sort.Slice(events, func(i, j int) bool {
		if events[i][0] != events[j][0] {
			return events[i][0] < events[j][0]
		}
		return events[i][1] < events[j][1]
	})
	active, peak := 0, 0
	for _, event := range events {
		active += event[1]
		if active > peak {
			peak = active
		}
	}
	return peak
}
