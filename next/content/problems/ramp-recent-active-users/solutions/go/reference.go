package solution

func RecentActiveUsers(timestamps []int, users []string, window int) []int {
	left := 0
	countsByUser := map[string]int{}
	results := []int{}

	for right, timestamp := range timestamps {
		user := users[right]
		countsByUser[user]++

		for timestamps[left] < timestamp-window {
			oldUser := users[left]
			countsByUser[oldUser]--
			if countsByUser[oldUser] == 0 {
				delete(countsByUser, oldUser)
			}
			left++
		}

		results = append(results, len(countsByUser))
	}

	return results
}
