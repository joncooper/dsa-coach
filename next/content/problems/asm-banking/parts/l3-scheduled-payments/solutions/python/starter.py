def solution(queries):
    balances = {}
    spent = {}
    payments = {}         # id -> {"account","amount","exec_at","status"}
    results = []
    for query in queries:
        op = query[0]
        # Level 1-2 ops, plus:
        # SCHEDULE_PAYMENT ts account amount delay -> "payment{N}" / ""
        # CANCEL_PAYMENT   ts account payment_id   -> "true" / "false"
        results.append("")
    return results
