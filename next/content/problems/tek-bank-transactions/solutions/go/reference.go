package solution

func ApplyTransactions(startingBalances map[string]any, transactions []map[string]any) []any {
	balances := map[string]int{}
	for account, balance := range startingBalances {
		balances[account] = asInt(balance)
	}
	rejected := []int{}
	for index, txn := range transactions {
		kind, amount := asString(txn["type"]), asInt(txn["amount"])
		switch kind {
		case "DEPOSIT":
			account := asString(txn["account"])
			if _, ok := balances[account]; ok {
				balances[account] += amount
			} else {
				rejected = append(rejected, index)
			}
		case "WITHDRAW":
			account := asString(txn["account"])
			if _, ok := balances[account]; ok && balances[account] >= amount {
				balances[account] -= amount
			} else {
				rejected = append(rejected, index)
			}
		case "TRANSFER":
			src, dst := asString(txn["from"]), asString(txn["to"])
			_, srcOK := balances[src]
			_, dstOK := balances[dst]
			if srcOK && dstOK && balances[src] >= amount {
				balances[src] -= amount
				balances[dst] += amount
			} else {
				rejected = append(rejected, index)
			}
		default:
			rejected = append(rejected, index)
		}
	}
	return []any{balances, rejected}
}
func asInt(value any) int {
	switch v := value.(type) {
	case int:
		return v
	case int64:
		return int(v)
	case float64:
		return int(v)
	default:
		return 0
	}
}
func asString(value any) string {
	if s, ok := value.(string); ok {
		return s
	}
	return ""
}
