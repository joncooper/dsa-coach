def revenue_by_region(customers: list[dict], orders: list[dict]) -> dict:
    region_of = {c['id']: c['region'] for c in customers}
    totals = {}
    for order in orders:
        region = region_of.get(order['customer_id'])
        if region is None:
            continue
        totals[region] = totals.get(region, 0) + order['amount']
    return totals
