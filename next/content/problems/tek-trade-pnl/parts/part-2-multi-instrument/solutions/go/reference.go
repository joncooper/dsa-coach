package solution

func RealizedPnlBySymbol(trades []map[string]any) map[string]int {
	lots := map[string][]lot{}
	totals := map[string]int{}
	for _, trade := range trades {
		symbol := asString(trade["symbol"])
		if asString(trade["side"]) == "BUY" {
			lots[symbol] = append(lots[symbol], lot{asInt(trade["qty"]), asInt(trade["price"])})
			continue
		}
		if _, ok := totals[symbol]; !ok {
			totals[symbol] = 0
		}
		remaining, price := asInt(trade["qty"]), asInt(trade["price"])
		queue := lots[symbol]
		for remaining > 0 && len(queue) > 0 {
			matched := minInt(remaining, queue[0].qty)
			totals[symbol] += (price - queue[0].price) * matched
			remaining -= matched
			queue[0].qty -= matched
			if queue[0].qty == 0 {
				queue = queue[1:]
			}
		}
		lots[symbol] = queue
	}
	return totals
}

type lot struct {
	qty   int
	price int
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
func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}
