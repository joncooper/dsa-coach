def solution(queries):
    balances = {}
    out = []
    for q in queries:
        op = q[0]
        if op == "CREATE_ACCOUNT":
            account = q[2]
            if account in balances:
                out.append("false")
            else:
                balances[account] = 0
                out.append("true")
        elif op == "DEPOSIT":
            account, amount = q[2], int(q[3])
            if account not in balances:
                out.append("")
            else:
                balances[account] += amount
                out.append(str(balances[account]))
        elif op == "WITHDRAW":
            account, amount = q[2], int(q[3])
            if account not in balances or balances[account] < amount:
                out.append("")
            else:
                balances[account] -= amount
                out.append(str(balances[account]))
        elif op == "TRANSFER":
            src, target, amount = q[2], q[3], int(q[4])
            if src == target or src not in balances or target not in balances or balances[src] < amount:
                out.append("")
            else:
                balances[src] -= amount
                balances[target] += amount
                out.append(str(balances[src]))
        else:
            out.append("")
    return out
