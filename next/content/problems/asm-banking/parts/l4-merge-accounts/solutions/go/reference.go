package solution

import (
	"sort"
	"strconv"
	"strings"
)

type payment struct {
	account string
	amount  int
	execAt  int
	seq     int
	status  string
}

type spendRow struct {
	account string
	total   int
}

func Solution(queries [][]string) []string {
	balances := map[string]int{}
	spent := map[string]int{}
	payments := map[string]*payment{}
	out := []string{}
	scheduleSeq := 0

	spend := func(account string, amount int) { spent[account] += amount }
	fireDue := func(timestamp int) {
		due := []*payment{}
		for _, current := range payments {
			if current.status == "pending" && current.execAt <= timestamp {
				due = append(due, current)
			}
		}
		sort.Slice(due, func(i, j int) bool {
			if due[i].execAt != due[j].execAt {
				return due[i].execAt < due[j].execAt
			}
			return due[i].seq < due[j].seq
		})
		for _, current := range due {
			balance, exists := balances[current.account]
			if !exists || balance < current.amount {
				current.status = "cancelled"
			} else {
				balances[current.account] = balance - current.amount
				spend(current.account, current.amount)
				current.status = "fired"
			}
		}
	}

	for _, query := range queries {
		timestamp, _ := strconv.Atoi(query[1])
		fireDue(timestamp)
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
		case "SCHEDULE_PAYMENT":
			account := query[2]
			_, exists := balances[account]
			if !exists {
				out = append(out, "")
				continue
			}
			amount, _ := strconv.Atoi(query[3])
			delay, _ := strconv.Atoi(query[4])
			scheduleSeq++
			id := "payment" + strconv.Itoa(scheduleSeq)
			payments[id] = &payment{account: account, amount: amount, execAt: timestamp + delay, seq: scheduleSeq, status: "pending"}
			out = append(out, id)
		case "CANCEL_PAYMENT":
			current := payments[query[3]]
			if current == nil || current.status != "pending" || current.account != query[2] {
				out = append(out, "false")
			} else {
				current.status = "cancelled"
				out = append(out, "true")
			}
		case "MERGE_ACCOUNTS":
			primary, secondary := query[2], query[3]
			primaryBalance, primaryExists := balances[primary]
			secondaryBalance, secondaryExists := balances[secondary]
			if primary == secondary || !primaryExists || !secondaryExists {
				out = append(out, "")
				continue
			}
			balances[primary] = primaryBalance + secondaryBalance
			spent[primary] += spent[secondary]
			for _, current := range payments {
				if current.status == "pending" && current.account == secondary {
					current.account = primary
				}
			}
			delete(balances, secondary)
			delete(spent, secondary)
			out = append(out, strconv.Itoa(balances[primary]))
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
