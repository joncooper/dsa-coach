package solution

import "sort"

func ReconcileInventory(expected map[string]any, observed map[string]any) [][]any {
	seen := map[string]bool{}
	for sku := range expected {
		seen[sku] = true
	}
	for sku := range observed {
		seen[sku] = true
	}
	skus := make([]string, 0, len(seen))
	for sku := range seen {
		skus = append(skus, sku)
	}
	sort.Strings(skus)
	rows := [][]any{}
	for _, sku := range skus {
		_, inExpected := expected[sku]
		_, inObserved := observed[sku]
		expQty, obsQty := asInt(expected[sku]), asInt(observed[sku])
		delta := obsQty - expQty
		if !inObserved {
			rows = append(rows, []any{sku, "missing", expQty, 0, delta})
		} else if !inExpected {
			rows = append(rows, []any{sku, "extra", 0, obsQty, delta})
		} else if obsQty < expQty {
			rows = append(rows, []any{sku, "short", expQty, obsQty, delta})
		} else if obsQty > expQty {
			rows = append(rows, []any{sku, "over", expQty, obsQty, delta})
		}
	}
	return rows
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
