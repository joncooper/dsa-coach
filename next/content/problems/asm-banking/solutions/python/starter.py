def solution(queries):
    balances = {}         # account -> int cents
    results = []
    for query in queries:
        op = query[0]
        # CREATE_ACCOUNT ts account              -> "true" / "false"
        # DEPOSIT        ts account amount       -> "<balance>" / ""
        # WITHDRAW       ts account amount       -> "<balance>" / ""
        # TRANSFER       ts src target amount    -> "<src balance>" / ""
        results.append("")
    return results
