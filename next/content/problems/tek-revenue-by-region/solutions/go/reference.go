package solution

func RevenueByRegion(customers []map[string]any, orders []map[string]any) map[string]int {
	regionOf := map[int]string{}
	for _, customer := range customers {
		regionOf[asInt(customer["id"])] = asString(customer["region"])
	}
	totals := map[string]int{}
	for _, order := range orders {
		if region, ok := regionOf[asInt(order["customer_id"])]; ok {
			totals[region] += asInt(order["amount"])
		}
	}
	return totals
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
