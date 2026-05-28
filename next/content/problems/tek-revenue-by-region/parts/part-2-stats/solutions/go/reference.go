package solution

func RevenueStatsByRegion(customers []map[string]any, orders []map[string]any) map[string]map[string]int {
	regionOf := map[int]string{}
	for _, customer := range customers {
		regionOf[asInt(customer["id"])] = asString(customer["region"])
	}
	stats := map[string]map[string]int{}
	for _, order := range orders {
		if region, ok := regionOf[asInt(order["customer_id"])]; ok {
			bucket := stats[region]
			if bucket == nil {
				bucket = map[string]int{"total": 0, "count": 0}
				stats[region] = bucket
			}
			bucket["total"] += asInt(order["amount"])
			bucket["count"]++
		}
	}
	return stats
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
