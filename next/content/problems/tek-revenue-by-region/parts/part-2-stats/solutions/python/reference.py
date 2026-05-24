def revenue_stats_by_region(customers, orders):
    region_of = {c["id"]: c["region"] for c in customers}
    stats = {}
    for order in orders:
        region = region_of.get(order["customer_id"])
        if region is None:
            continue
        bucket = stats.setdefault(region, {"total": 0, "count": 0})
        bucket["total"] += order["amount"]
        bucket["count"] += 1
    return stats
