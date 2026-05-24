def reconcile_inventory(expected: dict, observed: dict) -> list[list[object]]:
    rows = []
    for sku in sorted(set(expected) | set(observed)):
        in_exp = sku in expected
        in_obs = sku in observed
        exp_qty = expected.get(sku, 0)
        obs_qty = observed.get(sku, 0)
        delta = obs_qty - exp_qty
        if not in_obs:
            rows.append([sku, 'missing', exp_qty, 0, delta])
        elif not in_exp:
            rows.append([sku, 'extra', 0, obs_qty, delta])
        elif obs_qty < exp_qty:
            rows.append([sku, 'short', exp_qty, obs_qty, delta])
        elif obs_qty > exp_qty:
            rows.append([sku, 'over', exp_qty, obs_qty, delta])
    return rows
