package solution

import "sort"

type flight struct {
	depart      string
	arrive      string
	origin      string
	destination string
}

func UserLocations(flights [][]string, queryTime string) [][]string {
	byUser := map[string][]flight{}
	for _, row := range flights {
		userID := row[0]
		byUser[userID] = append(byUser[userID], flight{
			origin:      row[1],
			depart:      row[2],
			destination: row[3],
			arrive:      row[4],
		})
	}

	users := make([]string, 0, len(byUser))
	for userID := range byUser {
		users = append(users, userID)
	}
	sort.Strings(users)

	out := make([][]string, 0, len(users))
	for _, userID := range users {
		timeline := byUser[userID]
		sort.Slice(timeline, func(i, j int) bool {
			return timeline[i].depart < timeline[j].depart
		})

		status := "UNKNOWN"
		for _, item := range timeline {
			if queryTime < item.depart {
				break
			}
			if item.depart <= queryTime && queryTime < item.arrive {
				status = "IN_FLIGHT:" + item.origin + "->" + item.destination
			} else {
				status = item.destination
			}
		}
		out = append(out, []string{userID, status})
	}
	return out
}
