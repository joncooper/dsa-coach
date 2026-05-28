package solution

import (
	"sort"
	"strconv"
	"strings"
)

type spendRow struct {
	account string
	total   int
}

func Solution(queries [][]string) []string {
	balances := map[string]int{}
	spent := map[string]int{}
	out := []string{}

	spend := func(account string, amount int) { spent[account] += amount }

	for _, query := range queries {
		switch query[0] {
		case "CREATE_ACCOUNT":
			account := query[2]
			if _, exists := balances[account]; exists {
				out = append(out, "false")
			} else {
				balances[account] = 0
				spent[account] = 0
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
				spend(account, amount)
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
				spend(source, amount)
				out = append(out, strconv.Itoa(balances[source]))
			}
		case "TOP_SPENDERS":
			count, _ := strconv.Atoi(query[2])
			out = append(out, renderTop(balances, spent, count))
		default:
			out = append(out, "")
		}
	}

	return out
}

func renderTop(balances map[string]int, spent map[string]int, count int) string {
	if count <= 0 || len(balances) == 0 {
		return ""
	}
	rows := []spendRow{}
	for account := range balances {
		rows = append(rows, spendRow{account, spent[account]})
	}
	sort.Slice(rows, func(i, j int) bool {
		if rows[i].total != rows[j].total {
			return rows[i].total > rows[j].total
		}
		return rows[i].account < rows[j].account
	})
	if count > len(rows) {
		count = len(rows)
	}
	parts := make([]string, 0, count)
	for _, row := range rows[:count] {
		parts = append(parts, row.account+"("+strconv.Itoa(row.total)+")")
	}
	return strings.Join(parts, ",")
}
