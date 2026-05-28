package solution

func RealizedPnl(trades []map[string]any) int {
	lots := make([]lot, 0)
	total := 0
	for _, trade := range trades {
		if asString(trade["side"]) == "BUY" {
			lots = append(lots, lot{qty: asInt(trade["qty"]), price: asInt(trade["price"])})
			continue
		}
		remaining := asInt(trade["qty"])
		price := asInt(trade["price"])
		for remaining > 0 && len(lots) > 0 {
			matched := minInt(remaining, lots[0].qty)
			total += (price - lots[0].price) * matched
			remaining -= matched
			lots[0].qty -= matched
			if lots[0].qty == 0 {
				lots = lots[1:]
			}
		}
	}
	return total
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
