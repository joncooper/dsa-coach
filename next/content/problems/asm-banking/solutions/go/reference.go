package solution

import "strconv"

func Solution(queries [][]string) []string {
	balances := map[string]int{}
	out := []string{}

	for _, query := range queries {
		switch query[0] {
		case "CREATE_ACCOUNT":
			account := query[2]
			if _, exists := balances[account]; exists {
				out = append(out, "false")
			} else {
				balances[account] = 0
				out = append(out, "true")
			}
		case "DEPOSIT":
			account := query[2]
			amount, _ := strconv.Atoi(query[3])
			balance, exists := balances[account]
			if !exists {
				out = append(out, "")
			} else {
				balances[account] = balance + amount
				out = append(out, strconv.Itoa(balances[account]))
			}
		case "WITHDRAW":
			account := query[2]
			amount, _ := strconv.Atoi(query[3])
			balance, exists := balances[account]
			if !exists || balance < amount {
				out = append(out, "")
			} else {
				balances[account] = balance - amount
				out = append(out, strconv.Itoa(balances[account]))
			}
		case "TRANSFER":
			source, target := query[2], query[3]
			amount, _ := strconv.Atoi(query[4])
			sourceBalance, sourceExists := balances[source]
			targetBalance, targetExists := balances[target]
			if source == target || !sourceExists || !targetExists || sourceBalance < amount {
				out = append(out, "")
			} else {
				balances[source] = sourceBalance - amount
				balances[target] = targetBalance + amount
				out = append(out, strconv.Itoa(balances[source]))
			}
		default:
			out = append(out, "")
		}
	}

	return out
}
